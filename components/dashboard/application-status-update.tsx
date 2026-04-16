"use client";

import { useRef, useState, useTransition } from "react";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUSES } from "@/lib/types/enums";
import { Check } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/types";

type StatusUpdateProps = {
  applicationId: string;
  currentStatus: string;
};

const SENSITIVE_STATUSES = ["accepted", "rejected"];

// O12: Optimistic — auto-submit on select change, with confirmation for sensitive statuses
export function ApplicationStatusUpdate({ applicationId, currentStatus }: StatusUpdateProps) {
  const t = useTranslations("applications.status");
  const tCommon = useTranslations("common");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  function handleChange(newStatus: string) {
    // Confirm before sensitive status changes
    if (SENSITIVE_STATUSES.includes(newStatus) && newStatus !== currentStatus) {
      const confirmed = window.confirm(
        `${t(newStatus)}? ${tCommon("confirmAction")}`
      );
      if (!confirmed) return;
    }

    setStatus(newStatus);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const formData = new FormData(formRef.current!);
      const result: ActionResult = await updateApplicationStatusAction(
        { error: null },
        formData
      );
      if (result.error) {
        setError(result.error);
        setStatus(currentStatus); // Revert on error
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form ref={formRef} className="flex items-center gap-1.5">
      <input type="hidden" name="application_id" value={applicationId} />

      <Select name="status" value={status} onValueChange={handleChange}>
        <SelectTrigger className="w-[130px] h-8 text-[12px]" disabled={isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-[12px]">
              {t(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isPending && <Spinner className="text-muted-foreground/50" />}
      {saved && (
        <span className="flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="sr-only">{tCommon("saved")}</span>
        </span>
      )}
      {error && <span role="alert" className="text-[11px] text-destructive/80">{error}</span>}
    </form>
  );
}
