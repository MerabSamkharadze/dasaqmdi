-- Phase 11: New categories for small businesses
INSERT INTO categories (slug, name_en, name_ka) VALUES
  ('food-service', 'Food & Service', 'კვება და სერვისი'),
  ('retail', 'Retail & Sales', 'ვაჭრობა'),
  ('beauty-wellness', 'Beauty & Wellness', 'სილამაზე და ჯანმრთელობა'),
  ('logistics', 'Logistics & Transport', 'ლოჯისტიკა და ტრანსპორტი'),
  ('healthcare', 'Healthcare', 'ჯანდაცვა')
ON CONFLICT (slug) DO NOTHING;
