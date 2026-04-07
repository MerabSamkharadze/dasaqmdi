import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const VALID_LANGUAGES = ["en", "ka", "both"] as const;

// Maps client seniority values to display labels
const SENIORITY_MAP: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
};
// H1 FIX: Strict input validation schema
const draftJobInputSchema = z.object({
  title: z
    .string()
    .min(2, "Title too short")
    .max(120, "Title too long")
    .regex(/^[a-zA-Z0-9\s\-\/&,.()#+ა-ჰ]+$/, "Title contains invalid characters"),
  skills: z
    .union([
      z.string().min(1).max(500),
      z.array(z.string().min(1).max(60)).min(1).max(20),
    ])
    .transform((val) => {
      const arr = Array.isArray(val) ? val : val.split(",").map((s) => s.trim()).filter(Boolean);
      // Sanitize each skill: only allow alphanumeric, spaces, hyphens, dots, +, #, Georgian
      return arr
        .map((s) => s.replace(/[^\w\s\-./#+ა-ჰ]/g, "").trim())
        .filter((s) => s.length > 0)
        .slice(0, 20);
    }),
  seniority: z
    .string()
    .optional()
    .default("mid")
    .transform((val) => SENIORITY_MAP[val] ?? "Mid-level"),
  language: z.enum(VALID_LANGUAGES).optional().default("en"),
});

export async function POST(req: Request) {
  // Auth check
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Plan gating: AI draft requires Pro+ plan
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (company) {
    const { getActivePlan } = await import("@/lib/queries/subscriptions");
    const { canUseAIDraft } = await import("@/lib/subscription-helpers");
    const plan = await getActivePlan(company.id);
    if (!canUseAIDraft(plan)) {
      return new Response(
        JSON.stringify({ error: "AI draft requires Pro or Verified plan" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // H1 FIX: Validate and sanitize all inputs
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = draftJobInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { title, skills, seniority, language } = parsed.data;

  // Build language instruction
  const languageInstruction =
    language === "both"
      ? `Write the response in BOTH languages. First write the full description in English, then add a separator line "---", then write the same description in Georgian (ქართული). Label each section with [EN] and [KA].`
      : language === "ka"
        ? "Write the entire response in Georgian (ქართული)."
        : "Write the entire response in English.";

  const outputSchema = z.object({
    description: z.string().describe("Job description in English: Responsibilities (5-7 bullet points) + Benefits (4-5 bullet points). Plain text with line breaks, no markdown."),
    description_ka: z.string().describe("იგივე აღწერა ქართულად: მოვალეობები (5-7 პუნქტი) + ბენეფიტები (4-5 პუნქტი). უბრალო ტექსტი."),
    requirements: z.string().describe("Requirements in English: Required skills (5-7 bullet points) + Nice to Have (3-4 bullet points). Plain text."),
    requirements_ka: z.string().describe("მოთხოვნები ქართულად: საჭირო უნარები (5-7 პუნქტი) + სასურველი (3-4 პუნქტი). უბრალო ტექსტი."),
  });

  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: outputSchema,
    system: `You are a professional job description writer for the Georgian job market (dasaqmdi.com). Generate BOTH English and Georgian versions simultaneously. Be specific to the role, not generic. Use plain text with line breaks and bullet points (- ), no markdown headers.`,
    prompt: `Generate a structured job description for:

Job Title: ${title}
Seniority Level: ${seniority}
Core Skills: ${skills.join(", ")}

For each field, write professional, detailed content. Georgian text must be natural Georgian, not a machine translation.`,
  });

  return Response.json(result.object);
}
