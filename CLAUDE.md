# dasakmdi.com — Project Source of Truth

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js 14 (App Router) | 14.2.15 |
| Language | TypeScript (strict) | ^5 |
| Runtime | React | 18.3.1 |
| Database | Supabase (PostgreSQL) | ^2.47.12 |
| Auth | Supabase Auth + @supabase/ssr | ^0.5.2 |
| Styling | Tailwind CSS + tailwindcss-animate | ^3.4.1 |
| Components | shadcn/ui (Radix primitives) | new-york style |
| Icons | Lucide React | ^0.511.0 |
| Validation | Zod | ^3.23.8 |
| i18n | next-intl | ^3.25.3 |
| Theme | next-themes | ^0.4.6 |
| Fonts | Geist Sans (Latin) + Noto Sans Georgian | `geist` + Google Fonts |
| AI | Vercel AI SDK v6 (`ai` + `@ai-sdk/anthropic`) | Claude Sonnet |

### Next.js 14 Conventions (CRITICAL)

- `cookies()` from `next/headers` is **synchronous** — do NOT `await`
- `createClient()` in `lib/supabase/server.ts` is **synchronous** — do NOT `await`
- `params` and `searchParams` are **plain objects** — no `Promise<>`, no `await`
- Config: `next.config.mjs` (NOT `.ts`), ESLint: `.eslintrc.json` (NOT flat config)
- `useFormState` imported from `react-dom` (React 18)
- Zod: `.partial()` only on `ZodObject`, NOT on `ZodEffects`

---

## Design System — "Quiet Design"

- **Palette**: Slate base + Indigo accent (`--primary`). CSS variables in HSL (`globals.css`)
- **Cards**: `rounded-xl border border-border/60 bg-card p-5 shadow-soft` + `hover:shadow-soft-md`
- **Typography**: `text-[15px] font-semibold` titles, `text-sm text-muted-foreground` metadata
- **Spacing**: `p-5`, `py-8`, `gap-3` — generous whitespace
- **Animation**: `animate-fade-in` with `animationDelay: i * 50ms`
- **Header**: `sticky backdrop-blur-lg bg-background/80`
- **Empty states**: `border-dashed rounded-xl py-20`
- **Dark/Light**: `next-themes` with `attribute="class"`, test both modes
- **No hardcoded colors** — all via CSS variables. Status badges (accepted=green, rejected=red) are semantic exceptions

### Visual Hierarchy

1. **Primary**: title — `font-semibold text-foreground`
2. **Secondary**: company, salary — `text-sm text-foreground`
3. **Tertiary**: location, dates — `text-sm text-muted-foreground`, icons `opacity-60`
4. **Ambient**: borders `border-border/60`, backgrounds `bg-muted/50`

---

## i18n

- Default: `ka` (no prefix), Secondary: `en` (`/en/...`)
- `localePrefix: "as-needed"`
- Server: `await getTranslations("namespace")`, Client: `useTranslations("namespace")`
- Namespaces: `common`, `nav`, `home`, `jobs`, `categories`, `auth`, `profile`, `company`, `applications`, `dashboard`, `admin`, `errors`
- Bilingual fields: `field` + `field_ka`. Use `localized(obj, "title", locale)` helper

---

## Project Structure

