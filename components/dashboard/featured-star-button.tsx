"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Star, Check } from "lucide-react";
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
import { Spinner } from "@/components/shared/spinner";
import { toggleJobFeaturedAction } from "@/lib/actions/jobs";
import { createFeaturedExtraCheckoutAction } from "@/lib/actions/featured-extra";
import { FEATURED_EXTRA_CONFIG } from "@/lib/lemonsqueezy";
import { cn } from "@/lib/utils";

type FeaturedStarButtonProps = {
  jobId: string;
  isFeatured: boolean;
  featuredUntil: string | null;
};

/**
 * Star toggle with paid-extra fallback:
 *   - Subscription slot → standard toggle on/off
 *   - Paid-extra in window → disabled, shows "Featured until {date}"
 *   - Slot full when trying to feature → opens 5₾/30d upsell dialog
 */
export function FeaturedStarButton({
  jobId,
  isFeatured,
  featuredUntil,
}: FeaturedStarButtonProps) {
  const t = useTranslations("billing");
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const paidExtraActive =
    isFeatured && featuredUntil !== null && new Date(featuredUntil).getTime() > Date.now();

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleJobFeaturedAction(jobId);
      if (result.error) {
        // "slot limit reached" is the only error we want to upsell on;
        // other errors (auth, db) surface inline.
        if (/slot limit reached/i.test(result.error)) {
          setDialogOpen(true);
        } else {
          setError(result.error);
        }
      }
    });
  }

  function handleBuyExtra() {
    setError(null);
    startTransition(async () => {
      const result = await createFeaturedExtraCheckoutAction(jobId);
      if (result.error || !result.data) {
        setError(result.error ?? "Failed to start checkout");
        return;
      }
      window.location.href = result.data.checkoutUrl;
    });
  }

  if (paidExtraActive && featuredUntil) {
    const until = new Date(featuredUntil).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={t("featuredExtraActive", { date: until })}
        title={t("featuredExtraActive", { date: until })}
        className="h-8 w-8 rounded-xl cursor-default"
      >
        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      </Button>
    );
  }

  return (
    <>
      <div className="relative">
        {error && (
          <span className="absolute -top-6 right-0 text-[11px] text-destructive/80 whitespace-nowrap">
            {error}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={isFeatured ? "Unfeature job" : "Feature job"}
          className="h-8 w-8 rounded-xl"
        >
          {isPending ? (
            <Spinner />
          ) : (
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-200",
                isFeatured
                  ? "fill-amber-500 text-amber-500"
                  : "text-muted-foreground/70 hover:text-amber-500",
              )}
            />
          )}
        </Button>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("featuredExtraTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("featuredExtraDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <button
            type="button"
            onClick={handleBuyExtra}
            disabled={isPending}
            className={cn(
              "relative flex items-center justify-between gap-3 rounded-xl border border-amber-300/70 bg-amber-50/60 px-4 py-3 text-left transition-all duration-200 hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/5",
              isPending && "opacity-60 cursor-not-allowed",
            )}
          >
            <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              <Check className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />
              {t("featuredExtraBadge")}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {t("featuredExtraOptionTitle")}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                {t("featuredExtraOptionSubtitle", { days: FEATURED_EXTRA_CONFIG.days })}
              </p>
            </div>
            <div className="shrink-0 text-[15px] font-semibold tabular-nums text-primary">
              {FEATURED_EXTRA_CONFIG.priceLabel}
            </div>
          </button>

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
