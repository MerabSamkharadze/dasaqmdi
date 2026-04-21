"use server";

import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import {
  configureLemonSqueezy,
  VIP_VARIANTS,
  type VipBoostLevel,
} from "@/lib/lemonsqueezy";
import type { ActionResult } from "@/lib/types";

export async function createVipBoostCheckoutAction(
  jobId: string,
  level: VipBoostLevel,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify job ownership — only the job's poster can boost it
  const { data: job } = await supabase
    .from("jobs")
    .select("id, posted_by, company_id, status, title, title_ka")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.posted_by !== user.id) return { error: "Not authorized for this job" };
  if (job.status !== "active") return { error: "Only active jobs can be boosted" };

  configureLemonSqueezy();

  const { data: checkout, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    VIP_VARIANTS[level],
    {
      checkoutData: {
        email: user.email!,
        custom: {
          type: "vip_boost",
          job_id: job.id,
          level,
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/employer/jobs?boost=success`,
      },
    },
  );

  if (error || !checkout) {
    return { error: "Failed to create checkout session" };
  }

  return { error: null, data: { checkoutUrl: checkout.data.attributes.url } };
}
