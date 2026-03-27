import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithJob, ApplicationWithApplicant } from "@/lib/types";

export async function getMyApplications(userId: string): Promise<ApplicationWithJob[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      job:jobs!inner(
        id, title, title_ka, status, application_deadline,
        company:companies!inner(name, name_ka, logo_url)
      )
    `,
    )
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch applications:", error.message);
    return [];
  }

  return (data ?? []) as unknown as ApplicationWithJob[];
}

export async function getApplicationsByJob(
  jobId: string
): Promise<ApplicationWithApplicant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      applicant:profiles!inner(
        id, full_name, full_name_ka, avatar_url, skills, experience_years
      )
    `
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch job applications:", error.message);
    return [];
  }

  return (data ?? []) as unknown as ApplicationWithApplicant[];
}
