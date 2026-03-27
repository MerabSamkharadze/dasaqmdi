import { createClient } from "@/lib/supabase/server";
import type { JobWithCompany } from "@/lib/types";

const JOBS_PER_PAGE = 20;

type GetJobsParams = {
  page?: number;
  category?: string;
  city?: string;
  type?: string;
  q?: string;
};

type GetJobsResult = {
  jobs: JobWithCompany[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export async function getJobs({
  page = 1,
  category,
  city,
  type,
  q,
}: GetJobsParams = {}): Promise<GetJobsResult> {
  const supabase = createClient();
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE - 1;

  let query = supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url),
      category:categories!inner(id, slug, name_en, name_ka)
    `,
      { count: "exact" },
    )
    .eq("status", "active")
    .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq("category.slug", category);
  }
  if (city) {
    query = query.ilike("city", `%${city}%`);
  }
  if (type) {
    query = query.eq("job_type", type);
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch jobs:", error.message);
    return { jobs: [], totalCount: 0, totalPages: 0, currentPage };
  }

  const totalCount = count ?? 0;

  return {
    jobs: (data ?? []) as unknown as JobWithCompany[],
    totalCount,
    totalPages: Math.ceil(totalCount / JOBS_PER_PAGE),
    currentPage,
  };
}

export async function getJobById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url, city, website, description, description_ka),
      category:categories!inner(id, slug, name_en, name_ka)
    `,
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as JobWithCompany;
}