```
app/[locale]/
├── page.tsx                    # Homepage — job feed
├── (auth)/auth/                # Login, signup, password reset, confirm
├── (public)/
│   ├── jobs/page.tsx           # Job listing with search/filters
│   ├── jobs/[id]/page.tsx      # Job detail + apply
│   └── companies/              # Company directory + profiles
└── (dashboard)/
    ├── layout.tsx              # Auth guard + sidebar + header
    ├── dashboard/page.tsx      # Role-aware dashboard (seeker/employer/admin)
    ├── profile/page.tsx        # Seeker profile only
    ├── seeker/applications/    # My applications + saved jobs
    ├── employer/
    │   ├── company/            # Company CRUD
    │   ├── jobs/               # Job CRUD + per-job applicants
    │   └── applications/       # All applicants across jobs
    └── admin/                  # Users, jobs, companies management

lib/
├── supabase/                   # server.ts (sync), client.ts, middleware.ts
├── storage.ts                  # Upload/delete with bucket whitelist, path sanitization
├── matching.ts                 # Smart matching: skills[] ↔ tags[] intersection
├── actions/                    # "use server" mutations (auth, jobs, applications, profile, company, admin)
├── queries/                    # Pure reads (jobs, applications, profile, companies, categories, dashboard, admin)
├── types/                      # database.ts, enums.ts, index.ts (Row/Insert/Update/Joined types)
└── validations/                # Zod schemas (auth, job, profile, company, application)

components/
├── ui/                         # shadcn/ui primitives
├── layout/                     # Header, Footer, LanguageSwitcher
├── brand/                      # Logo, Icons (custom SVG)
├── dashboard/                  # Sidebar, Header, nav-items, role dashboards, forms
├── jobs/                       # JobCard, JobList, JobFilters, Pagination
├── applications/               # StatusBadge, DeleteButton, ApplyForm
└── shared/                     # SubmitButton, FileUpload
```

---

## Database Schema

### Tables

| Table | Key Fields |
|---|---|
| `profiles` | id (FK auth.users), role, full_name/full_name_ka, skills[], resume_url |
| `categories` | slug, name_en, name_ka (6 seeded rows) |
| `companies` | owner_id, name, slug, is_verified, logo_url |
| `jobs` | company_id, category_id, title, job_type, status, salary_min/max, expires_at, tags[] |
| `applications` | job_id, applicant_id, resume_url, status, is_viewed, viewed_at |
| `saved_jobs` | user_id, job_id (unique constraint) |

### Roles: `seeker` (apply, track), `employer` (post, review), `admin` (moderate all)

### Key Behaviors
- `on_auth_user_created` trigger → auto-creates profile with role
- `jobs_set_expires_at` trigger → `expires_at = created_at + 30 days`
- RLS enforces ownership at DB level; app layer adds defense-in-depth checks

---

## Key Types

```ts
ActionResult<T = null> = { error: string | null; data?: T }

JobWithCompany = Job & { company: Pick<Company, ...>, category: Pick<Category, ...> }
ApplicationWithJob = Application & { job: { ..., company: { ... } } }
ApplicationWithApplicant = Application & { applicant: Pick<Profile, ...> }
```

Supabase join queries use `.returns<T>()` for type safety (not `as unknown as`).

---

## Business Rules

1. **Smart Visibility**: Feed excludes expired (`expires_at < now`) and past-deadline jobs
2. **30-Day Freshness**: Auto `expires_at`, employer can "Renew" (+30 days), closed jobs cannot renew
3. **Seen Tracking**: `is_viewed` + `viewed_at` set when employer views application
4. **Smart Matching**: `calculateMatch(skills[], tags[])` → percentage score, sorted on employer's applicant page
5. **AI Draft**: Claude Sonnet generates job descriptions, supports `"en"`, `"ka"`, `"both"` languages
6. **Storage**: Deterministic paths (`{userId}/avatar.ext`), `upsert: true` overwrites, old files deleted on re-upload
7. **Profile page**: Seeker only — employer/admin redirected to `/dashboard`

---

## Conventions

