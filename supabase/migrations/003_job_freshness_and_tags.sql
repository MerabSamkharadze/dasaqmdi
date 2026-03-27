-- ============================================
-- 003: 30-Day Freshness Rule + Structured Tags
-- ============================================

-- ========== JOB EXPIRY ==========

-- expires_at: auto-set to created_at + 30 days. Employer can renew.
ALTER TABLE public.jobs
  ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days');

-- Backfill existing rows (if any)
UPDATE public.jobs SET expires_at = created_at + INTERVAL '30 days' WHERE expires_at IS NULL;

-- Auto-set expires_at on INSERT if not provided
CREATE OR REPLACE FUNCTION public.set_job_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_set_expires_at
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_job_expires_at();

-- Index for expiry queries
CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);

-- ========== STRUCTURED TAGS (for future Smart Matching) ==========

-- Tags on jobs: structured skills/keywords for matching
ALTER TABLE public.jobs
  ADD COLUMN tags TEXT[] DEFAULT '{}';

-- GIN index for array containment queries (e.g., tags @> ARRAY['react'])
CREATE INDEX idx_jobs_tags ON public.jobs USING gin(tags);

-- Note: profiles.skills already exists as TEXT[] from 001_initial_schema.sql.
-- Future matching engine will compare jobs.tags against profiles.skills.
