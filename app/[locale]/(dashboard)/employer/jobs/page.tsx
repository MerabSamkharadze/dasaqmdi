import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getJobsByEmployer } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { localized, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { JobActionButtons } from "@/components/dashboard/job-action-buttons";
import { EmployerJobFilters } from "@/components/dashboard/employer-job-filters";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Jobs",
};

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const t = await getTranslations("nav");
  const td = await getTranslations("dashboard");

  const [jobs, categories] = await Promise.all([
    getJobsByEmployer(user.id, {
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
    searchPlaceholder: td("searchJobs"),
    allStatuses: td("allStatuses"),
    active: td("active"),
    closed: td("closed"),
    expired: td("expired"),
    allCategories: td("allCategories"),
  };

  const hasFilters = !!(searchParams.q || searchParams.status || searchParams.category);

  if (jobs.length === 0 && !hasFilters) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{t("myJobs")}</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 gap-4">
          <Briefcase className="h-7 w-7 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground/60">{t("noJobs")}</p>
          <Button asChild>
            <Link href="/employer/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("postJob")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{t("myJobs")}</h1>
          <CountBadge>{jobs.length}</CountBadge>
        </div>
        <Button asChild size="sm">
          <Link href="/employer/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("postJob")}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-muted/50" />}>
        <EmployerJobFilters
          categories={categoryOptions}
          translations={filterTranslations}
        />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
          <p className="text-sm text-muted-foreground/60">{td("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {jobs.map((job, i) => {
            const isExpired = new Date(job.expires_at) < new Date();
            const isClosed = job.status === "closed" || job.status === "archived";
            const title = localized(job, "title", locale);

            return (
              <div
                key={job.id}
                className={cn(
                  "rounded-xl border bg-card px-5 py-4 sm:px-6 shadow-soft transition-all duration-200 animate-fade-in",
                  (isExpired || isClosed)
                    ? "border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10"
                    : "border-border/60",
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/employer/jobs/${job.id}`}
                        className="text-[15px] font-semibold leading-snug tracking-tight text-foreground hover:text-primary transition-colors duration-200 truncate"
                      >
                        {title}
                      </Link>

                      {isClosed && (
                        <Badge variant="outline" className="text-[11px] border-red-300/50 text-red-600 dark:border-red-500/30 dark:text-red-400">
                          {td("closed")}
                        </Badge>
                      )}
                      {isExpired && !isClosed && (
                        <Badge className="text-[11px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
                          {td("expired")}
                        </Badge>
                      )}
                      {!isExpired && !isClosed && (
                        <Badge className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20">
                          {td("active")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {formatDate(job.created_at, locale)}
                      </span>
                      <span>
                        {job.views_count} {locale === "ka" ? "ნახვა" : "views"}
                      </span>
                    </div>
                  </div>

                  <JobActionButtons
                    jobId={job.id}
                    isExpired={isExpired}
                    isClosed={isClosed}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
