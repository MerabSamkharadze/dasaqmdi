import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

export type ApplicantProfileForEmployer = {
  profile: Profile;
  email: string | null;
  applications: Array<{
    id: string;
    status: string;
    created_at: string;
    job: { id: string; title: string; title_ka: string | null };
  }>;
};

export type EmployerApplicationRow = {
  id: string;
  status: string;
  is_viewed: boolean;
  created_at: string;
  resume_url: string;
  cover_letter: string | null;
  applicant: {
    id: string;
    full_name: string | null;
    full_name_ka: string | null;
    avatar_url: string | null;
    skills: string[];
    experience_years: number | null;
  };
  job: {
    id: string;
    title: string;
    title_ka: string | null;
  };
};

export async function getAllEmployerApplications(
  userId: string
): Promise<EmployerApplicationRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  if (user.id !== userId) return [];

  // Get all employer's job IDs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("posted_by", userId);

  const jobIds = (jobs ?? []).map((j) => j.id);
  if (jobIds.length === 0) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id, status, is_viewed, created_at, resume_url, cover_letter,
      applicant:profiles!inner(id, full_name, full_name_ka, avatar_url, skills, experience_years),
      job:jobs!inner(id, title, title_ka)
    `
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .returns<EmployerApplicationRow[]>();

  if (error) {
    console.error("Failed to fetch employer applications:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Returns an applicant's full profile + email + all their applications to the
 * requesting employer's jobs. Bypasses the public `is_public` privacy flag
 * because the employer has a legitimate business relationship with the
 * applicant (the applicant chose to apply). Returns null if no such
 * relationship exists.
 */
export async function getApplicantProfileForEmployer(
  applicantId: string,
  employerId: string
): Promise<ApplicantProfileForEmployer | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== employerId) return null;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("posted_by", employerId);

  const jobIds = (jobs ?? []).map((j) => j.id);
  if (jobIds.length === 0) return null;

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `id, status, created_at,
       job:jobs!inner(id, title, title_ka)`
    )
    .eq("applicant_id", applicantId)
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .returns<ApplicantProfileForEmployer["applications"]>();

  if (!applications || applications.length === 0) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", applicantId)
    .single();

  if (!profile) return null;

  let email: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: authUser } = await admin.auth.admin.getUserById(applicantId);
    email = authUser?.user?.email ?? null;
  } catch {
    email = null;
  }

  return { profile: profile as Profile, email, applications };
}
