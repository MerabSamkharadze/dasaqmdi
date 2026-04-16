# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# dasaqmdi.com — Project Source of Truth

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
```

No test framework is configured. No unit/integration tests exist yet.

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
| Fonts | Inter (Latin) + Noto Sans Georgian | Google Fonts |
| AI | Vercel AI SDK v6 (`ai` + `@ai-sdk/google`) | Gemini 2.5 Flash |
| Payments | Lemon Squeezy (`@lemonsqueezy/lemonsqueezy.js`) | MoR model |
| Telegram | Grammy (`grammy`) | Bot API |
| Image Crop | `react-easy-crop` | Avatar/logo upload |

### Next.js 14 Conventions (CRITICAL)

- `cookies()` is **synchronous** — do NOT `await`
- `createClient()` in `lib/supabase/server.ts` is **synchronous** — do NOT `await`
- `params` and `searchParams` are **plain objects** — no `Promise<>`, no `await`
- Config: `next.config.mjs` (NOT `.ts`), ESLint: `.eslintrc.json` (NOT flat config)
- `useFormState` imported from `react-dom` (React 18)
- Zod: `.partial()` only on `ZodObject`, NOT on `ZodEffects`

---

## Design System — "Quiet Design"

- **Palette**: Dark warm base + Gold accent (`--primary: #C7AE6A`). CSS variables in HSL (`globals.css`)
- **Cards**: `rounded-xl border border-border/60 bg-card p-5 shadow-soft` + `hover:shadow-gold-glow`
- **Typography**: `text-[15px] font-semibold` titles, `text-sm text-muted-foreground` metadata
- **Spacing**: `p-5`, `py-8`, `gap-3` — generous whitespace
- **Animation**: `animate-fade-in` with `animationDelay: i * 50ms`
- **Header**: `sticky backdrop-blur-lg bg-[hsl(195_70%_65%/0.85)]` light, `bg-background/80` dark
- **Empty states**: `border-dashed rounded-xl py-20`
- **Dark/Light**: `next-themes` with `attribute="class"`, test both modes

### Visual Hierarchy

1. **Primary**: title — `font-semibold text-foreground`
2. **Secondary**: company, salary — `text-sm text-foreground`
3. **Tertiary**: location, dates — `text-sm text-muted-foreground`, icons `opacity-60`
4. **Ambient**: borders `border-border/60`, backgrounds `bg-muted/50`

---

## i18n

- Default: `ka` (no prefix), Secondary: `en` (`/en/...`)
- `localePrefix: "as-needed"` — defined in `i18n/routing.ts`
- Navigation: `i18n/navigation.ts` — `createNavigation(routing)`
- Server: `await getTranslations("namespace")`, Client: `useTranslations("namespace")`
- Namespaces: `common`, `nav`, `home`, `jobs`, `categories`, `auth`, `profile`, `company`, `applications`, `dashboard`, `admin`, `errors`, `salaries`, `pricing`
- Bilingual fields: `field` + `field_ka`. Use `localized(obj, "title", locale)` helper from `lib/utils.ts`
- Language switching: `LanguageSwitcher` component — `router.replace` + `router.refresh()` via `startTransition`

---

## Project Structure

