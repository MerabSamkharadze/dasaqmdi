-- Admin-granted verification tracking
-- ------------------------------------------------------------------
-- Prior to this migration, `companies.is_verified` was overwritten by
-- the Lemon Squeezy webhook on every subscription event:
--   - subscription_created/updated: is_verified = (plan='verified' AND active)
--   - subscription_expired: is_verified = false
-- This clobbered admin-granted verifications whenever the company bought
-- a Business plan (plan='pro') or let their Pro plan lapse.
--
-- We now track admin grants separately: `admin_verified`. The webhook
-- must compute `is_verified = admin_verified OR subscription_backed`,
-- so admin grants survive subscription lifecycle events.
--
-- Backfill: any company currently is_verified=true whose verification is
-- NOT backed by an active Pro subscription must have been granted by
-- admin. Mark admin_verified=true for those rows to preserve history.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve historical admin grants by detecting which verifications are
-- NOT currently backed by an active Pro subscription.
UPDATE public.companies AS c
SET admin_verified = TRUE
WHERE c.is_verified = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM public.subscriptions AS s
    WHERE s.company_id = c.id
      AND s.plan = 'verified'
      AND s.status = 'active'
  );
