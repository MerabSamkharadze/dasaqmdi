"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/shared/spinner";
import { clearOldLogsAction } from "@/lib/actions/admin";

const CLEANUP_OPTIONS = [30, 60, 90, 180] as const;

type CleanupTranslations = {
  cleanupTitle: string;
  cleanupDescription: string;
  cleanupOlderThan: string;
  days: string;
  confirmClearTitle: string;
  confirmClearDescription: string;
  confirmClearAction: string;
  cancel: string;
  cleared: string;
};

export function AdminLogsCleanup({ t }: { t: CleanupTranslations }) {
  const [isPending, startTransition] = useTransition();
  const [pendingDays, setPendingDays] = useState<number | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm(days: number) {
    setError(null);
    setResultMsg(null);
    setPendingDays(null);
    startTransition(async () => {
      const result = await clearOldLogsAction(days);
      if (result.error) {
        setError(result.error);
      } else {
        setResultMsg(t.cleared.replace("{count}", String(result.data?.count ?? 0)));
      }
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">{t.cleanupTitle}</h2>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{t.cleanupDescription}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CLEANUP_OPTIONS.map((d) => (
            <Button
              key={d}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setPendingDays(d)}
              className="gap-1.5 text-[11px] h-7"
            >
              {isPending && pendingDays === d ? <Spinner /> : <Eraser className="h-3 w-3" />}
              &gt; {d} {t.days}
            </Button>
          ))}
        </div>
      </div>

      {(resultMsg || error) && (
        <p
          className={`mt-3 text-[12px] ${
            error ? "text-destructive/80" : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {error ?? resultMsg}
        </p>
      )}

      <AlertDialog open={pendingDays !== null} onOpenChange={(open) => !open && setPendingDays(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmClearTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmClearDescription.replace("{days}", String(pendingDays ?? 0))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDays && handleConfirm(pendingDays)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.confirmClearAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
