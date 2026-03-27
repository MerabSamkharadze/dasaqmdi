import { getAllJobs } from "@/lib/queries/admin";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { AdminDeleteJobButton } from "@/components/dashboard/admin-delete-job-button";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Jobs" };

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJobsPage() {
  const t = await getTranslations("admin");
  const jobs = await getAllJobs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("manageJobs")}</h1>
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">{jobs.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {jobs.map((job, i) => {
          const isExpired = new Date(job.expires_at) < new Date();

          return (
            <div
              key={job.id}
              className="flex items-center gap-4 rounded-xl border border-border/30 bg-card px-5 py-3.5 shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{job.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 opacity-50" />
                    {formatDate(job.created_at)}
                  </span>
                  <span>{job.views_count} views</span>
                </div>
              </div>

              {job.status === "active" && !isExpired ? (
                <Badge variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400/90">
                  {job.status}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[11px]">
                  {isExpired ? "Expired" : job.status}
                </Badge>
              )}

              <AdminDeleteJobButton jobId={job.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
