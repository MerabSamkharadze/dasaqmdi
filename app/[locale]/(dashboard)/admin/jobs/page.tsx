import { getAllJobs } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminDeleteJobButton } from "@/components/dashboard/admin-delete-job-button";
import { AdminJobFilters } from "@/components/dashboard/admin-job-filters";
import { Calendar } from "lucide-react";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Jobs" };

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  const [jobs, categories] = await Promise.all([
    getAllJobs({
      q: searchParams.q,
      status: searchParams.status,
      category: searchParams.category,
    }),
    getCategories(),
  ]);

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    label: locale === "ka" ? c.name_ka : c.name_en,
  }));

  const filterTranslations = {
    searchPlaceholder: t("searchJobs"),
    allStatuses: t("allStatuses"),
    active: t("active"),
    closed: t("closed"),
    expired: t("expired"),
    allCategories: t("allCategories"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("manageJobs")}</h1>
        <CountBadge>{jobs.length}</CountBadge>
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-muted/50" />}>
        <AdminJobFilters
          categories={categoryOptions}
          translations={filterTranslations}
        />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
          <p className="text-sm text-muted-foreground/60">{t("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job, i) => {
            const isExpired = new Date(job.expires_at) < new Date();

            return (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {localized(job, "title", locale)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 opacity-50" />
                      {formatDate(job.created_at, locale)}
                    </span>
                    <span>
                      {job.views_count} {locale === "ka" ? "ნახვა" : "views"}
                    </span>
                  </div>
                </div>

                {job.status === "active" && !isExpired ? (
                  <Badge className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20">
                    {t("active")}
                  </Badge>
                ) : job.status === "closed" ? (
                  <Badge className="text-[11px] bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20">
                    {t("closed")}
                  </Badge>
                ) : (
                  <Badge className="text-[11px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
                    {t("expired")}
                  </Badge>
                )}

                <AdminDeleteJobButton jobId={job.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
