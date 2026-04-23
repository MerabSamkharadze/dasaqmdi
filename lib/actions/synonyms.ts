"use server";

import {
  resolveCategoriesForTerm,
  resolveCityCanonical,
  type ResolvedCategory,
  type ResolvedCity,
} from "@/lib/queries/jobs";

export type SynonymSuggestionResult = {
  categories: ResolvedCategory[];
};

export type CitySuggestionResult = {
  city: ResolvedCity | null;
};

// Client-callable wrapper around resolveCategoriesForTerm for the
// JobFilters autocomplete. Stays a thin pass-through — the underlying
// query is already cached (5 min per term) in lib/queries/jobs.ts.
export async function searchSynonymCategoriesAction(
  term: string,
): Promise<SynonymSuggestionResult> {
  const categories = await resolveCategoriesForTerm(term);
  return { categories };
}

// City autocomplete — resolves a typed term to its canonical bilingual form
// so the UI can chip "Searching in Tbilisi?" and rewrite the URL on accept.
export async function searchCityCanonicalAction(
  term: string,
): Promise<CitySuggestionResult> {
  const city = await resolveCityCanonical(term);
  return { city };
}
