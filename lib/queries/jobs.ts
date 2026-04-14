import { unstable_cache } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { JobWithCompany } from "@/lib/types";

const JOBS_PER_PAGE = 20;

type GetJobsParams = {
  page?: number;
  category?: string;
  categories?: string[]; // multi-category filter for preferred categories
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

// Cached version for public feed — 30 second cache
const getJobsCached = unstable_cache(
  async (page: number, category?: string, categoriesJson?: string, city?: string, type?: string, q?: string): Promise<GetJobsResult> => {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const currentPage = Math.max(1, page);
    const from = (currentPage - 1) * JOBS_PER_PAGE;
    const to = from + JOBS_PER_PAGE - 1;

    let query = supabase
      .from("jobs")
      .select(
        `
        *,
        company:companies!inner(id, name, name_ka, slug, logo_url, is_verified),
        category:categories!inner(id, slug, name_en, name_ka)
      `,
        { count: "exact" },
      )
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category) {
      query = query.eq("category.slug", category);
    } else if (categoriesJson) {
      const cats = JSON.parse(categoriesJson) as string[];
      if (cats.length > 0) query = query.in("category.slug", cats);
    }
    if (city) query = query.ilike("city", `%${city}%`);
    if (type) query = query.eq("job_type", type);
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

    const { data, count, error } = await query.returns<JobWithCompany[]>();

    if (error) {
      console.error("Failed to fetch jobs:", error.message);
      return { jobs: [], totalCount: 0, totalPages: 0, currentPage };
    }

    return {
      jobs: data ?? [],
      totalCount: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / JOBS_PER_PAGE),
      currentPage,
    };
  },
  ["jobs-feed"],
  { revalidate: 30 }
);

export async function getJobs({
  page = 1,
  category,
  categories,
  city,
  type,
  q,
}: GetJobsParams = {}): Promise<GetJobsResult> {
  const categoriesJson = categories && categories.length > 0 ? JSON.stringify(categories) : undefined;
  return getJobsCached(page, category, categoriesJson, city, type, q);
}

export async function getJobsByEmployer(userId: string): Promise<JobWithCompany[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url, is_verified),
      category:categories!inner(id, slug, name_en, name_ka)
    `
    )
    .eq("posted_by", userId)
    .order("created_at", { ascending: false })
    .returns<JobWithCompany[]>();

  if (error) {
    console.error("Failed to fetch employer jobs:", error.message);
    return [];
  }

  return data ?? [];
}

// Note: Job detail page selects extended company fields (city, website, description).
// The return type uses JobWithCompany but the actual data includes extra company fields
// accessible at runtime. This is safe because TypeScript's structural typing allows it.
export async function getJobById(id: string): Promise<JobWithCompany | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url, is_verified, city, website, description, description_ka),
      category:categories!inner(id, slug, name_en, name_ka)
    `,
    )
    .eq("id", id)
    .returns<JobWithCompany[]>()
    .single();

  if (error) return null;
  return data;
}
