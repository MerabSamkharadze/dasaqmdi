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
  };
};

export function BillingCard({
  plan,
  status,
  periodEnd,
  cancelAt,
  hasLsSubscription,
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

  const planLabels: Record<SubscriptionPlan, string> = {
    free: "Free",
    pro: "Pro",
    verified: "Verified",
  };

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
          <p className="text-xl font-bold tracking-tight text-foreground mt-1">
            {planLabels[plan]}
          </p>
        </div>
        {status && (
          <Badge variant={statusVariant}>
            {t.status[status] ?? status}
          </Badge>
        )}
      </div>

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
