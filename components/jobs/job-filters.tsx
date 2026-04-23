"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChocoDrink } from "@/components/shared/loaders/choco-drink";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Sparkles, MapPin } from "lucide-react";
import { JOB_TYPES } from "@/lib/types/enums";
import {
  searchSynonymCategoriesAction,
  searchCityCanonicalAction,
} from "@/lib/actions/synonyms";
import type { ResolvedCategory, ResolvedCity } from "@/lib/queries/jobs";

const SEARCH_DEBOUNCE_MS = 2000;
// Autocomplete is a separate, faster signal than the feed search.
// 300ms feels responsive without spamming the server action.
const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_LENGTH = 2;

type Category = {
  slug: string;
  label: string;
};

type JobFiltersProps = {
  categories: Category[];
  locale: string;
  translations: {
    searchPlaceholder: string;
    category: string;
    location: string;
    type: string;
    allCategories: string;
    allLocations: string;
    allTypes: string;
    // ICU placeholders preserved — client substitutes per suggestion
    suggestInCategory: string;
    suggestInCity: string;
    types: Record<string, string>;
  };
};

export function JobFilters({ categories, locale, translations }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Feed-search debounce (fires the 2s URL update for q and city)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocomplete debounces (fires the 300ms suggestion lookups)
  const categoryAcRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityAcRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stale-response guards — monotonically-increasing sequence per autocomplete
  const categorySeqRef = useRef(0);
  const citySeqRef = useRef(0);

  const [categorySuggestions, setCategorySuggestions] = useState<ResolvedCategory[]>([]);
  const [citySuggestion, setCitySuggestion] = useState<ResolvedCity | null>(null);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      if (categoryAcRef.current) clearTimeout(categoryAcRef.current);
      if (cityAcRef.current) clearTimeout(cityAcRef.current);
    };
  }, []);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const updateParam = useCallback(
    (key: string, value: string) => updateParams({ [key]: value }),
    [updateParams]
  );

  // ── Category autocomplete ─────────────────────────────────────────

  const fetchCategorySuggestions = useCallback(
    (term: string) => {
      if (searchParams.get("category")) {
        setCategorySuggestions([]);
        return;
      }
      const seq = ++categorySeqRef.current;
      void searchSynonymCategoriesAction(term).then((result) => {
        if (seq !== categorySeqRef.current) return;
        setCategorySuggestions(result.categories);
      });
    },
    [searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Feed search — 2s debounce
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        updateParam("q", trimmed);
      }, SEARCH_DEBOUNCE_MS);

      // Category suggestion — 300ms debounce
      if (categoryAcRef.current) clearTimeout(categoryAcRef.current);
      if (trimmed.length < AUTOCOMPLETE_MIN_LENGTH) {
        setCategorySuggestions([]);
        return;
      }
      categoryAcRef.current = setTimeout(() => {
        fetchCategorySuggestions(trimmed);
      }, AUTOCOMPLETE_DEBOUNCE_MS);
    },
    [updateParam, fetchCategorySuggestions]
  );

  const applyCategorySuggestion = useCallback(
    (slug: string) => {
      setCategorySuggestions([]);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (categoryAcRef.current) clearTimeout(categoryAcRef.current);
      updateParams({ category: slug, q: null });
    },
    [updateParams]
  );

  // ── City autocomplete ─────────────────────────────────────────────

  const fetchCitySuggestion = useCallback((term: string) => {
    const seq = ++citySeqRef.current;
    void searchCityCanonicalAction(term).then((result) => {
      if (seq !== citySeqRef.current) return;
      setCitySuggestion(result.city);
    });
  }, []);

  const handleCityChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Feed filter — 2s debounce (uses its own timer so q and city don't
      // clobber each other's scheduled updates)
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      cityDebounceRef.current = setTimeout(() => {
        updateParam("city", trimmed);
      }, SEARCH_DEBOUNCE_MS);

      // City canonical lookup — 300ms debounce
      if (cityAcRef.current) clearTimeout(cityAcRef.current);
      if (trimmed.length < AUTOCOMPLETE_MIN_LENGTH) {
        setCitySuggestion(null);
        return;
      }
      cityAcRef.current = setTimeout(() => {
        fetchCitySuggestion(trimmed);
      }, AUTOCOMPLETE_DEBOUNCE_MS);
    },
    [updateParam, fetchCitySuggestion]
  );

  const applyCitySuggestion = useCallback(
    (canonicalEn: string) => {
      setCitySuggestion(null);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      if (cityAcRef.current) clearTimeout(cityAcRef.current);
      updateParam("city", canonicalEn);
    },
    [updateParam]
  );

  // ── Visibility rules ──────────────────────────────────────────────

  // Category: hide when explicit category filter is already set
  const visibleCategorySuggestions = searchParams.get("category")
    ? []
    : categorySuggestions;

  // City: hide when URL already holds the canonical form (avoid self-suggesting)
  const urlCity = searchParams.get("city");
  const urlCityLc = urlCity?.toLowerCase();
  const visibleCitySuggestion =
    citySuggestion &&
    urlCityLc !== citySuggestion.name_en.toLowerCase() &&
    urlCityLc !== citySuggestion.name_ka.toLowerCase()
      ? citySuggestion
      : null;

  const hasAnySuggestion =
    visibleCategorySuggestions.length > 0 || visibleCitySuggestion !== null;

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity duration-200", isPending && "opacity-60")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search — debounced feed (2s) + debounced category suggestion (300ms) */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            defaultValue={searchParams.get("q") ?? ""}
            placeholder={translations.searchPlaceholder}
            className="pl-9 h-9 text-[13px]"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

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
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug} className="text-[13px]" title={cat.label}>
                <span className="block max-w-[240px] sm:max-w-[120px] truncate">{cat.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Type */}
        <Select
          defaultValue={searchParams.get("type") ?? "all"}
          onValueChange={(v) => updateParam("type", v)}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-[13px] truncate">
            <SelectValue placeholder={translations.allTypes} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[13px]">
              {translations.allTypes}
            </SelectItem>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-[13px]" title={translations.types[type] ?? type}>
                <span className="block max-w-[240px] sm:max-w-[100px] truncate">{translations.types[type] ?? type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City — debounced feed (2s) + debounced canonical lookup (300ms) */}
        <Input
          defaultValue={searchParams.get("city") ?? ""}
          placeholder={translations.location}
          className="w-full sm:w-[130px] h-9 text-[13px]"
          onChange={(e) => handleCityChange(e.target.value)}
        />
      </div>

      {/* Autocomplete chips — category + city suggestions in one row */}
      {hasAnySuggestion && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          {visibleCategorySuggestions.map((cat) => {
            const label = locale === "ka" ? cat.name_ka : cat.name_en;
            // Function form — avoids $& / $1 interpolation if a category
            // name ever contains "$" (e.g. a "50$" salary landing page).
            const message = translations.suggestInCategory.replace("{category}", () => label);
            return (
              <button
                key={`cat-${cat.slug}`}
                type="button"
                onClick={() => applyCategorySuggestion(cat.slug)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[12px] text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <Sparkles className="h-3 w-3 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[320px]">{message}</span>
              </button>
            );
          })}

          {visibleCitySuggestion && (() => {
            const label = locale === "ka" ? visibleCitySuggestion.name_ka : visibleCitySuggestion.name_en;
            const message = translations.suggestInCity.replace("{city}", () => label);
            return (
              <button
                type="button"
                onClick={() => applyCitySuggestion(visibleCitySuggestion.name_en)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[12px] text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <MapPin className="h-3 w-3 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[320px]">{message}</span>
              </button>
            );
          })()}
        </div>
      )}

      {isPending && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <ChocoDrink />
        </div>,
        document.body
      )}
    </div>
  );
}
