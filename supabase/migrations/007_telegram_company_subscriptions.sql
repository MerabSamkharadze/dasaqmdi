-- Add company subscriptions to telegram bot
ALTER TABLE telegram_subscriptions
  ADD COLUMN IF NOT EXISTS company_ids TEXT[] DEFAULT '{}';

-- GIN index for company matching
CREATE INDEX IF NOT EXISTS idx_telegram_company_ids ON telegram_subscriptions USING GIN (company_ids);
