import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
