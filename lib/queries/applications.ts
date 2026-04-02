import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ApplicationWithJob, ApplicationWithApplicant } from "@/lib/types";

// H2 FIX: Auth-enforced — only returns the authenticated user's own applications
export async function getMyApplications(): Promise<ApplicationWithJob[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

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
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ApplicationWithJob[]>();

  if (error) {
    console.error("Failed to fetch applications:", error.message);
    return [];
  }

  return data ?? [];
}

// H3 FIX: Auth-enforced — verifies the caller owns the job before returning applications
// When caller has already verified ownership (e.g. page checked job.posted_by === user.id),
// pass verifiedOwnerId to skip the redundant job query
export async function getApplicationsByJob(
  jobId: string,
  verifiedOwnerId?: string
): Promise<ApplicationWithApplicant[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // If caller already verified ownership, just confirm user matches
  if (verifiedOwnerId) {
    if (verifiedOwnerId !== user.id) return [];
  } else {
    // Otherwise verify ownership via DB query
    const { data: job } = await supabase
      .from("jobs")
      .select("id, posted_by")
      .eq("id", jobId)
      .single();

    if (!job || job.posted_by !== user.id) {
      return [];
    }
  }

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
    .order("created_at", { ascending: false })
    .returns<ApplicationWithApplicant[]>();

  if (error) {
    console.error("Failed to fetch job applications:", error.message);
    return [];
  }

  return data ?? [];
}
