"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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
      {/* Category */}
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
      >
        <option value="">{translations.allCategories}</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label}
          </option>
        ))}
      </select>

      {/* City */}
      <select
        value={searchParams.get("city") ?? ""}
        onChange={(e) => updateParam("city", e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
      >
        <option value="">{translations.allCities}</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Currency */}
      <select
        value={searchParams.get("currency") ?? ""}
        onChange={(e) => updateParam("currency", e.target.value)}
        className="h-9 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
      >
        <option value="">{translations.allCurrencies}</option>
        <option value="GEL">GEL (₾)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
      </select>
    </div>
  );
}