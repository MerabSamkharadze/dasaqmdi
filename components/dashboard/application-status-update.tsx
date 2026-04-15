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
import { Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/types";

type StatusUpdateProps = {
  applicationId: string;
  currentStatus: string;
};

// O12: Optimistic — auto-submit on select change, no Update button needed
export function ApplicationStatusUpdate({ applicationId, currentStatus }: StatusUpdateProps) {
  const t = useTranslations("applications.status");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleChange() {
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
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form ref={formRef} className="flex items-center gap-1.5">
      <input type="hidden" name="application_id" value={applicationId} />

      <Select name="status" defaultValue={currentStatus} onValueChange={handleChange}>
        <SelectTrigger className="w-[130px] h-8 text-[12px]" disabled={isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="text-[12px]">
              {t(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/50" />}
      {saved && <Check className="h-3.5 w-3.5 text-primary" />}
      {error && <span className="text-[11px] text-destructive/80">{error}</span>}
    </form>
  );
}
