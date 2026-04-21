import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function redirectIfAuthenticated(to: string = "/dashboard"): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(to);
}

export async function requireAuthenticated(fallback: string = "/auth/login"): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(fallback);
}
