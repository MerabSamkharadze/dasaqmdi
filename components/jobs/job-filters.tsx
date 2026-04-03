"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { JOB_TYPES } from "@/lib/types/enums";

type Category = {
  slug: string;
  label: string;
};

type JobFiltersProps = {
  categories: Category[];
  translations: {
    searchPlaceholder: string;
    category: string;
    location: string;
    type: string;
    allCategories: string;
    allLocations: string;
    allTypes: string;
    types: Record<string, string>;
  };
};

export function JobFilters({ categories, translations }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search — O11: debounced realtime search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
        <Input
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={translations.searchPlaceholder}
          className="pl-9 h-9 text-[13px]"
          onChange={(e) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              updateParams("q", e.target.value.trim());
            }, 350);
          }}
        />
      </div>

      {/* Category */}
      <Select
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParams("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-[13px]">
          <SelectValue placeholder={translations.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allCategories}
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug} className="text-[13px]">
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Job Type */}
      <Select
        defaultValue={searchParams.get("type") ?? "all"}
        onValueChange={(v) => updateParams("type", v)}
      >
        <SelectTrigger className="w-full sm:w-[140px] h-9 text-[13px]">
          <SelectValue placeholder={translations.allTypes} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allTypes}
          </SelectItem>
          {JOB_TYPES.map((type) => (
            <SelectItem key={type} value={type} className="text-[13px]">
              {translations.types[type] ?? type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const city = (formData.get("city") as string)?.trim();
          updateParams("city", city);
        }}
      >
        <Input
          name="city"
          defaultValue={searchParams.get("city") ?? ""}
          placeholder={translations.location}
          className="w-full sm:w-[130px] h-9 text-[13px]"
        />
      </form>
    </div>
  );
}
