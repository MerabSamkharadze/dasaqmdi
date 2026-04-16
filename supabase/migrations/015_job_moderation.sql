-- Add "pending" and "rejected" to job_status enum for moderation
-- Default behavior unchanged: MODERATION_ENABLED env var controls whether
-- new jobs start as "pending" (true) or "active" (false/unset)

ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'rejected' AFTER 'closed';
