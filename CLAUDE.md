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

### Next.js 14 Conventions (CRITICAL)

- `cookies()` from `next/headers` is **synchronous** — do NOT use `await cookies()`
- `createClient()` in `lib/supabase/server.ts` is a **synchronous** function — do NOT use `await createClient()`
- `params` and `searchParams` in Page/Layout components are **plain objects** — do NOT use `Promise<>` or `await params`
- Config file is `next.config.mjs` (NOT `.ts` — Next.js 14 does not support TypeScript config)
- ESLint uses `.eslintrc.json` (NOT flat config `eslint.config.mjs`)
- `useFormState` imported from `react-dom` (React 18 via Next.js shim)

### Zod 3 Conventions

- Error access: `parsed.error.issues[0].message`
- Enum errors: `{ required_error: "...", invalid_type_error: "..." }` (NOT `{ message }`)
- Non-negative: `.nonnegative()` or `.min(0)` — both work
- `.partial()` only works on `ZodObject`, NOT on `ZodEffects` (refined schemas) — extract base schema first

---

## Design System — "Quiet Design"

### Philosophy

- **Less is more**: No jarring colors, no cluttered layouts. Every element earns its place.
- **Calm & professional**: Sophisticated Slate palette with soft Indigo accent only for primary actions.
- **Typography first**: Geist Sans for Latin, Noto Sans Georgian for Georgian. Generous `leading` and `tracking-tight`.
- **Whitespace is a tool**: Ample padding (`p-5`, `py-8`, `gap-3`) — let content breathe.
- **Subtle interactivity**: `shadow-sm` on cards, `rounded-xl` borders, `duration-200` transitions on hover.

### Color Palette (CSS variables in HSL — `globals.css`)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | Slate 50 | Slate 900 | Page background |
| `--card` | White | Slate 800 | Card surfaces |
| `--primary` | Indigo 500 | Indigo 400 | CTA buttons, active links, focus rings |
| `--muted-foreground` | Slate 500 | Slate 400 | Secondary text, metadata, icons |
| `--border` | Slate 200 | Slate 700 | Dividers, card borders (`border-border/60` for subtlety) |
| `--destructive` | Red 500 | Red 800 | Errors, expired badges |

### Typography

- **Font stack**: `font-sans` → Geist Sans → Noto Sans Georgian → system-ui
- **Title** (Job Card): `text-[15px] font-semibold leading-snug` — stands out clearly
- **Body/metadata**: `text-sm text-muted-foreground` — secondary, elegant
- **Page headings**: `text-xl font-semibold tracking-tight`
- **Badges**: `text-xs font-normal` — informational, not loud

### Component Guidelines

- **Cards**: `rounded-xl border border-border/60 bg-card p-5 shadow-sm` + `hover:shadow-md hover:border-border`
- **Header**: Sticky, `backdrop-blur-lg bg-background/80` for frosted glass effect
- **Buttons**: shadcn defaults + `rounded-lg` for consistency with `--radius: 0.75rem`
- **Empty states**: `border-dashed rounded-xl py-20` — calm, not alarming
- **Staggered entry**: `animate-fade-in` with per-item `animationDelay` (50ms intervals)

### Visual Hierarchy (CRITICAL)

When building any UI component, always enforce this priority order:
1. **Primary**: Job title, main heading — `font-semibold text-foreground`
2. **Secondary**: Company name, salary — `text-sm text-foreground` or `font-semibold`
3. **Tertiary**: Location, dates, badges, metadata — `text-sm text-muted-foreground` with `opacity-60` icons
4. **Ambient**: Borders, dividers, backgrounds — `border-border/60`, `bg-muted/50`

### Dark/Light Mode

- Full **Dark/Light/System** toggle via `next-themes` with `attribute="class"`
- Theme toggle: `<ThemeSwitcher />` (`components/theme-switcher.tsx`)
- Color system uses CSS variables in HSL (configured in `globals.css`)
- shadcn/ui style: `new-york`, base: **Slate** with **Indigo** accent
- Every component MUST look balanced in both modes — test both before shipping

---

## i18n (Internationalization)

