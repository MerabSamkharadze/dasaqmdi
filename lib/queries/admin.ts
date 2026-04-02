import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Company, Job } from "@/lib/types";

// C3 FIX: Shared admin verification for query layer (defense-in-depth)
async function requireAdmin(): Promise<void> {
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
}

export async function getAdminStats() {
  await requireAdmin();

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
  await requireAdmin();

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllJobs(): Promise<Job[]> {
  await requireAdmin();

  const supabase = createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAllCompaniesAdmin(): Promise<Company[]> {
  await requireAdmin();

  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
