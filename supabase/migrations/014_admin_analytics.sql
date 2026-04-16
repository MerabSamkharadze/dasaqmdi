-- Admin Analytics RPC functions
-- Returns daily counts for trend charts

-- Registration trend (profiles created per day)
CREATE OR REPLACE FUNCTION public.get_registration_trend(p_days INT DEFAULT 30)
RETURNS TABLE(date TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    d::date::text AS date,
    COALESCE(COUNT(p.id), 0) AS count
  FROM generate_series(
    CURRENT_DATE - (p_days - 1),
    CURRENT_DATE,
    '1 day'::interval
  ) AS d
  LEFT JOIN public.profiles p
    ON p.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
$$;

-- Job posting trend (jobs created per day)
CREATE OR REPLACE FUNCTION public.get_job_posting_trend(p_days INT DEFAULT 30)
RETURNS TABLE(date TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    d::date::text AS date,
    COALESCE(COUNT(j.id), 0) AS count
  FROM generate_series(
    CURRENT_DATE - (p_days - 1),
    CURRENT_DATE,
    '1 day'::interval
  ) AS d
  LEFT JOIN public.jobs j
    ON j.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
$$;

-- Application trend (applications created per day)
CREATE OR REPLACE FUNCTION public.get_application_trend(p_days INT DEFAULT 30)
RETURNS TABLE(date TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    d::date::text AS date,
    COALESCE(COUNT(a.id), 0) AS count
  FROM generate_series(
    CURRENT_DATE - (p_days - 1),
    CURRENT_DATE,
    '1 day'::interval
  ) AS d
  LEFT JOIN public.applications a
    ON a.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
$$;

-- Category breakdown (job count per category)
CREATE OR REPLACE FUNCTION public.get_category_breakdown()
RETURNS TABLE(slug TEXT, name_en TEXT, name_ka TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    c.slug,
    c.name_en,
    c.name_ka,
    COUNT(j.id) AS count
  FROM public.categories c
  LEFT JOIN public.jobs j ON j.category_id = c.id
  GROUP BY c.id, c.slug, c.name_en, c.name_ka
  ORDER BY count DESC;
$$;
