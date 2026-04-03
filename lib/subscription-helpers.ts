import type { SubscriptionPlan } from "@/lib/types";

export function canPostJob(plan: SubscriptionPlan, activeJobCount: number): boolean {
  if (plan === "free") return activeJobCount < 3;
  return true;
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
