import { unstable_cache } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { generateSearchCandidates } from "@/lib/transliteration";
import type { Category, JobWithCompany } from "@/lib/types";

const JOBS_PER_PAGE = 20;

// Synonym fallback triggers when the initial q-search returns fewer than
// this many hits. Chosen to favour specificity: if the user's exact term
// already matched a handful of real jobs, we don't broaden to a whole category.
const SYNONYM_FALLBACK_THRESHOLD = 3;

export type ResolvedCategory = Pick<Category, "id" | "slug" | "name_en" | "name_ka">;

// Shape returned by the resolve_categories_from_term RPC. The DB returns
// `category_id` (not `id`) so we map in the wrapper.
type SynonymRpcRow = {
  category_id: number;
  slug: string;
  name_en: string;
  name_ka: string;
  score: number;
};

// Shape returned by the resolve_city RPC.
type CityRpcRow = {
  id: number;
  name_en: string;
  name_ka: string;
  aliases: string[] | null;
  score: number;
};

// PostgREST `.or()` treats commas as filter separators and parens as groupers,
// and ILIKE treats `%` / `_` as wildcards. Stripping these defensively so
// arbitrary user-typed or DB-stored strings don't break the query syntax.
function sanitizeForOrFilter(value: string): string {
  return value.replace(/[,()%_*]/g, " ").trim();
}

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
  // Populated when the original `q` search was thin and we broadened by
  // synonym-resolved category. UI should show: "No exact matches for
  // '{originalTerm}' — showing jobs in {resolvedCategories[]}."
  searchFallback?: {
    originalTerm: string;
    resolvedCategories: ResolvedCategory[];
  };
};

// Factory so AnonClient picks up the runtime-inferred schema binding.
// Using ReturnType<typeof createServiceClient> directly (no args applied)
// yields a stricter type that doesn't match real call sites.
function createAnonClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
type AnonClient = ReturnType<typeof createAnonClient>;

type RunQueryArgs = {
  supabase: AnonClient;
  page: number;
  category?: string;
  categoriesJson?: string;
  categoryIds?: number[];
  city?: string;
  type?: string;
  q?: string;
};

// Pulled out of the cached wrapper so we can run the base query twice
// (first with `q`, then broadened by synonym-resolved category ids).
async function runJobsQuery({
  supabase,
  page,
  category,
  categoriesJson,
  categoryIds,
  city,
  type,
  q,
}: RunQueryArgs): Promise<{ jobs: JobWithCompany[]; count: number }> {
  const from = (page - 1) * JOBS_PER_PAGE;
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
  } else if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  }
  if (type) query = query.eq("job_type", type);

  // City: resolve via canonical cities table when possible, otherwise fall
  // back to the user's typed term + its cross-script transliteration. In
  // both cases we OR-match jobs.city against every variant.
  if (city) {
    const variants = await resolveCityVariants(supabase, city);
    const safeVariants = variants.map(sanitizeForOrFilter).filter(Boolean);
    if (safeVariants.length > 0) {
      const orFilter = safeVariants.map((v) => `city.ilike.%${v}%`).join(",");
      query = query.or(orFilter);
    }
  }

  if (q) {
    const safe = sanitizeForOrFilter(q);
    if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, count, error } = await query.returns<JobWithCompany[]>();

  if (error) {
    console.error("Failed to fetch jobs:", error.message);
    return { jobs: [], count: 0 };
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

  return { jobs: sorted, count: count ?? 0 };
}

// Low-level: single-term RPC call. Prefer `resolveCategoriesSmart` which
// also handles cross-script transliteration candidates.
async function resolveCategoriesViaRpc(
  supabase: AnonClient,
  searchTerm: string,
): Promise<ResolvedCategory[]> {
  // Cast is deliberate: the generated Database type doesn't include this
  // RPC until `supabase gen types` is re-run after migration 021.
  // Matches the pattern used in lib/queries/admin.ts for trend RPCs.
  const { data, error } = await supabase.rpc(
    "resolve_categories_from_term" as never,
    { search_term: searchTerm } as never,
  );

  if (error) {
    console.error("Failed to resolve synonym categories:", error.message);
    return [];
  }

  const rows = (data ?? []) as SynonymRpcRow[];
  return rows.map((row) => ({
    id: row.category_id,
    slug: row.slug,
    name_en: row.name_en,
    name_ka: row.name_ka,
  }));
}

export type ResolvedCity = {
  name_en: string;
  name_ka: string;
};

// Shared core: try the RPC across transliteration candidates, return the
// first canonical match (or null). Used by both variant expansion (for the
// feed filter) and canonical lookup (for the autocomplete chip).
async function resolveCityMatch(
  supabase: AnonClient,
  term: string,
): Promise<CityRpcRow | null> {
  const candidates = generateSearchCandidates(term);
  if (candidates.length === 0) return null;

  const responses = await Promise.all(
    candidates.map((c) =>
      supabase.rpc("resolve_city" as never, { search_term: c } as never),
    ),
  );

  for (const r of responses) {
    const rows = (r.data ?? []) as CityRpcRow[];
    if (rows.length > 0) return rows[0];
  }
  return null;
}

