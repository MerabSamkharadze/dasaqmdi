import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAdminAction(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  await supabase.from("admin_logs").insert({
    action,
    actor_id: actorId,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata ?? {},
  });
}
