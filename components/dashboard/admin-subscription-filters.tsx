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

type AdminSubscriptionFiltersProps = {
  translations: {
    allStatuses: string;
    active: string;
    cancelled: string;
    pastDue: string;
    expired: string;
    allPlans: string;
    free: string;
    pro: string;
    verified: string;
  };
};

export function AdminSubscriptionFilters({ translations: t }: AdminSubscriptionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 transition-opacity duration-200", isPending && "opacity-60")}>
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParams("status", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px] h-9 text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">{t.allStatuses}</SelectItem>
          <SelectItem value="active" className="text-[13px]">{t.active}</SelectItem>
          <SelectItem value="cancelled" className="text-[13px]">{t.cancelled}</SelectItem>
          <SelectItem value="past_due" className="text-[13px]">{t.pastDue}</SelectItem>
          <SelectItem value="expired" className="text-[13px]">{t.expired}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("plan") ?? "all"}
        onValueChange={(v) => updateParams("plan", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">{t.allPlans}</SelectItem>
          <SelectItem value="free" className="text-[13px]">{t.free}</SelectItem>
          <SelectItem value="pro" className="text-[13px]">{t.pro}</SelectItem>
          <SelectItem value="verified" className="text-[13px]">{t.verified}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
