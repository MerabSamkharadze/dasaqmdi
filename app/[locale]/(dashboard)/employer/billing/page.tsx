import { createClient } from "@/lib/supabase/server";
import { getSubscriptionByCompanyId } from "@/lib/queries/subscriptions";
import { BillingCard } from "@/components/dashboard/billing-card";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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

      <BillingCard
        plan={plan}
        status={subscription?.status ?? null}
        periodEnd={subscription?.current_period_end ?? null}
        cancelAt={subscription?.cancel_at ?? null}
        hasLsSubscription={!!subscription?.lemon_squeezy_id}
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
        }}
      />
    </div>
  );
}
