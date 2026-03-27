-- ============================================
-- dasakmdi.com — Initial Database Schema
-- ============================================

-- ========== ENUMS ==========

CREATE TYPE public.job_type AS ENUM (
  'full-time', 'part-time', 'contract', 'internship', 'remote'
);

CREATE TYPE public.job_status AS ENUM (
  'draft', 'active', 'closed', 'archived'
);

CREATE TYPE public.application_status AS ENUM (
  'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'
);

-- ========== UTILITY FUNCTIONS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== PROFILES ==========

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

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- ========== CATEGORIES ==========

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

-- ========== COMPANIES ==========

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

-- ========== JOBS ==========

CREATE TABLE public.jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id           INTEGER NOT NULL REFERENCES public.categories(id),
  title                 TEXT NOT NULL,
  title_ka              TEXT,
  description           TEXT NOT NULL,
  description_ka        TEXT,
  requirements          TEXT,
  requirements_ka       TEXT,
  job_type              public.job_type NOT NULL,
  city                  TEXT,
  is_remote             BOOLEAN NOT NULL DEFAULT false,
  salary_min            INTEGER,
  salary_max            INTEGER,
  salary_currency       TEXT DEFAULT 'GEL'
                        CHECK (salary_currency IN ('GEL', 'USD', 'EUR')),
  status                public.job_status NOT NULL DEFAULT 'active',
  application_deadline  TIMESTAMPTZ,
  views_count           INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_company ON public.jobs(company_id);
CREATE INDEX idx_jobs_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_city ON public.jobs(city);
CREATE INDEX idx_jobs_created ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_search ON public.jobs USING gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

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

-- ========== APPLICATIONS ==========

CREATE TABLE public.applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter    TEXT,
  resume_url      TEXT NOT NULL,
  status          public.application_status NOT NULL DEFAULT 'pending',
  employer_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_applicant ON public.applications(applicant_id);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

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

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== STORAGE BUCKETS ==========
-- Run these separately in Supabase Dashboard > Storage, or via:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
