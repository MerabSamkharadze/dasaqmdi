-- ============================================================
-- Phase 22: Cities — initial seed (30 major Georgian cities)
--
-- Idempotent: `ON CONFLICT (name_en) DO NOTHING`. Safe to re-run.
-- Aliases are for TRUE synonyms (legacy/Soviet names) — mechanical
-- transliterations are handled by lib/transliteration.ts at query time.
-- ============================================================

INSERT INTO public.cities (name_en, name_ka, aliases) VALUES
  ('Tbilisi',        'თბილისი',         ARRAY['Tiflis', 'ტფილისი']),
  ('Batumi',         'ბათუმი',          ARRAY[]::TEXT[]),
  ('Kutaisi',        'ქუთაისი',         ARRAY['Qutaisi']),
  ('Rustavi',        'რუსთავი',         ARRAY[]::TEXT[]),
  ('Gori',           'გორი',            ARRAY[]::TEXT[]),
  ('Zugdidi',        'ზუგდიდი',         ARRAY[]::TEXT[]),
  ('Poti',           'ფოთი',            ARRAY[]::TEXT[]),
  ('Kobuleti',       'ქობულეთი',        ARRAY[]::TEXT[]),
  ('Telavi',         'თელავი',          ARRAY[]::TEXT[]),
  ('Mtskheta',       'მცხეთა',          ARRAY[]::TEXT[]),
  ('Akhaltsikhe',    'ახალციხე',        ARRAY[]::TEXT[]),
  ('Borjomi',        'ბორჯომი',         ARRAY[]::TEXT[]),
  ('Bakuriani',      'ბაკურიანი',       ARRAY[]::TEXT[]),
  ('Gudauri',        'გუდაური',         ARRAY[]::TEXT[]),
  ('Sighnaghi',      'სიღნაღი',         ARRAY['Signagi']),
  ('Kvareli',        'ყვარელი',         ARRAY[]::TEXT[]),
  ('Kazbegi',        'ყაზბეგი',         ARRAY['Stepantsminda', 'სტეფანწმინდა']),
  ('Marneuli',       'მარნეული',        ARRAY[]::TEXT[]),
  ('Gardabani',      'გარდაბანი',       ARRAY[]::TEXT[]),
  ('Khashuri',       'ხაშური',          ARRAY[]::TEXT[]),
  ('Samtredia',      'სამტრედია',       ARRAY[]::TEXT[]),
  ('Senaki',         'სენაკი',          ARRAY[]::TEXT[]),
  ('Akhalkalaki',    'ახალქალაქი',      ARRAY[]::TEXT[]),
  ('Ozurgeti',       'ოზურგეთი',        ARRAY[]::TEXT[]),
  ('Chiatura',       'ჭიათურა',         ARRAY[]::TEXT[]),
  ('Tkibuli',        'ტყიბული',         ARRAY[]::TEXT[]),
  ('Ambrolauri',     'ამბროლაური',      ARRAY[]::TEXT[]),
  ('Lagodekhi',      'ლაგოდეხი',        ARRAY[]::TEXT[]),
  ('Mestia',         'მესტია',          ARRAY[]::TEXT[]),
  ('Zestaponi',      'ზესტაფონი',       ARRAY[]::TEXT[])
ON CONFLICT (name_en) DO NOTHING;
