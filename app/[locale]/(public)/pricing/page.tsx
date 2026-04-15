import { PricingCard } from "@/components/pricing/pricing-card";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/queries/subscriptions";
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
  const locale = await getLocale();

  // Check if user is logged in and has a company
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

  const period = t("perMonth");

  return (
    <div className="py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free */}
        <PricingCard
          name={t("free.name")}
          price={t("free.price")}
          period={period}
          features={[
            t("features.activeJobs3"),
            t("features.basicPosting"),
          ]}
          disabledFeatures={[
            t("features.aiDraft"),
            t("features.matchScores"),
            t("features.verifiedBadge"),
            t("features.featuredJobs"),
          ]}
          ctaLabel={t("free.cta")}
          ctaHref={isLoggedIn ? "/dashboard" : "/auth/register"}
          currentPlanLabel={t("currentPlan")}
          isCurrent={currentPlan === "free"}
        />

        {/* Pro */}
        <PricingCard
          name={t("pro.name")}
          price={t("pro.price")}
          period={period}
          features={[
            t("features.unlimitedJobs"),
            t("features.basicPosting"),
            t("features.aiDraft"),
            t("features.matchScores"),
            t("features.featuredJobs"),
          ]}
          disabledFeatures={[
            t("features.verifiedBadge"),
          ]}
          highlighted
          popularLabel={t("popular")}
          ctaLabel={t("pro.cta")}
          plan="pro"
          isLoggedIn={isLoggedIn}
          currentPlanLabel={t("currentPlan")}
          isCurrent={currentPlan === "pro"}
        />

        {/* Verified */}
        <PricingCard
          name={t("verified.name")}
          price={t("verified.price")}
          period={period}
          features={[
            t("features.allProFeatures"),
            t("features.unlimitedJobs"),
            t("features.aiDraft"),
            t("features.matchScores"),
            t("features.featuredJobs"),
            t("features.verifiedBadge"),
          ]}
          ctaLabel={t("verified.cta")}
          plan="verified"
          isLoggedIn={isLoggedIn}
          currentPlanLabel={t("currentPlan")}
          isCurrent={currentPlan === "verified"}
        />
      </div>
    </div>
  );
}
