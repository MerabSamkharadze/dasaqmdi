-- ============================================================
-- Phase 22: Category Synonyms — Initial Seed (source of truth)
--
-- ~290 profession names mapped to 11 categories, bilingual en/ka.
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING).
--
-- Weight scale:
--   2 = high-priority industry-defining term
--   1 = canonical / common term (default)
--   0 = loose alias or generic fallback ("Manager", "Specialist")
--
-- Admins can add/edit/delete rows directly via Supabase Table Editor;
-- this file is the baseline, not a runtime dependency.
-- ============================================================

-- =====================
-- IT & Software (it-software) — 35 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Software Engineer',          'პროგრამული ინჟინერი',              2),
  ('Software Developer',         'პროგრამისტი',                      2),
  ('Frontend Developer',         'ფრონტენდ დეველოპერი',              2),
  ('Backend Developer',          'ბექენდ დეველოპერი',                2),
  ('Fullstack Developer',        'ფულსტექ დეველოპერი',               2),
  ('React Developer',            'რეაქტ დეველოპერი',                 1),
  ('Vue Developer',              'ვიუ დეველოპერი',                   1),
  ('Angular Developer',          'ანგულარ დეველოპერი',               1),
  ('Node.js Developer',          'ნოუდ ჯეი-ეს დეველოპერი',           1),
  ('Python Developer',           'პითონ დეველოპერი',                 1),
  ('Java Developer',             'ჯავა დეველოპერი',                  1),
  ('PHP Developer',              'PHP დეველოპერი',                   1),
  ('.NET Developer',             '.NET დეველოპერი',                  1),
  ('Mobile Developer',           'მობილური აპლიკაციის დეველოპერი',   1),
  ('iOS Developer',              'iOS დეველოპერი',                   1),
  ('Android Developer',          'ანდროიდ დეველოპერი',               1),
  ('DevOps Engineer',            'დევოფს ინჟინერი',                  2),
  ('QA Engineer',                'QA ინჟინერი',                      2),
  ('QA Tester',                  'ტესტერი',                          1),
  ('Data Engineer',              'მონაცემთა ინჟინერი',               2),
  ('Data Scientist',             'მონაცემთა მეცნიერი',               2),
  ('Data Analyst',               'მონაცემთა ანალიტიკოსი',            2),
  ('System Administrator',       'სისტემური ადმინისტრატორი',         1),
  ('Network Administrator',      'ქსელის ადმინისტრატორი',            1),
  ('Database Administrator',     'მონაცემთა ბაზის ადმინისტრატორი',   1),
  ('UX Designer',                'UX დიზაინერი',                     1),
  ('UI Designer',                'UI დიზაინერი',                     1),
  ('Product Manager',            'პროდუქტის მენეჯერი',               1),
  ('Scrum Master',               'სქრამ მასტერი',                    1),
  ('Tech Lead',                  'ტექნიკური ლიდერი',                 1),
  ('CTO',                        'ტექნიკური დირექტორი',              1),
  ('IT Specialist',              'IT სპეციალისტი',                   1),
  ('Machine Learning Engineer',  'მანქანური სწავლების ინჟინერი',     1),
  ('Cybersecurity Specialist',   'კიბერუსაფრთხოების სპეციალისტი',    1),
  ('WordPress Developer',        'WordPress დეველოპერი',             0),
  ('Programmer',                 'პროგრამისტი',                      0),
  ('Coder',                      'კოდერი',                           0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'it-software'
ON CONFLICT DO NOTHING;

-- =====================
-- Sales & Marketing (sales-marketing) — 30 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Sales Manager',                  'გაყიდვების მენეჯერი',              2),
  ('Sales Representative',           'გაყიდვების წარმომადგენელი',        2),
  ('Sales Consultant',               'გაყიდვების კონსულტანტი',           1),
  ('Sales Agent',                    'გაყიდვების აგენტი',                1),
  ('Sales Director',                 'გაყიდვების დირექტორი',             1),
  ('Account Manager',                'ექაუნთ მენეჯერი',                  1),
  ('Key Account Manager',            'მთავარი ექაუნთ მენეჯერი',          1),
  ('Business Development Manager',   'ბიზნესის განვითარების მენეჯერი',   1),
  ('Marketing Manager',              'მარკეტინგის მენეჯერი',             2),
  ('Marketing Specialist',           'მარკეტინგის სპეციალისტი',          2),
  ('Marketing Director',             'მარკეტინგის დირექტორი',            1),
  ('Digital Marketing Manager',      'ციფრული მარკეტინგის მენეჯერი',     1),
  ('SMM Manager',                    'SMM მენეჯერი',                     2),
  ('Social Media Manager',           'სოციალური მედიის მენეჯერი',        1),
  ('Content Manager',                'კონტენტის მენეჯერი',               1),
  ('Content Creator',                'კონტენტის შემქმნელი',              1),
  ('Copywriter',                     'კოპირაიტერი',                      1),
  ('SEO Specialist',                 'SEO სპეციალისტი',                  1),
  ('PPC Specialist',                 'PPC სპეციალისტი',                  1),
  ('Brand Manager',                  'ბრენდ მენეჯერი',                   1),
  ('PR Manager',                     'PR მენეჯერი',                      1),
  ('Public Relations Specialist',    'საზოგადოებასთან ურთიერთობის სპეციალისტი', 1),
  ('Event Manager',                  'ღონისძიებების მენეჯერი',           1),
  ('Telemarketing Operator',         'ტელემარკეტინგის ოპერატორი',        1),
  ('Call Center Operator',           'ქოლ ცენტრის ოპერატორი',            2),
  ('Customer Success Manager',       'მომხმარებლის წარმატების მენეჯერი', 1),
  ('Growth Manager',                 'ზრდის მენეჯერი',                   1),
  ('Email Marketing Specialist',     'იმეილ მარკეტინგის სპეციალისტი',    1),
  ('Graphic Designer',               'გრაფიკული დიზაინერი',              1),
  ('Marketing Analyst',              'მარკეტინგის ანალიტიკოსი',          1)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'sales-marketing'
ON CONFLICT DO NOTHING;

-- =====================
-- Administration (administration) — 28 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Office Manager',            'ოფისის მენეჯერი',                    2),
  ('Administrative Assistant',  'ადმინისტრაციული ასისტენტი',          2),
  ('Executive Assistant',       'აღმასრულებელი ასისტენტი',            1),
  ('Personal Assistant',        'პირადი ასისტენტი',                   1),
  ('Secretary',                 'მდივანი',                            2),
  ('Receptionist',              'რეცეფციონისტი',                      2),
  ('Office Administrator',      'ოფისის ადმინისტრატორი',              1),
  ('HR Manager',                'HR მენეჯერი',                        2),
  ('HR Specialist',             'HR სპეციალისტი',                     2),
  ('Human Resources',           'ადამიანური რესურსების სპეციალისტი',  1),
  ('Recruiter',                 'რეკრუტერი',                          2),
  ('Talent Acquisition',        'ტალანტების მოზიდვის სპეციალისტი',    1),
  ('Office Clerk',              'ოფისის თანამშრომელი',                1),
  ('Data Entry Operator',       'მონაცემების შემყვანი ოპერატორი',     1),
  ('Document Controller',       'დოკუმენტბრუნვის სპეციალისტი',        1),
  ('Translator',                'მთარგმნელი',                         1),
  ('Interpreter',               'თარჯიმანი',                          1),
  ('Legal Assistant',           'იურიდიული ასისტენტი',                1),
  ('Paralegal',                 'პარალეგალი',                         0),
  ('Lawyer',                    'იურისტი',                            2),
  ('Legal Counsel',             'იურიდიული მრჩეველი',                 1),
  ('Compliance Officer',        'კომპლაიანსის ოფიცერი',               1),
  ('Project Coordinator',       'პროექტის კოორდინატორი',              1),
  ('Project Manager',           'პროექტის მენეჯერი',                  2),
  ('Operations Manager',        'ოპერაციების მენეჯერი',               1),
  ('General Manager',           'გენერალური მენეჯერი',                1),
  ('Executive Director',        'აღმასრულებელი დირექტორი',            1),
  ('Assistant',                 'ასისტენტი',                          0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'administration'
ON CONFLICT DO NOTHING;

-- =====================
-- Finance (finance) — 28 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Accountant',             'ბუღალტერი',                        2),
  ('Chief Accountant',       'მთავარი ბუღალტერი',                2),
  ('Senior Accountant',      'უფროსი ბუღალტერი',                 1),
  ('Junior Accountant',      'უმცროსი ბუღალტერი',                1),
  ('Financial Analyst',      'ფინანსური ანალიტიკოსი',            2),
  ('Financial Manager',      'ფინანსური მენეჯერი',               2),
  ('Financial Controller',   'ფინანსური კონტროლერი',             1),
  ('Auditor',                'აუდიტორი',                         2),
  ('Internal Auditor',       'შიდა აუდიტორი',                    1),
  ('Tax Specialist',         'გადასახადების სპეციალისტი',        1),
  ('Tax Consultant',         'საგადასახადო კონსულტანტი',         1),
  ('Bookkeeper',             'ბუღალტერი',                        0),
  ('CFO',                    'ფინანსური დირექტორი',              1),
  ('Treasurer',              'ხაზინადარი',                       1),
  ('Cashier',                'მოლარე',                           2),
  ('Credit Officer',         'საკრედიტო ოფიცერი',                1),
  ('Loan Officer',           'სასესხო ოფიცერი',                  1),
  ('Credit Analyst',         'საკრედიტო ანალიტიკოსი',            1),
  ('Banking Specialist',     'საბანკო სპეციალისტი',              2),
  ('Bank Teller',            'ბანკის ოპერატორი',                 1),
  ('Investment Analyst',     'საინვესტიციო ანალიტიკოსი',         1),
  ('Investment Banker',      'საინვესტიციო ბანკირი',             1),
  ('Risk Analyst',           'რისკების ანალიტიკოსი',             1),
  ('Risk Manager',           'რისკების მენეჯერი',                1),
  ('Budget Analyst',         'ბიუჯეტის ანალიტიკოსი',             1),
  ('Payroll Specialist',     'ხელფასის სპეციალისტი',             1),
  ('Economist',              'ეკონომისტი',                       1),
  ('Insurance Agent',        'სადაზღვევო აგენტი',                1)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'finance'
ON CONFLICT DO NOTHING;

-- =====================
-- Hospitality (hospitality) — 24 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Hotel Manager',             'სასტუმროს მენეჯერი',               2),
  ('Hotel Receptionist',        'სასტუმროს რეცეფციონისტი',          2),
  ('Front Desk Agent',          'ფრონტ-ოფისის თანამშრომელი',        1),
  ('Front Office Manager',      'ფრონტ-ოფისის მენეჯერი',            1),
  ('Concierge',                 'კონსიერჟი',                        1),
  ('Hospitality Manager',       'სტუმართმოყვარეობის მენეჯერი',      1),
  ('Guest Relations Manager',   'სტუმრებთან ურთიერთობის მენეჯერი',  1),
  ('Guest Services',            'სტუმრების მომსახურე',              1),
  ('Housekeeper',               'დიასახლისი',                       2),
  ('Housekeeping Manager',      'დასუფთავების მენეჯერი',            1),
  ('Room Attendant',            'ნომრის მომსახურე',                 1),
  ('Night Auditor',             'ღამის აუდიტორი',                   1),
  ('Reservation Agent',         'ჯავშნების აგენტი',                 1),
  ('Tour Guide',                'გიდი',                             2),
  ('Tour Operator',             'ტურისტული ოპერატორი',              1),
  ('Travel Agent',              'ტურისტული აგენტი',                 1),
  ('Event Coordinator',         'ღონისძიების კოორდინატორი',         1),
  ('Banquet Manager',           'ბანკეტების მენეჯერი',              1),
  ('Resort Manager',            'კურორტის მენეჯერი',                1),
  ('Hostel Manager',            'ჰოსტელის მენეჯერი',                1),
  ('Spa Manager',               'სპა მენეჯერი',                     1),
  ('Valet',                     'პარკირების თანამშრომელი',          0),
  ('Doorman',                   'კარისკაცი',                        0),
  ('Bellhop',                   'ბელბოი',                           0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'hospitality'
ON CONFLICT DO NOTHING;

-- =====================
-- Construction (construction) — 28 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Construction Worker',        'მშენებელი',                         2),
  ('Builder',                    'მშენებელი',                         2),
  ('Construction Laborer',       'სამშენებლო მუშა',                   1),
  ('Civil Engineer',             'სამოქალაქო ინჟინერი',               2),
  ('Construction Manager',       'სამშენებლო მენეჯერი',               2),
  ('Project Engineer',           'პროექტის ინჟინერი',                 1),
  ('Site Manager',               'ობიექტის მენეჯერი',                 1),
  ('Site Supervisor',            'ობიექტის ზედამხედველი',             1),
  ('Foreman',                    'ბრიგადირი',                         1),
  ('Architect',                  'არქიტექტორი',                       2),
  ('Interior Designer',          'ინტერიერის დიზაინერი',              1),
  ('Structural Engineer',        'კონსტრუქტორი ინჟინერი',             1),
  ('Quantity Surveyor',          'ბიუჯეტის ინჟინერი',                 1),
  ('Surveyor',                   'ტოპოგრაფი',                         1),
  ('Electrician',                'ელექტრიკოსი',                       2),
  ('Plumber',                    'სანტექნიკოსი',                      2),
  ('Welder',                     'შემდუღებელი',                       2),
  ('Carpenter',                  'დურგალი',                           1),
  ('Bricklayer',                 'კირითმწყობი',                       1),
  ('Painter',                    'მღებავი',                           1),
  ('Plasterer',                  'ბათქაშის ოსტატი',                   1),
  ('Roofer',                     'სახურავის ოსტატი',                  1),
  ('Tiler',                      'კაფელის მწყობი',                    1),
  ('Concrete Worker',            'ბეტონის ოსტატი',                    1),
  ('Crane Operator',             'ამწის ოპერატორი',                   1),
  ('Heavy Equipment Operator',   'სამშენებლო ტექნიკის ოპერატორი',     1),
  ('HVAC Technician',            'გათბობა-კონდინცირების ტექნიკოსი',   1),
  ('HVAC Engineer',              'გათბობა-კონდინცირების ინჟინერი',    1)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'construction'
ON CONFLICT DO NOTHING;

-- =====================
-- Food & Service (food-service) — 28 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Chef',                       'შეფ-მზარეული',                   2),
  ('Head Chef',                  'მთავარი შეფი',                   1),
  ('Sous Chef',                  'სუ-შეფი',                        1),
  ('Pastry Chef',                'საკონდიტრო შეფი',                1),
  ('Cook',                       'მზარეული',                       2),
  ('Line Cook',                  'ხაზის მზარეული',                 1),
  ('Prep Cook',                  'მოსამზადებელი მზარეული',         1),
  ('Baker',                      'მცხობელი',                       1),
  ('Pastry Baker',               'კონდიტერი',                      1),
  ('Barista',                    'ბარისტა',                        2),
  ('Bartender',                  'ბარმენი',                        2),
  ('Waiter',                     'ოფიციანტი',                      2),
  ('Waitress',                   'ოფიციანტი ქალი',                 1),
  ('Server',                     'სერვიორი',                       0),
  ('Host',                       'მასპინძელი',                     0),
  ('Dishwasher',                 'ჭურჭლის მრეცხავი',               1),
  ('Kitchen Assistant',          'სამზარეულოს ასისტენტი',          1),
  ('Kitchen Helper',             'სამზარეულოს თანაშემწე',          1),
  ('Restaurant Manager',         'რესტორნის მენეჯერი',             2),
  ('Cafe Manager',               'კაფეს მენეჯერი',                 1),
  ('Catering Manager',           'კეიტერინგის მენეჯერი',           1),
  ('Food Delivery Courier',      'საკვების კურიერი',               1),
  ('Delivery Driver',            'მიტანის მძღოლი',                 1),
  ('Butcher',                    'ხორცის სპეციალისტი',             1),
  ('Sushi Chef',                 'სუში შეფი',                      1),
  ('Pizzaiolo',                  'პიცერი',                         1),
  ('Fast Food Worker',           'სწრაფი კვების თანამშრომელი',     1),
  ('Food Service Worker',        'კვების სერვისის თანამშრომელი',   0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'food-service'
ON CONFLICT DO NOTHING;

-- =====================
-- Retail & Sales (retail) — 24 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Sales Associate',            'გამყიდველ-კონსულტანტი',              2),
  ('Salesperson',                'გამყიდველი',                         2),
  ('Sales Clerk',                'გამყიდველი-კლერკი',                  1),
  ('Shop Assistant',             'მაღაზიის ასისტენტი',                 1),
  ('Store Manager',              'მაღაზიის მენეჯერი',                  2),
  ('Assistant Store Manager',    'მაღაზიის თანაშემწე მენეჯერი',        1),
  ('Retail Manager',             'რითეილ მენეჯერი',                    1),
  ('Department Manager',         'განყოფილების მენეჯერი',              1),
  ('Boutique Manager',           'ბუტიკის მენეჯერი',                   1),
  ('Cashier',                    'მოლარე',                             2),
  ('Check-out Operator',         'სალაროს ოპერატორი',                  1),
  ('Retail Clerk',               'მაღაზიის თანამშრომელი',              1),
  ('Shopkeeper',                 'მაღაზიის გამგე',                     1),
  ('Merchandiser',               'მერჩენდაიზერი',                      1),
  ('Visual Merchandiser',        'ვიტრინის დიზაინერი',                 1),
  ('Stock Clerk',                'საწყობის თანამშრომელი',              1),
  ('Inventory Specialist',       'ინვენტარიზაციის სპეციალისტი',        1),
  ('Beauty Consultant',          'სილამაზის პროდუქტების კონსულტანტი',  1),
  ('Product Consultant',         'პროდუქტის კონსულტანტი',              1),
  ('Retail Supervisor',          'რითეილ ზედამხედველი',                1),
  ('Customer Service Rep',       'მომხმარებელთა მომსახურე',            1),
  ('Buyer',                      'შემსყიდველი',                        1),
  ('Procurement Specialist',     'შესყიდვების სპეციალისტი',            1),
  ('Floor Manager',              'მუშა ზედამხედველი',                  0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'retail'
ON CONFLICT DO NOTHING;

-- =====================
-- Beauty & Wellness (beauty-wellness) — 26 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Hairdresser',                'თმის სტილისტი',                     2),
  ('Hair Stylist',               'თმის სტილისტი',                     2),
  ('Hair Colorist',              'თმის კოლორისტი',                    1),
  ('Barber',                     'პარიკმახერი',                       2),
  ('Makeup Artist',              'ვიზაჟისტი',                         2),
  ('SPMU Artist',                'პერმანენტული მაკიაჟის ოსტატი',      1),
  ('Beautician',                 'კოსმეტოლოგი',                       2),
  ('Cosmetologist',              'კოსმეტოლოგი',                       1),
  ('Esthetician',                'ესთეტიკოსი',                        1),
  ('Nail Technician',            'მანიკურის ოსტატი',                  2),
  ('Manicurist',                 'მანიკურის სპეციალისტი',             1),
  ('Pedicurist',                 'პედიკურის ოსტატი',                  1),
  ('Massage Therapist',          'მასაჟისტი',                         2),
  ('Spa Therapist',              'სპა თერაპევტი',                     1),
  ('Eyebrow Specialist',         'წარბების სპეციალისტი',              1),
  ('Eyelash Technician',         'წამწამების ოსტატი',                 1),
  ('Laser Specialist',           'ლაზერის სპეციალისტი',               1),
  ('Waxing Specialist',          'ვოქსირების სპეციალისტი',            1),
  ('Personal Trainer',           'პერსონალური მწვრთნელი',             2),
  ('Fitness Instructor',         'ფიტნეს ინსტრუქტორი',                1),
  ('Yoga Instructor',            'იოგას ინსტრუქტორი',                 1),
  ('Pilates Instructor',         'პილატესის ინსტრუქტორი',             1),
  ('Dietitian',                  'დიეტოლოგი',                         1),
  ('Nutritionist',               'ნუტრიციოლოგი',                      1),
  ('Beauty Salon Manager',       'სილამაზის სალონის მენეჯერი',        1),
  ('Tattoo Artist',              'ტატუს ოსტატი',                      1)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'beauty-wellness'
ON CONFLICT DO NOTHING;

-- =====================
-- Logistics & Transport (logistics) — 28 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Truck Driver',               'სატვირთოს მძღოლი',                  2),
  ('Driver',                     'მძღოლი',                            2),
  ('Delivery Driver',            'მიტანის მძღოლი',                    2),
  ('Courier',                    'კურიერი',                           2),
  ('Taxi Driver',                'ტაქსის მძღოლი',                     1),
  ('Bus Driver',                 'ავტობუსის მძღოლი',                  1),
  ('Dispatcher',                 'დისპეჩერი',                         2),
  ('Logistics Manager',          'ლოგისტიკის მენეჯერი',               2),
  ('Logistics Coordinator',      'ლოგისტიკის კოორდინატორი',           1),
  ('Supply Chain Manager',       'მიწოდების ჯაჭვის მენეჯერი',         1),
  ('Warehouse Manager',          'საწყობის მენეჯერი',                 2),
  ('Warehouse Worker',           'საწყობის მუშა',                     2),
  ('Forklift Operator',          'ფორკლიფტის ოპერატორი',              1),
  ('Loader',                     'დამტვირთავი',                       1),
  ('Freight Forwarder',          'ექსპედიტორი',                       1),
  ('Customs Broker',             'საბაჟო ბროკერი',                    1),
  ('Customs Specialist',         'საბაჟო სპეციალისტი',                1),
  ('Shipping Clerk',             'ტვირთის კლერკი',                    1),
  ('Freight Broker',             'სატვირთო ბროკერი',                  1),
  ('Fleet Manager',              'ავტოპარკის მენეჯერი',               1),
  ('Mechanic',                   'ავტომექანიკოსი',                    2),
  ('Auto Mechanic',              'ავტომექანიკოსი',                    1),
  ('Vehicle Inspector',          'ავტოინსპექტორი',                    1),
  ('Import/Export Specialist',   'იმპორტ-ექსპორტის სპეციალისტი',      1),
  ('Procurement Manager',        'შესყიდვების მენეჯერი',              1),
  ('Transportation Manager',     'ტრანსპორტირების მენეჯერი',          1),
  ('Operations Manager',         'ლოგისტიკის ოპერაციების მენეჯერი',   0),
  ('Yard Worker',                'ტერიტორიის თანამშრომელი',           0)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'logistics'
ON CONFLICT DO NOTHING;

-- =====================
-- Healthcare (healthcare) — 30 terms
-- =====================
INSERT INTO public.category_synonyms (category_id, term_en, term_ka, weight)
SELECT c.id, v.term_en, v.term_ka, v.weight
FROM public.categories c, (VALUES
  ('Doctor',                     'ექიმი',                             2),
  ('Physician',                  'ექიმი-თერაპევტი',                   1),
  ('Nurse',                      'ექთანი',                            2),
  ('Registered Nurse',           'რეგისტრირებული ექთანი',             1),
  ('Paramedic',                  'პარამედიკოსი',                      1),
  ('Surgeon',                    'ქირურგი',                           2),
  ('Dentist',                    'სტომატოლოგი',                       2),
  ('Dental Assistant',           'სტომატოლოგის ასისტენტი',            1),
  ('Pharmacist',                 'ფარმაცევტი',                        2),
  ('Pharmacy Technician',        'ფარმაცევტის ასისტენტი',             1),
  ('Pediatrician',               'პედიატრი',                          1),
  ('Cardiologist',               'კარდიოლოგი',                        1),
  ('Radiologist',                'რადიოლოგი',                         1),
  ('Radiographer',               'რენტგენოლოგი',                      1),
  ('Psychologist',               'ფსიქოლოგი',                         2),
  ('Psychiatrist',               'ფსიქიატრი',                         1),
  ('Therapist',                  'თერაპევტი',                         1),
  ('Physical Therapist',         'ფიზიოთერაპევტი',                    1),
  ('Physiotherapist',            'ფიზიოთერაპევტი',                    1),
  ('Occupational Therapist',     'ოკუპაციური თერაპევტი',              1),
  ('Speech Therapist',           'ლოგოპედი',                          1),
  ('Medical Assistant',          'სამედიცინო ასისტენტი',              1),
  ('Lab Technician',             'ლაბორანტი',                         1),
  ('Midwife',                    'ბებიაქალი',                         1),
  ('Gynecologist',               'გინეკოლოგი',                        1),
  ('Neurologist',                'ნევროლოგი',                         1),
  ('Dermatologist',              'დერმატოლოგი',                       1),
  ('Anesthesiologist',           'ანესთეზიოლოგი',                     1),
  ('Caregiver',                  'მომვლელი',                          1),
  ('Veterinarian',               'ვეტერინარი',                        1)
) AS v(term_en, term_ka, weight)
WHERE c.slug = 'healthcare'
ON CONFLICT DO NOTHING;
