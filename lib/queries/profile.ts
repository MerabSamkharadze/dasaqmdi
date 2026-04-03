import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// O2: React.cache deduplicates within a single request (layout + page)
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
});

export async function getPublicProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, full_name_ka, avatar_url, city, bio, bio_ka, skills, experience_years, role, is_public, created_at")
    .eq("id", userId)
    .single();

  if (!data) return null;

  // Respect privacy setting — default to public if field doesn't exist yet
  const isPublic = (data as Record<string, unknown>).is_public ?? true;
  if (!isPublic) return null;

  return data as Profile | null;
}
