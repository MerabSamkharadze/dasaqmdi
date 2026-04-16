export const revalidate = 300; // ISR: regenerate every 5 minutes

import { getSalaryData, getSalaryCities } from "@/lib/queries/salaries";
import { getCategories } from "@/lib/queries/categories";
import { SalaryFilters } from "@/components/salaries/salary-filters";
import { getTranslations, getLocale } from "next-intl/server";
import { Suspense } from "react";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { TrendingUp, TrendingDown, BarChart3, Briefcase } from "lucide-react";
import type { Metadata } from "next";
import type { SalaryCurrency } from "@/lib/types/enums";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("salaries");
  const alternates = buildAlternates("/salaries", params.locale);
  const isKa = params.locale === "ka";
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
};

function formatSalary(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${amount.toLocaleString()} ${symbol}`;
}

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    city?: string;
    currency?: string;
  };
}) {
  const locale = await getLocale();
  const t = await getTranslations("salaries");

  const [salaryData, categories, cities] = await Promise.all([
    getSalaryData({
      category: searchParams.category,
      city: searchParams.city,
      currency: searchParams.currency as SalaryCurrency | undefined,
    }),
    getCategories(),
    getSalaryCities(),
  ]);

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    label: locale === "ka" ? c.name_ka : c.name_en,
  }));

  const filterTranslations = {
    category: t("category"),
    city: t("city"),
    currency: t("currency"),
    allCategories: t("allCategories"),
    allCities: t("allCities"),
    allCurrencies: t("allCurrencies"),
  };

  // Aggregate totals across all results for the summary
  const totalJobs = salaryData.reduce((sum, d) => sum + d.job_count, 0);
  const allAvgMin = salaryData.length > 0
    ? Math.round(salaryData.reduce((sum, d) => sum + d.avg_min * d.job_count, 0) / totalJobs)
    : 0;
  const allAvgMax = salaryData.length > 0
    ? Math.round(salaryData.reduce((sum, d) => sum + d.avg_max * d.job_count, 0) / totalJobs)
    : 0;

  // Group by category for display
  const byCategory = new Map<string, typeof salaryData>();
  for (const item of salaryData) {
    const key = item.category_slug;
    if (!byCategory.has(key)) {
      byCategory.set(key, []);
    }
    byCategory.get(key)!.push(item);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header + illustration */}
      <section className="flex flex-col-reverse md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] shrink-0 rounded-2xl overflow-hidden">
          <HeroIllustration src="/illustrations/money.svg" />
        </div>
      </section>

      {/* Filters */}
      <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-muted/50" />}>
        <SalaryFilters
          categories={categoryOptions}
          cities={cities}
          translations={filterTranslations}
        />
      </Suspense>

      {salaryData.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("noData")}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("noDataDescription")}
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          {totalJobs > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard
                label={t("avgSalary")}
                value={allAvgMin !== allAvgMax
                  ? `${allAvgMin.toLocaleString()} - ${allAvgMax.toLocaleString()}`
                  : `${allAvgMin.toLocaleString()}`
                }
                icon={<BarChart3 className="h-4 w-4" />}
                iconColor="text-blue-600 dark:text-blue-400"
                sub={t("basedOn", { count: String(totalJobs) })}
              />
              <SummaryCard
                label={t("minSalary")}
                value={Math.min(...salaryData.map((d) => d.min_salary)).toLocaleString()}
                icon={<TrendingDown className="h-4 w-4" />}
                iconColor="text-amber-600 dark:text-amber-400"
              />
              <SummaryCard
                label={t("maxSalary")}
                value={Math.max(...salaryData.map((d) => d.max_salary)).toLocaleString()}
                icon={<TrendingUp className="h-4 w-4" />}
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          )}

          {/* Category breakdown */}
          <div className="flex flex-col gap-6">
            {[...byCategory.entries()].map(([slug, items]) => {
              const catName = locale === "ka" ? items[0].category_name_ka : items[0].category_name_en;
              return (
                <div key={slug} className="flex flex-col gap-3">
                  <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                    {catName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item, i) => (
                      <div
                        key={`${item.category_slug}-${item.city}-${item.currency}`}
                        className="rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-md hover:border-border animate-fade-in"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {/* City + currency */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">
                            {item.city ?? (locale === "ka" ? "ყველა ქალაქი" : "All cities")}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground/60 px-1.5 py-0.5 rounded bg-muted/50">
                            {item.currency}
                          </span>
                        </div>

                        {/* Average salary range */}
                        <div className="mb-2">
                          <span className="text-lg font-semibold text-foreground tabular-nums">
                            {formatSalary(item.avg_min, item.currency)}
                          </span>
                          {item.avg_max !== item.avg_min && (
                            <span className="text-lg font-semibold text-foreground tabular-nums">
                              {" "}&ndash; {formatSalary(item.avg_max, item.currency)}
                            </span>
                          )}
                        </div>

                        {/* Range + count */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
                          <span>
                            {t("range")}: {formatSalary(item.min_salary, item.currency)} &ndash; {formatSalary(item.max_salary, item.currency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 opacity-50" />
                            {item.job_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-muted-foreground/50 text-center pt-4">
            {t("disclaimer")}
          </p>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconColor,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span className={iconColor ?? "text-primary/60"}>{icon}</span>
        {label}
      </div>
      <p className="text-xl font-semibold text-foreground tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/60 mt-1">{sub}</p>
      )}
    </div>
  );
}