```
app/
├── layout.tsx                              # Root layout (metadata only)
├── sitemap.ts                              # Dynamic sitemap (jobs + companies)
├── robots.ts                               # Crawl rules (dashboard blocked)
├── [locale]/
│   ├── layout.tsx                          # Locale layout (fonts, providers, AuthModalProvider)
│   ├── error.tsx / not-found.tsx / loading.tsx
│   ├── (auth)/
│   │   ├── layout.tsx                      # Auth layout (branding + form panels, redirect if logged in)
│   │   └── auth/                           # login, sign-up, forgot-password, update-password, confirm
│   ├── (public)/
│   │   ├── layout.tsx                      # Header + Footer + main content
│   │   ├── page.tsx                        # Homepage — hero + job feed + auto-filter by preferred categories
│   │   ├── jobs/
│   │   │   ├── page.tsx                    # Job listing with search/filters + auto-filter
│   │   │   ├── loading.tsx                 # Skeleton loader
│   │   │   └── [id]/
│   │   │       ├── page.tsx                # Job detail + JSON-LD + share + apply
│   │   │       ├── apply/page.tsx          # Apply form
│   │   │       ├── loading.tsx
│   │   │       └── opengraph-image.tsx     # Dynamic OG image
│   │   ├── companies/                      # Company directory + profiles (revalidate: 3600)
│   │   ├── seekers/[id]/page.tsx           # Public seeker portfolio (privacy-gated)
│   │   ├── salaries/page.tsx               # Salary aggregation dashboard
│   │   └── pricing/page.tsx                # Subscription plans
│   └── (dashboard)/
│       ├── layout.tsx                      # Auth guard + sidebar + header + badge count
│       ├── dashboard/page.tsx              # Role-aware: SeekerDashboard / EmployerDashboard / AdminDashboard
│       ├── profile/page.tsx                # Seeker only (employer/admin → redirect)
│       ├── seeker/
│       │   ├── applications/page.tsx       # My applications
│       │   └── saved/page.tsx              # Saved jobs
│       ├── employer/
│       │   ├── company/                    # Company CRUD (culture: tech_stack, benefits, why_work_here)
│       │   ├── jobs/                       # Job CRUD + per-job applicants (match % sorted)
│       │   ├── applications/page.tsx       # All applicants across jobs
│       │   └── billing/page.tsx            # Subscription management
│       └── admin/                          # Users, jobs, companies management
├── api/
│   ├── ai/draft-job/route.ts               # Gemini 2.5 Flash — generates 4 fields (desc/req × en/ka)
│   ├── telegram/
│   │   ├── webhook/route.ts                # Grammy bot: /start, /categories, /companies, /language, /stop
│   │   └── notify/route.ts                 # Send job notifications to subscribers
│   ├── digest/                             # Email digest (⏸️ deferred)
│   └── webhooks/lemonsqueezy/route.ts      # Payment webhook handler

lib/
├── supabase/                               # server.ts (sync), client.ts, middleware.ts
├── storage.ts                              # Upload/delete, bucket whitelist, path sanitization, crop support
├── matching.ts                             # Smart matching: skills[] ↔ tags[] intersection
├── telegram/bot.ts                         # Grammy bot instance, categories, keyboards, messages
├── subscription-helpers.ts                 # Plan-based feature gating (canPostJob, canUseAIDraft)
├── hooks/
│   ├── use-auth-modal.tsx                  # Auth modal context + provider
│   └── use-scroll-on-save.ts               # Scroll to success message
├── actions/                                # "use server" mutations
│   ├── auth.ts                             # Login (returnUrl support), signup, logout, password reset
│   ├── jobs.ts                             # CRUD + renew + Telegram notify hook + plan gating
│   ├── applications.ts                     # Apply, status update, batch mark viewed, delete (+ storage cleanup)
│   ├── profile.ts                          # Update (preferred_categories, is_public, email_digest)
│   ├── company.ts                          # CRUD (tech_stack, benefits, why_work_here)
│   ├── admin.ts                            # Verify company, update role, delete job
│   ├── saved-jobs.ts                       # Save/unsave jobs
│   ├── billing.ts                          # Lemon Squeezy checkout
│   └── subscriptions.ts                    # Subscription management
├── queries/                                # Pure reads
│   ├── jobs.ts                             # getJobs (cached 30s, multi-category filter), getJobById (ISR 60s)
│   ├── applications.ts                     # getMyApplications (auth-enforced), getApplicationsByJob (ownership check)
│   ├── profile.ts                          # getProfile (React.cache), getPublicProfile (privacy-gated)
│   ├── companies.ts                        # getCompanyByOwner, getCompanyBySlug, getAllCompanies
│   ├── categories.ts                       # getCategories (unstable_cache 1hr)
│   ├── dashboard.ts                        # getSeekerDashboardData, getEmployerDashboardData
│   ├── admin.ts                            # getAdminStats, getAllUsers/Jobs/Companies (requireAdmin guard)
│   ├── salaries.ts                         # Salary aggregation by category/city
│   ├── saved-jobs.ts                       # getSavedJobIds
│   ├── employer-applications.ts            # All applications across employer's jobs
│   ├── subscriptions.ts                    # getActivePlan
│   ├── digest.ts                           # Email digest data
│   └── seeker-stats.ts                     # Seeker dashboard stats
├── types/
│   ├── database.ts                         # Supabase Row/Insert/Update types (all tables)
│   ├── enums.ts                            # USER_ROLES, JOB_TYPES, JOB_STATUSES, etc.
│   └── index.ts                            # Joined types, ActionResult, re-exports
├── validations/                            # Zod schemas
│   ├── auth.ts                             # Login, signup (min 8 chars), password reset
│   ├── job.ts                              # Job create/update (tags, salary, deadline)
│   ├── profile.ts                          # Profile (preferred_categories, is_public, email_digest)
│   ├── company.ts                          # Company (tech_stack, benefits, why_work_here)
│   └── application.ts                      # Apply, status update
└── email/                                  # Email templates (digest)

components/
├── ui/                                     # shadcn/ui primitives (select with truncate fix)
├── layout/
│   ├── header.tsx                          # Sticky header (jobs, companies, salaries nav)
│   ├── footer.tsx                          # 3-column footer (brand, links, telegram)
│   └── language-switcher.tsx               # Locale switch with startTransition + refresh
├── brand/                                  # Logo (multiple variants), nav-icons
├── dashboard/
│   ├── nav-items.ts                        # Single source: seeker/employer/admin nav arrays
│   ├── dashboard-sidebar.tsx               # Sidebar with badge count
│   ├── seeker-dashboard.tsx                # Stats + profile strength + recent apps + recommended
│   ├── employer-dashboard.tsx              # Company info + stats + recent jobs + renew button
│   ├── admin-dashboard.tsx                 # Platform stats + quick links
│   ├── job-form.tsx                        # AI draft integration (4 fields auto-fill)
│   ├── profile-form.tsx                    # Preferred categories checkboxes, avatar crop
│   ├── profile-page-client.tsx             # View/edit toggle
│   ├── company-form.tsx                    # Culture section (tech_stack, benefits)
│   ├── application-status-update.tsx       # Auto-submit on select change
│   └── job-action-buttons.tsx              # Close, renew (RenewJobButton), edit, applicants
├── jobs/
│   ├── job-card.tsx                        # Card with share + bookmark (auth modal for guests)
│   ├── job-list.tsx                        # Staggered fade-in list
│   ├── job-filters.tsx                     # Search (debounce 350ms), category, type, city dropdowns
│   ├── pagination.tsx                      # Page numbers with query params preserved
│   ├── share-job-button.tsx                # Dropdown: copy, Facebook, LinkedIn, X, WhatsApp
│   ├── bookmark-button.tsx                 # Save/unsave with auth modal for guests
│   ├── apply-button.tsx                    # Apply with auth modal for guests
│   ├── top-matches.tsx                     # "Picked for You" section
│   └── view-tracker.tsx                    # Increment job views
├── applications/                           # StatusBadge, DeleteButton, ApplyForm
└── shared/
    ├── file-upload.tsx                     # Upload with crop dialog (avatars/logos), old file cleanup
    ├── image-crop-dialog.tsx               # react-easy-crop, circular/rect, WebP output
    ├── auth-modal.tsx                      # "Sign in required" modal with returnUrl
    ├── refresh-button.tsx                  # router.refresh() for cache bypass
    ├── share-button.tsx                    # Clipboard copy
    └── submit-button.tsx                   # Form submit with pending state
```

