"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPortalUrlAction } from "@/lib/actions/billing";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import Link from "next/link";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types";

type BillingCardProps = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  periodEnd: string | null;
  cancelAt: string | null;
  hasLsSubscription: boolean;
  isLegacy?: boolean;
  cycle?: "monthly" | "yearly" | null;
  translations: {
    currentPlan: string;
    nextBilling: string;
    manageSub: string;
    upgrade: string;
    freePlan: string;
    upgradePrompt: string;
    cancelledNotice: string;
    pastDue: string;
    status: Record<string, string>;
    planLabel: Record<SubscriptionPlan, string>;
    cycleLabel?: { monthly: string; yearly: string };
    legacyBadge?: string;
    legacyNotice?: string;
  };
};

export function BillingCard({
  plan,
  status,
  periodEnd,
  cancelAt,
  hasLsSubscription,
  isLegacy = false,
  cycle = null,
  translations: t,
}: BillingCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleManage() {
    startTransition(async () => {
      const result = await getPortalUrlAction();
      if (result.data?.portalUrl) {
        window.open(result.data.portalUrl, "_blank");
      }
    });
  }

  const statusVariant = status === "active"
    ? "default"
    : status === "past_due"
      ? "destructive"
      : "secondary";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
      {/* Plan info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{t.currentPlan}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xl font-bold tracking-tight text-foreground">
              {t.planLabel[plan]}
            </p>
            {cycle && t.cycleLabel && plan !== "free" && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                {t.cycleLabel[cycle]}
              </Badge>
            )}
            {isLegacy && t.legacyBadge && (
              <Badge
                variant="outline"
                className="text-[10px] font-normal border-amber-300/50 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
              >
                {t.legacyBadge}
              </Badge>
            )}
          </div>
        </div>
        {status && (
          <Badge variant={statusVariant}>
            {t.status[status] ?? status}
          </Badge>
        )}
      </div>

      {/* Legacy pricing notice */}
      {isLegacy && t.legacyNotice && (
        <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/40 p-3 text-[12px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400">
          {t.legacyNotice}
        </div>
      )}

      {/* Warnings */}
      {status === "past_due" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t.pastDue}</span>
        </div>
      )}

      {status === "cancelled" && cancelAt && (
        <div className="mb-4 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
          {t.cancelledNotice.replace("{date}", new Date(cancelAt).toLocaleDateString())}
        </div>
      )}

      {/* Period info */}
      {periodEnd && status === "active" && (
        <div className="mb-6 text-sm text-muted-foreground">
          <span>{t.nextBilling}: </span>
          <span className="font-medium text-foreground">
            {new Date(periodEnd).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasLsSubscription && (
          <Button
            variant="outline"
            onClick={handleManage}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Spinner />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {t.manageSub}
          </Button>
        )}

        {plan !== "verified" && (
          <Button asChild>
            <Link href="/pricing">{t.upgrade}</Link>
          </Button>
        )}
      </div>

      {/* Free plan prompt */}
      {plan === "free" && (
        <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
          <p className="text-sm text-muted-foreground">{t.freePlan}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {t.upgradePrompt}
          </p>
        </div>
      )}
    </div>
  );
}
