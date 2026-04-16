import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Company, Job } from "@/lib/types";

// C3 FIX: Shared admin verification — returns the same client to avoid double-creation
async function requireAdmin(): Promise<SupabaseClient> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return supabase;
}

export async function getAdminStats() {
  const supabase = await requireAdmin();

  const [users, jobs, companies, applications] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalJobs: jobs.count ?? 0,
    totalCompanies: companies.count ?? 0,
    totalApplications: applications.count ?? 0,
  };
}

type AdminUserFilters = {
  q?: string;
  role?: string;
};

export async function getAllUsers(filters?: AdminUserFilters): Promise<Profile[]> {
  const supabase = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.q) {
    const term = `%${filters.q}%`;
    query = query.or(`full_name.ilike.${term},full_name_ka.ilike.${term}`);
  }

  if (filters?.role && ["seeker", "employer", "admin"].includes(filters.role)) {
    query = query.eq("role", filters.role);
  }

  const { data } = await query;
  return data ?? [];
}

type AdminJobFilters = {
  q?: string;
  status?: string;
  category?: string;
};

export async function getAllJobs(filters?: AdminJobFilters): Promise<Job[]> {
  const supabase = await requireAdmin();

  // Resolve category slug → id if needed
  let categoryId: number | undefined;
  if (filters?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    categoryId = cat?.id;
  }

  let query = supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.q) {
    const term = `%${filters.q}%`;
    query = query.or(`title.ilike.${term},title_ka.ilike.${term}`);
  }

  const now = new Date().toISOString();
  if (filters?.status === "active") {
    query = query.eq("status", "active").gte("expires_at", now);
  } else if (filters?.status === "closed") {
    query = query.eq("status", "closed");
  } else if (filters?.status === "expired") {
    query = query.eq("status", "active").lt("expires_at", now);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  return data ?? [];
}

// --- Analytics ---

export type TrendPoint = { date: string; count: number };
export type CategoryCount = { slug: string; name_en: string; name_ka: string; count: number };

export async function getRegistrationTrend(days = 30): Promise<TrendPoint[]> {
  const supabase = await requireAdmin();
  const { data } = await supabase.rpc("get_registration_trend", { p_days: days });
  return (data as TrendPoint[]) ?? [];
}

export async function getJobPostingTrend(days = 30): Promise<TrendPoint[]> {
  const supabase = await requireAdmin();
  const { data } = await supabase.rpc("get_job_posting_trend", { p_days: days });
  return (data as TrendPoint[]) ?? [];
}

export async function getApplicationTrend(days = 30): Promise<TrendPoint[]> {
  const supabase = await requireAdmin();
  const { data } = await supabase.rpc("get_application_trend", { p_days: days });
  return (data as TrendPoint[]) ?? [];
}

export async function getCategoryBreakdown(): Promise<CategoryCount[]> {
  const supabase = await requireAdmin();
  const { data } = await supabase.rpc("get_category_breakdown");
  return (data as CategoryCount[]) ?? [];
}

// --- User Detail ---

export type AdminUserDetail = {
  profile: Profile;
  applicationsCount: number;
  postedJobsCount: number;
  company: { id: string; name: string; slug: string; is_verified: boolean } | null;
};

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const [applications, jobs, company] = await Promise.all([
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", userId),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("posted_by", userId),
    supabase
      .from("companies")
      .select("id, name, slug, is_verified")
      .eq("owner_id", userId)
      .single(),
  ]);

  return {
    profile,
    applicationsCount: applications.count ?? 0,
    postedJobsCount: jobs.count ?? 0,
    company: company.data,
  };
}

// --- Company Detail ---

export type AdminCompanyDetail = {
  company: Company;
  owner: { id: string; full_name: string | null; full_name_ka: string | null; role: string } | null;
  activeJobsCount: number;
  totalJobsCount: number;
  totalApplicationsCount: number;
  subscription: {
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
};

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail | null> {
  const supabase = await requireAdmin();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (!company) return null;

  const now = new Date().toISOString();

  // First: get job IDs for this company (needed for applications count)
  const { data: companyJobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", companyId);
  const jobIds = (companyJobs ?? []).map((j) => j.id);

  const [owner, activeJobs, totalJobs, applications, subscription] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, full_name_ka, role")
      .eq("id", company.owner_id)
      .single(),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "active")
      .gte("expires_at", now),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    jobIds.length > 0
      ? supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .in("job_id", jobIds)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    company,
    owner: owner.data,
    activeJobsCount: activeJobs.count ?? 0,
    totalJobsCount: totalJobs.count ?? 0,
    totalApplicationsCount: applications.count ?? 0,
    subscription: subscription.data,
  };
}

// --- Subscriptions ---

export type AdminSubscription = {
  id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  company: { id: string; name: string; slug: string } | null;
};

type AdminSubscriptionFilters = {
  status?: string;
  plan?: string;
};

export async function getAllSubscriptions(filters?: AdminSubscriptionFilters): Promise<AdminSubscription[]> {
  const supabase = await requireAdmin();

  let query = supabase
    .from("subscriptions")
    .select("id, plan, status, current_period_start, current_period_end, created_at, company:companies(id, name, slug)")
    .order("created_at", { ascending: false });

  if (filters?.status && ["active", "cancelled", "past_due", "expired"].includes(filters.status)) {
    query = query.eq("status", filters.status);
  }
  if (filters?.plan && ["free", "pro", "verified"].includes(filters.plan)) {
    query = query.eq("plan", filters.plan);
  }

  const { data } = await query;
  return (data as unknown as AdminSubscription[]) ?? [];
}

// --- Moderation ---

export type PendingJob = {
  id: string;
  title: string;
  title_ka: string | null;
  created_at: string;
  company: { name: string; name_ka: string | null; slug: string } | null;
};

export async function getPendingJobs(): Promise<PendingJob[]> {
  const supabase = await requireAdmin();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, title_ka, created_at, company:companies(name, name_ka, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data as unknown as PendingJob[]) ?? [];
}

export async function getAllCompaniesAdmin(): Promise<Company[]> {
  const supabase = await requireAdmin();

  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
