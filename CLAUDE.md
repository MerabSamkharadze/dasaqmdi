# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚡ სამუშაო პრინციპი (CRITICAL — ყოველთვის დაიცავი)

**ყველა ტასკი HIGH EFFORT-ით შეასრულე — თუნდაც მცირე და უმნიშვნელო ჩანდეს.**

- არასოდეს იჩქარო. ყოველთვის გაიარე სრული ციკლი: დაგეგმე → იმპლემენტირე → შეამოწმე → რევიუ
- კოდის წერამდე გაიაზრე არსებული არქიტექტურა, naming conventions და design patterns
- ყოველი ფაილის შეცვლის შემდეგ: TypeScript check, i18n consistency, ლოგიკური რევიუ
- `window.confirm()` / `window.alert()` არასოდეს — ყოველთვის shadcn `AlertDialog`
- `<script>` tag-ები არასოდეს პირდაპირ JSX-ში — ყოველთვის `next/script` `<Script>` component
- Hardcoded strings არასოდეს — i18n keys ან `siteConfig`
- ტესტირებადი edge cases-ზე ყოველთვის იფიქრე: empty data, null values, expired dates
- შეცდომა რომ დაუშვა — აღიარე, გაასწორე და მიზეზი ახსენი

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
| Auth | Supabase Auth + @supabase/ssr + OAuth (Google, Facebook, LinkedIn) | ^0.5.2 |
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
| Rankings | TOP.GE | Georgian website rating counter |
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
- Namespaces: `common`, `nav`, `home`, `jobs`, `categories`, `auth`, `profile`, `company`, `applications`, `dashboard`, `admin`, `errors`, `salaries`, `pricing`, `about`, `cookies`
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
├── auth/
│   └── callback/route.ts                   # OAuth callback (outside [locale] — no middleware interference)
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
│   │   ├── about/page.tsx                  # About page (public, all roles)
│   │   └── privacy/page.tsx                # Privacy Policy (bilingual, public)
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
│   ├── job-filters.tsx                     # Search + city (debounce 2000ms via SEARCH_DEBOUNCE_MS), category, type dropdowns
│   ├── pagination.tsx                      # Page numbers with query params preserved
│   ├── share-job-button.tsx                # Dropdown: copy, Facebook, LinkedIn, X, WhatsApp
│   ├── bookmark-button.tsx                 # Save/unsave with auth modal for guests
│   ├── apply-button.tsx                    # Apply with auth modal for guests
│   ├── top-matches.tsx                     # "Picked for You" section
│   ├── view-tracker.tsx                    # Increment job views + Facebook Pixel ViewContent
│   ├── vip-spotlight.tsx                   # Homepage VIP jobs horizontal section
│   ├── vip-carousel.tsx                    # Infinite auto-scroll carousel (drag + momentum + loop)
│   └── vip-card.tsx                        # VIP job card for carousel
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
    ├── verified-badge.tsx                  # Gold star SVG verified badge + heartbeat hover
    ├── vip-badge.tsx                       # Gold/Silver star VIP badge
    └── cookie-consent.tsx                  # Cookie consent banner (Accept/Decline + localStorage)
