-- ============================================================
-- dasakmdi.com — Consolidated Database Schema (v1)
-- Run this ONCE in the Supabase SQL Editor for a fresh project.
-- ============================================================

-- =====================
-- 1. ENUMS
-- =====================

CREATE TYPE public.job_type AS ENUM (
  'full-time', 'part-time', 'contract', 'internship', 'remote'
);

CREATE TYPE public.job_status AS ENUM (
  'draft', 'active', 'closed', 'archived'
);

CREATE TYPE public.application_status AS ENUM (
  'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'
);

-- =====================
-- 2. UTILITY FUNCTIONS
-- =====================

-- Auto-update `updated_at` on every UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- 3. PROFILES
-- =====================

CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                TEXT NOT NULL DEFAULT 'seeker'
                        CHECK (role IN ('seeker', 'employer', 'admin')),
  full_name           TEXT,
  full_name_ka        TEXT,
  avatar_url          TEXT,
  phone               TEXT,
  city                TEXT,
  bio                 TEXT,
  bio_ka              TEXT,
  skills              TEXT[] DEFAULT '{}',
  experience_years    INTEGER,
  resume_url          TEXT,
  preferred_language  TEXT DEFAULT 'ka'
                        CHECK (preferred_language IN ('ka', 'en')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'seeker');
  -- Only allow valid roles; fallback to 'seeker' for anything else
  IF _role NOT IN ('seeker', 'employer') THEN
    _role := 'seeker';
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GIN index for skills array (future Smart Matching)
CREATE INDEX idx_profiles_skills ON public.profiles USING gin(skills);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 4. CATEGORIES
-- =====================

CREATE TABLE public.categories (
  id      SERIAL PRIMARY KEY,
  slug    TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ka TEXT NOT NULL
);

INSERT INTO public.categories (slug, name_en, name_ka) VALUES
  ('it-software',      'IT & Software',      'IT და პროგრამირება'),
  ('sales-marketing',  'Sales & Marketing',  'გაყიდვები და მარკეტინგი'),
  ('administration',   'Administration',     'ადმინისტრაცია'),
  ('finance',          'Finance',            'ფინანსები'),
  ('hospitality',      'Hospitality',        'სტუმართმოყვარეობა'),
  ('construction',     'Construction',       'მშენებლობა');

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 5. COMPANIES
-- =====================

CREATE TABLE public.companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ka         TEXT,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  description_ka  TEXT,
  logo_url        TEXT,
  website         TEXT,
  city            TEXT,
  address         TEXT,
  address_ka      TEXT,
  employee_count  TEXT CHECK (employee_count IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_companies_owner ON public.companies(owner_id);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are publicly readable"
  ON public.companies FOR SELECT USING (true);

CREATE POLICY "Employers can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
  );

CREATE POLICY "Employers can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Employers can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage any company"
  ON public.companies FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 6. JOBS
-- =====================

CREATE TABLE public.jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id           INTEGER NOT NULL REFERENCES public.categories(id),

  -- Bilingual content
  title                 TEXT NOT NULL,
  title_ka              TEXT,
  description           TEXT NOT NULL,
  description_ka        TEXT,
  requirements          TEXT,
  requirements_ka       TEXT,

  -- Structured
  job_type              public.job_type NOT NULL,
  city                  TEXT,
  is_remote             BOOLEAN NOT NULL DEFAULT false,
  salary_min            INTEGER CHECK (salary_min >= 0),
  salary_max            INTEGER CHECK (salary_max >= 0),
  salary_currency       TEXT DEFAULT 'GEL'
                          CHECK (salary_currency IN ('GEL', 'USD', 'EUR')),
  tags                  TEXT[] DEFAULT '{}',

  -- Lifecycle
  status                public.job_status NOT NULL DEFAULT 'active',
  application_deadline  TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  views_count           INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Table-level constraints
  CONSTRAINT salary_range_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- Auto-set expires_at to created_at + 30 days if not provided
CREATE OR REPLACE FUNCTION public.set_job_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_set_expires_at
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_job_expires_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_jobs_status      ON public.jobs(status);
CREATE INDEX idx_jobs_category    ON public.jobs(category_id);
CREATE INDEX idx_jobs_company     ON public.jobs(company_id);
CREATE INDEX idx_jobs_type        ON public.jobs(job_type);
CREATE INDEX idx_jobs_city        ON public.jobs(city);
CREATE INDEX idx_jobs_created     ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_expires_at  ON public.jobs(expires_at);
CREATE INDEX idx_jobs_deadline    ON public.jobs(application_deadline) WHERE application_deadline IS NOT NULL;
CREATE INDEX idx_jobs_tags        ON public.jobs USING gin(tags);
CREATE INDEX idx_jobs_search      ON public.jobs USING gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active jobs are publicly readable"
  ON public.jobs FOR SELECT
  USING (status = 'active' OR posted_by = auth.uid());

CREATE POLICY "Employers can insert jobs for own company"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() = posted_by
    AND EXISTS (
      SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Employers can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = posted_by);

CREATE POLICY "Admins can manage any job"
  ON public.jobs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 7. APPLICATIONS
-- =====================

CREATE TABLE public.applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter    TEXT,
  resume_url      TEXT NOT NULL,
  status          public.application_status NOT NULL DEFAULT 'pending',
  employer_notes  TEXT,

  -- Tracking: "Seen" feature
  is_viewed       BOOLEAN NOT NULL DEFAULT false,
  viewed_at       TIMESTAMPTZ,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(job_id, applicant_id)
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_applications_job       ON public.applications(job_id);
CREATE INDEX idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX idx_applications_viewed    ON public.applications(is_viewed);

-- RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can view applications for own jobs"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = job_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    auth.uid() = applicant_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seeker')
  );

CREATE POLICY "Employers can update applications for own jobs"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = job_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = applicant_id);

CREATE POLICY "Admins can manage all applications"
  ON public.applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 8. STORAGE BUCKETS
-- =====================
-- Run these in Supabase Dashboard > Storage, or uncomment below:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