- Server Components by default; Client only for interactivity
- Actions: `"use server"` + Zod validation + auth check + ownership verification
- Queries: pure reads, auth-enforced where needed (`requireAdmin()`, `getMyApplications()` uses auth internally)
- Nav items: single source in `components/dashboard/nav-items.ts`
- All i18n strings in `messages/ka.json` + `messages/en.json` — no hardcoded text in components
- Storage buckets: `avatars`, `resumes` (private), `company-logos` — whitelist enforced
- Password minimum: 8 characters

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
ANTHROPIC_API_KEY=<api-key>   # AI Job Draft
```

---

## Roadmap — All Phases DONE

- Phase 0: Foundation (auth, i18n, theme, schema, types)
- Phase 1: Profiles & Companies (CRUD, file uploads)
- Phase 2: Jobs (feed, filters, pagination, CRUD, company pages)
- Phase 3: Applications & Tracking (apply, seen tracking, status management)
- Phase 4: Admin & Polish (admin panel, SEO, skeletons, error boundaries)
- Phase 5: Intelligence (smart matching, AI job draft, dual-language)

### Known Limitation
- `auth/error` page causes build error — Next.js 14 route group resolution bug (not our code)

---

## Phase 6: Optimization

### P1 — Performance (სიჩქარე)

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O1 | `next/image` — 18 `<img>` ჩანაცვლდა, Supabase domain config | 16 ფაილი + `next.config.mjs` | LCP -40-60% | ✅ |
| O2 | Query deduplication — layout + page ორჯერ ფეჩავს `getProfile`-ს | `(dashboard)/layout.tsx`, `dashboard/page.tsx` | DB load -50% | ❌ |
| O3 | Parallel fetching — `Promise.all` | `apply/page.tsx` | Page load -200ms | ✅ |
| O4 | Static generation — `revalidate: 3600` იშვიათად ცვლად გვერდებზე | `/companies/page.tsx`, `/companies/[slug]/page.tsx` | TTFB -80% | ❌ |

### P2 — SEO (ხილვადობა)

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O5 | Sitemap — jobs + companies + static, ორენოვანი | `app/sitemap.ts` | Google ინდექსაცია | ✅ |
| O6 | robots.txt — dashboard/admin/profile დაბლოკილი | `app/robots.ts` | Crawl control | ✅ |
| O7 | JSON-LD JobPosting — title, salary, location, employmentType | `jobs/[id]/page.tsx` | Google Jobs | ✅ |
| O8 | Dynamic OG images — სოციალური sharing | `app/[locale]/(public)/jobs/[id]/opengraph-image.tsx` (ახალი) | Social CTR | ❌ |

### P3 — Database (მოთხოვნები)

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O9 | N+1 fix — `markApplicationsBatchViewedAction` | 2 employer pages + `actions/applications.ts` | N queries → 1 | ✅ |
| O10 | Sidebar badge — `select("id")` ნაცვლად `count` with `head: true` | `(dashboard)/layout.tsx` | Data transfer -90% | ❌ |

### P4 — UX (გამოცდილება)

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O11 | Search debounce — realtime ძიება 300ms debounce-ით | `components/jobs/job-filters.tsx` | UX responsiveness | ❌ |
| O12 | Optimistic updates — status/save ცვლილება server-ის მოლოდინის გარეშე | `application-status-update.tsx`, saved jobs | Snappy UX | ❌ |

### P5 — Caching (კეშირება)

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O13 | `unstable_cache` — categories, public companies | `lib/queries/categories.ts`, `lib/queries/companies.ts` | DB calls -80% | ❌ |
| O14 | `revalidatePath` granularity — ზუსტი path-ები ფართოს ნაცვლად | `lib/actions/*.ts` | Cache hit rate ↑ | ❌ |

### შესრულების თანმიმდევრობა

```
P1 (Performance): O1 → O3 → O2 → O4
P2 (SEO):         O5+O6 → O7 → O8
P3 (Database):    O9 → O10
P4 (UX):          O11 → O12
P5 (Caching):     O13 → O14
```

რეკომენდებული სტარტი: **O1 → O5+O6 → O7 → O9 → O3** (მაქსიმალური ეფექტი, მინიმალური რისკი)

---

## Phase 7: ნდობა და გამჭვირვალობა (Trust & Transparency)

**მიზანი**: Jobs.ge-სგან დიფერენციაცია გამჭვირვალობით. მომხმარებლები მოვლენ მონაცემებისთვის, დარჩებიან ვაკანსიებისთვის.

### T1 — ხელფასების აგრეგაციის დეშბორდი (`/salaries`)

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T1.1 | Supabase query — ხელფასების აგრეგაცია | `AVG(salary_min)`, `AVG(salary_max)` გროუპირებული `category_id`, `city`-ით. მხოლოდ `status='active'` ვაკანსიები. `salary_min IS NOT NULL` ფილტრი | ❌ არ დაწყებულა |
| T1.2 | `/salaries` გვერდი — UI | ფილტრები: კატეგორია, ქალაქი. ბარათები: საშუალო, მინიმუმი, მაქსიმუმი ხელფასი. ვალუტის გათვალისწინება (GEL/USD/EUR). Quiet Design ესთეტიკა | ❌ არ დაწყებულა |
| T1.3 | i18n — ტექსტები | `messages/ka.json` + `messages/en.json` — namespace `salaries` | ❌ არ დაწყებულა |
| T1.4 | SEO — metadata + JSON-LD | `generateMetadata()` ორენოვანი. სტრუქტურირებული მონაცემები Google-ისთვის | ❌ არ დაწყებულა |
| T1.5 | Nav ლინკი | Header-ში "ხელფასები" ლინკის დამატება | ❌ არ დაწყებულა |

### T2 — კომპანიის კულტურის სექცია

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T2.1 | DB მიგრაცია — ახალი ველები `companies`-ში | `tech_stack TEXT[]`, `team_size VARCHAR`, `why_work_here TEXT`, `why_work_here_ka TEXT`, `benefits TEXT[]`, `benefits_ka TEXT[]` | ❌ არ დაწყებულა |
| T2.2 | ტიპების განახლება | `database.ts`, `index.ts` — ახალი ველები Company ტიპში | ❌ არ დაწყებულა |
| T2.3 | Zod ვალიდაცია | `lib/validations/company.ts` — ახალი ველების სქემა | ❌ არ დაწყებულა |
| T2.4 | კომპანიის ფორმა — ახალი ველები | `CompanyForm`-ში tech_stack (tag input), team_size (select), why_work_here (textarea), benefits (tag input) | ❌ არ დაწყებულა |
| T2.5 | კომპანიის საჯარო გვერდი — კულტურის ბლოკი | `/companies/[slug]` — "კულტურა და გარემო" სექცია: ტექ სტეკის ბეჯები, გუნდის ზომა, ბენეფიტები, "რატომ ჩვენ" ტექსტი | ❌ არ დაწყებულა |
| T2.6 | Server Action — განახლება | `updateCompanyAction()`-ში ახალი ველების შენახვა | ❌ არ დაწყებულა |
| T2.7 | i18n | namespace `company` — ახალი გასაღებები ორივე ენაზე | ❌ არ დაწყებულა |

---

## Phase 8: შეკავების ძრავა (Retention Engine)

**მიზანი**: მომხმარებელი საიტის გახსნის გარეშეც ურთიერთქმედებს. ჩვევის ფორმირება.

### T3 — "შენთვის შერჩეული" სექცია მთავარ გვერდზე

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T3.1 | Query — Top matches | `getTopMatchesForUser(userId, limit=5)` — `calculateMatch()` + აქტიური ვაკანსიები, სორტირება match%-ით | ❌ არ დაწყებულა |
| T3.2 | UI — "შენთვის შერჩეული" ბლოკი | მთავარ გვერდზე, ზოგადი ფიდის ზემოთ. მხოლოდ ავტორიზებული seeker-ისთვის. 5 ბარათი ჰორიზონტალურად, match % ბეჯით | ❌ არ დაწყებულა |
| T3.3 | Empty state | თუ skills ცარიელია → "შეავსე უნარები პროფილში უკეთესი შესატყვისებისთვის" CTA | ❌ არ დაწყებულა |
| T3.4 | i18n | namespace `home` — ახალი გასაღებები | ❌ არ დაწყებულა |

### T4 — Daily Match Digest (ელფოსტა)

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T4.1 | Email provider ინტეგრაცია | Resend ან Supabase Edge Function + SMTP. გარემოს ცვლადები | ❌ არ დაწყებულა |
| T4.2 | Email template | React Email ან HTML — "დღის 5 საუკეთესო ვაკანსია შენთვის". Quiet Design სტილი, ორენოვანი | ❌ არ დაწყებულა |
| T4.3 | Digest logic | Cron (დღეში ერთხელ) → seeker-ები skills[]-ით → `calculateMatch()` ბოლო 24სთ ვაკანსიებზე → top 5 → email | ❌ არ დაწყებულა |
| T4.4 | Opt-in/Opt-out | `profiles` ცხრილში `email_digest BOOLEAN DEFAULT true`. პროფილის პარამეტრებში toggle | ❌ არ დაწყებულა |
| T4.5 | Unsubscribe link | ყოველ email-ში one-click unsubscribe (CAN-SPAM/GDPR მოთხოვნა) | ❌ არ დაწყებულა |

---

## Phase 9: პროფილის რევოლუცია (Profile Revolution)

**მიზანი**: პროფილი გახდეს პროდუქტი — რაღაც, რისი გაზიარებაც მაძიებელს თავად უნდა.

### T5 — საჯარო მაძიებლის პორტფოლიო

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T5.1 | `/seekers/[id]` გვერდის რედიზაინი | Read.cv ესთეტიკა: ავატარი, სახელი, bio, ქალაქი — hero სექცია. Quiet Design | ❌ არ დაწყებულა |
| T5.2 | უნარების ვიზუალიზაცია | skills[] → სტილიზებული tag cloud ან ჰორიზონტალური pill badges, კატეგორიებით დაჯგუფებული | ❌ არ დაწყებულა |
| T5.3 | გამოცდილების სექცია | `experience_years` + bio-ს სტრუქტურირებული ჩვენება. timeline სტილი თუ მონაცემები საკმარისია | ❌ არ დაწყებულა |
| T5.4 | გაზიარების ღილაკი | "პროფილის გაზიარება" → clipboard copy + toast. Social share (Facebook, LinkedIn) | ❌ არ დაწყებულა |
| T5.5 | OG Meta + generateMetadata | სოციალურ ქსელებში გაზიარებისას: სახელი, უნარები, ავატარი. Dynamic OG image (სურვილისამებრ) | ❌ არ დაწყებულა |
| T5.6 | Privacy toggle | პროფილში "საჯარო პროფილი" checkbox. `profiles.is_public BOOLEAN DEFAULT true`. გამორთვისას → 404 | ❌ არ დაწყებულა |
| T5.7 | DB მიგრაცია | `is_public` ველი `profiles`-ში | ❌ არ დაწყებულა |

---

## Phase 10: მონეტიზაცია (Monetization)

**მიზანი**: მდგრადი შემოსავლის მოდელი, რომელიც არ ზღუდავს მომხმარებელს.

### T6 — პაკეტების სისტემა

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T6.1 | Pricing გვერდი | `/pricing` — 3 პაკეტი: Free, Pro (50₾/თვე), Verified (100₾/თვე). Quiet Design, ორენოვანი | ❌ არ დაწყებულა |
| T6.2 | DB — subscriptions ცხრილი | `subscriptions`: company_id, plan_type, status, current_period_start/end, payment_provider_id | ❌ არ დაწყებულა |
| T6.3 | Payment ინტეგრაცია | BOG iPay ან Stripe (საქართველოს მხარდაჭერით). Webhook handler | ❌ არ დაწყებულა |
| T6.4 | Feature gating | Free: 3 აქტიური ვაკანსია. Pro: unlimited + AI draft + match scores. Verified: badge + featured placement | ❌ არ დაწყებულა |
| T6.5 | Employer dashboard — plan info | მიმდინარე პაკეტი, გადახდის ისტორია, upgrade CTA | ❌ არ დაწყებულა |
| T6.6 | "Featured" ვაკანსიები | Pro/Verified კომპანიების ვაკანსიები ფიდის თავში, subtle highlight ბეჯით | ❌ არ დაწყებულა |

---

## შესრულების თანმიმდევრობა (Phase 7-10)

```
Phase 7 (ნდობა):     T1.1→T1.2→T1.3→T1.4→T1.5  ║  T2.1→T2.2→T2.3→T2.4→T2.5→T2.6→T2.7
Phase 8 (შეკავება):   T3.1→T3.2→T3.3→T3.4        ║  T4.1→T4.2→T4.3→T4.4→T4.5
Phase 9 (პროფილი):   T5.7→T5.1→T5.2→T5.3→T5.4→T5.5→T5.6
Phase 10 (ფული):     T6.1→T6.2→T6.3→T6.4→T6.5→T6.6
```

**რეკომენდებული სტარტი**: T1 (ხელფასები) → T3 (შერჩეული) → T2 (კულტურა) → T5 (პორტფოლიო) → T4 (digest) → T6 (მონეტიზაცია)
