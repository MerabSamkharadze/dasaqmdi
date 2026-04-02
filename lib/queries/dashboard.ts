import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithJob, JobWithCompany } from "@/lib/types";

type SeekerDashboardData = {
  totalApplications: number;
  pendingCount: number;
  reviewedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  recentApplications: ApplicationWithJob[];
  profileStrength: number;
};

type EmployerDashboardData = {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  newApplications: number;
  recentJobs: JobWithCompany[];
};

export async function getSeekerDashboardData(
  userId: string
): Promise<SeekerDashboardData> {
  const supabase = createClient();

  const [applicationsResult, profileResult] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `
        *,
        job:jobs!inner(
          id, title, title_ka, status, application_deadline,
          company:companies!inner(name, name_ka, logo_url)
        )
      `
      )
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false })
      .returns<ApplicationWithJob[]>(),
    supabase.from("profiles").select("*").eq("id", userId).single(),
  ]);

  const applications = applicationsResult.data ?? [];
  const profile = profileResult.data;

  // Profile strength: count filled fields out of key fields
  const profileFields = [
    profile?.full_name,
    profile?.phone,
    profile?.city,
    profile?.bio,
    profile?.skills?.length,
    profile?.experience_years,
    profile?.resume_url,
    profile?.avatar_url,
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const profileStrength = Math.round((filledCount / profileFields.length) * 100);

  return {
    totalApplications: applications.length,
    pendingCount: applications.filter((a) => a.status === "pending").length,
    reviewedCount: applications.filter(
      (a) => a.status === "reviewed" || a.status === "shortlisted"
    ).length,
    acceptedCount: applications.filter((a) => a.status === "accepted").length,
    rejectedCount: applications.filter((a) => a.status === "rejected").length,
    recentApplications: applications.slice(0, 5),
    profileStrength,
  };
}

export async function getEmployerDashboardData(
  userId: string
): Promise<EmployerDashboardData> {
  const supabase = createClient();
  const now = new Date().toISOString();

  // Get employer's jobs with company info
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url),
      category:categories!inner(id, slug, name_en, name_ka)
    `
    )
    .eq("posted_by", userId)
    .order("created_at", { ascending: false })
    .returns<JobWithCompany[]>();

  const allJobs = jobs ?? [];
  const jobIds = allJobs.map((j) => j.id);

  const activeJobs = allJobs.filter(
    (j) => j.status === "active" && j.expires_at >= now
  ).length;

  // Get application counts for employer's jobs
  let totalApplications = 0;
  let newApplications = 0;

  if (jobIds.length > 0) {
    const [totalResult, newResult] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("job_id", jobIds),
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("is_viewed", false),
    ]);

    totalApplications = totalResult.count ?? 0;
    newApplications = newResult.count ?? 0;
  }

  return {
    activeJobs,
    totalJobs: allJobs.length,
    totalApplications,
    newApplications,
    recentJobs: allJobs.slice(0, 5),
  };
}
