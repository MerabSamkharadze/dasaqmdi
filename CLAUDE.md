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
├── storage.ts                           # Supabase Storage upload/delete helpers
├── actions/                             # "use server" mutations
│   ├── auth.ts                          # Login, signup, logout, password reset
│   ├── applications.ts                  # markViewed, deleteApplication
│   ├── profile.ts                       # updateProfile
│   └── company.ts                       # createCompany, updateCompany
├── queries/                             # Pure reads for Server Components
│   ├── jobs.ts                          # getJobs (paginated, filtered), getJobById
│   ├── applications.ts                  # getMyApplications
│   ├── profile.ts                       # getProfile
│   └── companies.ts                     # getCompanyByOwner, getCompanyBySlug, getAll
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
├── dashboard/                           # DashboardSidebar, DashboardHeader, ProfileForm, CompanyForm
├── jobs/                                # JobCard, JobList, Pagination
├── applications/                        # ApplicationStatusBadge, DeleteApplicationButton
└── shared/                              # SubmitButton, FileUpload
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

## TypeScript Type System (`lib/types/`)

### Source Files

- `lib/types/database.ts` — Supabase-generated Row/Insert/Update types (mirrors SQL schema 1:1)
- `lib/types/enums.ts` — Const arrays + inferred union types
- `lib/types/index.ts` — Derived types, joined types, re-exports

### Enum Constants (`lib/types/enums.ts`)

```ts
USER_ROLES      = ["seeker", "employer", "admin"]          → type UserRole
JOB_TYPES       = ["full-time", "part-time", "contract", "internship", "remote"] → type JobType
JOB_STATUSES    = ["draft", "active", "closed", "archived"] → type JobStatus
APPLICATION_STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"] → type ApplicationStatus
SALARY_CURRENCIES = ["GEL", "USD", "EUR"]                  → type SalaryCurrency
EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "201-500", "500+"] → type EmployeeCount
LOCALES         = ["ka", "en"]                             → type Locale
```

### Row Types (what Supabase returns)

```ts
Profile {
  id: string                          // UUID, FK to auth.users
  role: "seeker" | "employer" | "admin"
  full_name: string | null
  full_name_ka: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  bio: string | null
  bio_ka: string | null
  skills: string[]                    // For Smart Matching (Phase 5)
  experience_years: number | null
  resume_url: string | null
  preferred_language: "ka" | "en"
  created_at: string                  // ISO timestamp
  updated_at: string
}

Category {
  id: number                          // SERIAL
  slug: string                        // "it-software", "finance", etc.
  name_en: string
  name_ka: string
}

Company {
  id: string                          // UUID
  owner_id: string                    // FK to profiles.id
  name: string
  name_ka: string | null
  slug: string                        // URL-safe unique identifier
  description: string | null
  description_ka: string | null
  logo_url: string | null             // Supabase Storage: company-logos bucket
  website: string | null
  city: string | null
  address: string | null
  address_ka: string | null
  employee_count: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

Job {
  id: string                          // UUID
  company_id: string                  // FK to companies.id
  posted_by: string                   // FK to profiles.id
  category_id: number                 // FK to categories.id
  title: string
  title_ka: string | null
  description: string
  description_ka: string | null
  requirements: string | null
  requirements_ka: string | null
  job_type: JobType
  city: string | null
  is_remote: boolean
  salary_min: number | null           // In salary_currency units
  salary_max: number | null
  salary_currency: "GEL" | "USD" | "EUR"
  tags: string[]                      // For Smart Matching (Phase 5)
  status: JobStatus
  application_deadline: string | null // ISO timestamp
  expires_at: string                  // Auto: created_at + 30 days
  views_count: number
  created_at: string
  updated_at: string
}

Application {
  id: string                          // UUID
  job_id: string                      // FK to jobs.id
  applicant_id: string                // FK to profiles.id
  cover_letter: string | null
  resume_url: string                  // Supabase Storage: resumes bucket
  status: ApplicationStatus
  employer_notes: string | null       // Private, only employer sees
  is_viewed: boolean                  // "Seen" feature
  viewed_at: string | null            // When employer first opened it
  created_at: string
  updated_at: string
}
```