├── auth/
│   ├── google-auth-button.tsx              # Google OAuth button
│   ├── facebook-auth-button.tsx            # Facebook OAuth button
│   └── linkedin-auth-button.tsx            # LinkedIn OAuth button
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
| `jobs` | company_id, category_id, title, job_type, status, salary_min/max, expires_at, tags[], is_featured, external_url, external_source, vip_level, vip_until |
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
017_external_jobs.sql            # external_url, external_source + system company "dasaqmdi"
018_vip_jobs.sql                 # vip_level, vip_until + index
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
11. **Feature Gating** (Phase 21): Plans `free`/`pro`/`verified` in DB → **Starter** (0₾, 2 active jobs) / **Business** (79₾/mo, 790₾/yr, unlimited + AI + match + 1 featured slot + analytics) / **Pro** (199₾/mo, 1990₾/yr, everything + verified badge + 3 featured slots + custom email templates). Helpers in `lib/subscription-helpers.ts`: `STARTER_JOB_LIMIT`, `canPostJob`, `canUseAIDraft`, `canSeeMatchScores`, `getFeaturedSlotLimit`. Analytics gated to Business+, email templates gated to Pro (verified) only. See "Monetization Model" section for full Boost + Featured mechanics.
12. **Company website**: Auto-prefix `https://` if missing
13. **Job Moderation**: `MODERATION_ENABLED` env var (default false). When true, new jobs start as `pending` → admin approves/rejects. Telegram notify only on approve
14. **AI Draft**: Also suggests best-matching category + 10-15 skill tags
15. **OG Images**: Route Handler at `/api/og/job/[id]` (not metadata convention — Next.js 14 route group bug workaround)
16. **Facebook Pixel**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` env var. Events: PageView, ViewContent, CompleteRegistration, Lead, JobPosted (custom)
17. **Admin Audit Log**: All admin actions (verify, role change, approve, reject, delete, vip upgrade) auto-logged to `admin_logs` table
18. **External Jobs**: Admin-only. `external_url` + `external_source` fields. System company "dasaqmdi" (slug). Apply → external link. Source badge on card
19. **VIP/Premium Jobs (Boost)** (Phase 21): Self-service one-time purchase via Lemon Squeezy, independent of subscription. `vip_level` (normal/silver/gold) + `vip_until`. Silver = 30₾ / 7 days, Gold = 80₾ / 14 days. Feed sorting: gold → silver → featured → normal. VipSpotlight carousel on homepage (gold only). Entry via `<VipBoostButton>` on employer job actions; checkout flow in `lib/actions/vip-boost.ts`; webhook applies `vip_level`/`vip_until` on `order_created` event + logs to `admin_logs` for audit. Admin can still upgrade/remove manually via `<AdminVipButton>`. See "Monetization Model" for Boost vs Featured distinction.
20. **SEO Landing Pages**: `/jobs/explore/[slug]` — 18 pages (4 cities + 3 types + 11 categories). `lib/seo-landings.ts` config. Sitemap included
21. **IndexNow**: Auto-ping Bing/Yandex on job publish/approve (`lib/seo-ping.ts`)
22. **Cookie Consent**: Banner with Accept/Decline. `localStorage` key `cookie-consent`. Tracking works regardless (non-EU site)
23. **TOP.GE Counter**: Site ID 118671. Script in layout, counter div in footer (must be visible per rules)
24. **OAuth**: Google + Facebook + LinkedIn. Callback at `/auth/callback` (outside [locale]). Middleware redirects `?code=` params to callback. Sign-up Google/FB/LinkedIn — seeker only (employer must use email). Login — all providers
25. **Privacy Policy**: `/privacy` — 8 sections, bilingual, contact: samkharadzemerab@gmail.com
26. **Supabase Email Templates**: Branded HTML (dark bg, gold accent, SVG logo) for: Confirm signup, Reset password, Invite user

---

## Monetization Model — Plans, Boost, Featured (Phase 21)

### Subscription Plans (recurring)

DB enum values `free`/`pro`/`verified` mapped to UI labels **Starter**/**Business**/**Pro**. Label mapping lives in `messages/*.json` under `billing.planLabel` — never rename the DB enum.

| UI label | DB value | Monthly | Yearly (−2 mo) | Audience | Features |
|---|---|---|---|---|---|
| **Starter** | `free` | 0₾ | — | Occasional hiring | 2 active jobs, basic posting |
| **Business** | `pro` | 79₾ | 790₾ | Regular recruiting | Unlimited jobs, AI draft, match scores, **1 featured slot**, employer analytics |
| **Pro** | `verified` | 199₾ | 1990₾ | Active HR teams | Everything in Business + verified badge + **3 featured slots** + custom email templates |

Yearly toggle hides automatically if `LEMONSQUEEZY_*_ANNUAL_VARIANT_ID` env vars are missing — see `hasAnnualVariants()` in `lib/lemonsqueezy.ts`.

Legacy subscribers (on old variant IDs) keep their grandfathered price — Lemon Squeezy handles this at the subscription level. UI surfaces a `Legacy pricing` badge via `isLegacyVariant()`.

### Two Independent Premium-Visibility Mechanisms

There are **two separate ways** an employer can make a job more visible. They layer independently.

#### 1. ⭐ Featured (subscription benefit, persistent)

- **What**: Mark a job as `is_featured = true`. Shown with a star badge; sorted above normal listings in the feed.
- **Cost**: Included in subscription — no extra charge.
- **Limit**: Plan-gated slot count — Starter 0, Business 1, Pro 3. Enforced in `toggleJobFeaturedAction` via `getFeaturedSlotLimit(plan)`.
- **Duration**: Active for as long as the subscription is active. Cleared on `subscription_expired`.
- **UX**: ⭐ Star icon in `JobActionButtons` on `/employer/jobs`. Click toggles on/off. Over-limit returns a clear error.
- **Webhook reconciliation** (`app/api/webhooks/lemonsqueezy/route.ts`):
  - `subscription_created` with 0 currently featured → welcome-feature the N newest active jobs
  - `subscription_updated` with over-limit (e.g. downgrade Pro → Business) → keeps the N newest, unfeatures the rest
  - Otherwise leaves user's choices untouched
- **Storage**: `jobs.is_featured` (boolean)

#### 2. ✨ Boost / VIP (one-time purchase, time-boxed)

- **What**: Pay-per-job premium placement that sits **above Featured** in the feed sort order. Available to anyone — subscription not required.
- **Tiers**:
  - 🥈 **Silver** — 30₾ for 7 days — VIP placement in the jobs feed
  - 🥇 **Gold** — 80₾ for 14 days — top placement + appears in the Hero VipSpotlight carousel on the homepage
- **Checkout**: `createVipBoostCheckoutAction(jobId, level)` opens a Lemon Squeezy one-time-product checkout. Custom data `{ type: "vip_boost", job_id, level, user_id }` flows through.
- **Activation**: `order_created` webhook (filtered by `custom_data.type === "vip_boost"`) sets `vip_level` + `vip_until = now + VIP_CONFIG[level].days`. Variant-vs-level sanity check via `variantToVipLevel()`; mismatched payload returns 400. On success, logs `boost_purchased` to `admin_logs` for revenue audit.
- **UX**: ✨ Sparkles button in `JobActionButtons`. Dialog offers both tiers with a "Best value" hint on Gold. If a boost is already active, shows disabled state "VIP until {date}" instead of a new purchase flow. Post-checkout redirect lands on `/employer/jobs?boost=success` which renders a confirmation banner.
- **Storage**: `jobs.vip_level` (`normal`/`silver`/`gold`) + `jobs.vip_until` (timestamp). Active state checked via `isVipActive()` (`lib/vip.ts`).

#### Feed Sort Priority

```
🥇 Gold VIP  (boost, 14d)    → highest
🥈 Silver VIP (boost, 7d)
⭐ Featured  (subscription, persistent)
📋 Normal                      → default
```

Implementation: query order in `getJobsCached()` (`lib/queries/jobs.ts`) — VIP sorted first with client-side re-sort to handle expired `vip_until`, then `is_featured`, then `created_at DESC`.

#### Strategic Positioning

- **Business/Pro subscription + Featured**: cheaper at scale for regular recruiting (pay once per month, feature N jobs indefinitely).
- **Boost** (Silver or Gold): best for a single standout job; the **only way to reach the homepage Hero carousel** is Gold Boost.
- Layering: an employer on Pro can have 3 Featured AND any number of Boosts — independent systems.

### Revenue Audit Trail

Every `order_created` webhook for a VIP boost writes to `admin_logs`:
- `action = "boost_purchased"`
- `actor_id = user_id`, `target_type = "job"`, `target_id = jobId`
- `metadata = { level, days, order_id, total_amount, currency }`

Viewable in `/admin/logs`. Lemon Squeezy's own order history remains the source of truth for financial reporting; the audit log is for correlating boosts to specific jobs/users in the product.

### Employer Analytics (Business+)

`/employer/analytics` — funnel stats (views → applications → accepted + rates), 30-day trends (jobs posted, applications received), top 5 jobs by applications/views. Plan-gated: Starter sees an upsell card. Data aggregated in TypeScript from `jobs` + `applications` (no employer-scoped RPCs needed).

### Upsell Touchpoints

- `/employer/jobs/new` — Starter at 2-job limit sees upsell card (Upgrade vs Boost), form is not rendered
- `/employer/email-templates` — non-Pro sees upsell card
- `/employer/analytics` — non-Business+ sees upsell card
- Pricing page (`/pricing`) — Monthly/Yearly toggle with "−2 months" badge on yearly; Boost info banner below the tier grid
- Billing page (`/employer/billing`) — "Active Boosts" card listing currently-active VIP jobs with expiry dates

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
LEMONSQUEEZY_PRO_VARIANT_ID=<variant-id>                          # Business plan, monthly (79₾)
LEMONSQUEEZY_VERIFIED_VARIANT_ID=<variant-id>                     # Pro plan, monthly (199₾)
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=<variant-id>                   # Business plan, yearly (790₾) — optional; hides toggle if absent
LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID=<variant-id>              # Pro plan, yearly (1990₾) — optional; hides toggle if absent
LEMONSQUEEZY_VIP_SILVER_VARIANT_ID=<one-time-product-variant-id>  # 30₾ Silver boost (7 days)
LEMONSQUEEZY_VIP_GOLD_VARIANT_ID=<one-time-product-variant-id>    # 80₾ Gold boost (14 days)
MODERATION_ENABLED=false
INDEXNOW_KEY=<bing-indexnow-key>
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
- **Phase 16**: External Job Aggregation (admin-only external jobs, system company "dasaqmdi", source badge, external link)
- **Phase 17**: SEO & Search Dominance (JSON-LD enhancement, BreadcrumbList, Organization/WebSite schemas, IndexNow, 18 SEO landing pages, sitemap expansion)
- **Phase 18**: VIP/Premium Jobs (gold/silver levels, 14-day duration, VipSpotlight carousel, admin upgrade/remove, feed priority sorting)
- **Phase 19**: Cookie Consent Banner, TOP.GE counter integration, Google Search Console verification
- **Phase 20**: OAuth (Google + Facebook + LinkedIn sign-in), Privacy Policy page, OAuth callback handler, Supabase email templates (branded)
- **Phase 21**: Pricing overhaul — tier rename (Free→Starter 2 jobs, Pro→Business 79₾, Verified→Pro 199₾), annual billing toggle (2 months free), VIP Boost self-service (Silver 30₾/7d + Gold 80₾/14d one-time), employer analytics dashboard (views/applications funnel + trends + top jobs), legacy pricing grandfathering badge

### Domain: `www.dasaqmdi.com` (Vercel)
### Bot: `@dasaqmdi_bot` (Telegram)

---

## დარჩენილი ამოცანები

### Lemon Squeezy Setup (შენზე — Phase 21 სრულყოფისთვის)

| Task | დეტალი | სტატუსი |
|---|---|---|
| Silver Spotlight one-time product | LS-ში შექმნა, 30₾, env: `LEMONSQUEEZY_VIP_SILVER_VARIANT_ID` | ⏳ |
| Gold Premium one-time product | LS-ში შექმნა, 80₾, env: `LEMONSQUEEZY_VIP_GOLD_VARIANT_ID` | ⏳ |
| Business annual variant | 790₾/yr subscription variant, env: `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` (optional — toggle hides if missing) | ⏳ |
| Pro annual variant | 1990₾/yr subscription variant, env: `LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID` (optional) | ⏳ |
| Webhook event `order_created` | LS Dashboard → Webhooks → ჩართე ეს event | ⏳ |
| Env vars Vercel-ზე | ოთხივე ცვლადი production-ში | ⏳ |

### Pending Migrations (Supabase SQL Editor-ში გასაშვები)

| Migration | აღწერა |
|---|---|
| `017_external_jobs.sql` | external_url, external_source columns + system company |
| `018_vip_jobs.sql` | vip_level, vip_until columns + index |
| `019_storage_policies.sql` | RLS policies for avatars / company-logos / resumes buckets (owner-write, public/owner-read) |

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
