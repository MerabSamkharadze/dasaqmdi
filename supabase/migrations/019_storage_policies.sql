-- =====================================================================
-- Migration 019: Storage RLS Policies for avatars, company-logos, resumes
-- =====================================================================
-- Root cause: storage.objects has RLS enabled by default in Supabase,
-- but buckets were created via Dashboard without accompanying policies,
-- so ALL authenticated writes (avatar upload, logo upload, resume upload)
-- were blocked with "row-level security policy" errors.
--
-- Policy model:
--   - Path convention (see lib/storage.ts getFilePath):
--       {userId}/{prefix}.{ext}   e.g. "abc-uuid/avatar.png"
--   - Ownership check: (storage.foldername(name))[1] = auth.uid()::text
--   - avatars & company-logos: public SELECT (profiles/company pages show them)
--   - resumes: owner-only SELECT (employers access via server-generated
--             signed URLs using service_role, which bypasses RLS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Ensure buckets exist (idempotent — safe to re-run)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ---------------------------------------------------------------------
-- AVATARS (public read, owner write)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- COMPANY LOGOS (public read, owner write)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "company_logos_public_select" ON storage.objects;
CREATE POLICY "company_logos_public_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "company_logos_owner_insert" ON storage.objects;
CREATE POLICY "company_logos_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "company_logos_owner_update" ON storage.objects;
CREATE POLICY "company_logos_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "company_logos_owner_delete" ON storage.objects;
CREATE POLICY "company_logos_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- RESUMES (owner-only — employers access via server-side signed URLs)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "resumes_owner_select" ON storage.objects;
CREATE POLICY "resumes_owner_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "resumes_owner_insert" ON storage.objects;
CREATE POLICY "resumes_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "resumes_owner_update" ON storage.objects;
CREATE POLICY "resumes_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "resumes_owner_delete" ON storage.objects;
CREATE POLICY "resumes_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
