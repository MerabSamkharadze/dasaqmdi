import {
  getRegistrationTrend,
  getJobPostingTrend,
  getApplicationTrend,
  getCategoryBreakdown,
} from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { BarChart, HBarChart } from "@/components/dashboard/admin-bar-chart";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  const [registrations, jobPostings, applications, categories] =
    await Promise.all([
      getRegistrationTrend(),
      getJobPostingTrend(),
      getApplicationTrend(),
      getCategoryBreakdown(),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold tracking-tight">
        {t("analyticsTitle")}
      </h1>

      {/* Trend charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <BarChart
            data={registrations}
            label={t("registrations")}
            subtitle={t("last30Days")}
          />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <BarChart
            data={jobPostings}
            label={t("jobPostings")}
            subtitle={t("last30Days")}
          />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <BarChart
            data={applications}
            label={t("applicationsTrend")}
            subtitle={t("last30Days")}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
        <HBarChart
          data={categories}
          label={t("categoryBreakdown")}
          locale={locale}
        />
      </div>
    </div>
  );
}
