"use server";

import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { configureLemonSqueezy, PLAN_VARIANTS } from "@/lib/lemonsqueezy";
import type { ActionResult } from "@/lib/types";

export async function createCheckoutAction(
  plan: "pro" | "verified"
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!company) return { error: "You must create a company first" };

  configureLemonSqueezy();

  const { data: checkout, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    PLAN_VARIANTS[plan],
    {
      checkoutData: {
        email: user.email!,
        custom: {
          company_id: company.id,
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/employer/billing?success=true`,
      },
    }
  );

  if (error || !checkout) {
    return { error: "Failed to create checkout session" };
  }

  const url = checkout.data.attributes.url;
  return { error: null, data: { checkoutUrl: url } };
}
