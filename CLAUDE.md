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
ფა| Fonts | Geist Sans (Latin) + Noto Sans Georgian | `geist` + Google Fonts |

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
    ├── page.tsx                         # Homepage (hero, categories)
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
        │   └── applications/page.tsx    # My applications
        ├── employer/
        │   ├── company/page.tsx         # Edit company
        │   │   └── new/page.tsx         # Create company
        │   └── jobs/
        │       ├── page.tsx             # My posted jobs
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
│   ├── jobs.ts                          # getJobs (paginated), getJobById
│   └── applications.ts                  # getMyApplications
├── types/
│   ├── database.ts                      # Supabase table types (Row/Insert/Update)
│   ├── enums.ts                         # Const arrays + inferred types
│   └── index.ts                         # Derived + joined types, ActionResult
└── validations/
    ├── auth.ts                          # Login, signup, password schemas
    ├── job.ts                           # Job create/update schemas
    ├── profile.ts                       # Profile update schema
    ├── company.ts                       # Company create/update schemas
    └── application.ts                   # Apply + status update schemas

components/
├── ui/                                  # shadcn/ui primitives
├── layout/                              # Header, Footer, LanguageSwitcher
├── shared/                              # SubmitButton, reusable components
└── (feature components to be created)
```

---

## Database Schema

### Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `profiles` | Extends auth.users | id (FK), role, full_name, full_name_ka, skills[], resume_url |
| `categories` | Job categories (seeded) | slug, name_en, name_ka |
| `companies` | Employer companies | owner_id (FK), name, slug, is_verified |
| `jobs` | Job listings | company_id, category_id, title, job_type, status, salary_min/max, expires_at, tags[] |
| `applications` | Job applications | job_id, applicant_id, resume_url, status, is_viewed, viewed_at |

### Enums

- `job_type`: full-time, part-time, contract, internship, remote
- `job_status`: draft, active, closed, archived
- `application_status`: pending, reviewed, shortlisted, rejected, accepted

### User Roles

- **seeker**: Browse jobs, apply, manage own applications
- **employer**: Create company, post jobs, review applicants
- **admin**: Moderate everything, verify companies, manage users

### RLS Summary

- Profiles: public read, owner update, admin update any
- Categories: public read, admin manage
- Companies: public read, owner CRUD, admin manage any
- Jobs: active=public read, owner CRUD, admin manage any
- Applications: seeker sees own, employer sees own-job apps, admin sees all

### Key Triggers

- `on_auth_user_created` → auto-creates profile row with role from `raw_user_meta_data`
- `*_updated_at` → auto-sets `updated_at = now()` on UPDATE

### Migration Files

- `supabase/migrations/001_initial_schema.sql` — base tables, RLS, triggers, seeds
- `supabase/migrations/002_application_tracking.sql` — `is_viewed`/`viewed_at` fields, deadline index, seeker delete policy
- `supabase/migrations/003_job_freshness_and_tags.sql` — `expires_at` (30-day rule), `tags[]`, GIN indexes, auto-set trigger

---

## Business Rules

### 1. Smart Visibility (Job Feed)

- **Deadline filter**: Homepage query excludes jobs where `application_deadline < now()`. Jobs with no deadline are always shown.
- **Auto-archive visual**: In employer dashboard, jobs past deadline show a red "Expired" badge. Status remains `active` in DB — employer manually closes it.
- **Query location**: `lib/queries/jobs.ts` → `.or('application_deadline.is.null,application_deadline.gte.{now}')`

### 2. Application Tracking ("Seen" Feature)

- **DB fields**: `applications.is_viewed` (boolean, default false) + `applications.viewed_at` (timestamptz, nullable)
- **Trigger**: When employer first opens application detail → Server Action `markApplicationViewedAction()` sets `is_viewed=true, viewed_at=now()` (only updates if `is_viewed=false`)
- **Seeker UI**: Green dot + "Seen" label when `is_viewed=true` and status is still `pending`
- **Status precedence**: If status is `reviewed`/`shortlisted`/`accepted`/`rejected`, show that status instead of "Seen"

### 3. Expired Job Handling (Seeker Side)

- **Detection**: `isJobExpired()` checks `application_deadline < now()` OR `job.status !== 'active'`
- **Visual**: Expired rows have red left-border + red background tint + "Expired" badge
- **Cleanup**: "Delete" button appears on expired rows — calls `deleteApplicationAction()` (RLS enforces `applicant_id = auth.uid()`)

### 4. 30-Day Freshness Rule

- **DB field**: `jobs.expires_at` (TIMESTAMPTZ, defaults to `created_at + 30 days`)
- **Auto-set trigger**: `jobs_set_expires_at` — on INSERT, sets `expires_at = created_at + 30 days` if not provided
- **Feed filter**: `lib/queries/jobs.ts` adds `.gte("expires_at", now())` — expired jobs disappear from public feed
- **Employer dashboard**: Jobs past `expires_at` show red "Expired" state + "Renew for 30 days" button
- **Renew action** (to build): Server Action sets `expires_at = now() + 30 days`, `status = 'active'`
- **No auto-archive in DB**: Status stays `active` — visibility is controlled by the query filter. Employer can manually archive or renew.

### 5. Structured Tags (Matching Foundation)

- **DB fields**: `jobs.tags TEXT[]` (skills/keywords per job) + `profiles.skills TEXT[]` (already exists)
- **GIN indexes**: On both `jobs.tags` and future queries using `@>` containment
- **Validation**: `tags` field in `createJobSchema` — array of up to 20 strings, max 50 chars each
- **Purpose**: Foundation for Phase 5 Smart Matching Engine. Employers tag jobs with skills; seekers have skills in profile. Matching = array intersection score.

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

### Phase 0: Foundation
- [x] Supabase SSR setup (server/client/middleware)
- [x] Authentication (login, signup with role, logout, password reset)
- [x] next-intl i18n (ka/en, routing, messages)
- [x] Theme provider (dark/light/system toggle)
- [x] Database schema SQL (profiles, categories, companies, jobs, applications)
- [x] Type system (database.ts, enums.ts, index.ts)
- [x] Zod validation schemas (auth, job, profile, company, application)
- [x] App directory restructure ([locale], route groups)
- [x] Middleware (Supabase session + next-intl chaining)
- [x] Layout components (Header, Footer, LanguageSwitcher)
- [x] CLAUDE.md created
- [x] Pinned to Next.js 14.2.15 (stable)

### Phase 1: Profiles & Companies
- [ ] Dashboard layout (sidebar, header, role-aware nav)
- [ ] Profile CRUD (queries + actions + form)
- [ ] Company CRUD (queries + actions + form)
- [ ] File uploads (Supabase Storage: avatars, resumes, logos)

### Phase 2: Jobs (PRIMARY GOAL)
- [x] Homepage as direct job feed (no landing page — immediate vacancy list)
- [x] Job query layer (`lib/queries/jobs.ts`) with pagination, filters, sorting
- [x] JobCard component (logo, title, company, salary, dates — row layout)
- [x] JobList component (bordered list with empty state)
- [x] Pagination component (page numbers, prev/next, query param preservation)
- [ ] Job detail page (`/jobs/[id]`) with SEO metadata
- [ ] Job CRUD for employers (create/edit/close)
- [ ] Public company pages

### Phase 3: Applications & Tracking
- [x] Smart Visibility: deadline filter on job feed (expired jobs hidden)
- [x] Application tracking schema: `is_viewed`, `viewed_at` fields + migration
- [x] `markApplicationViewedAction()` — employer marks as seen
- [x] `deleteApplicationAction()` — seeker cleans up expired
- [x] Seeker dashboard (`/seeker/applications`) — full tracking UI
- [x] ApplicationStatusBadge — green dot for "Seen", color-coded statuses
- [x] Expired job visual: red row highlight + "Expired" badge + Delete button
- [ ] Apply to job (resume upload + cover letter form)
- [ ] Employer: review applicants per job (trigger markViewed)
- [ ] Employer dashboard: expired jobs red indicator

### Phase 4: Admin & Polish
- [ ] Admin dashboard (stats, moderation)
- [ ] Admin: manage users, jobs, companies
- [ ] 30-Day Freshness: "Renew for 30 days" button in employer dashboard
- [ ] Employer dashboard: expired jobs red indicator (expires_at < now)
- [ ] Loading states (Skeleton) + error boundaries
- [ ] SEO: generateMetadata on key pages
- [ ] Responsive design pass (mobile-first)

### Phase 5: Intelligence (Long-term)

**Smart Matching Engine**
- [ ] Matching algorithm: compare `profiles.skills[]` vs `jobs.tags[]` via array intersection
- [ ] Compatibility score: `(matched_tags / total_job_tags) * 100` → percentage
- [ ] Seeker UI: "85% Match" badge on job cards when logged in
- [ ] Job detail: "Your matching skills: React, TypeScript" highlight
- [ ] Employer UI: sort applicants by match % in applicant review page
- [ ] Future: weight by experience_years, category preference, location proximity

**AI Job Assistant**
- [ ] Integration: Vercel AI SDK (`ai` package) with Claude/OpenAI provider
- [ ] Employer UX: "Draft with AI" button on job creation form
- [ ] Input: job title, seniority level, 3-5 core skills
- [ ] Output: structured job description (responsibilities, requirements, benefits) in both EN and KA
- [ ] Streaming: use `useChat()` or `useCompletion()` for real-time text generation
- [ ] Guard: AI-generated text is always editable before publishing
