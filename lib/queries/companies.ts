import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/types";

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

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}
