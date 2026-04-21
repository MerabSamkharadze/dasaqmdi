import { PricingGrid } from "@/components/pricing/pricing-grid";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/queries/subscriptions";
import { hasAnnualVariants } from "@/lib/lemonsqueezy";
import type { Metadata } from "next";
import type { SubscriptionPlan } from "@/lib/types";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("pricing");
  const isKa = params.locale === "ka";
  const title = isKa ? "ფასები" : "Pricing";
  const description = t("subtitle");
  const alternates = buildAlternates("/pricing", params.locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  await getLocale();

  let isLoggedIn = false;
  let currentPlan: SubscriptionPlan = "free";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    isLoggedIn = true;
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (company) {
      currentPlan = await getActivePlan(company.id);
    }
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <PricingGrid
        starter={{
          name: t("free.name"),
          description: t("free.description"),
          priceMonthly: t("free.priceMonthly"),
          priceYearly: t("free.priceYearly"),
          cta: t("free.cta"),
        }}
        business={{
          name: t("pro.name"),
          description: t("pro.description"),
          priceMonthly: t("pro.priceMonthly"),
          priceYearly: t("pro.priceYearly"),
          cta: t("pro.cta"),
        }}
        pro={{
          name: t("verified.name"),
          description: t("verified.description"),
          priceMonthly: t("verified.priceMonthly"),
          priceYearly: t("verified.priceYearly"),
          cta: t("verified.cta"),
        }}
        features={{
          starter: [
            t("features.activeJobs", { count: 2 }),
            t("features.basicPosting"),
          ],
          starterDisabled: [
            t("features.aiDraft"),
            t("features.matchScores"),
            t("features.featuredSlot1"),
            t("features.verifiedBadge"),
          ],
          business: [
            t("features.unlimitedJobs"),
            t("features.aiDraft"),
            t("features.matchScores"),
            t("features.featuredSlot1"),
          ],
          businessDisabled: [
            t("features.verifiedBadge"),
            t("features.customEmailTemplates"),
          ],
          pro: [
            t("features.everythingInBusiness"),
            t("features.verifiedBadge"),
            t("features.featuredSlot3"),
            t("features.customEmailTemplates"),
          ],
        }}
        perMonth={t("perMonth")}
        perYear={t("perYear")}
        popular={t("popular")}
        currentPlanLabel={t("currentPlan")}
        currentPlan={currentPlan}
        isLoggedIn={isLoggedIn}
        supportsAnnual={hasAnnualVariants()}
        billingCycleLabels={{
          monthly: t("billingCycle.monthly"),
          yearly: t("billingCycle.yearly"),
          saveBadge: t("billingCycle.saveBadge"),
        }}
      />

      {/* One-time Boost info */}
      <div className="mt-12 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-500/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
              {t("boostTitle")}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t("boostSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-[12px] font-medium">
              🥈 Silver — 30₾ / 7d
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
              🥇 Gold — 80₾ / 14d
            </span>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/60">
          {t("boostFromJob")}
        </p>
      </div>
    </div>
  );
}
