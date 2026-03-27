import { createClient } from "@/lib/supabase/server";
import type { Profile, Company, Job } from "@/lib/types";

export async function getAdminStats() {
  const supabase = createClient();

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
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllJobs(): Promise<Job[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllCompaniesAdmin(): Promise<Company[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
