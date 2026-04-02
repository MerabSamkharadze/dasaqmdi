import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

export async function getPublicProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, full_name_ka, avatar_url, city, bio, bio_ka, skills, experience_years, role, created_at")
    .eq("id", userId)
    .single();

  return data as Profile | null;
}
