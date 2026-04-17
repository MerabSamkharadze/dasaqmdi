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
| Framework | Next.js 14 (App Router) | 14.2.35 |
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
| Email | Resend | Transactional emails (accepted/rejected) |
| Analytics | Facebook Pixel | Conversion tracking |
| Monitoring | Vercel Speed Insights | `@vercel/speed-insights` |

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
- Namespaces: `common`, `nav`, `home`, `jobs`, `categories`, `auth`, `profile`, `company`, `applications`, `dashboard`, `admin`, `errors`, `salaries`, `pricing`, `about`
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
│   │   │       └── loading.tsx
│   │   ├── companies/                      # Company directory + profiles (revalidate: 3600)
│   │   ├── seekers/[id]/page.tsx           # Public seeker portfolio (privacy-gated)
│   │   ├── salaries/page.tsx               # Salary aggregation dashboard
│   │   ├── pricing/page.tsx                # Subscription plans
│   │   └── about/page.tsx                  # About page (public, all roles)
│   └── (dashboard)/
│       ├── layout.tsx                      # Auth guard + sidebar + header + badge count
│       ├── dashboard/page.tsx              # Role-aware: SeekerDashboard / EmployerDashboard / AdminDashboard
│       ├── profile/page.tsx                # Seeker only (employer/admin → redirect)
│       ├── seeker/
│       │   ├── applications/page.tsx       # My applications
│       │   └── saved/page.tsx              # Saved jobs
│       ├── employer/
│       │   ├── company/                    # Company CRUD (culture: tech_stack, benefits, why_work_here)
│       │   ├── jobs/                       # Job CRUD + filters + per-job applicants (match % sorted)
│       │   ├── applications/page.tsx       # All applicants across jobs
│       │   ├── email-templates/page.tsx    # Custom accepted/rejected email templates
│       │   └── billing/page.tsx            # Subscription management
│       └── admin/
│           ├── users/                      # User list (search + role filter) + detail view
│           ├── jobs/                       # Job list (search + status + category filter) + bulk delete
│           ├── companies/                  # Company list + detail view + verify
│           ├── analytics/page.tsx          # Charts: registration/job/application trends + category breakdown
│           ├── subscriptions/page.tsx       # Subscription management (status + plan filters)
│           ├── moderation/page.tsx          # Pending job approval/rejection queue
│           └── logs/page.tsx               # Admin activity audit trail (paginated)
├── api/
│   ├── ai/draft-job/route.ts               # Gemini 2.5 Flash — generates 4 fields + category + tags
│   ├── og/job/[id]/route.tsx               # Dynamic OG image for job posts (Route Handler)
│   ├── telegram/
│   │   ├── webhook/route.ts                # Grammy bot: /start, /categories, /companies, /language, /stop
│   │   └── notify/route.ts                 # Send job notifications to subscribers
│   ├── email/notify/route.ts               # Send status change emails via Resend
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
│   ├── admin.ts                            # Verify company, update role, delete job, approve/reject, bulk delete + audit log
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
│   ├── admin.ts                            # getAdminStats, getAllUsers/Jobs/Companies, trends (RPC), user/company detail, subscriptions, moderation, logs
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
├── tracking/
│   └── pixel-events.ts                     # Facebook Pixel event helpers (ViewContent, Registration, Lead, JobPosted)
├── admin-log.ts                            # Audit trail logger
├── seo.ts                                  # buildAlternates() for canonical/hreflang
├── og-fonts.ts                             # Noto Georgian font loader for OG images
├── config.ts                               # siteConfig — centralized brand/URL/OG constants
└── email/                                  # Email templates (status notifications + digest)

