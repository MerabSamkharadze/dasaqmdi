import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Insert a row into admin_logs.
 *
 * Auto-captures the actor's display name (full_name / full_name_ka) so the
 * log remains readable even if the actor profile is later deleted or
 * renamed. All other context must be passed explicitly via `metadata` —
 * fields like job title, company name, posted_by etc. are denormalized at
 * log time so they survive deletion of the source rows (the entire point
 * of an audit log).
 */
export async function logAdminAction(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  // Fetch actor's display name — best-effort, don't fail the log on lookup error
  let actorName: string | null = null;
  let actorNameKa: string | null = null;
  try {
    const { data: actor } = await supabase
      .from("profiles")
      .select("full_name, full_name_ka")
      .eq("id", actorId)
      .single();
    actorName = actor?.full_name ?? null;
    actorNameKa = actor?.full_name_ka ?? null;
  } catch {
    // Swallow — audit log integrity > actor name fidelity
  }

  await supabase.from("admin_logs").insert({
    action,
    actor_id: actorId,
    target_type: targetType,
    target_id: targetId,
    metadata: {
      ...(metadata ?? {}),
      actor_name: actorName,
      actor_name_ka: actorNameKa,
    },
  });
}
