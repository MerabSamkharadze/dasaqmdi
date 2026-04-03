import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/types";

// O13: Categories rarely change — cache for 1 hour
// Uses @supabase/supabase-js directly (not SSR client) because
// unstable_cache cannot access cookies() inside its scope
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name_en");

    return (data as Category[]) ?? [];
  },
  ["categories"],
  { revalidate: 3600 }
);