components/
├── ui/                                     # shadcn/ui primitives (select truncate, alert-dialog)
├── layout/
│   ├── header.tsx                          # Sticky header (jobs, companies, salaries, about nav)
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
│   ├── application-status-update.tsx       # Auto-submit + AlertDialog confirm for accept/reject
│   ├── job-action-buttons.tsx              # Close, renew (RenewJobButton), edit, applicants
│   ├── admin-bar-chart.tsx                 # CSS-only BarChart + HBarChart for analytics
│   ├── admin-job-filters.tsx               # Admin jobs search + status + category filters
│   ├── admin-user-filters.tsx              # Admin users search + role filter
│   ├── admin-subscription-filters.tsx      # Admin subscription status + plan filters
│   ├── admin-moderation-buttons.tsx        # Approve/reject pending jobs
│   ├── admin-selectable-list.tsx           # Reusable checkbox selection + bulk action bar
│   ├── admin-jobs-list.tsx                 # Client wrapper for bulk-deletable job list
│   └── employer-job-filters.tsx            # Employer jobs search + status + category filters
├── jobs/
│   ├── job-card.tsx                        # Card with share + bookmark (auth modal for guests)
│   ├── job-list.tsx                        # Staggered fade-in list
│   ├── job-filters.tsx                     # Search (debounce 350ms), category, type, city dropdowns
│   ├── pagination.tsx                      # Page numbers with query params preserved
│   ├── share-job-button.tsx                # Dropdown: copy, Facebook, LinkedIn, X, WhatsApp
│   ├── bookmark-button.tsx                 # Save/unsave with auth modal for guests
│   ├── apply-button.tsx                    # Apply with auth modal for guests
│   ├── top-matches.tsx                     # "Picked for You" section
│   └── view-tracker.tsx                    # Increment job views + Facebook Pixel ViewContent
├── applications/                           # StatusBadge, DeleteButton, ApplyForm
└── shared/
    ├── file-upload.tsx                     # Upload with crop dialog (avatars/logos), old file cleanup
    ├── image-crop-dialog.tsx               # react-easy-crop, circular/rect, WebP output
    ├── auth-modal.tsx                      # "Sign in required" modal with returnUrl
    ├── refresh-button.tsx                  # router.refresh() for cache bypass
    ├── share-button.tsx                    # Clipboard copy
    ├── submit-button.tsx                   # Form submit with pending state
    ├── spinner.tsx                         # Reusable Loader2 spinner
    ├── count-badge.tsx                     # Gold pill badge for list counts
    └── verified-badge.tsx                  # Gold star SVG verified badge + heartbeat hover
├── tracking/
│   ├── facebook-pixel.tsx                  # Meta Pixel base snippet + PageView + noscript
│   ├── registration-tracker.tsx            # CompleteRegistration on ?registered=1
│   └── job-posted-tracker.tsx              # JobPosted custom event on ?created=1
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
| `email_templates` | company_id, type (accepted/rejected), subject/body en/ka, is_active |
| `admin_logs` | action, actor_id, target_type, target_id, metadata jsonb, created_at |

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
013_rollback_profiles_rls.sql    # rollback 012 temporarily
014_admin_analytics.sql          # 4 RPC functions (registration/job/application trends + category breakdown)
015_job_moderation.sql           # pending/rejected job status enum values
016_admin_logs.sql               # admin_logs table + indexes + RLS
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
13. **Job Moderation**: `MODERATION_ENABLED` env var (default false). When true, new jobs start as `pending` → admin approves/rejects. Telegram notify only on approve
14. **AI Draft**: Also suggests best-matching category + 10-15 skill tags
15. **OG Images**: Route Handler at `/api/og/job/[id]` (not metadata convention — Next.js 14 route group bug workaround)
16. **Facebook Pixel**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` env var. Events: PageView, ViewContent, CompleteRegistration, Lead, JobPosted (custom)
17. **Admin Audit Log**: All admin actions (verify, role change, approve, reject, delete) auto-logged to `admin_logs` table

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
- Middleware: Supabase session refresh → auth guard → intl locale routing (API routes excluded). Metadata routes (opengraph-image) get intl rewrite only, no auth
- Facebook Pixel: `afterInteractive` script, env-gated. Events fire via `lib/tracking/pixel-events.ts` helpers
- **არასოდეს გამოიყენო `window.confirm()` ან `window.alert()`** — ყოველთვის shadcn `AlertDialog` კომპონენტი (`components/ui/alert-dialog.tsx`). Destructive actions-ზე confirm ღილაკს `bg-destructive` class

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://www.dasaqmdi.com
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=<pixel-id>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GOOGLE_GENERATIVE_AI_API_KEY=<gemini-key>
TELEGRAM_BOT_TOKEN=<bot-token>
CRON_SECRET=<random-secret>
RESEND_API_KEY=<resend-key>
LEMONSQUEEZY_API_KEY=<api-key>
LEMONSQUEEZY_STORE_ID=<store-id>
LEMONSQUEEZY_WEBHOOK_SECRET=<webhook-secret>
LEMONSQUEEZY_PRO_VARIANT_ID=<variant-id>
LEMONSQUEEZY_VERIFIED_VARIANT_ID=<variant-id>
MODERATION_ENABLED=false
```

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
- **Phase 12**: Email notifications (Resend — accepted/rejected status emails, custom templates per company)
- **Phase 13**: Admin panel enhancement (analytics charts, user/company detail, subscriptions, moderation, audit log, bulk actions)
- **Phase 14**: UI/UX & Accessibility (ARIA, focus management, design system, contrast, touch targets)
- **Phase 15**: Facebook Pixel integration (PageView, ViewContent, Registration, Lead, JobPosted events)

### Domain: `www.dasaqmdi.com` (Vercel)
### Bot: `@dasaqmdi_bot` (Telegram)

---

## დარჩენილი ამოცანები

### Phase 16: External Job Aggregation ✅

Migration `017_external_jobs.sql` გასაშვებია Supabase-ზე deploy-ის წინ.

---

## Phase 17: Search Dominance — SEO & Visibility 360°

