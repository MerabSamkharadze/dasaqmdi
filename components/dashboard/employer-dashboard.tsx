import Image from "next/image";
import Link from "next/link";
import { localized } from "@/lib/utils";
import { Briefcase, FileText, Eye, PlusCircle, Building2 } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Badge } from "@/components/ui/badge";
import { RenewJobButton } from "@/components/dashboard/job-action-buttons";
import type { JobWithCompany } from "@/lib/types";

type CompanyInfo = {
  name: string;
  name_ka: string | null;
  logo_url: string | null;
  is_verified: boolean;
} | null;

type EmployerDashboardProps = {
  data: {
    activeJobs: number;
    totalJobs: number;
    totalApplications: number;
    newApplications: number;
    recentJobs: JobWithCompany[];
    company: CompanyInfo;
  };
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function EmployerDashboard({ data, locale, t }: EmployerDashboardProps) {
  const companyName = data.company
    ? localized(data.company, "name", locale)
    : null;

  return (
    <div className="flex flex-col gap-8">
      {/* E3: Company info */}
      {data.company ? (
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8">
            {data.company.logo_url ? (
              <Image src={data.company.logo_url} alt="" width={36} height={36} sizes="36px" className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <Building2 className="h-5 w-5 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold tracking-tight text-foreground truncate">
                {companyName}
              </p>
              {data.company.is_verified && <VerifiedBadge />}
            </div>
          </div>
          <Link
            href="/employer/company"
            className="text-[12px] text-primary/70 hover:text-primary transition-colors duration-200"
          >
            {t("editCompany")}
          </Link>
        </div>
      ) : (
        <Link
          href="/employer/company/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/8 py-5 text-[13px] font-medium text-primary hover:bg-primary/12 hover:border-primary/50 transition-all duration-200"
        >
          <Building2 className="h-4 w-4" />
          {t("createCompany")}
        </Link>
      )}

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
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/8 py-5 text-[13px] font-medium text-primary hover:bg-primary/12 hover:border-primary/50 transition-all duration-200"
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
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft hover:shadow-soft-md hover:border-border transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 20}ms` }}
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
                  <JobStatusBadge isActive={isActive} isExpired={isExpired} status={job.status} t={t} />
                  {isExpired && job.status !== "closed" && (
                    <RenewJobButton jobId={job.id} />
                  )}
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
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12">
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
  t,
}: {
  isActive: boolean;
  isExpired: boolean;
  status: string;
  t: (key: string) => string;
}) {
  if (isExpired) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20 text-[10px] font-normal">
        {t("expired")}
      </Badge>
    );
  }
  if (status === "closed") {
    return (
      <Badge variant="outline" className="text-[10px] font-normal border-red-300/50 text-red-600 dark:border-red-500/30 dark:text-red-400">
        {t("closed")}
      </Badge>
    );
  }
  if (isActive) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-normal">
        {t("active")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-normal">
      {status}
    </Badge>
  );
}
