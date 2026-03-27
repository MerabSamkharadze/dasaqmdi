import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Auth check
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, skills, seniority, language } = await req.json();

  if (!title || !skills) {
    return new Response("Missing required fields", { status: 400 });
  }

  const prompt = `You are a professional job description writer for the Georgian job market (dasakmdi.com).

Generate a structured job description based on:
- **Job Title**: ${title}
- **Seniority Level**: ${seniority || "Mid-level"}
- **Core Skills**: ${Array.isArray(skills) ? skills.join(", ") : skills}

${language === "ka" ? "Write the entire response in Georgian (ქართული)." : "Write the entire response in English."}

Output format (use markdown headers):

## Responsibilities
- 5-7 specific, actionable bullet points

## Requirements
- 5-7 bullet points covering skills, experience, and qualifications

## Nice to Have
- 3-4 optional qualifications

## Benefits
- 4-5 company benefits and perks

Keep the tone professional but approachable. Be specific to the role, not generic.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt,
    maxTokens: 1500,
  });

  return result.toDataStreamResponse();
}
