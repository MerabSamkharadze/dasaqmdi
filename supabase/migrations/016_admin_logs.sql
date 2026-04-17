-- Admin activity log for audit trail
CREATE TABLE public.admin_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action     TEXT NOT NULL,           -- e.g. "verify_company", "delete_job", "change_role", "approve_job"
  actor_id   UUID NOT NULL,           -- admin user who performed the action
  target_type TEXT NOT NULL,          -- e.g. "company", "job", "user"
  target_id  TEXT NOT NULL,           -- ID of the affected entity
  metadata   JSONB DEFAULT '{}',      -- extra context (old_role, new_role, job_title, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for chronological queries + pagination
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Index for filtering by action type
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);

-- RLS: only service_role can insert, admin can read
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read logs"
  ON public.admin_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- No INSERT policy for authenticated — inserts happen via server actions with the same client
-- that already verified admin role. RLS SELECT policy is sufficient.
-- For extra security, INSERT could be restricted to service_role only,
-- but current admin actions use anon key with verified admin check.
CREATE POLICY "Authenticated admin can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
