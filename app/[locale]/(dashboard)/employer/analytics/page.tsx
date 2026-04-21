import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getEmployerAnalytics } from "@/lib/queries/employer-analytics";
import { getActivePlan } from "@/lib/queries/subscriptions";
import { BarChart } from "@/components/dashboard/admin-bar-chart";
import { localized } from "@/lib/utils";
import { Briefcase, Eye, FileText, CheckCircle2, TrendingUp, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("analytics");
  return { title: t("title") };
}

export default async function EmployerAnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const t = await getTranslations("analytics");
  const locale = await getLocale();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!company) redirect("/employer/company");

  const plan = await getActivePlan(company.id);

  // Plan gate: Business+ only
  if (plan === "free") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center shadow-soft">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 mb-4">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            {t("upgradeTitle")}
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground max-w-md mx-auto">
            {t("upgradeDescription")}
          </p>
          <Link
            href="/pricing"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
          >
            {t("upgradeCta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const data = await getEmployerAnalytics(user.id, 30);

  const appsRate = data.totals.views > 0
    ? ((data.totals.applications / data.totals.views) * 100).toFixed(1)
    : "0.0";
  const acceptedRate = data.totals.applications > 0
    ? ((data.totals.accepted / data.totals.applications) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground/70">
          {t("subtitle", { days: 30 })}
        </p>
      </div>

      {/* Funnel stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FunnelStat icon={Eye} label={t("views")} value={data.totals.views} />
        <FunnelStat
          icon={FileText}
          label={t("applications")}
          value={data.totals.applications}
          rate={`${appsRate}%`}
          rateLabel={t("conversionRate")}
        />
        <FunnelStat
          icon={CheckCircle2}
          label={t("accepted")}
          value={data.totals.accepted}
          rate={`${acceptedRate}%`}
          rateLabel={t("acceptanceRate")}
        />
        <FunnelStat icon={Briefcase} label={t("activeJobs")} value={data.totals.activeJobs} />
      </div>

      {/* Trend charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
          <BarChart
            data={data.jobPostingTrend}
            label={t("jobsPosted")}
            subtitle={t("last30Days")}
          />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
          <BarChart
            data={data.applicationTrend}
            label={t("applicationsReceived")}
            subtitle={t("last30Days")}
          />
        </div>
      </div>

      {/* Top jobs */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary/60" />
          <h2 className="text-[15px] font-semibold tracking-tight">
            {t("topJobs")}
          </h2>
        </div>
        {data.topJobs.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/60">{t("noJobs")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.topJobs.map((job, i) => {
              const title = localized(job, "title", locale);
              return (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.id}/applications`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/60 px-4 py-3 hover:border-border hover:bg-background transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-medium text-foreground truncate">
                      {title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 opacity-60" />
                      {job.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 opacity-60" />
                      {job.applications_count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelStat({
  icon: Icon,
  label,
  value,
  rate,
  rateLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  rate?: string;
  rateLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          <p className="text-[12px] text-muted-foreground/60">{label}</p>
        </div>
      </div>
      {rate && rateLabel && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-baseline justify-between">
          <span className="text-[11px] text-muted-foreground/60">{rateLabel}</span>
          <span className="text-[13px] font-semibold text-primary tabular-nums">{rate}</span>
        </div>
      )}
    </div>
  );
}
