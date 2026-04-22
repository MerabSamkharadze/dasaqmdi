"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminLogAction } from "@/lib/queries/admin";

type AdminLogsFiltersProps = {
  actions: readonly AdminLogAction[];
  translations: {
    allActions: string;
    filterByAction: string;
    actionLabels: Record<AdminLogAction, string>;
  };
};

export function AdminLogsFilters({ actions, translations: t }: AdminLogsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentAction = searchParams.get("action") ?? "all";

  const updateAction = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set("action", value);
      } else {
        params.delete("action");
      }
      params.delete("page"); // reset pagination when filter changes
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 transition-opacity duration-200",
        isPending && "opacity-60",
      )}
    >
      <Select value={currentAction} onValueChange={updateAction}>
        <SelectTrigger
          className="w-full sm:w-[240px] h-9 text-[13px]"
          aria-label={t.filterByAction}
        >
          <SelectValue placeholder={t.allActions} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {t.allActions}
          </SelectItem>
          {actions.map((action) => (
            <SelectItem key={action} value={action} className="text-[13px]">
              {t.actionLabels[action] ?? action}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
