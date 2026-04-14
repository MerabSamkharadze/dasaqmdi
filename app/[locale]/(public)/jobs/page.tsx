import { getJobs } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import { JobList } from "@/components/jobs/job-list";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("jobs");
  return {
    title: t("title"),
    description: "Browse and search all job listings on dasakmdi.com",
  };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    city?: string;
    type?: string;
    q?: string;
    all?: string;
  };
}) {
  const locale = await getLocale();
  const t = await getTranslations("jobs");
  const tHome = await getTranslations("home");

  const page = Number(searchParams.page) || 1;

  // Step 1: Auth + categories in parallel
  const supabase = createClient();
  const [categories, { data: { user } }] = await Promise.all([
    getCategories(),
    supabase.auth.getUser(),
  ]);

  // Step 2: Profile for preferred categories + match scores
  let matchScores: Map<string, number> | null = null;
  let savedJobIds: Set<string> | null = null;
  let isLoggedIn = false;
  let preferredCategories: string[] = [];

  if (user) {
    isLoggedIn = true;
    const [profile, savedIds] = await Promise.all([
      getProfile(user.id),
      getSavedJobIds(user.id),
    ]);
    if (profile?.role === "seeker") {
      savedJobIds = savedIds;
      preferredCategories = profile.preferred_categories ?? [];
    }
  }

  // Step 3: Fetch jobs — auto-filter by preferred categories if no manual filter
  const hasManualFilter = !!(searchParams.category || searchParams.q || searchParams.type || searchParams.city);
  const showAll = searchParams.all === "1";
  const { jobs, totalPages, currentPage, totalCount } = await getJobs({
    page,
    category: searchParams.category,
    categories: !hasManualFilter && !showAll && preferredCategories.length > 0 ? preferredCategories : undefined,
    city: searchParams.city,
    type: searchParams.type,
    q: searchParams.q,
  });

  // Step 4: Match scores
  if (isLoggedIn && user) {
    const profile = await getProfile(user.id);
    if (profile?.role === "seeker" && profile.skills?.length > 0) {
      const results = calculateMatchScores(
        profile.skills,
        jobs.map((j) => ({ id: j.id, tags: j.tags }))
      );
      matchScores = new Map<string, number>();
      for (const [jobId, result] of results) {
        if (result.score > 0) {
          matchScores.set(jobId, result.score);
        }
      }
    }
  }

  const jobTranslations = {
    remote: t("remote"),
    featured: t("featured"),
    deadline: t("deadline", { date: "{date}" }),
    noJobs: t("noJobs"),
    match: t("match", { score: "{score}" }),
    types: {
      "full-time": t("types.full-time"),
      "part-time": t("types.part-time"),
      contract: t("types.contract"),
      internship: t("types.internship"),
      remote: t("types.remote"),
    },
  };

  const filterTranslations = {
    searchPlaceholder: t("searchPlaceholder"),
    category: t("filters.category"),
    location: t("filters.location"),
    type: t("filters.type"),
    allCategories: t("filters.allCategories"),
    allLocations: t("filters.allLocations"),
    allTypes: t("filters.allTypes"),
    types: jobTranslations.types,
  };

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    label: locale === "ka" ? c.name_ka : c.name_en,
  }));

  const preservedParams: Record<string, string> = {};
  if (searchParams.category) preservedParams.category = searchParams.category;
  if (searchParams.city) preservedParams.city = searchParams.city;
  if (searchParams.type) preservedParams.type = searchParams.type;
  if (searchParams.q) preservedParams.q = searchParams.q;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft backdrop-blur-sm">
        <Suspense>
          <JobFilters
            categories={categoryOptions}
            translations={filterTranslations}
          />
        </Suspense>
      </div>

      {/* Active filters summary */}
      {(searchParams.q || searchParams.category || searchParams.type || searchParams.city) && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
          <span>
            {t("resultsCount", { count: totalCount })}
            {searchParams.q && <> — &ldquo;{searchParams.q}&rdquo;</>}
          </span>
        </div>
      )}

      {/* Personalized feed indicator */}
      {!hasManualFilter && !showAll && preferredCategories.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/15">
          <span className="text-[12px] text-primary font-medium">
            {tHome("personalizedFeed")}
          </span>
          <a href="/jobs?all=1" className="text-[11px] text-primary/60 hover:text-primary transition-colors">
            {tHome("showAll")}
          </a>
        </div>
      )}

      {/* Job list */}
      <JobList
        jobs={jobs}
        locale={locale}
        matchScores={matchScores}
        savedJobIds={savedJobIds}
        isLoggedIn={isLoggedIn}
        translations={jobTranslations}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/jobs"
        searchParams={preservedParams}
      />
    </div>
  );
}
