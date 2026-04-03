import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionPlan } from "@/lib/types";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

function verifySignature(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}

function variantToPlan(variantId: string): SubscriptionPlan {
  if (variantId === process.env.LEMONSQUEEZY_VERIFIED_VARIANT_ID) return "verified";
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  return "free";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const eventName: string = body.meta?.event_name;
  const customData = body.meta?.custom_data;
  const companyId: string | undefined = customData?.company_id;

  if (!companyId) {
    return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const attrs = body.data?.attributes;

  if (
    eventName === "subscription_created" ||
    eventName === "subscription_updated"
  ) {
    const variantId = String(attrs.variant_id);
    const plan = variantToPlan(variantId);
    const status = mapStatus(attrs.status);

    // Upsert subscription
    await supabase
      .from("subscriptions")
      .upsert(
        {
          company_id: companyId,
          plan,
          status,
          lemon_squeezy_id: String(body.data.id),
          lemon_squeezy_customer_id: String(attrs.customer_id),
          variant_id: variantId,
          current_period_start: attrs.renews_at
            ? new Date(attrs.created_at).toISOString()
            : null,
          current_period_end: attrs.renews_at
            ? new Date(attrs.renews_at).toISOString()
            : null,
          cancel_at: attrs.ends_at
            ? new Date(attrs.ends_at).toISOString()
            : null,
        },
        { onConflict: "company_id" }
      );

    // Update company verification status
    const isVerified = plan === "verified" && status === "active";
    await supabase
      .from("companies")
      .update({ is_verified: isVerified })
      .eq("id", companyId);

    // Update featured status on jobs
    const isFeatured = (plan === "pro" || plan === "verified") && status === "active";
    await supabase
      .from("jobs")
      .update({ is_featured: isFeatured })
      .eq("company_id", companyId)
      .eq("status", "active");
  }

  if (eventName === "subscription_payment_failed") {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("company_id", companyId);
  }

  if (eventName === "subscription_expired") {
    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("company_id", companyId);

    // Remove featured + verified
    await supabase
      .from("companies")
      .update({ is_verified: false })
      .eq("id", companyId);

    await supabase
      .from("jobs")
      .update({ is_featured: false })
      .eq("company_id", companyId);
  }

  return NextResponse.json({ received: true });
}

function mapStatus(
  lsStatus: string
): "active" | "cancelled" | "past_due" | "expired" {
  switch (lsStatus) {
    case "active":
    case "on_trial":
      return "active";
    case "cancelled":
      return "cancelled";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "expired":
      return "expired";
    default:
      return "active";
  }
}