---

## Database Schema

### Tables

| Table | Key Fields |
|---|---|
| `profiles` | id (FK), role, full_name/ka, skills[], resume_url, preferred_categories[], is_public, email_digest |
| `categories` | slug, name_en, name_ka (11 rows: IT, sales, admin, finance, hospitality, construction, food-service, retail, beauty-wellness, logistics, healthcare) |
| `companies` | owner_id, name, slug, is_verified, logo_url, tech_stack[], benefits[], why_work_here |
| `jobs` | company_id, category_id, title, job_type, status, salary_min/max, expires_at, tags[], is_featured |
| `applications` | job_id, applicant_id, resume_url, status, is_viewed, viewed_at |
| `saved_jobs` | user_id, job_id (unique) |
| `subscriptions` | company_id, plan (free/pro/verified), status, lemon_squeezy_id, period dates |
| `telegram_subscriptions` | telegram_id, chat_id, categories[], company_ids[], locale, is_active |

### Migrations (in order)

```
001_initial_schema.sql          # profiles, categories, companies, jobs, applications + triggers + indexes
002_company_culture.sql          # tech_stack, why_work_here, benefits on companies
002_increment_job_views.sql      # views_count RPC
003_profile_public.sql           # is_public on profiles
003_saved_jobs.sql               # saved_jobs table
004_email_digest.sql             # email_digest on profiles
005_subscriptions.sql            # subscriptions table + is_featured on jobs
006_telegram_subscriptions.sql   # telegram_subscriptions table
007_telegram_company_subscriptions.sql  # company_ids on telegram_subscriptions
008_new_categories.sql           # 5 new categories (food, retail, beauty, logistics, healthcare)
009_preferred_categories.sql     # preferred_categories on profiles
010_email_templates.sql          # email_templates per company (custom accepted/rejected)
011_telegram_rls.sql             # enable RLS on telegram_subscriptions (service_role only)
012_profiles_privacy_rls.sql     # profile SELECT enforces is_public / own / admin / employer-applicant
```

