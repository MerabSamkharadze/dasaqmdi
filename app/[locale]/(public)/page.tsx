import { JobList } from "@/components/jobs/job-list";
import { JobFilters } from "@/components/jobs/job-filters";
import { SearchFallbackBanner } from "@/components/jobs/search-fallback-banner";
import { ActiveFilterBadges, type FilterBadge } from "@/components/jobs/active-filter-badges";
import { Pagination } from "@/components/jobs/pagination";
import { TopMatches, TopMatchesEmpty } from "@/components/jobs/top-matches";
import { getJobs, getVipJobs } from "@/lib/queries/jobs";
import { VipSpotlight } from "@/components/jobs/vip-spotlight";
import { getCategories } from "@/lib/queries/categories";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ShowAllLink } from "@/components/shared/show-all-link";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { RegistrationTracker } from "@/components/tracking/registration-tracker";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKa = params.locale === "ka";
  const title = isKa
    ? "დასაქმდი — ვაკანსიები საქართველოში"
    : "dasaqmdi — Jobs in Georgia";
  const description = isKa
    ? "იპოვე სამუშაო საქართველოში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები, ადმინისტრაცია და სხვა სფეროებში."
    : "Find your next job in Georgia. Latest openings in IT, marketing, finance, administration and more.";
  const alternates = buildAlternates("/", params.locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({
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

  // Step 2: Profile (needed for preferred categories + match scores)
  let matchScores: Map<string, number> | null = null;
  let savedJobIds: Set<string> | null = null;
  let isLoggedIn = false;
  let isSeeker = false;
  let hasSkills = false;
  let preferredCategories: string[] = [];

  if (user) {
    isLoggedIn = true;
    const [profile, savedIds] = await Promise.all([
      getProfile(user.id),
      getSavedJobIds(user.id),
    ]);
    if (profile?.role === "seeker") {
      isSeeker = true;
      savedJobIds = savedIds;
      hasSkills = (profile.skills?.length ?? 0) > 0;
      preferredCategories = profile.preferred_categories ?? [];
    }
  }

  // Step 3: Fetch jobs — auto-filter by preferred categories if no manual filter
  const hasManualFilter = !!(searchParams.category || searchParams.q || searchParams.type || searchParams.city);
  const showAll = searchParams.all === "1";
  const { jobs, totalPages, currentPage, totalCount, searchFallback } = await getJobs({
    page,
    category: searchParams.category,
    categories: !hasManualFilter && !showAll && preferredCategories.length > 0 ? preferredCategories : undefined,
    city: searchParams.city,
    type: searchParams.type,
    q: searchParams.q,
  });

  // Step 4: Match scores for seekers
  if (isSeeker && hasSkills) {
    const profile = await getProfile(user!.id); // cached — no extra DB call
    if (profile?.skills) {
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
    suggestInCategory: t("filters.suggestInCategory", { category: "{category}" }),
    suggestInCity: t("filters.suggestInCity", { city: "{city}" }),
    types: jobTranslations.types,
  };

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    label: locale === "ka" ? c.name_ka : c.name_en,
  }));

  // Active filter badges (dismissable)
  const activeBadges: FilterBadge[] = [];
  if (searchParams.q) {
    activeBadges.push({
      paramKey: "q",
      label: `${t("filters.activeSearch")}: "${searchParams.q}"`,
    });
  }
  if (searchParams.category) {
    const cat = categories.find((c) => c.slug === searchParams.category);
    if (cat) {
      activeBadges.push({
        paramKey: "category",
        label: `${t("filters.activeCategory")}: ${locale === "ka" ? cat.name_ka : cat.name_en}`,
      });
    }
  }
  if (searchParams.city) {
    activeBadges.push({
      paramKey: "city",
      label: `${t("filters.activeCity")}: ${searchParams.city}`,
    });
  }
  if (searchParams.type) {
    activeBadges.push({
      paramKey: "type",
      label: `${t("filters.activeType")}: ${t(`types.${searchParams.type}`)}`,
    });
  }

  const preservedParams: Record<string, string> = {};
  if (searchParams.category) preservedParams.category = searchParams.category;
  if (searchParams.city) preservedParams.city = searchParams.city;
  if (searchParams.type) preservedParams.type = searchParams.type;
  if (searchParams.q) preservedParams.q = searchParams.q;

  return (
    <>
      <Suspense><RegistrationTracker /></Suspense>
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
            <RefreshButton />
          </div>
          {/* Animated SVG illustration */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] shrink-0 rounded-2xl overflow-hidden">
            <HeroIllustration />
          </div>
        </section>
      )}

      {/* VIP Spotlight */}
      {page === 1 && !searchParams.q && !searchParams.category && (
        <VipSpotlightSection locale={locale} />
      )}

      {/* Filters */}
      <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft backdrop-blur-sm">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-muted/50" />}>
          <JobFilters
            categories={categoryOptions}
            translations={filterTranslations}
            locale={locale}
          />
        </Suspense>
      </div>

      {/* Active filters — dismissable badges + result count */}
      {activeBadges.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          <div className="text-[12px] text-muted-foreground/60">
            {t("resultsCount", { count: totalCount })}
          </div>
          <ActiveFilterBadges
            badges={activeBadges}
            clearAllLabel={t("filters.clearAll")}
          />
        </div>
      )}

      {/* Synonym fallback indicator — shows when we broadened q → category */}
      {searchFallback && (
        <div className="mb-6">
          <SearchFallbackBanner
            originalTerm={searchFallback.originalTerm}
            resolvedCategories={searchFallback.resolvedCategories}
            locale={locale}
            template={t("filters.fallbackBanner")}
          />
        </div>
      )}

      {/* Personalized feed indicator */}
      {!hasManualFilter && !showAll && preferredCategories.length > 0 && (
        <div className="flex items-center justify-between mb-6 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15">
          <span className="text-[12px] text-primary font-medium">
            {tHome("personalizedFeed")}
          </span>
          <ShowAllLink />
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

async function VipSpotlightSection({ locale }: { locale: string }) {
  const t = await getTranslations("jobs");
  const vipJobs = await getVipJobs(10);
  if (vipJobs.length === 0) return null;
  return <VipSpotlight jobs={vipJobs} locale={locale} title={t("vipSpotlight")} />;
}
