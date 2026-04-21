import { createClient } from "@/lib/supabase/server";
import { getSubscriptionByCompanyId } from "@/lib/queries/subscriptions";
import { BillingCard } from "@/components/dashboard/billing-card";
import { ActiveBoostsCard, type ActiveBoost } from "@/components/dashboard/active-boosts-card";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { isLegacyVariant, getBillingCycle } from "@/lib/lemonsqueezy";
import { localized } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/types";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const t = await getTranslations("billing");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!company) redirect("/employer/company");

  const subscription = await getSubscriptionByCompanyId(company.id);
  const plan: SubscriptionPlan = subscription?.status === "active"
    ? subscription.plan
    : "free";

  const isLegacy =
    subscription?.status === "active" && plan !== "free"
      ? isLegacyVariant(subscription.variant_id, plan)
      : false;

  const cycle =
    subscription?.status === "active" && plan !== "free"
      ? getBillingCycle(subscription.variant_id, plan)
      : null;

  // Active boosts on this employer's jobs
  const locale = await getLocale();
  const nowIso = new Date().toISOString();
  const { data: boostedJobs } = await supabase
    .from("jobs")
    .select("id, title, title_ka, vip_level, vip_until")
    .eq("company_id", company.id)
    .neq("vip_level", "normal")
    .gte("vip_until", nowIso)
    .order("vip_until", { ascending: true });

  const activeBoosts: ActiveBoost[] = (boostedJobs ?? [])
    .filter((j) => j.vip_until)
    .map((j) => ({
      jobId: j.id,
      title: localized(j, "title", locale),
      vipLevel: j.vip_level as "silver" | "gold",
      vipUntil: j.vip_until as string,
    }));

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-lg font-semibold tracking-tight text-foreground mb-6">
        {t("title")}
      </h1>

      {/* Success message after checkout */}
      {searchParams.success === "true" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t("successMessage")}
        </div>
      )}

      {/* No company warning — shouldn't reach here due to redirect */}
      {!company && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Create a company first to manage billing.</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <BillingCard
          plan={plan}
          status={subscription?.status ?? null}
          periodEnd={subscription?.current_period_end ?? null}
          cancelAt={subscription?.cancel_at ?? null}
          hasLsSubscription={!!subscription?.lemon_squeezy_id}
          isLegacy={isLegacy}
          cycle={cycle}
          translations={{
            currentPlan: t("currentPlan"),
            nextBilling: t("nextBilling"),
            manageSub: t("manageSub"),
            upgrade: t("upgrade"),
            freePlan: t("freePlan"),
            upgradePrompt: t("upgradePrompt"),
            cancelledNotice: t("cancelledNotice"),
            pastDue: t("pastDue"),
            status: {
              active: t("status.active"),
              cancelled: t("status.cancelled"),
              past_due: t("status.past_due"),
              expired: t("status.expired"),
            },
            planLabel: {
              free: t("planLabel.free"),
              pro: t("planLabel.pro"),
              verified: t("planLabel.verified"),
            },
            cycleLabel: {
              monthly: t("billingCycleLabel.monthly"),
              yearly: t("billingCycleLabel.yearly"),
            },
            legacyBadge: t("legacyBadge"),
            legacyNotice: t("legacyNotice"),
          }}
        />

        <ActiveBoostsCard
          boosts={activeBoosts}
          title={t("activeBoosts")}
          emptyLabel={t("noActiveBoosts")}
          untilLabel={t("boostUntil")}
          locale={locale}
        />
      </div>
    </div>
  );
}
