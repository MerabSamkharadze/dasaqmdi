"use client";

import { Button } from "@/components/ui/button";
import { closeJobAction, renewJobAction } from "@/lib/actions/jobs";
import { Edit, XCircle, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

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
};

export function JobActionButtons({ jobId, isExpired, isClosed }: JobActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    startTransition(async () => {
      await closeJobAction(jobId);
    });
  }

  function handleRenew() {
    startTransition(async () => {
      await renewJobAction(jobId);
    });
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
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
