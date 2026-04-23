import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Stateless anon client for `unstable_cache`-wrapped queries. The normal
 * `createClient()` reads cookies() which is a dynamic data source that
 * Next.js refuses to allow inside cache scopes. This client uses only the
 * public anon key — safe for data protected by public RLS policies.
 */
export function createPublicClient() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component.
            // This can be ignored if middleware is refreshing user sessions.
          }
        },
      },
    },
  );
}
