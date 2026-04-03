import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionPlan } from "@/lib/types";

export async function getSubscriptionByCompanyId(
  companyId: string
): Promise<Subscription | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .single();

  return data;
}

export async function getActivePlan(companyId: string): Promise<SubscriptionPlan> {
  const sub = await getSubscriptionByCompanyId(companyId);
  if (!sub || sub.status !== "active") return "free";
  return sub.plan;
}