**მიზანი**: "ვაკანსიები", "დასაქმება", "სამსახური", "ვაკანსიები თბილისში" — Google-ის პირველ გვერდზე 1-3 თვეში.

### ⚠️ არქიტექტურული გადაწყვეტილებები

- **Landing pages**: Dynamic routes `/jobs/[city]`, `/jobs/category/[slug]`, `/jobs/remote`, `/jobs/internship` — არსებული `getJobs` query-ს reuse
- **JSON-LD**: `directApply`, `identifier`, `sameAs` fields — Google Jobs widget-ისთვის აუცილებელი
- **IndexNow**: Bing/Yandex instant indexing — ახალი job publish-ზე API call
- **Structured Data**: Organization + BreadcrumbList + WebSite SearchAction schemas root layout-ში

### SEO1 — JSON-LD Schema გაძლიერება

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| SEO1.1 | `directApply` | `true` internal, `false` external | ✅ |
| SEO1.2 | `identifier` | `PropertyValue` with job ID | ✅ |
| SEO1.3 | `hiringOrganization.sameAs` | Company website URL | ✅ |
| SEO1.4 | `applicantLocationRequirements` | Remote jobs — Country: Georgia | ✅ |
| SEO1.5 | `skills` + `occupationalCategory` + `url` | Extra fields for richer results | ✅ |
| SEO1.6 | Validation | Google Rich Results Test | ⏳ შენზეა |

### SEO2 — SEO Landing Pages

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| SEO2.1 | Catch-all landing | `/jobs/explore/[...slug]` — 18 landings (4 cities + 3 types + 11 categories) | ✅ |
| SEO2.2 | Landing config | `lib/seo-landings.ts` — centralized filter + title + description ka/en | ✅ |
| SEO2.3 | generateMetadata | SEO-optimized title/description + alternates per landing | ✅ |
| SEO2.4 | generateStaticParams | ISG — all landing slugs pre-generated | ✅ |
| SEO2.5 | Sitemap | 36 landing URLs (18 × ka/en) priority 0.85 | ✅ |
| SEO2.6 | Internal linking | Jobs page — "Browse by" section with 10 landing links | ✅ |
| SEO2.7 | Full job list | Match scores + saved jobs + pagination per landing | ✅ |

### SEO3 — Sitemap & Indexing

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| SEO3.1 | Missing pages | about, salaries, pricing + category pages sitemap-ში | ✅ |
| SEO3.2 | IndexNow | `app/api/indexnow/route.ts` + `lib/seo-ping.ts` helper | ✅ |
| SEO3.3 | IndexNow hooks | `createJobAction` + `createExternalJobAction` + `approveJobAction` → ping | ✅ |
| SEO3.4 | IndexNow key | `INDEXNOW_KEY` env var + `public/[key].txt` | ⏳ შენზეა |

### SEO4 — Structured Data (Root-level schemas)

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| SEO4.1 | Organization schema | Root layout — Organization + logo + sameAs | ✅ |
| SEO4.2 | BreadcrumbList | Job detail — Home > Jobs > Category > Title | ✅ |
| SEO4.3 | WebSite SearchAction | Root layout — SearchAction for sitelinks search box | ✅ |

### SEO5 — არაკოდური (შენზეა)

| # | ამოცანა | დეტალი | სტატუსი |
|---|---------|--------|---------|
| SEO5.1 | Google Search Console | verification + sitemap submit + performance monitoring | ⏳ შენზეა |
| SEO5.2 | Bing Webmaster Tools | registration + IndexNow API key | ⏳ შენზეა |
| SEO5.3 | Google Business Profile | dasaqmdi.com registration | ⏳ შენზეა |
| SEO5.4 | Rich Results Test | https://search.google.com/test/rich-results — job URLs test | ⏳ შენზეა |
| SEO5.5 | External jobs content | 50+ ვაკანსია jobs.ge/hr.ge-დან full description-ებით | ⏳ შენზეა |
| SEO5.6 | Backlinks | University career centers, Georgian job review sites, forums | ⏳ long-term |

### შესრულების თანმიმდევრობა

```
SEO1 (Schema) → SEO3 (Sitemap + IndexNow) → SEO4 (Structured Data) → SEO2 (Landing Pages)
```

**პრიორიტეტი**: SEO1 — ყველაზე სწრაფი (1-2 საათი), Google Jobs widget-ში 1 კვირაში. SEO2 — ყველაზე impact-იანი (50+ pages), 2-4 კვირაში traffic. SEO5 პარალელურად.

### მოსალოდნელი შედეგი

| ვადა | შედეგი |
|---|---|
| 1 კვირა | JSON-LD სრული → Google Jobs widget |
| 2 კვირა | Sitemap + IndexNow → სწრაფი indexing |
| 1 თვე | Landing pages → "ვაკანსიები თბილისში" queries |
| 2 თვე | 100+ external jobs → Domain Authority ↑ |
| 3 თვე | "ვაკანსიები" / "დასაქმება" — Google page 1 |
