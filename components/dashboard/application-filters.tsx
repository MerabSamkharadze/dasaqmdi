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

type ApplicationFiltersProps = {
  jobs: { id: string; title: string }[];
  translations: {
    allJobs: string;
    allStatuses: string;
    filterByJob: string;
    filterByStatus: string;
    statuses: Record<string, string>;
  };
};

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

export function ApplicationFilters({ jobs, translations }: ApplicationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
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
    [router, pathname, searchParams]
  );

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 transition-opacity duration-200", isPending && "opacity-60")}>
      {/* Filter by job */}
      <Select
        defaultValue={searchParams.get("job") ?? "all"}
        onValueChange={(v) => updateParam("job", v)}
      >
        <SelectTrigger className="w-full sm:w-[220px] h-9 text-[13px] truncate">
          <SelectValue placeholder={translations.allJobs} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allJobs}
          </SelectItem>
          {jobs.map((j) => (
            <SelectItem key={j.id} value={j.id} className="text-[13px]" title={j.title}>
              <span className="block max-w-[240px] sm:max-w-[180px] truncate">{j.title}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter by status */}
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-[13px] truncate">
          <SelectValue placeholder={translations.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allStatuses}
          </SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s} className="text-[13px]">
              {translations.statuses[s] ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
