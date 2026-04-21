"use client";

import { Button } from "@/components/ui/button";
import {
  closeJobAction,
  renewJobAction,
  toggleJobFeaturedAction,
} from "@/lib/actions/jobs";
import { Edit, XCircle, RefreshCw, Users, Star } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { VipBoostButton } from "@/components/dashboard/vip-boost-button";
import { cn } from "@/lib/utils";

// E6: Standalone renew button for dashboard
export function RenewJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("dashboard");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startTransition(async () => { await renewJobAction(jobId); })}
      disabled={isPending}
      className="gap-1.5 text-[11px] h-7"
    >
      <RefreshCw className={`h-2.5 w-2.5 ${isPending ? "animate-spin" : ""}`} />
      {t("renew")}
    </Button>
  );
}

type JobActionButtonsProps = {
  jobId: string;
  isExpired: boolean;
  isClosed: boolean;
  isFeatured?: boolean;
  vipLevel?: string;
  vipUntil?: string | null;
};

export function JobActionButtons({
  jobId,
  isExpired,
  isClosed,
  isFeatured = false,
  vipLevel = "normal",
  vipUntil = null,
}: JobActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setError(null);
    startTransition(async () => {
      const result = await closeJobAction(jobId);
      if (result.error) setError(result.error);
    });
  }

  function handleRenew() {
    setError(null);
    startTransition(async () => {
      const result = await renewJobAction(jobId);
      if (result.error) setError(result.error);
    });
  }

  function handleToggleFeatured() {
    setError(null);
    startTransition(async () => {
      const result = await toggleJobFeaturedAction(jobId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0 relative">
      {error && (
        <span className="absolute -top-6 right-0 text-[11px] text-destructive/80 whitespace-nowrap">
          {error}
        </span>
      )}
      {(isExpired || isClosed) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRenew}
          disabled={isPending}
          className="gap-1.5 text-[13px]"
        >
          <RefreshCw className="h-3 w-3" />
          Renew
        </Button>
      )}

      {!isClosed && !isExpired && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFeatured}
          disabled={isPending}
          aria-label={isFeatured ? "Unfeature job" : "Feature job"}
          className="h-8 w-8 rounded-xl"
        >
          <Star
            className={cn(
              "h-3.5 w-3.5 transition-colors duration-200",
              isFeatured
                ? "fill-amber-500 text-amber-500"
                : "text-muted-foreground/70 hover:text-amber-500",
            )}
          />
        </Button>
      )}

      {!isClosed && !isExpired && (
        <VipBoostButton jobId={jobId} vipLevel={vipLevel} vipUntil={vipUntil} />
      )}

      {!isClosed && !isExpired && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground/70 text-[13px]"
        >
          <XCircle className="h-3 w-3" />
          Close
        </Button>
      )}

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
        <Link href={`/employer/jobs/${jobId}/applications`}>
          <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
        <Link href={`/employer/jobs/${jobId}`}>
          <Edit className="h-3.5 w-3.5 text-muted-foreground/70" />
        </Link>
      </Button>
    </div>
  );
}
