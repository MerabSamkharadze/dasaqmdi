import { createClient } from "@/lib/supabase/server";
import { calculateMatch } from "@/lib/matching";
import type { ApplicationWithJob, JobWithCompany } from "@/lib/types";

type RecommendedJob = JobWithCompany & { matchScore: number };

type SeekerDashboardData = {
  totalApplications: number;
  pendingCount: number;
  reviewedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  recentApplications: ApplicationWithJob[];
  profileStrength: number;
  recommendedJobs: RecommendedJob[];
};

type EmployerCompanyInfo = {
  name: string;
  name_ka: string | null;
  logo_url: string | null;
  is_verified: boolean;
} | null;

type EmployerDashboardData = {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  newApplications: number;
  recentJobs: JobWithCompany[];
  company: EmployerCompanyInfo;
};

export async function getSeekerDashboardData(
  userId: string
): Promise<SeekerDashboardData> {
  const supabase = createClient();

  const now = new Date().toISOString();

  // First: fetch applications + profile in parallel. Jobs-for-matching is
  // only fetched if the seeker has skills to match against (avoids a 50-row
  // join for new users with empty profile).
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
      .limit(20)
      .returns<ApplicationWithJob[]>(),
    supabase.from("profiles").select("*").eq("id", userId).single(),
  ]);

  const applications = applicationsResult.data ?? [];
  const profile = profileResult.data;
  const seekerSkills = profile?.skills ?? [];

  // Only fetch jobs for matching when seeker has skills — otherwise zero
  // recommendations anyway. Saves ~200ms TTFB for new seekers.
  let allJobs: JobWithCompany[] = [];
  if (seekerSkills.length > 0) {
    const { data } = await supabase
      .from("jobs")
      .select(
        `
        *,
        company:companies!inner(id, name, name_ka, slug, logo_url),
        category:categories!inner(id, slug, name_en, name_ka)
      `
      )
      .eq("status", "active")
      .gte("expires_at", now)
      .or(`application_deadline.is.null,application_deadline.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<JobWithCompany[]>();
    allJobs = data ?? [];
  }

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

  // Recommended jobs: match against seeker skills, exclude already-applied.
  // `allJobs` is empty when seekerSkills.length === 0 (we skipped the fetch).
  const appliedJobIds = new Set(applications.map((a) => a.job.id));
  const recommendedJobs: RecommendedJob[] = allJobs
    .filter((job) => !appliedJobIds.has(job.id) && job.tags?.length > 0)
    .map((job) => {
      const { score } = calculateMatch(seekerSkills, job.tags);
      return { ...job, matchScore: score };
    })
    .filter((job) => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

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
    recommendedJobs,
  };
}

export async function getEmployerDashboardData(
  userId: string
): Promise<EmployerDashboardData> {
  const supabase = createClient();
  const now = new Date().toISOString();

  // Get employer's company + jobs in parallel
  const [{ data: companyData }, { data: jobs }] = await Promise.all([
    supabase
      .from("companies")
      .select("name, name_ka, logo_url, is_verified")
      .eq("owner_id", userId)
      .single(),
    supabase
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
      .returns<JobWithCompany[]>(),
  ]);

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
    company: companyData ?? null,
  };
}
