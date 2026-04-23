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
import { Search, Sparkles } from "lucide-react";
import { JOB_TYPES } from "@/lib/types/enums";
import { searchSynonymCategoriesAction } from "@/lib/actions/synonyms";
import type { ResolvedCategory } from "@/lib/queries/jobs";

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
    // ICU placeholder preserved — client substitutes per suggestion
    suggestInCategory: string;
    types: Record<string, string>;
  };
};

export function JobFilters({ categories, locale, translations }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);
  const [suggestions, setSuggestions] = useState<ResolvedCategory[]>([]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (autocompleteRef.current) clearTimeout(autocompleteRef.current);
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

  const fetchSuggestions = useCallback(
    (term: string) => {
      // Don't suggest while an explicit category is active — it would
      // override the user's deliberate scoping.
      if (searchParams.get("category")) {
        setSuggestions([]);
        return;
      }
      if (term.length < AUTOCOMPLETE_MIN_LENGTH) {
        setSuggestions([]);
        return;
      }
      const seq = ++requestSeqRef.current;
      void searchSynonymCategoriesAction(term).then((result) => {
        // Drop stale responses — user may have typed again mid-flight
        if (seq !== requestSeqRef.current) return;
        setSuggestions(result.categories);
      });
    },
    [searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Feed search — 2s debounce (existing behavior)
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateParam("q", trimmed);
      }, SEARCH_DEBOUNCE_MS);

      // Suggestion lookup — 300ms debounce (new)
      if (autocompleteRef.current) clearTimeout(autocompleteRef.current);
      if (trimmed.length < AUTOCOMPLETE_MIN_LENGTH) {
        setSuggestions([]);
        return;
      }
      autocompleteRef.current = setTimeout(() => {
        fetchSuggestions(trimmed);
      }, AUTOCOMPLETE_DEBOUNCE_MS);
    },
    [updateParam, fetchSuggestions]
  );

  const applySuggestion = useCallback(
    (slug: string) => {
      // Switching to category scope: clear q (we've captured the intent)
      // and clear any in-flight suggestion list so the chip disappears.
      setSuggestions([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (autocompleteRef.current) clearTimeout(autocompleteRef.current);
      updateParams({ category: slug, q: null });
    },
    [updateParams]
  );

  // Hide top suggestion if it points to a category that's already active
  const activeCategory = searchParams.get("category");
  const visibleSuggestions = activeCategory
    ? []
    : suggestions.filter((s) => s.slug !== activeCategory);

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity duration-200", isPending && "opacity-60")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search — debounced feed (2s) + debounced suggestion (300ms) */}
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

        {/* City — debounced like search */}
        <Input
          defaultValue={searchParams.get("city") ?? ""}
          placeholder={translations.location}
          className="w-full sm:w-[130px] h-9 text-[13px]"
          onChange={(e) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              updateParam("city", e.target.value.trim());
            }, SEARCH_DEBOUNCE_MS);
          }}
        />
      </div>

      {/* Synonym autocomplete — subtle suggestion chips */}
      {visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          {visibleSuggestions.map((cat) => {
            const label = locale === "ka" ? cat.name_ka : cat.name_en;
            const message = translations.suggestInCategory.replace("{category}", label);
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => applySuggestion(cat.slug)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[12px] text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <Sparkles className="h-3 w-3 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[320px]">{message}</span>
              </button>
            );
          })}
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
