-- Phase 7 T2: Company culture fields
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS why_work_here TEXT,
  ADD COLUMN IF NOT EXISTS why_work_here_ka TEXT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits_ka TEXT[] DEFAULT '{}';
