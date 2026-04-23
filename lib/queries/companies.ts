import { unstable_cache } from "next/cache";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/types";

// Narrow column set matching what the /companies list view actually renders.
// Avoids fetching heavy JSONB/text columns (tech_stack, benefits, why_work_here*,
// address*) on every ISR regeneration.
const LIST_COLUMNS = "id, name, name_ka, slug, logo_url, is_verified, city, employee_count, description, description_ka, created_at";

export async function getCompanyByOwner(ownerId: string): Promise<Company | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", ownerId)
    .single();

  return data;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  return data;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

/**
 * Cached company list for the /companies page. Revalidates hourly or on
 * demand via `revalidateTag("companies")` after verify/create/update actions.
 */
export const getAllCompanies = unstable_cache(
  async (): Promise<Company[]> => {
    // Stateless anon client — cookies() is disallowed inside unstable_cache
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("companies")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false });

    return (data as Company[] | null) ?? [];
  },
  ["all-companies"],
  { revalidate: 3600, tags: ["companies"] },
);
