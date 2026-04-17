-- Set system company logo to the site's own logo
UPDATE public.companies
SET logo_url = 'https://www.dasaqmdi.com/logo.svg'
WHERE slug = 'dasaqmdi';
