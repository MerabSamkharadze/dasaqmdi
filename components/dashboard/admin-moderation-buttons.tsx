"use client";

import { Button } from "@/components/ui/button";
import { approveJobAction, rejectJobAction } from "@/lib/actions/admin";
import { Check, X } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { useState, useTransition } from "react";

export function ModerationButtons({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  function handle(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveJobAction(jobId)
          : await rejectJobAction(jobId);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(action === "approve" ? "approved" : "rejected");
      }
    });
  }

  if (done) {
    return (
      <span
        className={`text-[11px] font-medium ${
          done === "approved"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {done === "approved" ? "Approved" : "Rejected"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handle("approve")}
            className="gap-1 text-[12px] h-7 border-emerald-300/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handle("reject")}
            className="gap-1 text-[12px] h-7 border-red-300/50 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      )}
      {error && <span className="text-[11px] text-destructive/80">{error}</span>}
    </div>
  );
}
