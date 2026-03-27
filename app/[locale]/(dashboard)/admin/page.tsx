import { getAdminStats } from "@/lib/queries/admin";
import { getTranslations } from "next-intl/server";
import { Users, Briefcase, Building2, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t("totalUsers")} value={stats.totalUsers} />
        <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs} />
        <StatCard icon={Building2} label="Companies" value={stats.totalCompanies} />
        <StatCard icon={FileText} label="Applications" value={stats.totalApplications} />
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
    <div className="rounded-xl border border-border/30 bg-card p-5 shadow-sm">
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
