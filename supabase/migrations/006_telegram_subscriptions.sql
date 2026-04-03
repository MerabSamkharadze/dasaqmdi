-- Phase 11: Telegram Bot subscriptions
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  chat_id BIGINT NOT NULL,
  username TEXT,
  first_name TEXT,
  categories TEXT[] DEFAULT '{}',
  locale VARCHAR(2) DEFAULT 'ka',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for active subscribers lookup
CREATE INDEX idx_telegram_active ON telegram_subscriptions (is_active) WHERE is_active = true;

-- GIN index for category matching
CREATE INDEX idx_telegram_categories ON telegram_subscriptions USING GIN (categories);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER telegram_subscriptions_updated_at
  BEFORE UPDATE ON telegram_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
