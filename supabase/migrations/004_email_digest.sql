-- Phase 8 T4: Email digest opt-in field
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_digest BOOLEAN DEFAULT true;
