"use client";

import { Button } from "@/components/ui/button";
import { closeJobAction, renewJobAction } from "@/lib/actions/jobs";
import { Edit, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

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
    <div className="flex items-center gap-1 shrink-0">
      {(isExpired || isClosed) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRenew}
          disabled={isPending}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Renew
        </Button>
      )}

      {!isClosed && !isExpired && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground"
        >
          <XCircle className="h-3.5 w-3.5" />
          Close
        </Button>
      )}

      <Button variant="ghost" size="sm" asChild>
        <Link href={`/employer/jobs/${jobId}`}>
          <Edit className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
