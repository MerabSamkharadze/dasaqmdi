import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import type { SalaryCurrency } from "@/lib/types/enums";

export type SalaryAggregation = {
  category_id: number;
  category_slug: string;
  category_name_en: string;
  category_name_ka: string;
  city: string | null;
  currency: SalaryCurrency;
  avg_min: number;
  avg_max: number;
  min_salary: number;
  max_salary: number;
  job_count: number;
};

/**
 * Fetch the full unfiltered salary aggregation. Filtering is done
 * client-side (see `components/salaries/salary-view.tsx`), so we cache the
 * heavy DB scan + aggregation once per ISR window instead of on every filter
 * combination. Revalidates via `revalidateTag("salaries")` on job changes.
 */
export const getSalaryData = unstable_cache(
  async (): Promise<SalaryAggregation[]> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        salary_min,
        salary_max,
        salary_currency,
        city,
        category_id,
        category:categories!inner(id, slug, name_en, name_ka)
      `
      )
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .not("salary_min", "is", null);

    if (error) {
      console.error("Failed to fetch salary data:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Aggregate in JS — Supabase doesn't support GROUP BY with aggregates directly
    const groups = new Map<string, {
      category_id: number;
      category_slug: string;
      category_name_en: string;
      category_name_ka: string;
      city: string | null;
      currency: SalaryCurrency;
      salaries_min: number[];
      salaries_max: number[];
    }>();

    for (const row of data) {
      const cat = row.category as unknown as Pick<Category, "id" | "slug" | "name_en" | "name_ka">;
      const key = `${cat.slug}:${row.city ?? "all"}:${row.salary_currency}`;

      if (!groups.has(key)) {
        groups.set(key, {
          category_id: cat.id,
          category_slug: cat.slug,
          category_name_en: cat.name_en,
          category_name_ka: cat.name_ka,
          city: row.city,
          currency: row.salary_currency as SalaryCurrency,
          salaries_min: [],
          salaries_max: [],
        });
      }

      const group = groups.get(key)!;
      group.salaries_min.push(row.salary_min as number);
      if (row.salary_max) {
        group.salaries_max.push(row.salary_max as number);
      }
    }

    const results: SalaryAggregation[] = [];

    for (const group of groups.values()) {
      const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      const allSalaries = [...group.salaries_min, ...group.salaries_max];

      results.push({
        category_id: group.category_id,
        category_slug: group.category_slug,
        category_name_en: group.category_name_en,
        category_name_ka: group.category_name_ka,
        city: group.city,
        currency: group.currency,
        avg_min: avg(group.salaries_min),
        avg_max: group.salaries_max.length > 0 ? avg(group.salaries_max) : avg(group.salaries_min),
        min_salary: Math.min(...allSalaries),
        max_salary: Math.max(...allSalaries),
        job_count: group.salaries_min.length,
      });
    }

    results.sort((a, b) => b.job_count - a.job_count);
    return results;
  },
  ["salary-data"],
  { revalidate: 300, tags: ["salaries", "jobs"] },
);

export const getSalaryCities = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("city")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .not("salary_min", "is", null)
      .not("city", "is", null);

    if (error || !data) return [];

    const cities = [...new Set(data.map((r) => r.city as string))].sort();
    return cities;
  },
  ["salary-cities"],
  { revalidate: 300, tags: ["salaries", "jobs"] },
);