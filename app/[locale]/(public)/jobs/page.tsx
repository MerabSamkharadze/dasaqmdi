import { getJobs } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import { CountBadge } from "@/components/shared/count-badge";
import { JobList } from "@/components/jobs/job-list";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { ShowAllLink } from "@/components/shared/show-all-link";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("jobs");
  const isKa = params.locale === "ka";
  const description = isKa
    ? `დაათვალიერე და მოძებნე ყველა ვაკანსია ${siteConfig.domain}-ზე.`
    : `Browse and search all job listings on ${siteConfig.domain}.`;
  const alternates = buildAlternates("/jobs", params.locale);
  return {
    title: t("title"),
    description,
    alternates,
    openGraph: {
      title: t("title"),
      description,
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description,
    },
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
          <CountBadge>{totalCount}</CountBadge>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft backdrop-blur-sm">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-muted/50" />}>
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
          <ShowAllLink href="/jobs?all=1" />
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

      {/* SEO internal links */}
      {page === 1 && !searchParams.q && !searchParams.category && (
        <section className="mt-4 rounded-xl border border-border/40 bg-card/50 p-5">
          <h2 className="text-[13px] font-semibold text-muted-foreground mb-3">
            {tHome("browseByCategory")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/jobs/explore/tbilisi", label: locale === "ka" ? "თბილისი" : "Tbilisi" },
              { href: "/jobs/explore/batumi", label: locale === "ka" ? "ბათუმი" : "Batumi" },
              { href: "/jobs/explore/remote", label: locale === "ka" ? "დისტანციური" : "Remote" },
              { href: "/jobs/explore/internship", label: locale === "ka" ? "სტაჟირება" : "Internship" },
              { href: "/jobs/explore/it-software", label: "IT" },
              { href: "/jobs/explore/sales-marketing", label: locale === "ka" ? "მარკეტინგი" : "Marketing" },
              { href: "/jobs/explore/finance", label: locale === "ka" ? "ფინანსები" : "Finance" },
              { href: "/jobs/explore/hospitality", label: locale === "ka" ? "სტუმართმოყვარეობა" : "Hospitality" },
              { href: "/jobs/explore/healthcare", label: locale === "ka" ? "ჯანდაცვა" : "Healthcare" },
              { href: "/jobs/explore/part-time", label: locale === "ka" ? "ნახევარი განაკვეთი" : "Part-time" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] rounded-lg px-3 py-1.5 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
