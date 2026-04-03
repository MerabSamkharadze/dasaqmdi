import { createClient } from "@/lib/supabase/server";
import type { JobWithCompany } from "@/lib/types";

export async function getSavedJobs(userId: string): Promise<JobWithCompany[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("saved_jobs")
    .select(
      `
      job:jobs!inner(
        *,
        company:companies!inner(id, name, name_ka, slug, logo_url),
        category:categories!inner(id, slug, name_en, name_ka)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => row.job as unknown as JobWithCompany);
}

export async function getSavedJobIds(userId: string): Promise<Set<string>> {
  const supabase = createClient();

  const { data } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((row) => row.job_id));
}
