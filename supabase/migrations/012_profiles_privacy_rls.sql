-- Security: enforce profile privacy at RLS level.
-- Previous policy "USING (true)" allowed anyone (including anonymous) to read
-- any profile regardless of the is_public flag.
--
-- New policy allows reading a profile only when:
--   1. The caller owns it (auth.uid() = id)
--   2. The profile is marked public (is_public = true)
--   3. The caller is an admin
--   4. The caller is an employer viewing an applicant to their own job

-- Helper: check admin without recursing into the profiles policy.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

CREATE POLICY "Profiles readable with privacy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR is_public = true
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.companies c ON c.id = j.company_id
      WHERE a.applicant_id = profiles.id
        AND c.owner_id = auth.uid()
    )
  );
