import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS, used for webhooks and admin operations.
// Intentionally untyped: RLS-only policies on subscriptions make the typed
// client infer `never` for insert/update operations.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
