"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type EmployerJobFiltersProps = {
  categories: { slug: string; label: string }[];
  translations: {
    searchPlaceholder: string;
    allStatuses: string;
    active: string;
    closed: string;
    expired: string;
    allCategories: string;
  };
};

export function EmployerJobFilters({
  categories,
  translations: t,
}: EmployerJobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateParams("q", e.target.value.trim());
      }, 350);
    },
    [updateParams],
  );

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 transition-opacity duration-200", isPending && "opacity-60")}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
        <Input
          placeholder={t.searchPlaceholder}
          defaultValue={searchParams.get("q") ?? ""}
          onChange={handleSearch}
          className="pl-9 h-9 text-[13px]"
        />
      </div>

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
          <SelectItem value="closed" className="text-[13px]">{t.closed}</SelectItem>
          <SelectItem value="expired" className="text-[13px]">{t.expired}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParams("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[200px] h-9 text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">{t.allCategories}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug} className="text-[13px]">
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
