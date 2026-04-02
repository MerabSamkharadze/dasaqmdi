-- Atomic increment for job views to avoid race conditions
CREATE OR REPLACE FUNCTION increment_job_views(job_id_input UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE jobs
  SET views_count = views_count + 1
  WHERE id = job_id_input;
$$;
