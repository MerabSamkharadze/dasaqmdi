"use client";

import { useFormState } from "react-dom";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/submit-button";
import { APPLICATION_STATUSES } from "@/lib/types/enums";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult = { error: null };

type StatusUpdateProps = {
  applicationId: string;
  currentStatus: string;
};

export function ApplicationStatusUpdate({ applicationId, currentStatus }: StatusUpdateProps) {
  const [state, formAction] = useFormState(updateApplicationStatusAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="application_id" value={applicationId} />

      <Select name="status" defaultValue={currentStatus}>
        <SelectTrigger className="w-[130px] h-8 text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="text-[12px]">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SubmitButton size="sm" variant="outline" className="h-8 text-[12px]" pendingText="...">
        Update
      </SubmitButton>

      {state.error && (
        <span className="text-[11px] text-destructive/80">{state.error}</span>
      )}
    </form>
  );
}
