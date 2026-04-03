"use server";

import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { getSubscriptionByCompanyId } from "@/lib/queries/subscriptions";
import type { ActionResult } from "@/lib/types";

export async function getPortalUrlAction(): Promise<
  ActionResult<{ portalUrl: string }>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!company) return { error: "Company not found" };

  const subscription = await getSubscriptionByCompanyId(company.id);
  if (!subscription?.lemon_squeezy_id) {
    return { error: "No active subscription" };
  }

  configureLemonSqueezy();

  const { data: lsSub, error } = await getSubscription(
    subscription.lemon_squeezy_id
  );

  if (error || !lsSub) {
    return { error: "Failed to fetch subscription details" };
  }

  const portalUrl = lsSub.data.attributes.urls.customer_portal;
  if (!portalUrl) return { error: "Portal URL not available" };

  return { error: null, data: { portalUrl } };
}
