"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterBadge = {
  // URL param to remove on dismiss
  paramKey: "q" | "category" | "city" | "type";
  // Pre-formatted, localized label — e.g. "კატეგორია: IT და პროგრამირება"
  label: string;
};

type Props = {
  badges: FilterBadge[];
  clearAllLabel: string;
};

export function ActiveFilterBadges({ badges, clearAllLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const replaceWith = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const removeParam = useCallback(
    (key: FilterBadge["paramKey"]) => replaceWith((p) => p.delete(key)),
    [replaceWith]
  );

  const clearAll = useCallback(
    () =>
      replaceWith((p) => {
        for (const b of badges) p.delete(b.paramKey);
      }),
    [replaceWith, badges]
  );

  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60"
      )}
    >
      {badges.map((b) => (
        <button
          key={b.paramKey}
          type="button"
          onClick={() => removeParam(b.paramKey)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 pl-3 pr-1.5 py-1 text-[12px] text-foreground transition-colors hover:border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={`Remove filter: ${b.label}`}
        >
          <span className="truncate max-w-[240px]">{b.label}</span>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
            <X className="h-3 w-3" aria-hidden="true" />
          </span>
        </button>
      ))}

      {badges.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
        >
          {clearAllLabel}
        </button>
      )}
    </div>
  );
}
