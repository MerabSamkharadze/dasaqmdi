import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JobList } from "@/components/jobs/job-list";
import { Pagination } from "@/components/jobs/pagination";
import { getJobs } from "@/lib/queries/jobs";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScores } from "@/lib/matching";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "დასაქმდი — ვაკანსიები საქართველოში | dasakmdi.com",
  description:
    "იპოვე სამუშაო საქართველოში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები, ადმინისტრაცია და სხვა სფეროებში.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; city?: string; type?: string; q?: string };
}) {
  const locale = await getLocale();
  const t = await getTranslations();

  const page = Number(searchParams.page) || 1;

  const { jobs, totalPages, currentPage, totalCount } = await getJobs({
    page,
    category: searchParams.category,
    city: searchParams.city,
    type: searchParams.type,
    q: searchParams.q,
  });

  // Compute match scores for logged-in seekers
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
    remote: t("jobs.remote"),
    deadline: t("jobs.deadline"),
    noJobs: t("jobs.noJobs"),
    match: t("jobs.match"),
    types: {
      "full-time": t("jobs.types.full-time"),
      "part-time": t("jobs.types.part-time"),
      contract: t("jobs.types.contract"),
      internship: t("jobs.types.internship"),
      remote: t("jobs.types.remote"),
    },
  };

  const preservedParams: Record<string, string> = {};
  if (searchParams.category) preservedParams.category = searchParams.category;
  if (searchParams.city) preservedParams.city = searchParams.city;
  if (searchParams.type) preservedParams.type = searchParams.type;
  if (searchParams.q) preservedParams.q = searchParams.q;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
          {/* Page header */}
          <div className="flex items-baseline justify-between mb-8">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {t("jobs.title")}
            </h1>
            <span className="text-xs text-muted-foreground/60 tabular-nums">
              {totalCount}
            </span>
          </div>

          {/* Job feed */}
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
            basePath="/"
            searchParams={preservedParams}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
