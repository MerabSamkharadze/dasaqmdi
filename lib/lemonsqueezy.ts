import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function configureLemonSqueezy() {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
}

export type BillingCycle = "monthly" | "yearly";
export type PaidPlan = "pro" | "verified";

// Subscription variants keyed by plan + billing cycle.
// Annual variants are optional — fall back to monthly if not set so the toggle
// can be hidden cleanly.
export const PLAN_VARIANTS: Record<PaidPlan, Record<BillingCycle, string>> = {
  pro: {
    monthly: process.env.LEMONSQUEEZY_PRO_VARIANT_ID!,
    yearly: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID ?? "",
  },
  verified: {
    monthly: process.env.LEMONSQUEEZY_VERIFIED_VARIANT_ID!,
    yearly: process.env.LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID ?? "",
  },
};

export function hasAnnualVariants(): boolean {
  return !!(
    process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID &&
    process.env.LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID
  );
}

export function getVariantId(plan: PaidPlan, cycle: BillingCycle): string | null {
  const id = PLAN_VARIANTS[plan][cycle];
  return id || null;
}

/**
 * A variant is "legacy" when it doesn't match any currently-configured variant
 * for its plan. Lemon Squeezy already preserves the original price on existing
 * subscriptions even if the product variant is later replaced, so legacy
 * subscribers keep their old rate — this helper is purely for surfacing a
 * "grandfathered pricing" note in the UI.
 */
export function isLegacyVariant(
  variantId: string | null,
  plan: PaidPlan,
): boolean {
  if (!variantId) return false;
  const current = PLAN_VARIANTS[plan];
  const known = [current.monthly, current.yearly].filter(Boolean);
  return known.length > 0 && !known.includes(variantId);
}

// ── VIP Boost (one-time products) ────────────────────────────────────────
export type VipBoostLevel = "silver" | "gold";

export const VIP_VARIANTS: Record<VipBoostLevel, string> = {
  silver: process.env.LEMONSQUEEZY_VIP_SILVER_VARIANT_ID!,
  gold: process.env.LEMONSQUEEZY_VIP_GOLD_VARIANT_ID!,
};

export const VIP_CONFIG: Record<VipBoostLevel, { days: number; priceLabel: string }> = {
  silver: { days: 7, priceLabel: "30₾" },
  gold: { days: 14, priceLabel: "80₾" },
};

export function variantToVipLevel(variantId: string): VipBoostLevel | null {
  if (variantId === process.env.LEMONSQUEEZY_VIP_SILVER_VARIANT_ID) return "silver";
  if (variantId === process.env.LEMONSQUEEZY_VIP_GOLD_VARIANT_ID) return "gold";
  return null;
}
