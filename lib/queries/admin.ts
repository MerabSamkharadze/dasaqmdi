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

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = await requireAdmin();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
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

export async function getAllCompaniesAdmin(): Promise<Company[]> {
  const supabase = await requireAdmin();

  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
