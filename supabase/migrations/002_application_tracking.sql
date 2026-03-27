-- ============================================
-- 002: Application Tracking + Smart Visibility
-- ============================================

-- ========== APPLICATION TRACKING FIELDS ==========

ALTER TABLE public.applications
  ADD COLUMN is_viewed   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN viewed_at   TIMESTAMPTZ;

CREATE INDEX idx_applications_viewed ON public.applications(is_viewed);

-- ========== DEADLINE INDEX FOR SMART VISIBILITY ==========

CREATE INDEX idx_jobs_deadline ON public.jobs(application_deadline)
  WHERE application_deadline IS NOT NULL;

-- ========== SEEKERS CAN DELETE/ARCHIVE OWN APPLICATIONS ==========

CREATE POLICY "Seekers can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = applicant_id);
