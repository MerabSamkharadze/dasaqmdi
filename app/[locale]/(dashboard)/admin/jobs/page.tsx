import { getAllJobs } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminJobFilters } from "@/components/dashboard/admin-job-filters";
import { AdminJobsList } from "@/components/dashboard/admin-jobs-list";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Jobs" };

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

  // Serialize jobs for client component (localized title)
  const serializedJobs = jobs.map((job) => ({
    id: job.id,
    title: localized(job, "title", locale),
    created_at: job.created_at,
    views_count: job.views_count,
    status: job.status,
    expires_at: job.expires_at,
  }));

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
        <AdminJobsList
          jobs={serializedJobs}
          locale={locale}
          translations={{
            active: t("active"),
            closed: t("closed"),
            expired: t("expired"),
            pending: t("pending"),
            views: t("views"),
            selectAll: t("selectAll"),
            deleteSelected: t("deleteSelected"),
            cancel: t("cancelSelection"),
            confirmDelete: t("confirmBulkDelete"),
          }}
        />
      )}
    </div>
  );
}
