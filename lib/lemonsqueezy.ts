import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function configureLemonSqueezy() {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
}

export const PLAN_VARIANTS: Record<"pro" | "verified", string> = {
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID!,
  verified: process.env.LEMONSQUEEZY_VERIFIED_VARIANT_ID!,
};
