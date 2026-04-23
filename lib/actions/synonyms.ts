"use server";

import {
  resolveCategoriesForTerm,
  type ResolvedCategory,
} from "@/lib/queries/jobs";

export type SynonymSuggestionResult = {
  categories: ResolvedCategory[];
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
