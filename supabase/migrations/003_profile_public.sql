-- Phase 9 T5: Public profile privacy toggle
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