### Roles: `seeker` (apply, track, save), `employer` (post, review, billing), `admin` (moderate all)

### Key Behaviors
- `on_auth_user_created` → auto-creates profile with role
- `jobs_set_expires_at` → `expires_at = created_at + 30 days`
- RLS on all tables; `telegram_subscriptions` RLS enabled with no policies (service_role only)
- Auth layout redirects logged-in users to `/dashboard`

---

## Business Rules

1. **Smart Visibility**: Feed excludes expired + past-deadline jobs
2. **30-Day Freshness**: Auto expires_at, renew (+30 days), closed cannot renew
3. **Seen Tracking**: `is_viewed` + `viewed_at`, batch mark viewed (`markApplicationsBatchViewedAction`)
4. **Smart Matching**: `calculateMatch(skills[], tags[])` → percentage, sorted on employer page
5. **AI Draft**: Gemini 2.5 Flash → generates `description`, `description_ka`, `requirements`, `requirements_ka` as JSON (4 form fields auto-fill)
6. **Storage**: Deterministic paths (`{userId}/avatar.webp`), `upsert: true`, crop to 400x400 WebP for avatars, old files deleted on re-upload
7. **Profile page**: Seeker only — employer/admin redirected
8. **Preferred Categories**: Seeker selects categories in profile → homepage/jobs auto-filter by them. `?all=1` to override
9. **Auth Modal**: Guest clicks Apply/Bookmark → modal with Login/SignUp + `returnUrl` → post-login redirect back
10. **Telegram Bot**: Job published → notify subscribers by category + company. Commands: /start, /categories, /companies, /language, /stop. Only verified companies in /companies
11. **Feature Gating**: Free (3 jobs), Pro (unlimited + AI), Verified (badge + featured)
12. **Company website**: Auto-prefix `https://` if missing

---

## Conventions

