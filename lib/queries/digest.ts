import { createClient } from "@supabase/supabase-js";
import { calculateMatch } from "@/lib/matching";
import type { JobWithCompany } from "@/lib/types";

// Uses service role client for cron/API route (not user-scoped)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type DigestSeeker = {
  id: string;
  email: string;
  full_name: string | null;
  full_name_ka: string | null;
  skills: string[];
  preferred_language: "ka" | "en";
};

export type DigestEntry = {
  seeker: DigestSeeker;
  topJobs: Array<{
    job: JobWithCompany;
    score: number;
    matchedSkills: string[];
  }>;
};

/**
 * Build digest data for all opt-in seekers with skills.
 * Matches against jobs created in the last 24 hours.
 */
export async function buildDigestData(): Promise<DigestEntry[]> {
  const supabase = createServiceClient();

  // 1. Get all seekers who opted in for digest and have skills
  const { data: seekers, error: seekersError } = await supabase
    .from("profiles")
    .select("id, full_name, full_name_ka, skills, preferred_language")
    .eq("role", "seeker")
    .eq("email_digest", true)
    .not("skills", "eq", "{}");

  if (seekersError || !seekers?.length) {
    console.error("Digest: no seekers found", seekersError?.message);
    return [];
  }

  // 2. Get emails from auth.users
  const seekerIds = seekers.map((s) => s.id);
  const { data: authData } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });

  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email && seekerIds.includes(u.id)) {
        emailMap.set(u.id, u.email);
      }
    }
  }

  // 3. Get jobs from last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentJobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url),
      category:categories!inner(id, slug, name_en, name_ka)
    `
    )
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .gte("created_at", yesterday)
    .order("created_at", { ascending: false });

  if (jobsError || !recentJobs?.length) {
    console.log("Digest: no recent jobs found");
    return [];
  }

  const jobs = recentJobs as unknown as JobWithCompany[];

  // 4. Match each seeker against recent jobs
  const entries: DigestEntry[] = [];

  for (const seeker of seekers) {
    const email = emailMap.get(seeker.id);
    if (!email) continue;

    const matches = jobs
      .map((job) => {
        const result = calculateMatch(seeker.skills, job.tags);
        return { job, score: result.score, matchedSkills: result.matchedSkills };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (matches.length === 0) continue;

    entries.push({
      seeker: { ...seeker, email } as DigestSeeker,
      topJobs: matches,
    });
  }

  return entries;
}
