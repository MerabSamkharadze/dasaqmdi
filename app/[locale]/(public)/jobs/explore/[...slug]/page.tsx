import { getJobs } from "@/lib/queries/jobs";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { calculateMatchScores } from "@/lib/matching";
import { getLandingConfig, getAllLandingSlugs } from "@/lib/seo-landings";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { JobList } from "@/components/jobs/job-list";
import { Pagination } from "@/components/jobs/pagination";
import { CountBadge } from "@/components/shared/count-badge";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

type PageProps = {
  params: { slug: string[]; locale: string };
  searchParams: { page?: string };
};

export async function generateStaticParams() {
  return getAllLandingSlugs().map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const landing = getLandingConfig(params.slug[0]);
  if (!landing) return { title: "Not Found" };

  const isKa = params.locale === "ka";
  const title = isKa ? landing.title.ka : landing.title.en;
  const description = isKa ? landing.description.ka : landing.description.en;
  const alternates = buildAlternates(`/jobs/explore/${params.slug[0]}`, params.locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ExploreLandingPage({ params, searchParams }: PageProps) {
  const landing = getLandingConfig(params.slug[0]);
  if (!landing) notFound();

  const locale = await getLocale();
  const t = await getTranslations("jobs");
  const isKa = locale === "ka";

  const page = Number(searchParams.page) || 1;

  // Build query params from landing filter
  const { jobs, totalPages, currentPage, totalCount } = await getJobs({
    page,
    category: landing.filter.category,
    city: landing.filter.city,
    type: landing.filter.type ?? (landing.filter.isRemote ? "remote" : undefined),
  });

  // Auth + match scores
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let matchScores: Map<string, number> | null = null;
  let savedJobIds: Set<string> | null = null;
  let isLoggedIn = false;

  if (user) {
    isLoggedIn = true;
    const [profile, savedIds] = await Promise.all([
      getProfile(user.id),
      getSavedJobIds(user.id),
    ]);
    if (profile?.role === "seeker") {
      savedJobIds = savedIds;
      if (profile.skills?.length > 0) {
        const results = calculateMatchScores(
          profile.skills,
          jobs.map((j) => ({ id: j.id, tags: j.tags })),
        );
        matchScores = new Map<string, number>();
        for (const [jobId, result] of results) {
          if (result.score > 0) matchScores.set(jobId, result.score);
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

  const h1 = isKa ? landing.h1.ka : landing.h1.en;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("title")}
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {h1}
          </h1>
          <CountBadge>{totalCount}</CountBadge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isKa ? landing.description.ka : landing.description.en}
        </p>
      </div>

      <JobList
        jobs={jobs}
        locale={locale}
        matchScores={matchScores}
        savedJobIds={savedJobIds}
        isLoggedIn={isLoggedIn}
        translations={jobTranslations}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/jobs/explore/${params.slug[0]}`}
        searchParams={{}}
      />
    </div>
  );
}
