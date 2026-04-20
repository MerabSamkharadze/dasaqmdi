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
      .order("vip_until", { ascending: false, nullsFirst: false })
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

    // Sort: gold (PREMIUM) → silver (VIP) → featured → normal
    const now = Date.now();
    const sorted = (data ?? []).sort((a, b) => {
      const aVip = a.vip_level !== "normal" && a.vip_until && new Date(a.vip_until).getTime() > now;
      const bVip = b.vip_level !== "normal" && b.vip_until && new Date(b.vip_until).getTime() > now;
      if (aVip && !bVip) return -1;
      if (!aVip && bVip) return 1;
      if (aVip && bVip) {
        const aGold = a.vip_level === "gold" ? 0 : 1;
        const bGold = b.vip_level === "gold" ? 0 : 1;
        if (aGold !== bGold) return aGold - bGold;
      }
      return 0; // keep DB order for same tier
    });

    return {
      jobs: sorted,
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

const VIP_SORT_ORDER: Record<string, number> = { gold: 0, silver: 1 };

export async function getVipJobs(limit = 20): Promise<JobWithCompany[]> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url, is_verified),
      category:categories!inner(id, slug, name_en, name_ka)
    `)
    .eq("status", "active")
    .gte("expires_at", now)
    .neq("vip_level", "normal")
    .gte("vip_until", now)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<JobWithCompany[]>();

  // Sort: gold (PREMIUM) first, then silver (VIP)
  return (data ?? []).sort(
    (a, b) => (VIP_SORT_ORDER[a.vip_level] ?? 9) - (VIP_SORT_ORDER[b.vip_level] ?? 9),
  );
}

type EmployerJobFilters = {
  q?: string;
  status?: string;
  category?: string;
};

export async function getJobsByEmployer(
  userId: string,
  filters?: EmployerJobFilters,
): Promise<JobWithCompany[]> {
  const supabase = createClient();

  let query = supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies!inner(id, name, name_ka, slug, logo_url, is_verified),
      category:categories!inner(id, slug, name_en, name_ka)
    `
    )
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (filters?.q) {
    const term = `%${filters.q}%`;
    query = query.or(`title.ilike.${term},title_ka.ilike.${term}`);
  }

  const now = new Date().toISOString();
  if (filters?.status === "active") {
    query = query.eq("status", "active").gte("expires_at", now);
  } else if (filters?.status === "closed") {
    query = query.in("status", ["closed", "archived"]);
  } else if (filters?.status === "expired") {
    query = query.eq("status", "active").lt("expires_at", now);
  }

  if (filters?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data, error } = await query.returns<JobWithCompany[]>();

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
