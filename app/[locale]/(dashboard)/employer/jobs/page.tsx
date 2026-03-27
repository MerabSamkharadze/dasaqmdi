import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getJobsByEmployer } from "@/lib/queries/jobs";
import { getTranslations, getLocale } from "next-intl/server";
import { localized, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { JobActionButtons } from "@/components/dashboard/job-action-buttons";
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

export default async function EmployerJobsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const t = await getTranslations("nav");
  const jobs = await getJobsByEmployer(user.id);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{t("myJobs")}</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 gap-4">
          <Briefcase className="h-7 w-7 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground/60">No jobs posted yet</p>
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
        <h1 className="text-lg font-semibold tracking-tight">{t("myJobs")}</h1>
        <Button asChild size="sm">
          <Link href="/employer/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("postJob")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {jobs.map((job, i) => {
          const isExpired = new Date(job.expires_at) < new Date();
          const isClosed = job.status === "closed" || job.status === "archived";
          const title = localized(job, "title", locale);

          return (
            <div
              key={job.id}
              className={cn(
                "rounded-xl border bg-card px-5 py-4 sm:px-6 shadow-sm transition-all duration-200 animate-fade-in",
                (isExpired || isClosed)
                  ? "border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10"
                  : "border-border/30",
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
                      <Badge variant="secondary" className="text-[11px]">Closed</Badge>
                    )}
                    {isExpired && !isClosed && (
                      <Badge variant="destructive" className="text-[11px]">Expired</Badge>
                    )}
                    {!isExpired && !isClosed && (
                      <Badge variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400/90">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 opacity-50" />
                      {formatDate(job.created_at, locale)}
                    </span>
                    <span>{job.views_count} views</span>
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
    </div>
  );
}
