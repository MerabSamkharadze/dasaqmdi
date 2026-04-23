-- ============================================================
-- Phase 22: Cities — canonical city list + fuzzy/cross-script resolver
--
-- Purpose: when a user searches by city, accept any reasonable spelling
-- (Latin, Georgian, typos, legacy names like "Tiflis") and map it to a
-- canonical city entity whose variants we then OR-match against the free-
-- form `jobs.city` field.
--
-- Mirrors the category_synonyms design (migration 021) — pg_trgm for
-- script-agnostic fuzzy matching, public-read / admin-write RLS.
-- ============================================================

-- pg_trgm is already enabled by migration 021; safeguard in case this
-- migration is ever run first.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- 1. TABLE
-- =====================

CREATE TABLE public.cities (
  id         BIGSERIAL PRIMARY KEY,
  name_en    TEXT NOT NULL UNIQUE,
  name_ka    TEXT NOT NULL,
  -- Extra spellings that aren't mechanical transliterations of the
  -- canonical names — legacy names (Tiflis → Tbilisi), Soviet variants,
  -- or obvious misspellings common in job postings.
  aliases    TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.cities IS
  'Canonical city list for Georgia. Admins can add/edit via Supabase Dashboard. Aliases array holds true synonyms (legacy names, common misspellings) — mechanical ka↔latin transliteration is handled client-side.';
COMMENT ON COLUMN public.cities.name_en IS 'Canonical English name (e.g. "Tbilisi")';
COMMENT ON COLUMN public.cities.name_ka IS 'Canonical Georgian name (e.g. "თბილისი")';
COMMENT ON COLUMN public.cities.aliases IS 'Alternative spellings: legacy names ("Tiflis"), common typos, Soviet variants. Both scripts allowed.';

-- =====================
-- 2. INDEXES
-- =====================

-- Trigram GIN on canonical names — fuzzy lookup is the hot path
CREATE INDEX idx_cities_name_en_trgm
  ON public.cities USING gin (name_en gin_trgm_ops);

CREATE INDEX idx_cities_name_ka_trgm
  ON public.cities USING gin (name_ka gin_trgm_ops);

-- Aliases live in an array column — pg_trgm can't index text[] directly,
-- so we rely on seq-scan over unnest(aliases) inside the RPC. Acceptable
-- because the cities table has ~30 rows and aliases average <2 per row.

-- =====================
-- 3. RLS
-- =====================

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are publicly readable"
  ON public.cities FOR SELECT USING (true);

CREATE POLICY "Only admins can manage cities"
  ON public.cities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 4. RESOLVER RPC
-- =====================

-- Given a free-form city term, return the single best-matching city with
-- all its known variants. TS caller OR-matches those variants against the
-- `jobs.city` free-form text.
--
-- Returns at most ONE row — city searches are unambiguous in intent
-- ("Tbilisi" shouldn't also broaden to "Rustavi"), unlike categories
-- where polysemy matters.
--
-- Aliases are matched via unnest + similarity; the table is small enough
-- that this seq-scan is negligible.

CREATE OR REPLACE FUNCTION public.resolve_city(
  search_term    TEXT,
  min_similarity REAL DEFAULT 0.3
)
RETURNS TABLE (
  id       BIGINT,
  name_en  TEXT,
  name_ka  TEXT,
  aliases  TEXT[],
  score    REAL
)
LANGUAGE sql
STABLE
AS $$
  WITH matches AS (
    SELECT
      c.id,
      c.name_en,
      c.name_ka,
      c.aliases,
      GREATEST(
        similarity(lower(c.name_en), lower(search_term)),
        similarity(c.name_ka, search_term),
        -- Best similarity across the aliases array (case-insensitive for Latin)
        COALESCE((
          SELECT MAX(
            GREATEST(
              similarity(lower(a), lower(search_term)),
              similarity(a, search_term)
            )
          )
          FROM unnest(c.aliases) AS a
        ), 0)
      ) AS match_score
    FROM public.cities c
    WHERE
      c.name_en % search_term
      OR c.name_ka % search_term
      OR lower(c.name_en) ILIKE '%' || lower(search_term) || '%'
      OR c.name_ka ILIKE '%' || search_term || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(c.aliases) AS a
        WHERE a % search_term
           OR lower(a) ILIKE '%' || lower(search_term) || '%'
      )
  )
  SELECT
    id,
    name_en,
    name_ka,
    aliases,
    match_score::REAL AS score
  FROM matches
  WHERE match_score >= min_similarity
  ORDER BY match_score DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_city(TEXT, REAL) TO anon, authenticated;

COMMENT ON FUNCTION public.resolve_city(TEXT, REAL) IS
  'Resolve a free-form city term to the single best-matching canonical city. Returns name_en, name_ka, aliases, and match score.';
