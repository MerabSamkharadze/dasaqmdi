-- Subscription plans & statuses
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'verified');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'expired');

-- Subscriptions table (one per company)
CREATE TABLE public.subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                  UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  plan                        public.subscription_plan NOT NULL DEFAULT 'free',
  status                      public.subscription_status NOT NULL DEFAULT 'active',
  lemon_squeezy_id            TEXT UNIQUE,
  lemon_squeezy_customer_id   TEXT,
  variant_id                  TEXT,
  current_period_start        TIMESTAMPTZ,
  current_period_end          TIMESTAMPTZ,
  cancel_at                   TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at (reuses existing function from 001)
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Company owner can read their own subscription
CREATE POLICY "Owner can view subscription"
  ON public.subscriptions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- Admin can view all subscriptions
CREATE POLICY "Admin can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT/UPDATE only via service_role (webhook handler bypasses RLS)
-- No INSERT/UPDATE policies needed for anon/authenticated roles

-- Featured jobs column
ALTER TABLE public.jobs ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_jobs_featured ON public.jobs(is_featured) WHERE is_featured = true;