- **Default locale**: Georgian (`ka`) — no URL prefix
- **Secondary locale**: English (`en`) — shown as `/en/...`
- `localePrefix: "as-needed"` — only non-default locale gets prefix
- All UI strings live in `messages/ka.json` and `messages/en.json`
- Server Components: `await getTranslations("namespace")`
- Client Components: `useTranslations("namespace")`
- Translation keys are namespaced: `common`, `nav`, `home`, `jobs`, `categories`, `auth`, `profile`, `company`, `applications`, `dashboard`, `admin`, `errors`

---

## Project Structure

```
app/
├── layout.tsx                           # Root layout (metadata only, passes children)
├── globals.css                          # Global styles + CSS variables
└── [locale]/                            # i18n dynamic segment
    ├── layout.tsx                       # Locale layout (fonts, providers, i18n)
    ├── page.tsx                         # Homepage — direct job feed (no landing page)
    ├── (auth)/                          # Route group: public auth pages
    │   ├── layout.tsx                   # Centered card layout
    │   └── auth/
    │       ├── login/page.tsx
    │       ├── sign-up/page.tsx         # Includes role selection (seeker/employer)
    │       ├── sign-up-success/page.tsx
    │       ├── forgot-password/page.tsx
    │       ├── update-password/page.tsx
    │       ├── error/page.tsx
    │       └── confirm/route.ts         # Email confirmation handler
    ├── (public)/                        # Route group: public pages (no auth)
    │   ├── jobs/
    │   │   ├── page.tsx                 # Job listing with search/filter
    │   │   └── [id]/page.tsx            # Job detail
    │   └── companies/
    │       ├── page.tsx                 # Company directory
    │       └── [slug]/page.tsx          # Company profile
    └── (dashboard)/                     # Route group: authenticated
        ├── layout.tsx                   # Auth guard + nav shell
        ├── dashboard/page.tsx           # Role-aware dashboard home
        ├── profile/page.tsx             # Edit own profile
        ├── seeker/
        │   └── applications/page.tsx    # My applications (with Seen tracking)
        ├── employer/
        │   ├── company/page.tsx         # Edit company
        │   │   └── new/page.tsx         # Create company
        │   └── jobs/
        │       ├── page.tsx             # My posted jobs (with expiry indicators)
        │       ├── new/page.tsx         # Create job
        │       └── [id]/
        │           ├── page.tsx         # Edit job
        │           └── applications/page.tsx  # Job applicants
        └── admin/
            ├── layout.tsx               # Admin guard
            ├── page.tsx                 # Admin dashboard
            ├── jobs/page.tsx            # Moderate jobs
            ├── users/page.tsx           # Manage users
            └── companies/page.tsx       # Manage companies

lib/
├── supabase/
│   ├── server.ts                        # Sync server client: createClient() (NO await)
│   ├── client.ts                        # Browser client
│   └── middleware.ts                    # Session refresh for middleware
├── actions/                             # "use server" mutations
│   ├── auth.ts                          # Login, signup, logout, password reset
│   └── applications.ts                  # markViewed, deleteApplication
├── queries/                             # Pure reads for Server Components
│   ├── jobs.ts                          # getJobs (paginated, filtered), getJobById
│   └── applications.ts                  # getMyApplications
├── types/
│   ├── database.ts                      # Supabase table types (Row/Insert/Update)
│   ├── enums.ts                         # Const arrays + inferred types
│   └── index.ts                         # Derived + joined types, ActionResult
└── validations/
    ├── auth.ts                          # Login, signup, password schemas
    ├── job.ts                           # Job create/update schemas (includes tags)
    ├── profile.ts                       # Profile update schema
    ├── company.ts                       # Company create/update schemas
    └── application.ts                   # Apply + status update schemas

components/
├── ui/                                  # shadcn/ui primitives
├── layout/                              # Header, Footer, LanguageSwitcher
├── jobs/                                # JobCard, JobList, Pagination
├── applications/                        # ApplicationStatusBadge, DeleteApplicationButton
└── shared/                              # SubmitButton, reusable components
```

---

## Database Schema

**Single migration file**: `supabase/migrations/001_initial_schema.sql`

### Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `profiles` | Extends auth.users | id (FK), role, full_name, full_name_ka, **skills[]**, resume_url |
| `categories` | Job categories (seeded, 6 rows) | slug, name_en, name_ka |
| `companies` | Employer companies | owner_id (FK), name, slug, is_verified |
| `jobs` | Job listings | company_id, category_id, title, job_type, status, salary_min/max, **expires_at**, **tags[]** |
| `applications` | Job applications | job_id, applicant_id, resume_url, status, **is_viewed**, **viewed_at** |

### Enums

- `job_type`: full-time, part-time, contract, internship, remote
- `job_status`: draft, active, closed, archived
- `application_status`: pending, reviewed, shortlisted, rejected, accepted

### User Roles

- **seeker**: Browse jobs, apply, manage own applications, delete expired apps
- **employer**: Create company, post jobs, review applicants, renew expired jobs
- **admin**: Moderate everything, verify companies, manage users

### RLS Summary

- Profiles: public read, owner update, admin update any
- Categories: public read, admin manage
- Companies: public read, employer owner CRUD, admin manage any
- Jobs: active jobs public read, employer owner CRUD, admin manage any
- Applications: seeker sees/deletes own, employer sees/updates own-job apps, admin sees all

### Key Triggers

- `on_auth_user_created` → auto-creates profile row with role from `raw_user_meta_data`
- `jobs_set_expires_at` → on INSERT, sets `expires_at = created_at + 30 days` if not provided
- `*_updated_at` → auto-sets `updated_at = now()` on UPDATE

### Key Indexes

- `idx_profiles_skills` — GIN on `profiles.skills` (future matching)
- `idx_jobs_tags` — GIN on `jobs.tags` (future matching)
- `idx_jobs_search` — GIN full-text on `title + description`
- `idx_jobs_expires_at` — B-tree for freshness filter
- `idx_jobs_deadline` — partial B-tree where deadline IS NOT NULL
- `idx_applications_viewed` — B-tree for seen-tracking queries

---

## Business Rules

### 1. Smart Visibility (Job Feed)

- **Deadline filter**: Homepage query excludes jobs where `application_deadline < now()`. Jobs with no deadline always shown.
- **Freshness filter**: Homepage query also excludes jobs where `expires_at < now()`.
- **Query location**: `lib/queries/jobs.ts` → `.gte("expires_at", now).or("application_deadline.is.null,application_deadline.gte.{now}")`

### 2. 30-Day Freshness Rule

- **DB field**: `jobs.expires_at` — defaults to `created_at + 30 days`
- **Auto-set**: DB trigger ensures `expires_at` is always populated
- **Feed**: Expired jobs disappear from public feed but remain in employer's dashboard
- **Employer dashboard**: Jobs past `expires_at` show red "Expired" badge + "Renew for 30 days" button
- **Renew action**: Server Action sets `expires_at = now() + 30 days`

### 3. Application Tracking ("Seen" Feature)

- **DB fields**: `applications.is_viewed` (boolean, default false) + `applications.viewed_at` (timestamptz)
- **Trigger**: Employer opens application detail → `markApplicationViewedAction()` sets `is_viewed=true, viewed_at=now()`
- **Seeker UI**: Green dot + "Seen" label when `is_viewed=true` and status is still `pending`
- **Status precedence**: `reviewed`/`shortlisted`/`accepted`/`rejected` override "Seen" display

### 4. Expired Job Handling (Seeker Side)

- **Detection**: `isJobExpired()` checks `application_deadline < now()` OR `job.status !== 'active'`
- **Visual**: Red left-border + red background tint + "Expired" badge
- **Cleanup**: "Delete" button on expired rows → `deleteApplicationAction()` (RLS: `applicant_id = auth.uid()`)

### 5. Structured Tags (Matching Foundation)

- **DB**: `jobs.tags TEXT[]` + `profiles.skills TEXT[]` — both GIN-indexed
- **Validation**: `tags` in `createJobSchema` — array of up to 20 strings, max 50 chars each
- **Purpose**: Foundation for Phase 5 Smart Matching (array intersection score)

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Conventions

### Separation of Concerns

- `lib/actions/` — `"use server"` mutations with Zod validation
- `lib/queries/` — Pure read functions for Server Components (no `"use server"`)
- `lib/validations/` — Zod schemas shared between client forms and server actions
- `components/` — UI only, no direct Supabase calls

