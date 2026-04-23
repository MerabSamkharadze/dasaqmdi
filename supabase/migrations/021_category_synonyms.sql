-- ============================================================
-- Phase 22: Category Synonyms — smart search term → category fallback
--
-- Purpose: when a user searches for a profession (e.g. "React Developer",
-- "ბუღალტერი") and no exact job-title match is found, we look the term up
-- in this table and filter the feed by the resolved category instead.
--
-- Matching is powered by pg_trgm (trigram similarity) so Georgian + English
-- both get typo/partial-word tolerance with a single index strategy.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- 1. TABLE
-- =====================

CREATE TABLE public.category_synonyms (
  id          BIGSERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  term_en     TEXT NOT NULL,
  term_ka     TEXT NOT NULL,
  weight      SMALLINT NOT NULL DEFAULT 1
                CHECK (weight BETWEEN 0 AND 2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT category_synonyms_term_unique UNIQUE (category_id, term_en, term_ka)
);

-- Admin-friendly descriptions (shown in Supabase Table Editor sidebar)
COMMENT ON TABLE  public.category_synonyms IS
  'Profession name → category mapping for smart search. Admins can add/edit rows via Supabase Dashboard; no code change required.';
COMMENT ON COLUMN public.category_synonyms.category_id IS 'FK → categories.id (cascades on delete)';
COMMENT ON COLUMN public.category_synonyms.term_en     IS 'English profession name (e.g. "React Developer")';
COMMENT ON COLUMN public.category_synonyms.term_ka     IS 'Georgian profession name (e.g. "რეაქტ დეველოპერი")';
COMMENT ON COLUMN public.category_synonyms.weight      IS '0 = loose/generic alias (e.g. "Manager"), 1 = canonical term, 2 = high-priority industry term. Affects match ranking.';

-- =====================
-- 2. INDEXES
-- =====================

-- Trigram GIN indexes — power the `%` operator and similarity() for
-- fast fuzzy lookup. Georgian works the same as Latin because trigrams
-- operate on raw string data, not on language-specific stemming.
CREATE INDEX idx_category_synonyms_term_en_trgm
  ON public.category_synonyms USING gin (term_en gin_trgm_ops);

CREATE INDEX idx_category_synonyms_term_ka_trgm
  ON public.category_synonyms USING gin (term_ka gin_trgm_ops);

-- Plain btree for admin filtering by category in Supabase Dashboard
CREATE INDEX idx_category_synonyms_category
  ON public.category_synonyms (category_id);

-- =====================
-- 3. RLS
-- =====================

ALTER TABLE public.category_synonyms ENABLE ROW LEVEL SECURITY;

-- Public read: feed is public and the resolver RPC runs under anon
CREATE POLICY "Synonyms are publicly readable"
  ON public.category_synonyms FOR SELECT USING (true);

-- Admin-only write
CREATE POLICY "Only admins can manage synonyms"
  ON public.category_synonyms FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 4. RESOLVER RPC
-- =====================

-- Takes a free-form search term and returns up to `max_results` categories
-- ranked by weighted trigram similarity. Used by:
--   (a) getJobs() fallback — when exact-title search returns < N hits
--   (b) JobFilters autocomplete — "Looking for jobs in [Category]?" hint
--
-- Typo tolerance: the `%` operator uses pg_trgm's default similarity
-- threshold (0.3) via GIN index — fast. We then rank with similarity()
-- and multiply by weight bonus so canonical terms outrank loose aliases.
--
-- Polysemy: returns top 3 by default so terms like "Manager" can surface
-- multiple categories (sales, admin, retail) and the UI can show them all.

CREATE OR REPLACE FUNCTION public.resolve_categories_from_term(
  search_term    TEXT,
  min_similarity REAL DEFAULT 0.3,
  max_results    INT  DEFAULT 3
)
RETURNS TABLE (
  category_id INTEGER,
  slug        TEXT,
  name_en     TEXT,
  name_ka     TEXT,
  score       REAL
)
LANGUAGE sql
STABLE
AS $$
  WITH matches AS (
    SELECT
      s.category_id,
      GREATEST(
        similarity(lower(s.term_en), lower(search_term)),
        similarity(s.term_ka, search_term)
      ) * (1 + s.weight * 0.2) AS match_score
    FROM public.category_synonyms s
    WHERE
      s.term_en % search_term
      OR s.term_ka % search_term
      OR lower(s.term_en) ILIKE '%' || lower(search_term) || '%'
      OR s.term_ka ILIKE '%' || search_term || '%'
  )
  SELECT
    c.id,
    c.slug,
    c.name_en,
    c.name_ka,
    MAX(m.match_score)::REAL AS score
  FROM matches m
  JOIN public.categories c ON c.id = m.category_id
  GROUP BY c.id, c.slug, c.name_en, c.name_ka
  HAVING MAX(m.match_score) >= min_similarity
  ORDER BY score DESC
  LIMIT max_results;
$$;

-- Public feed + autocomplete must be able to call this
GRANT EXECUTE ON FUNCTION public.resolve_categories_from_term(TEXT, REAL, INT)
  TO anon, authenticated;

COMMENT ON FUNCTION public.resolve_categories_from_term(TEXT, REAL, INT) IS
  'Resolve a free-form search term to up to `max_results` categories via trigram similarity. Returns category metadata + score, ranked by weighted match quality.';
