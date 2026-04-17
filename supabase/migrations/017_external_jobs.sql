-- External job aggregation: admin can add jobs from external sources (jobs.ge, hr.ge)
-- These jobs link to the original source instead of internal apply form.

-- Add external fields to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_source TEXT;

-- System company for external jobs (admin-owned)
-- Insert only if not exists (idempotent)
INSERT INTO public.companies (id, owner_id, name, name_ka, slug, description, description_ka, is_verified)
SELECT
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'dasaqmdi.com',
  'დასაქმდი',
  'dasaqmdi',
  'Job aggregator — external listings from partner sites',
  'ვაკანსიების აგრეგატორი — გარე წყაროებიდან შეგროვებული ვაკანსიები',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies WHERE slug = 'dasaqmdi'
);
