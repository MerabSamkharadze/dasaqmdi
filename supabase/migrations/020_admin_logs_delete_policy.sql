-- =====================================================================
-- Migration 020: DELETE policy for admin_logs
-- =====================================================================
-- Root cause: migration 016 enabled RLS on admin_logs but only defined
-- SELECT + INSERT policies. Missing DELETE policy caused bulk/age-based
-- log cleanup actions (Phase 22) to silently affect 0 rows — RLS blocks
-- without raising an error.
--
-- Fix: allow admins to delete log entries via the same role-check
-- pattern used for read/insert.
-- =====================================================================

DROP POLICY IF EXISTS "Admin can delete logs" ON public.admin_logs;

CREATE POLICY "Admin can delete logs"
  ON public.admin_logs FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