### Joined Types (for Supabase `.select()` with relations)

```ts
// Used by: getJobs(), homepage feed, job list pages
// Select: *, company:companies!inner(id, name, name_ka, slug, logo_url),
//         category:categories!inner(id, slug, name_en, name_ka)
JobWithCompany = Job & {
  company: Pick<Company, "id" | "name" | "name_ka" | "slug" | "logo_url">
  category: Pick<Category, "id" | "slug" | "name_en" | "name_ka">
}

// Used by: getMyApplications(), seeker dashboard
// Select: *, job:jobs!inner(id, title, title_ka, status, application_deadline,
//                           company:companies!inner(name, name_ka, logo_url))
ApplicationWithJob = Application & {
  job: Pick<Job, "id" | "title" | "title_ka" | "status" | "application_deadline"> & {
    company: Pick<Company, "name" | "name_ka" | "logo_url">
  }
}

// Used by: employer applicant review page
// Select: *, applicant:profiles!inner(id, full_name, full_name_ka, avatar_url, skills, experience_years)
ApplicationWithApplicant = Application & {
  applicant: Pick<Profile, "id" | "full_name" | "full_name_ka" | "avatar_url" | "skills" | "experience_years">
}
```

### Utility Types

```ts
// All Server Actions return this
ActionResult<T = null> = { error: string | null; data?: T }

// Homepage/job listing search params
JobSearchParams = { q?: string; category?: string; city?: string; type?: JobType; page?: number }
```

### Supabase Query → Type Mapping (CRITICAL for components)

| Query Function | File | Returns | Used By |
|---|---|---|---|
| `getJobs()` | `lib/queries/jobs.ts` | `JobWithCompany[]` | Homepage, `/jobs` page |
| `getJobById(id)` | `lib/queries/jobs.ts` | `JobWithCompany \| null` | `/jobs/[id]` detail |
| `getMyApplications(userId)` | `lib/queries/applications.ts` | `ApplicationWithJob[]` | `/seeker/applications` |
| `getProfile(userId)` | `lib/queries/profile.ts` | `Profile \| null` | Dashboard, profile page |
| `getCompanyByOwner(userId)` | `lib/queries/companies.ts` | `Company \| null` | Employer dashboard |
| `getCompanyBySlug(slug)` | `lib/queries/companies.ts` | `Company \| null` | `/companies/[slug]` |

### Bilingual Field Convention

Every bilingual entity has `field` (English) + `field_ka` (Georgian). Use `localized()` helper:

```ts
import { localized } from "@/lib/utils";
// localized(job, "title", locale) → returns title_ka for "ka", title for "en"
// localized(company, "name", locale) → same pattern
```

Entities with bilingual fields: `Profile` (full_name, bio), `Company` (name, description, address), `Job` (title, description, requirements), `Category` (name_en, name_ka — special case: no suffix pattern)

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

### Phase 1: Profiles & Companies [DONE]
- [x] Dashboard layout (sidebar, header, role-aware nav)
- [x] Profile CRUD (queries + actions + form)
- [x] Company CRUD (queries + actions + form)
- [x] File uploads (Supabase Storage: avatars, resumes, logos)

### Phase 2: Jobs [DONE]
- [x] Homepage as direct job feed (20/page, sorted by created_at DESC)
- [x] Job query layer with pagination, filters, deadline+freshness exclusion
- [x] JobCard component (Quiet Design: logo, title, company, salary, dates)
- [x] JobList component (staggered fade-in, dashed empty state)
- [x] Pagination component (page numbers, prev/next, query params preserved)
- [x] Job detail page (`/jobs/[id]`) with SEO metadata
- [x] Job CRUD for employers (create/edit/close/renew)
- [x] Public company pages (directory + profile)

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