### Patterns

- Server Components by default; Client Components only for interactivity
- All form mutations use Server Actions + `useFormState` + `useFormStatus`
- All actions validate with Zod before executing
- Bilingual fields: `field` (English) + `field_ka` (Georgian)
- `ActionResult<T>` type for all action return values: `{ error: string | null; data?: T }`
- `createClient()` — server Supabase client is **synchronous** (no await)
- `params` / `searchParams` — plain objects (no await, no Promise)

---

## Roadmap

### Phase 0: Foundation [DONE]
- [x] Supabase SSR setup (server/client/middleware)
- [x] Authentication (login, signup with role, logout, password reset)
- [x] next-intl i18n (ka/en, routing, messages)
- [x] Theme provider (dark/light/system toggle)
- [x] Consolidated DB schema (profiles, categories, companies, jobs, applications)
- [x] Type system (database.ts, enums.ts, index.ts)
- [x] Zod validation schemas (auth, job, profile, company, application)
- [x] App directory restructure ([locale], route groups)
- [x] Middleware (Supabase session + next-intl chaining)
- [x] Layout components (Header, Footer, LanguageSwitcher)
- [x] Quiet Design system (globals.css, Slate+Indigo palette)
- [x] Pinned to Next.js 14.2.15 (stable)

### Phase 1: Profiles & Companies [TODO]
- [ ] Dashboard layout (sidebar, header, role-aware nav)
- [ ] Profile CRUD (queries + actions + form)
- [ ] Company CRUD (queries + actions + form)
- [ ] File uploads (Supabase Storage: avatars, resumes, logos)

### Phase 2: Jobs [IN PROGRESS]
- [x] Homepage as direct job feed (20/page, sorted by created_at DESC)
- [x] Job query layer with pagination, filters, deadline+freshness exclusion
- [x] JobCard component (Quiet Design: logo, title, company, salary, dates)
- [x] JobList component (staggered fade-in, dashed empty state)
- [x] Pagination component (page numbers, prev/next, query params preserved)
- [ ] Job detail page (`/jobs/[id]`) with SEO metadata
- [ ] Job CRUD for employers (create/edit/close/renew)
- [ ] Public company pages

### Phase 3: Applications & Tracking [IN PROGRESS]
- [x] Smart Visibility: deadline + freshness filter on job feed
- [x] Application tracking schema: `is_viewed`, `viewed_at` fields
- [x] `markApplicationViewedAction()` — employer marks as seen
- [x] `deleteApplicationAction()` — seeker cleans up expired
- [x] Seeker dashboard (`/seeker/applications`) — full tracking UI
- [x] ApplicationStatusBadge — green dot for "Seen", color-coded statuses
- [x] Expired job visual: red row highlight + "Expired" badge + Delete button
- [ ] Apply to job (resume upload + cover letter form)
- [ ] Employer: review applicants per job (trigger markViewed)
- [ ] Employer dashboard: expired jobs red indicator

### Phase 4: Admin & Polish [TODO]
- [ ] Admin dashboard (stats, moderation)
- [ ] Admin: manage users, jobs, companies
- [ ] 30-Day Freshness: "Renew for 30 days" button in employer dashboard
- [ ] Loading states (Skeleton) + error boundaries
- [ ] SEO: generateMetadata on key pages
- [ ] Responsive design pass (mobile-first)

### Phase 5: Intelligence [FUTURE]

**Smart Matching Engine**
- [ ] Matching algorithm: compare `profiles.skills[]` vs `jobs.tags[]` via array intersection
- [ ] Compatibility score: `(matched_tags / total_job_tags) * 100` → percentage
- [ ] Seeker UI: "85% Match" badge on job cards when logged in
- [ ] Job detail: "Your matching skills: React, TypeScript" highlight
- [ ] Employer UI: sort applicants by match % in applicant review page

**AI Job Assistant**
- [ ] Integration: Vercel AI SDK (`ai` package) with Claude/OpenAI provider
- [ ] Employer UX: "Draft with AI" button on job creation form
- [ ] Input: job title, seniority level, 3-5 core skills
- [ ] Output: structured job description in both EN and KA
- [ ] Streaming: `useCompletion()` for real-time text generation
