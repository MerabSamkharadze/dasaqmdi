"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Check } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { createVipBoostCheckoutAction } from "@/lib/actions/vip-boost";
import { VIP_CONFIG, type VipBoostLevel } from "@/lib/lemonsqueezy";
import { isVipActive } from "@/lib/vip";
import { cn } from "@/lib/utils";

type VipBoostButtonProps = {
  jobId: string;
  vipLevel: string;
  vipUntil: string | null;
};

export function VipBoostButton({ jobId, vipLevel, vipUntil }: VipBoostButtonProps) {
  const t = useTranslations("billing");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = isVipActive({ vip_level: vipLevel, vip_until: vipUntil });

  function handleCheckout(level: VipBoostLevel) {
    setError(null);
    startTransition(async () => {
      const result = await createVipBoostCheckoutAction(jobId, level);
      if (result.error || !result.data) {
        setError(result.error ?? "Failed to start checkout");
        return;
      }
      window.location.href = result.data.checkoutUrl;
    });
  }

  if (active && vipUntil) {
    const until = new Date(vipUntil).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title={t("boostActive", { date: until })}
        aria-label={t("boostActive", { date: until })}
        className="gap-1 text-[11px] h-7 px-2 border-amber-300/50 text-amber-600 dark:border-amber-500/30 dark:text-amber-400 cursor-default tabular-nums"
      >
        <Sparkles className="h-3 w-3" />
        <span>VIP · {until}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="gap-1.5 text-[11px] h-7 border-amber-300/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
      >
        {isPending ? <Spinner /> : <Sparkles className="h-3 w-3" />}
        {t("boost")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("boostTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("boostDescription")}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 py-2">
            <BoostOption
              level="silver"
              title={t("silverTitle")}
              subtitle={t("silverSubtitle", { days: VIP_CONFIG.silver.days })}
              price={VIP_CONFIG.silver.priceLabel}
              onClick={() => handleCheckout("silver")}
              disabled={isPending}
            />
            <BoostOption
              level="gold"
              title={t("goldTitle")}
              subtitle={t("goldSubtitle", { days: VIP_CONFIG.gold.days })}
              price={VIP_CONFIG.gold.priceLabel}
              onClick={() => handleCheckout("gold")}
              disabled={isPending}
              recommended
            />
          </div>

          {error && (
            <p className="text-[12px] text-destructive/80">{error}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BoostOption({
  title,
  subtitle,
  price,
  onClick,
  disabled,
  recommended,
}: {
  level: VipBoostLevel;
  title: string;
  subtitle: string;
  price: string;
  onClick: () => void;
  disabled: boolean;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200",
        recommended
          ? "border-amber-300/70 bg-amber-50/60 hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/5"
          : "border-border/60 bg-card hover:border-border",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
          <Check className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />
          Best value
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
      </div>
      <div className="shrink-0 text-[15px] font-semibold tabular-nums text-primary">
        {price}
      </div>
    </button>
  );
}
