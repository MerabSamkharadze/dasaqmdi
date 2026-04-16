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

type SalaryFiltersProps = {
  categories: { slug: string; label: string }[];
  cities: string[];
  translations: {
    category: string;
    city: string;
    currency: string;
    allCategories: string;
    allCities: string;
    allCurrencies: string;
  };
};

export function SalaryFilters({ categories, cities, translations }: SalaryFiltersProps) {
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
      {/* Category */}
      <Select
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[172px] h-9 text-[13px] truncate">
          <SelectValue placeholder={translations.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allCategories}
          </SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug} className="text-[13px]" title={c.label}>
              <span className="block max-w-[240px] sm:max-w-[120px] truncate">{c.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City */}
      <Select
        defaultValue={searchParams.get("city") ?? "all"}
        onValueChange={(v) => updateParam("city", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] h-9 text-[13px] truncate">
          <SelectValue placeholder={translations.allCities} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allCities}
          </SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c} className="text-[13px]">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Currency */}
      <Select
        defaultValue={searchParams.get("currency") ?? "all"}
        onValueChange={(v) => updateParam("currency", v)}
      >
        <SelectTrigger className="w-full sm:w-[140px] h-9 text-[13px] truncate">
          <SelectValue placeholder={translations.allCurrencies} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-[13px]">
            {translations.allCurrencies}
          </SelectItem>
          <SelectItem value="GEL" className="text-[13px]">GEL (₾)</SelectItem>
          <SelectItem value="USD" className="text-[13px]">USD ($)</SelectItem>
          <SelectItem value="EUR" className="text-[13px]">EUR (€)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
