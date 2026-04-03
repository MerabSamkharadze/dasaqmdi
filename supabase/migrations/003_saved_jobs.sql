-- Saved/Bookmarked Jobs feature
CREATE TABLE public.saved_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- UNIQUE(user_id, job_id) already covers user_id lookups
-- This index covers reverse lookups (all saves for a specific job)
CREATE INDEX idx_saved_jobs_job ON public.saved_jobs(job_id);

-- RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can see only their own saved jobs
CREATE POLICY "Users can view own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save jobs
CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave their own
CREATE POLICY "Users can unsave own jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);
