import Link from "next/link";
import { localized } from "@/lib/utils";
import { Briefcase, FileText, Eye, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JobWithCompany } from "@/lib/types";

type EmployerDashboardProps = {
  data: {
    activeJobs: number;
    totalJobs: number;
    totalApplications: number;
    newApplications: number;
    recentJobs: JobWithCompany[];
  };
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function EmployerDashboard({ data, locale, t }: EmployerDashboardProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label={t("activeJobs")}
          value={data.activeJobs}
        />
        <StatCard
          icon={FileText}
          label={t("totalApplications")}
          value={data.totalApplications}
        />
        <StatCard
          icon={Eye}
          label={t("newApplications")}
          value={data.newApplications}
          highlight={data.newApplications > 0}
        />
        <StatCard
          icon={Briefcase}
          label={t("totalJobs")}
          value={data.totalJobs}
        />
      </div>

      {/* Quick action */}
      {data.totalJobs === 0 && (
        <Link
          href="/employer/jobs/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/3 py-5 text-[13px] font-medium text-primary/80 hover:bg-primary/6 hover:border-primary/50 transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4" />
          {t("postFirstJob")}
        </Link>
      )}

      {/* Recent jobs */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-semibold tracking-tight">
            {t("yourJobs")}
          </h2>
          {data.totalJobs > 5 && (
            <Link
              href="/employer/jobs"
              className="text-[12px] text-primary/70 hover:text-primary hover:underline transition-colors duration-200"
            >
              {t("viewAll")}
            </Link>
          )}
        </div>

        {data.recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
            <Briefcase className="h-6 w-6 text-muted-foreground/25 mb-2.5" />
            <p className="text-[13px] text-muted-foreground/50">
              {t("noJobs")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentJobs.map((job, i) => {
              const title = localized(job, "title", locale);
              const now = new Date().toISOString();
              const isExpired = job.expires_at < now;
              const isActive = job.status === "active" && !isExpired;

              return (
                <div
                  key={job.id}
                  className="flex items-center gap-4 rounded-xl border border-border/30 bg-card px-5 py-3.5 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Link href={`/employer/jobs/${job.id}`} className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {title}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {new Date(job.created_at).toLocaleDateString(
                        locale === "ka" ? "ka-GE" : "en-US",
                        { day: "numeric", month: "short" }
                      )}
                    </p>
                  </Link>
                  <JobStatusBadge isActive={isActive} isExpired={isExpired} status={job.status} />
                  <Link
                    href={`/employer/jobs/${job.id}/applications`}
                    className="text-[11px] text-primary/60 hover:text-primary transition-colors duration-200"
                  >
                    {t("applicants")}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/30 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/6">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
        <div>
          <p className={`text-2xl font-semibold tracking-tight tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>
            {value}
          </p>
          <p className="text-[12px] text-muted-foreground/60">{label}</p>
        </div>
      </div>
    </div>
  );
}

function JobStatusBadge({
  isActive,
  isExpired,
  status,
}: {
  isActive: boolean;
  isExpired: boolean;
  status: string;
}) {
  if (isExpired) {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-normal">
        Expired
      </Badge>
    );
  }
  if (status === "closed") {
    return (
      <Badge variant="secondary" className="text-[10px] font-normal">
        Closed
      </Badge>
    );
  }
  if (isActive) {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-normal">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px] font-normal">
      {status}
    </Badge>
  );
}