- Server Components by default; Client only for interactivity
- Actions: `"use server"` + Zod + auth + ownership verification
- Queries: auth-enforced where needed (`requireAdmin()`, `getMyApplications()`)
- Nav items: single source `components/dashboard/nav-items.ts`
- All i18n in `messages/ka.json` + `messages/en.json` — no hardcoded text
- **No hardcoded brand/URL strings** — always use `siteConfig` from `@/lib/config`. Never write `"dasaqmdi.com"`, `"https://www.dasaqmdi.com"`, `"https://t.me/dasaqmdi_bot"`, or email from-addresses inline. Use `siteConfig.url`, `siteConfig.domain`, `siteConfig.brand.name`, `siteConfig.social.telegramBot`, `siteConfig.email.from`, `siteConfig.email.noreply`. If a new brand-related constant is needed, **add it to `lib/config.ts` first**, then import it
- **Email HTML templates must escape user-supplied data** — always wrap user data (names, titles, bodies) with `escapeHtml()` from `@/lib/email/escape` before interpolating into HTML. URLs get `encodeURI()`. Never insert raw DB strings into `<p>${x}</p>`
- **Webhook endpoints must verify signatures** — Telegram: `x-telegram-bot-api-secret-token` header; Lemon Squeezy: HMAC via `crypto.timingSafeEqual`. New webhooks must fail closed on missing/invalid signatures
- **File ownership must be verified server-side** — when a client submits a storage path (resume, avatar, logo), check it starts with `${user.id}/` before accepting. Never trust client-supplied URLs/paths
- **New migrations must enable RLS + explicit policies** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` + separate SELECT/INSERT/UPDATE/DELETE policies. Never rely on implicit blocking
- Storage buckets: `avatars`, `resumes` (private), `company-logos` — whitelist in `lib/storage.ts`
- Password minimum: 8 characters
- Caching: `React.cache()` for profile, `unstable_cache` for categories (1hr) + jobs (30s), `revalidate: 3600` on company pages, ISR 60s on job detail
- `next/image` for all images (Supabase domain configured in `next.config.mjs`)
- Middleware: Supabase session refresh → auth guard → intl locale routing (API routes excluded)

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://www.dasaqmdi.com
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GOOGLE_GENERATIVE_AI_API_KEY=<gemini-key>
TELEGRAM_BOT_TOKEN=<bot-token>
CRON_SECRET=<random-secret>
LEMONSQUEEZY_API_KEY=<api-key>
LEMONSQUEEZY_STORE_ID=<store-id>
LEMONSQUEEZY_WEBHOOK_SECRET=<webhook-secret>
LEMONSQUEEZY_PRO_VARIANT_ID=<variant-id>
LEMONSQUEEZY_VERIFIED_VARIANT_ID=<variant-id>
```

---

## Completed Phases

- **Phase 0-5**: Foundation, Profiles, Jobs, Applications, Admin, Intelligence (smart matching + AI draft)
- **Phase 6**: Optimization (next/image, caching, ISR, sitemap, robots, JSON-LD, OG images, batch queries, debounce)
- **Phase 7**: Trust (salary dashboard, company culture section)
- **Phase 8**: Retention (top matches, preferred categories auto-filter). Email digest ⏸️ deferred
- **Phase 9**: Profile revolution (public portfolio, privacy toggle, share button)
- **Phase 10**: Monetization (Lemon Squeezy, pricing page, feature gating, billing)
- **Phase 11**: Telegram bot (categories + companies subscription, real-time notifications, localized commands)

### Domain: `www.dasaqmdi.com` (Vercel)
### Bot: `@dasaqmdi_bot` (Telegram)

---

## Phase 12: Email Notifications (Resend)

**მიზანი**: აპლიკანტს ეცნობება როცა **მიიღეს (accepted)** ან **უარყვეს (rejected)**. სხვა სტატუსებზე (pending, reviewed, shortlisted) email არ იგზავნება. Employer-ს შეუძლია templates-ის კასტომიზაცია.

