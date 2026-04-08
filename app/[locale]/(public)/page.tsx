import { JobList } from "@/components/jobs/job-list";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { TopMatches, TopMatchesEmpty } from "@/components/jobs/top-matches";
import { getJobs } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "დასაქმდი — ვაკანსიები საქართველოში | dasakmdi.com",
  description:
    "იპოვე სამუშაო საქართველოში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები, ადმინისტრაცია და სხვა სფეროებში.",
};

export default async function HomePage({
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
  const tHome = await getTranslations("home");

  const page = Number(searchParams.page) || 1;

  // Fetch jobs, categories, and auth in parallel (biggest speed win)
  const supabase = createClient();
  const [{ jobs, totalPages, currentPage, totalCount }, categories, { data: { user } }] =
    await Promise.all([
      getJobs({
        page,
        category: searchParams.category,
        city: searchParams.city,
        type: searchParams.type,
        q: searchParams.q,
      }),
      getCategories(),
      supabase.auth.getUser(),
    ]);

  // Match scores + saved jobs for logged-in seekers
  let matchScores: Map<string, number> | null = null;
  let savedJobIds: Set<string> | null = null;
  let isLoggedIn = false;
  let isSeeker = false;
  let hasSkills = false;

  if (user) {
    isLoggedIn = true;
    // Profile + saved jobs in parallel (not sequential)
    const [profile, savedIds] = await Promise.all([
      getProfile(user.id),
      getSavedJobIds(user.id),
    ]);
    if (profile?.role === "seeker") {
      isSeeker = true;
      savedJobIds = savedIds;
      hasSkills = (profile.skills?.length ?? 0) > 0;
      if (hasSkills) {
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
  }

  // Compute top match IDs to exclude from main feed
  const showTopMatches = isSeeker && !searchParams.q && !searchParams.category && !searchParams.type && !searchParams.city && page === 1;
  const topMatchIds = new Set<string>();
  if (showTopMatches && matchScores && matchScores.size > 0) {
    const sorted = [...matchScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [id] of sorted) {
      topMatchIds.add(id);
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
    <>
      {/* Hero section — first page only, no filters active */}
      {page === 1 && !searchParams.q && !searchParams.category && !searchParams.type && !searchParams.city && (
        <section className="mb-10 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
              {tHome("title")}{" "}
              <span className="text-gradient">{tHome("titleAccent")}</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
              {tHome("subtitle")}
            </p>
          </div>
          {/* Animated SVG illustration */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] shrink-0 rounded-2xl overflow-hidden">
            <HeroIllustration />
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft backdrop-blur-sm">
        <Suspense>
          <JobFilters
            categories={categoryOptions}
            translations={filterTranslations}
          />
        </Suspense>
      </div>

      {/* Active filters summary */}
      {(searchParams.q || searchParams.category || searchParams.type || searchParams.city) && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60 mb-6">
          <span>
            {t("resultsCount", { count: totalCount })}
            {searchParams.q && <> — &ldquo;{searchParams.q}&rdquo;</>}
          </span>
        </div>
      )}

      {/* Top matches for seekers — only on first page without filters */}
      {isSeeker && !searchParams.q && !searchParams.category && !searchParams.type && !searchParams.city && page === 1 && (
        <div className="mb-8">
          {matchScores && matchScores.size > 0 ? (
            <TopMatches
              jobs={jobs}
              matchScores={matchScores}
              savedJobIds={savedJobIds}
              locale={locale}
              translations={{
                title: tHome("topMatches"),
                noSkills: tHome("noSkills"),
                noSkillsCta: tHome("noSkillsCta"),
                ...jobTranslations,
              }}
            />
          ) : hasSkills ? null : (
            <TopMatchesEmpty
              title={tHome("topMatches")}
              noSkills={tHome("noSkills")}
              noSkillsCta={tHome("noSkillsCta")}
            />
          )}
        </div>
      )}

      {/* Job feed — exclude jobs already shown in TopMatches */}
      <JobList
        jobs={topMatchIds.size > 0 ? jobs.filter((j) => !topMatchIds.has(j.id)) : jobs}
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
        basePath="/"
        searchParams={preservedParams}
      />
    </>
  );
}
