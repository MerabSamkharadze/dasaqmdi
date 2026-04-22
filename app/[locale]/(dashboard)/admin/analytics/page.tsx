import {
  getRegistrationTrend,
  getJobPostingTrend,
  getApplicationTrend,
  getCategoryBreakdown,
  getSubscriptionTrend,
  getBoostRevenueTrend,
} from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { BarChart, HBarChart } from "@/components/dashboard/admin-bar-chart";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();

  const [registrations, jobPostings, applications, categories, subscriptions, boosts] =
    await Promise.all([
      getRegistrationTrend(),
      getJobPostingTrend(),
      getApplicationTrend(),
      getCategoryBreakdown(),
      getSubscriptionTrend(),
      getBoostRevenueTrend(),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold tracking-tight">
        {t("analyticsTitle")}
      </h1>

      {/* Activity trends */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("activityTrends")}
        </h2>
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
      </section>

      {/* Revenue trends */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("revenueTrends")}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-soft">
            <BarChart
              data={subscriptions}
              label={t("newSubscriptions")}
              subtitle={t("last30Days")}
            />
          </div>
          <div className="rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-500/5 p-5 shadow-soft">
            <BarChart
              data={boosts}
              label={t("boostPurchases")}
              subtitle={t("last30Days")}
            />
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section>
        <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground/70 mb-3 uppercase">
          {t("categoryBreakdown")}
        </h2>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <HBarChart
            data={categories}
            label={t("categoryBreakdown")}
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}
