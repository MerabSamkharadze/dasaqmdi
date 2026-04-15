-- Rollback 012 temporarily: restore permissive profiles SELECT policy.
-- 012 broke data access in production. Revisit with more testing.

DROP POLICY IF EXISTS "Profiles readable with privacy" ON public.profiles;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);
