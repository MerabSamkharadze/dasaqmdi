-- Seeker preferred categories for auto-filtered job feed
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT '{}';

-- GIN index for category matching
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_categories ON profiles USING GIN (preferred_categories);
