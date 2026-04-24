"use server";

import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import {
  configureLemonSqueezy,
  FEATURED_EXTRA_VARIANT_ID,
} from "@/lib/lemonsqueezy";
import { isPaidExtraFeatured } from "@/lib/featured";
import type { ActionResult } from "@/lib/types";

export async function createFeaturedExtraCheckoutAction(
  jobId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  if (!FEATURED_EXTRA_VARIANT_ID) {
    return { error: "Featured extra product is not configured" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: job } = await supabase
    .from("jobs")
    .select("id, posted_by, status, is_featured, featured_until")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.posted_by !== user.id) return { error: "Not authorized for this job" };
  if (job.status !== "active") return { error: "Only active jobs can be featured" };
  // Already has a paid-extra window running — no double-charge.
  if (isPaidExtraFeatured(job)) {
    return { error: "Featured-extra is already active on this job" };
  }

  configureLemonSqueezy();

  const { data: checkout, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    FEATURED_EXTRA_VARIANT_ID,
    {
      checkoutData: {
        email: user.email!,
        custom: {
          type: "featured_extra",
          job_id: job.id,
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/employer/jobs?featured=success`,
      },
    },
  );

  if (error || !checkout) {
    console.error("[featured-extra] createCheckout failed:", {
      variantId: FEATURED_EXTRA_VARIANT_ID,
      storeId: process.env.LEMONSQUEEZY_STORE_ID,
      lsError: error,
    });
    return { error: "Failed to create checkout session" };
  }

  return { error: null, data: { checkoutUrl: checkout.data.attributes.url } };
}
