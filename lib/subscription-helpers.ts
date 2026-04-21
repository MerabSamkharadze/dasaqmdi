import type { SubscriptionPlan } from "@/lib/types";

export const STARTER_JOB_LIMIT = 2;

export function canPostJob(plan: SubscriptionPlan, activeJobCount: number): boolean {
  if (plan === "free") return activeJobCount < STARTER_JOB_LIMIT;
  return true;
}

/**
 * Number of "featured job" slots included in each plan.
 * Business = 1, Pro = 3, Starter = 0 (featured not available).
 */
export function getFeaturedSlotLimit(plan: SubscriptionPlan): number {
  if (plan === "verified") return 3;
  if (plan === "pro") return 1;
  return 0;
}

export function canUseAIDraft(plan: SubscriptionPlan): boolean {
  return plan !== "free";
}

export function canSeeMatchScores(plan: SubscriptionPlan): boolean {
  return plan !== "free";
}

export function isFeaturedPlan(plan: SubscriptionPlan): boolean {
  return plan === "pro" || plan === "verified";
}

export function isVerifiedPlan(plan: SubscriptionPlan): boolean {
  return plan === "verified";
}
