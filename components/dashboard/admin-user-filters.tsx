"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type AdminUserFiltersProps = {
  translations: {
    searchPlaceholder: string;
    allRoles: string;
    seeker: string;
    employer: string;
    admin: string;
  };
};

export function AdminUserFilters({ translations: t }: AdminUserFiltersProps) {
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
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3 transition-opacity duration-200",
        isPending && "opacity-60",
      )}
    >
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
        defaultValue={searchParams.get("role") ?? "all"}
        onValueChange={(v) => updateParams("role", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px] h-9 text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">{t.allRoles}</SelectItem>
          <SelectItem value="seeker" className="text-[13px]">{t.seeker}</SelectItem>
          <SelectItem value="employer" className="text-[13px]">{t.employer}</SelectItem>
          <SelectItem value="admin" className="text-[13px]">{t.admin}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
