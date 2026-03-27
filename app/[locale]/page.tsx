import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JobList } from "@/components/jobs/job-list";
import { Pagination } from "@/components/jobs/pagination";
import { getJobs } from "@/lib/queries/jobs";
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

  // Build translations object for job components
  const jobTranslations = {
    remote: t("jobs.remote"),
    deadline: t("jobs.deadline"),
    noJobs: t("jobs.noJobs"),
    types: {
      "full-time": t("jobs.types.full-time"),
      "part-time": t("jobs.types.part-time"),
      contract: t("jobs.types.contract"),
      internship: t("jobs.types.internship"),
      remote: t("jobs.types.remote"),
    },
  };

  // Preserve current filters for pagination links
  const preservedParams: Record<string, string> = {};
  if (searchParams.category) preservedParams.category = searchParams.category;
  if (searchParams.city) preservedParams.city = searchParams.city;
  if (searchParams.type) preservedParams.type = searchParams.type;
  if (searchParams.q) preservedParams.q = searchParams.q;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />

        <div className="flex-1 w-full max-w-5xl px-4 sm:px-6 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">
              {t("jobs.title")}
            </h1>
            <span className="text-sm text-muted-foreground">
              {totalCount} {t("jobs.title").toLowerCase()}
            </span>
          </div>

          {/* Job feed */}
          <JobList
            jobs={jobs}
            locale={locale}
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

        <Footer />
      </div>
    </main>
  );
}