### N1 — DB: Email Templates

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N1.1 | Migration `010_email_templates.sql` | `email_templates` table + RLS + unique(company_id, type) | ✅ |
| N1.2 | Default templates | `lib/email/default-templates.ts` — accepted/rejected en/ka + `renderTemplate()` | ✅ |
| N1.3 | Types | `database.ts` — EmailTemplate Row/Insert/Update | ✅ |

### N2 — Resend Setup

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N2.1 | `npm install resend` | Resend SDK | ✅ |
| N2.2 | Domain verification | `dasaqmdi.com` DNS records — **შენ უნდა გააკეთო resend.com-ზე** | ⏳ შენზეა |
| N2.3 | Env var | `RESEND_API_KEY` — **შენ უნდა დაამატო .env.local + Vercel-ში** | ⏳ შენზეა |

### N3 — Email HTML Template

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N3.1 | HTML template | `lib/email/application-status-template.ts` — dark bg, gold accent, job link button | ✅ |
| N3.2 | Variable substitution | `{applicant_name}`, `{job_title}`, `{company_name}` → `renderTemplate()` | ✅ |
| N3.3 | ენის არჩევა | `preferred_language`-ის მიხედვით ka/en subject + body | ✅ |

### N4 — API Route + Action Hook

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N4.1 | `/api/email/notify` route | POST, CRON_SECRET, fetch app+profile+job+company → custom/default template → Resend | ✅ |
| N4.2 | Action hook | `updateApplicationStatusAction` — accepted/rejected → fire-and-forget notify | ✅ |

### N5 — Employer Template Editor UI

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N5.1 | `/employer/email-templates` გვერდი | 2 ტაბი (accepted/rejected), subject/body EN+KA | ✅ |
| N5.2 | Live preview | real-time preview, variables replaced with sample data | ✅ |
| N5.3 | Save action | `upsertEmailTemplateAction` + `deleteEmailTemplateAction` — ownership check | ✅ |
| N5.4 | "Reset to default" | `deleteEmailTemplateAction` — წაშლის custom, default აბრუნებს | ✅ |
| N5.5 | Nav ლინკი | `nav-items.ts` — Mail icon, "Email Templates" / "ელფოსტის შაბლონები" | ✅ |

### N6 — i18n

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| N6.1 | Nav key | `nav.emailTemplates` ka/en | ✅ |
| N6.2 | Template editor keys | `dashboard.emailTemplates*`, `template*` 12 key ka/en | ✅ |

### შესრულების თანმიმდევრობა

```
N1.1 → N1.2 → N1.3 → N2.1 → N2.2 → N2.3 → N3.1 → N3.2 → N3.3 → N4.1 → N4.2 → N5.1 → N5.2 → N5.3 → N5.4 → N5.5 → N6.1 → N6.2
```

**რეკომენდებული სტარტი**: N1 (DB) → N2 (Resend setup) → N3 (template) → N4 (hook) — ეს 4 ნაბიჯი საკმარისია default templates-ით მუშაობისთვის. N5 (UI editor) მოგვიანებით.

---

## Phase 13: Admin Panel Enhancement

**მიზანი**: სრულყოფილი admin პანელი — analytics, user/company detail views, search, subscription management, moderation tools.

### ⚠️ არქიტექტურული გადაწყვეტილებები

- **Charts**: CSS-only bar charts (%-based divs). არ ვამატებთ recharts/tremor — bundle size +40KB არ ღირს 4 chart-ისთვის
- **Admin queries**: page-level `requireAdmin()` ერთხელ → supabase client parameter-ად გადაეცემა query helpers-ს (თავიდან ავიცილებთ ყოველ query-ზე auth check-ს)
- **Email search**: `profiles` table-ში `email` ველი არ არის (auth.users-ში ინახება). User search მხოლოდ `full_name`/`full_name_ka`-ით. Email-ით ძიება მომავალი phase — migration სჭირდება
- **Nav grouping**: admin nav 2 section-ად — "Main" (dashboard, users, jobs, companies) + "Tools" (analytics, subscriptions, moderation, logs). Sidebar-ში separator
- **Moderation**: default = OFF (auto-approve). `MODERATION_ENABLED` env var-ით ჩართვა. არსებული flow არ იშლება

