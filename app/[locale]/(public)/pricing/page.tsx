import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingCard } from "@/components/pricing/pricing-card";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan } from "@/lib/queries/subscriptions";
import type { Metadata } from "next";
import type { SubscriptionPlan } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  const locale = await getLocale();

  return {
    title: locale === "ka"
      ? "ფასები — დასაქმდი | dasakmdi.com"
      : "Pricing — dasakmdi.com",
    description: t("subtitle"),
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
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
      </main>

      <Footer />
    </div>
  );
}
