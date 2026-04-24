-- Paid-extra featured slots (Phase 21 follow-up)
-- ------------------------------------------------------------------
-- Subscription plans include N featured slots (Starter 0, Business 1,
-- Pro 3) as a persistent benefit: `is_featured = true` with
-- `featured_until = NULL`. When the employer hits that limit, they can
-- buy a one-time 30-day extra slot for 5 GEL. Those paid-extras are also
-- `is_featured = true`, but carry a `featured_until` timestamp and are
-- NOT counted against the plan limit.
--
-- Distinguishing subscription vs paid-extra on `featured_until`:
--   featured_until IS NULL     → subscription slot (persistent)
--   featured_until > now()     → paid-extra slot (active)
--   featured_until <= now()    → paid-extra expired (read-filtered out)

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Fast lookup for paid-extra expiry checks in the feed sort.
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until
  ON public.jobs (featured_until DESC)
  WHERE featured_until IS NOT NULL;
