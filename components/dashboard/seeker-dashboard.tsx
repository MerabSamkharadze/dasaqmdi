import Link from "next/link";
import { localized } from "@/lib/utils";
import { FileText, CheckCircle, Clock, XCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ApplicationWithJob } from "@/lib/types";

type SeekerDashboardProps = {
  data: {
    totalApplications: number;
    pendingCount: number;
    reviewedCount: number;
    acceptedCount: number;
    rejectedCount: number;
    recentApplications: ApplicationWithJob[];
    profileStrength: number;
  };
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function SeekerDashboard({ data, locale, t }: SeekerDashboardProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label={t("totalApplications")}
          value={data.totalApplications}
        />
        <StatCard
          icon={Clock}
          label={t("pending")}
          value={data.pendingCount}
        />
        <StatCard
          icon={CheckCircle}
          label={t("accepted")}
          value={data.acceptedCount}
        />
        <StatCard
          icon={User}
          label={t("profileStrength")}
          value={`${data.profileStrength}%`}
        />
      </div>

      {/* Profile strength bar */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-medium text-foreground">
            {t("profileStrength")}
          </p>
          <span className="text-[12px] text-muted-foreground/60 tabular-nums">
            {data.profileStrength}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/50">
          <div
            className="h-2 rounded-full bg-primary/70 transition-all duration-500"
            style={{ width: `${data.profileStrength}%` }}
          />
        </div>
        {data.profileStrength < 80 && (
          <p className="text-[11px] text-muted-foreground/50 mt-2">
            <Link href="/profile" className="text-primary/70 hover:text-primary hover:underline transition-colors duration-200">
              {t("completeProfile")}
            </Link>
          </p>
        )}
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-semibold tracking-tight">
            {t("recentApplications")}
          </h2>
          {data.totalApplications > 5 && (
            <Link
              href="/seeker/applications"
              className="text-[12px] text-primary/70 hover:text-primary hover:underline transition-colors duration-200"
            >
              {t("viewAll")}
            </Link>
          )}
        </div>

        {data.recentApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
            <FileText className="h-6 w-6 text-muted-foreground/25 mb-2.5" />
            <p className="text-[13px] text-muted-foreground/50">
              {t("noApplications")}
            </p>
            <Link
              href="/jobs"
              className="text-[12px] text-primary/70 hover:text-primary mt-1.5 transition-colors duration-200"
            >
              {t("browseJobs")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentApplications.map((app, i) => {
              const jobTitle = localized(app.job, "title", locale);
              const companyName = localized(app.job.company, "name", locale);

              return (
                <Link
                  key={app.id}
                  href={`/jobs/${app.job.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft hover:shadow-soft-md hover:border-border transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    {app.job.company.logo_url ? (
                      <img
                        src={app.job.company.logo_url}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {jobTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 truncate">
                      {companyName}
                    </p>
                  </div>
                  <ApplicationBadge status={app.status} isViewed={app.is_viewed} />
                </Link>
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/6">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <p className="text-[12px] text-muted-foreground/60">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ApplicationBadge({
  status,
  isViewed,
}: {
  status: string;
  isViewed: boolean;
}) {
  if (status === "accepted") {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-normal">
        Accepted
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-normal">
        Rejected
      </Badge>
    );
  }
  if (status === "shortlisted" || status === "reviewed") {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-normal">
        Reviewed
      </Badge>
    );
  }
  if (isViewed) {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-normal">
        Seen
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px] font-normal">
      Pending
    </Badge>
  );
}
