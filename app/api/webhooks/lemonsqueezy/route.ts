import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIP_CONFIG, variantToVipLevel } from "@/lib/lemonsqueezy";
import type { SubscriptionPlan } from "@/lib/types";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    return false;
  }

  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const hashBuf = Buffer.from(hash);
  const sigBuf = Buffer.from(signature);
  if (hashBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, sigBuf);
}

function variantToPlan(variantId: string): SubscriptionPlan {
  if (
    variantId === process.env.LEMONSQUEEZY_VERIFIED_VARIANT_ID ||
    variantId === process.env.LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID
  ) return "verified";
  if (
    variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID ||
    variantId === process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID
  ) return "pro";
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
  const supabase = createAdminClient();
  const attrs = body.data?.attributes;

  // ── One-time VIP boost purchase ─────────────────────────────────────────
  // Lemon Squeezy fires `order_created` for every order (including those that
  // back a subscription). We only handle it here when custom_data.type marks
  // it as a vip_boost — subscriptions are handled by the subscription_* events
  // below.
  if (eventName === "order_created" && customData?.type === "vip_boost") {
    const jobId: string | undefined = customData.job_id;
    const level = customData.level as "silver" | "gold" | undefined;
    const userId: string | undefined = customData.user_id;
    if (!jobId || !level || !VIP_CONFIG[level]) {
      return NextResponse.json({ error: "Invalid boost payload" }, { status: 400 });
    }

    // Sanity-check the paid variant matches the requested level
    const paidVariantId = String(attrs?.first_order_item?.variant_id ?? "");
    if (variantToVipLevel(paidVariantId) !== level) {
      return NextResponse.json({ error: "Variant/level mismatch" }, { status: 400 });
    }

    const vipUntil = new Date();
    vipUntil.setDate(vipUntil.getDate() + VIP_CONFIG[level].days);

    await supabase
      .from("jobs")
      .update({ vip_level: level, vip_until: vipUntil.toISOString() })
      .eq("id", jobId);

    // Audit trail — captures revenue events independent of Lemon Squeezy
    if (userId) {
      await supabase.from("admin_logs").insert({
        action: "boost_purchased",
        actor_id: userId,
        target_type: "job",
        target_id: jobId,
        metadata: {
          level,
          days: VIP_CONFIG[level].days,
          order_id: String(body.data?.id ?? ""),
          total_amount: attrs?.total_formatted ?? null,
          currency: attrs?.currency ?? null,
        },
      });
    }

    return NextResponse.json({ received: true });
  }

  // ── Subscription events ─────────────────────────────────────────────────
  const companyId: string | undefined = customData?.company_id;
  if (!companyId) {
    // Subscription-less order (e.g. boost with no custom_data, or unknown flow)
    // — acknowledge so Lemon Squeezy doesn't retry, but don't mutate state.
    return NextResponse.json({ received: true, skipped: true });
  }

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

    // Reconcile featured slot count.
    //   - active subscription: pre-fill N newest active jobs as featured on
    //     first subscription (welcome), but respect existing user choices on
    //     later updates. If user has too many featured (e.g. after downgrade
    //     Pro → Business), keep the N newest, unfeature the rest.
    //   - non-active status: leave featured state alone; subscription_expired
    //     clears it wholesale below.
    if (status === "active") {
      const limit = plan === "verified" ? 3 : plan === "pro" ? 1 : 0;

      const { data: currentlyFeatured } = await supabase
        .from("jobs")
        .select("id")
        .eq("company_id", companyId)
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      const featuredIds = (currentlyFeatured ?? []).map((j) => j.id);

      if (featuredIds.length > limit) {
        // Over limit → keep newest N, unfeature the rest
        const toUnfeature = featuredIds.slice(limit);
        await supabase
          .from("jobs")
          .update({ is_featured: false })
          .in("id", toUnfeature);
      } else if (
        featuredIds.length === 0 &&
        limit > 0 &&
        eventName === "subscription_created"
      ) {
        // Welcome experience on first subscription: auto-feature N newest
        const { data: newest } = await supabase
          .from("jobs")
          .select("id")
          .eq("company_id", companyId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(limit);
        const ids = (newest ?? []).map((j) => j.id);
        if (ids.length > 0) {
          await supabase
            .from("jobs")
            .update({ is_featured: true })
            .in("id", ids);
        }
      }
    } else if (plan === "free") {
      // Downgraded to free (shouldn't really happen via webhook, but be safe)
      await supabase
        .from("jobs")
        .update({ is_featured: false })
        .eq("company_id", companyId);
    }
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
