import { getJobs } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
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
  };
}) {
  const locale = await getLocale();
  const t = await getTranslations("jobs");

  const page = Number(searchParams.page) || 1;

  const [{ jobs, totalPages, currentPage, totalCount }, categories] =
    await Promise.all([
      getJobs({
        page,
        category: searchParams.category,
        city: searchParams.city,
        type: searchParams.type,
        q: searchParams.q,
      }),
      getCategories(),
    ]);

  // Match scores for logged-in seekers
  let matchScores: Map<string, number> | null = null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
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
    deadline: t("deadline"),
    noJobs: t("noJobs"),
    match: t("match"),
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
      <Suspense>
        <JobFilters
          categories={categoryOptions}
          translations={filterTranslations}
        />
      </Suspense>

      {/* Active filters summary */}
      {(searchParams.q || searchParams.category || searchParams.type || searchParams.city) && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
          <span>
            {totalCount} {totalCount === 1 ? "result" : "results"}
            {searchParams.q && <> for &ldquo;{searchParams.q}&rdquo;</>}
          </span>
        </div>
      )}

      {/* Job list */}
      <JobList
        jobs={jobs}
        locale={locale}
        matchScores={matchScores}
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
