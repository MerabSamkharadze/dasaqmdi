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
          <h1 className="text-xl font-semibold tracking-tight">{t("myJobs")}</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 gap-4">
          <Briefcase className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No jobs posted yet</p>
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
        <h1 className="text-xl font-semibold tracking-tight">{t("myJobs")}</h1>
        <Button asChild size="sm">
          <Link href="/employer/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("postJob")}
          </Link>
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        {jobs.map((job) => {
          const isExpired = new Date(job.expires_at) < new Date();
          const isClosed = job.status === "closed" || job.status === "archived";
          const title = localized(job, "title", locale);

          return (
            <div
              key={job.id}
              className={cn(
                "flex items-center gap-4 p-4 border-b border-border/60 last:border-b-0 transition-colors",
                (isExpired || isClosed) &&
                  "bg-red-50/50 dark:bg-red-950/20 border-l-2 border-l-red-400 dark:border-l-red-600"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/employer/jobs/${job.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate"
                  >
                    {title}
                  </Link>

                  {isClosed && (
                    <Badge variant="secondary" className="text-xs">Closed</Badge>
                  )}
                  {isExpired && !isClosed && (
                    <Badge variant="destructive" className="text-xs">Expired</Badge>
                  )}
                  {!isExpired && !isClosed && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
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
          );
        })}
      </div>
    </div>
  );
}
