"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filter by job */}
      <select
        value={searchParams.get("job") ?? ""}
        onChange={(e) => updateParam("job", e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors flex-1 sm:flex-none sm:min-w-[200px]"
      >
        <option value="">{translations.allJobs}</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>

      {/* Filter by status */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
      >
        <option value="">{translations.allStatuses}</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {translations.statuses[s] ?? s}
          </option>
        ))}
      </select>
    </div>
  );
}