// Resolve a city search term to the list of known variants for the best-
// matching canonical city (e.g. "tblisi" → ["Tbilisi", "თბილისი", "Tiflis",
// "ტფილისი"]). Returns the transliteration candidates as a fallback when no
// canonical match exists, so unknown villages/districts still get some
// cross-script tolerance instead of a strict ILIKE miss.
async function resolveCityVariants(
  supabase: AnonClient,
  term: string,
): Promise<string[]> {
  const match = await resolveCityMatch(supabase, term);
  if (!match) return generateSearchCandidates(term);

  const variants = new Set<string>([match.name_en, match.name_ka]);
  for (const alias of match.aliases ?? []) variants.add(alias);
  return Array.from(variants);
}

// Autocomplete helper for JobFilters — exposes just the canonical bilingual
// pair so the UI can render a chip ("Searching in Tbilisi?") and the click
// handler can push the canonical English name into the URL.
//
// Cached 5 min per term, like the category autocomplete. Short terms are
// skipped because trigram scores are noisy below 2 chars.
const resolveCityCanonicalCached = unstable_cache(
  async (term: string): Promise<ResolvedCity | null> => {
    const supabase = createAnonClient();
    const match = await resolveCityMatch(supabase, term);
    if (!match) return null;
    return { name_en: match.name_en, name_ka: match.name_ka };
  },
  ["city-canonical"],
  { revalidate: 300 },
);

export async function resolveCityCanonical(
  term: string,
): Promise<ResolvedCity | null> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return null;
  return resolveCityCanonicalCached(trimmed.toLowerCase());
}

// High-level: transliterate the term across scripts, fan out to the RPC in
// parallel, and merge results by category_id. Each candidate's results are
// already score-sorted by the RPC, so we preserve first-occurrence order —
// the top match from the best-fitting candidate wins the ranking.
//
// Handles the two user behaviours that pure same-script search misses:
//   • Latin typed for Georgian word  ("menejeri" → "მენეჯერი")
//   • Georgian typed for English word ("მანაგერ" → "manager")
async function resolveCategoriesSmart(
  supabase: AnonClient,
  searchTerm: string,
): Promise<ResolvedCategory[]> {
  const candidates = generateSearchCandidates(searchTerm);
  if (candidates.length === 0) return [];

  const batches = await Promise.all(
    candidates.map((term) => resolveCategoriesViaRpc(supabase, term)),
  );

  const seen = new Set<number>();
  const merged: ResolvedCategory[] = [];
  for (const batch of batches) {
    for (const cat of batch) {
      if (!seen.has(cat.id)) {
        seen.add(cat.id);
        merged.push(cat);
      }
    }
  }
  // RPC already caps at 3 per call; after merge we may have up to 3 × N,
  // so re-cap to keep the UX consistent.
  return merged.slice(0, 3);
}

// Cached version for public feed — 30 second cache
const getJobsCached = unstable_cache(
  async (page: number, category?: string, categoriesJson?: string, city?: string, type?: string, q?: string): Promise<GetJobsResult> => {
    const supabase = createAnonClient();

    const currentPage = Math.max(1, page);

    const { jobs, count } = await runJobsQuery({
      supabase,
      page: currentPage,
      category,
      categoriesJson,
      city,
      type,
      q,
    });

    // Synonym fallback: if the user searched a term and we got thin results,
    // resolve it via synonym table and broaden the search by category. Only
    // kicks in when no explicit category filter is already active — otherwise
    // we'd override the user's deliberate scoping.
    const shouldFallback =
      !!q &&
      count < SYNONYM_FALLBACK_THRESHOLD &&
      !category &&
      !categoriesJson;

    if (shouldFallback && q) {
      const resolved = await resolveCategoriesSmart(supabase, q);
      if (resolved.length > 0) {
        const fallback = await runJobsQuery({
          supabase,
          page: currentPage,
          categoryIds: resolved.map((r) => r.id),
          city,
          type,
          // deliberately omit `q` — we've already mapped the intent to a category
        });

        if (fallback.count > 0) {
          return {
            jobs: fallback.jobs,
            totalCount: fallback.count,
            totalPages: Math.ceil(fallback.count / JOBS_PER_PAGE),
            currentPage,
            searchFallback: {
              originalTerm: q,
              resolvedCategories: resolved,
            },
          };
        }
      }
    }

    return {
      jobs,
      totalCount: count,
      totalPages: Math.ceil(count / JOBS_PER_PAGE),
      currentPage,
    };
  },
  ["jobs-feed"],
  { revalidate: 30 }
);

// Autocomplete helper for JobFilters — "Looking for jobs in [Category]?".
// Cached 5 min per (term, locale-agnostic) so rapid keystrokes don't hit
// the DB. Callers should debounce on the client side (~300ms).
const resolveCategoriesForTermCached = unstable_cache(
  async (term: string): Promise<ResolvedCategory[]> => {
    const supabase = createAnonClient();
    return resolveCategoriesSmart(supabase, term);
  },
  ["synonym-resolve"],
  { revalidate: 300 },
);

export async function resolveCategoriesForTerm(
  term: string,
): Promise<ResolvedCategory[]> {
  const trimmed = term.trim();
  // Skip ultra-short terms — trigram scores are unstable below 2 chars and
  // would spam results. Let the feed's normal title search handle those.
  if (trimmed.length < 2) return [];
  return resolveCategoriesForTermCached(trimmed.toLowerCase());
}

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
