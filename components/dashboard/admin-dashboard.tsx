import Link from "next/link";
import { Users, Briefcase, Building2, FileText } from "lucide-react";

type AdminDashboardProps = {
  data: {
    totalUsers: number;
    totalJobs: number;
    totalCompanies: number;
    totalApplications: number;
  };
  t: (key: string) => string;
};

export function AdminDashboard({ data, t }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t("totalUsers")} value={data.totalUsers} />
        <StatCard icon={Briefcase} label={t("totalJobs")} value={data.totalJobs} />
        <StatCard icon={Building2} label={t("totalCompanies")} value={data.totalCompanies} />
        <StatCard icon={FileText} label={t("totalApplications")} value={data.totalApplications} />
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/admin/users"
          icon={Users}
          label={t("manageUsers")}
        />
        <QuickLink
          href="/admin/jobs"
          icon={Briefcase}
          label={t("manageJobs")}
        />
        <QuickLink
          href="/admin/companies"
          icon={Building2}
          label={t("manageCompanies")}
        />
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
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/6">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value.toLocaleString()}
          </p>
          <p className="text-[12px] text-muted-foreground/60">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-soft hover:shadow-soft-md hover:border-border transition-all duration-200"
    >
      <Icon className="h-4 w-4 text-muted-foreground/50" />
      <span className="text-[13px] font-medium text-foreground">{label}</span>
    </Link>
  );
}
