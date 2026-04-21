"use client";

import { useState } from "react";
import { PricingCard } from "@/components/pricing/pricing-card";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/types";
import type { BillingCycle } from "@/lib/lemonsqueezy";

type TierPricing = {
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  cta: string;
};

type FeaturesCopy = {
  starter: string[];
  starterDisabled: string[];
  business: string[];
  businessDisabled: string[];
  pro: string[];
};

type PricingGridProps = {
  starter: TierPricing;
  business: TierPricing;
  pro: TierPricing;
  features: FeaturesCopy;
  perMonth: string;
  perYear: string;
  popular: string;
  currentPlanLabel: string;
  currentPlan: SubscriptionPlan;
  isLoggedIn: boolean;
  supportsAnnual: boolean;
  billingCycleLabels: { monthly: string; yearly: string; saveBadge: string };
};

export function PricingGrid({
  starter,
  business,
  pro,
  features,
  perMonth,
  perYear,
  popular,
  currentPlanLabel,
  currentPlan,
  isLoggedIn,
  supportsAnnual,
  billingCycleLabels,
}: PricingGridProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  function priceFor(tier: TierPricing): string {
    return cycle === "yearly" ? tier.priceYearly : tier.priceMonthly;
  }

  const period = cycle === "yearly" ? perYear : perMonth;

  return (
    <>
      {supportsAnnual && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-soft">
            <CycleButton
              active={cycle === "monthly"}
              onClick={() => setCycle("monthly")}
              label={billingCycleLabels.monthly}
            />
            <CycleButton
              active={cycle === "yearly"}
              onClick={() => setCycle("yearly")}
              label={billingCycleLabels.yearly}
              badge={billingCycleLabels.saveBadge}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Starter (DB: free) */}
        <PricingCard
          name={starter.name}
          description={starter.description}
          price={priceFor(starter)}
          period={period}
          features={features.starter}
          disabledFeatures={features.starterDisabled}
          ctaLabel={starter.cta}
          ctaHref={isLoggedIn ? "/dashboard" : "/auth/register"}
          currentPlanLabel={currentPlanLabel}
          isCurrent={currentPlan === "free"}
        />

        {/* Business (DB: pro) */}
        <PricingCard
          name={business.name}
          description={business.description}
          price={priceFor(business)}
          period={period}
          features={features.business}
          disabledFeatures={features.businessDisabled}
          highlighted
          popularLabel={popular}
          ctaLabel={business.cta}
          plan="pro"
          cycle={cycle}
          isLoggedIn={isLoggedIn}
          currentPlanLabel={currentPlanLabel}
          isCurrent={currentPlan === "pro"}
        />

        {/* Pro (DB: verified) */}
        <PricingCard
          name={pro.name}
          description={pro.description}
          price={priceFor(pro)}
          period={period}
          features={features.pro}
          ctaLabel={pro.cta}
          plan="verified"
          cycle={cycle}
          isLoggedIn={isLoggedIn}
          currentPlanLabel={currentPlanLabel}
          isCurrent={currentPlan === "verified"}
        />
      </div>
    </>
  );
}

function CycleButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {badge && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-semibold tabular-nums",
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-500",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
