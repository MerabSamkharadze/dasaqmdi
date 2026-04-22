import Link from "next/link";
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  CreditCard,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  data: {
    totalUsers: number;
    totalJobs: number;
    totalCompanies: number;
    totalApplications: number;
    paidSubscriptions: number;
    activeBoosts: number;
    pendingJobs: number;
    newUsersThisWeek: number;
  };
  t: (key: string) => string;
};

export function AdminDashboard({ data, t }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Platform stats */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("platformStats")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label={t("totalUsers")} value={data.totalUsers} />
          <StatCard icon={Briefcase} label={t("totalJobs")} value={data.totalJobs} />
          <StatCard icon={Building2} label={t("totalCompanies")} value={data.totalCompanies} />
          <StatCard icon={FileText} label={t("totalApplications")} value={data.totalApplications} />
        </div>
      </section>

      {/* Monetization stats */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("monetizationStats")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CreditCard}
            label={t("paidSubscriptions")}
            value={data.paidSubscriptions}
            highlight={data.paidSubscriptions > 0}
          />
          <StatCard
            icon={Sparkles}
            label={t("activeBoosts")}
            value={data.activeBoosts}
            highlight={data.activeBoosts > 0}
            accent="amber"
          />
          <StatCard
            icon={ShieldCheck}
            label={t("pendingModeration")}
            value={data.pendingJobs}
            highlight={data.pendingJobs > 0}
            accent="red"
          />
          <StatCard
            icon={TrendingUp}
            label={t("newUsersThisWeek")}
            value={data.newUsersThisWeek}
          />
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("quickLinks")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/admin/users" icon={Users} label={t("manageUsers")} />
          <QuickLink href="/admin/jobs" icon={Briefcase} label={t("manageJobs")} />
          <QuickLink href="/admin/companies" icon={Building2} label={t("manageCompanies")} />
          <QuickLink href="/admin/subscriptions" icon={CreditCard} label={t("subscriptionsTitle")} />
          <QuickLink href="/admin/moderation" icon={ShieldCheck} label={t("moderation")} />
          <QuickLink href="/admin/analytics" icon={BarChart3} label={t("analyticsTitle")} />
          <QuickLink href="/admin/logs" icon={ScrollText} label={t("logsTitle")} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
  accent = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
  accent?: "primary" | "amber" | "red";
}) {
  const accentBg =
    accent === "amber"
      ? "bg-amber-500/15"
      : accent === "red"
        ? "bg-destructive/12"
        : "bg-primary/12";
  const accentText =
    accent === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : accent === "red"
        ? "text-destructive/80"
        : "text-primary/70";
  const valueText = highlight
    ? accent === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : accent === "red"
        ? "text-destructive"
        : "text-primary"
    : "text-foreground";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentBg)}>
          <Icon className={cn("h-4 w-4", accentText)} />
        </div>
        <div>
          <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", valueText)}>
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