### A1 — Analytics Dashboard (Charts + Trends)

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A1.0 | DB: RPC functions | Migration `014_admin_analytics.sql` — `get_registration_trend(days)`, `get_job_posting_trend(days)`, `get_application_trend(days)` Postgres functions returning `{date, count}[]` | ⬜ |
| A1.1 | Stats queries | `lib/queries/admin.ts` — trend queries via RPC + `getCategoryBreakdown` (Supabase group query) | ⬜ |
| A1.2 | Chart component | `components/dashboard/admin-charts.tsx` — CSS-only bar charts (%-based divs, brand palette, responsive). არ ვამატებთ external dependency | ⬜ |
| A1.3 | Analytics page | `app/[locale]/(dashboard)/admin/analytics/page.tsx` — 4 chart cards: registrations, jobs, applications, categories | ⬜ |
| A1.4 | Nav link | `nav-items.ts` — BarChart3 icon, admin nav "Tools" section | ⬜ |
| A1.5 | i18n | `admin.analytics*` keys ka/en | ⬜ |

### A2 — User Search + Filters

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A2.1 | Query update | `getAllUsers(filters)` — q (`full_name`/`full_name_ka` ilike search, არა email), role filter | ⬜ |
| A2.2 | Filter component | `components/dashboard/admin-user-filters.tsx` — Search + Role dropdown (seeker/employer/admin) + `startTransition` | ⬜ |
| A2.3 | Page update | `admin/users/page.tsx` — searchParams + filters + CountBadge | ⬜ |
| A2.4 | i18n | `admin.searchUsers`, `admin.allRoles`, `admin.seeker`, `admin.employer` ka/en | ⬜ |

### A3 — User Detail View

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A3.1 | Query | `getAdminUserDetail(supabase, userId)` — supabase client parameter-ად (არა ახალი requireAdmin). Profile + applications count + posted jobs count + company info | ⬜ |
| A3.2 | Detail page | `app/[locale]/(dashboard)/admin/users/[id]/page.tsx` — page-level requireAdmin → profile card (avatar, name, role, city, skills, created_at), activity stats (applications, jobs), role change dropdown | ⬜ |
| A3.3 | Link from list | `admin/users/page.tsx` — user name → Link to `/admin/users/[id]` | ⬜ |
| A3.4 | i18n | `admin.userDetail*` keys ka/en | ⬜ |

### A4 — Company Detail View

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A4.1 | Query | `getAdminCompanyDetail(supabase, companyId)` — company + active/total jobs count + total applications + subscription row + owner profile (name, email) | ⬜ |
| A4.2 | Detail page | `app/[locale]/(dashboard)/admin/companies/[id]/page.tsx` — company card (logo, name, city, verified), owner info, jobs summary, subscription status, verify/unverify button | ⬜ |
| A4.3 | Link from list | `admin/companies/page.tsx` — company name → Link to `/admin/companies/[id]` | ⬜ |
| A4.4 | i18n | `admin.companyDetail*` keys ka/en | ⬜ |

### A5 — Subscription Management

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A5.1 | Query | `getAllSubscriptions()` — all subscriptions joined with company (name, slug). Local DB only — Lemon Squeezy sync არ არის ამ phase-ში | ⬜ |
| A5.2 | Subscriptions page | `app/[locale]/(dashboard)/admin/subscriptions/page.tsx` — list with plan/status badges, company name, period dates. Summary cards: total active, revenue estimate | ⬜ |
| A5.3 | Nav link | `nav-items.ts` — CreditCard icon, admin nav "Tools" section | ⬜ |
| A5.4 | Filters | Status dropdown (active/cancelled/expired) + plan dropdown (free/pro/verified) | ⬜ |
| A5.5 | i18n | `admin.subscriptions*` keys ka/en | ⬜ |

### A6 — Job Moderation

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A6.0 | Config | `MODERATION_ENABLED` env var — default `false`. როცა `false`, jobs auto-approve (არსებული flow). როცა `true`, ახალი jobs `status: "pending"` | ⬜ |
| A6.1 | Status update | `jobs` table — `status` enum-ში `"pending"` დამატება (migration `015_job_moderation.sql`). Telegram notify მხოლოდ `pending → active` transition-ზე | ⬜ |
| A6.2 | Moderation queue | `app/[locale]/(dashboard)/admin/moderation/page.tsx` — pending jobs list (title, company, posted date) with approve/reject buttons | ⬜ |
| A6.3 | Actions | `approveJobAction(jobId)` → `status: "active"` + Telegram notify. `rejectJobAction(jobId)` → `status: "rejected"`. Both require admin role | ⬜ |
| A6.4 | Creation hook | `createJobAction` — if `MODERATION_ENABLED`, insert with `status: "pending"`. Otherwise `status: "active"` (no breaking change) | ⬜ |
| A6.5 | Employer UX | Employer dashboard shows "Pending moderation" badge. Employer jobs list filters include "pending" status | ⬜ |
| A6.6 | i18n | `admin.moderation*` + `dashboard.pendingModeration` keys ka/en | ⬜ |

### A7 — Activity Log / Audit Trail

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A7.1 | Migration | `016_admin_logs.sql` — `admin_logs` table (id, action, actor_id, target_type, target_id, metadata jsonb, created_at). Index on `created_at DESC`. RLS: service_role only | ⬜ |
| A7.2 | Logger util | `lib/admin-log.ts` — `logAdminAction(supabase, action, targetType, targetId, metadata?)` | ⬜ |
| A7.3 | Hook into actions | verify company, delete job, change role, approve/reject moderation → auto-log | ⬜ |
| A7.4 | Logs page | `app/[locale]/(dashboard)/admin/logs/page.tsx` — chronological list with **pagination** (20 per page) + date/action type filters | ⬜ |
| A7.5 | Retention | Auto-delete logs older than 90 days (Supabase cron ან manual cleanup) — documented, not auto-implemented | ⬜ |
| A7.6 | i18n | `admin.logs*` keys ka/en | ⬜ |

### A8 — Bulk Actions

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| A8.1 | Selection wrapper | `components/dashboard/admin-selectable-list.tsx` — Client Component wrapper. Receives items, renders checkboxes + "Select All". Internal state tracks selected IDs | ⬜ |
| A8.2 | Bulk actions bar | Sticky bottom bar — shows when selection > 0. "Delete selected (3)", "Close selected", "Change role". Confirm dialog before destructive actions | ⬜ |
| A8.3 | Batch server actions | `batchDeleteJobsAction(ids[])`, `batchCloseJobsAction(ids[])`, `batchUpdateRoleAction(ids[], role)` — admin role check + audit log | ⬜ |
| A8.4 | Integration | Apply to `admin/jobs` and `admin/users` pages | ⬜ |
| A8.5 | i18n | `admin.bulk*` keys ka/en | ⬜ |

### შესრულების თანმიმდევრობა

```
A1 (Analytics) → A2 (User Search) → A3 (User Detail) → A4 (Company Detail) → A5 (Subscriptions) → A6 (Moderation) → A7 (Audit Log) → A8 (Bulk Actions)
```

**პრიორიტეტი**: A1 → A2 → A3 → A4 — ეს 4 ნაბიჯი ყველაზე მეტ ღირებულებას იძლევა მინიმალური complexity-ით. A6 (Moderation) ყველაზე რისკიანია (breaking change potential) — `MODERATION_ENABLED=false` default-ით დაცულია.
