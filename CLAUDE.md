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
| Fonts | Inter (Latin) + Noto Sans Georgian | Google Fonts |

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

## Theme & Design

- Full **Dark/Light/System** mode via `next-themes` with `attribute="class"`
- Every component MUST use Tailwind `dark:` classes where needed
- Theme toggle available via `<ThemeSwitcher />` component (`components/theme-switcher.tsx`)
- Color system uses CSS variables in HSL format (configured in `globals.css`)
- shadcn/ui style: `new-york`, base color: `neutral`

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
│   └── auth.ts                          # Login, signup, logout, password reset
├── queries/                             # Pure reads for Server Components
│   (to be created)
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
| `jobs` | Job listings | company_id, category_id, title, job_type, status, salary_min/max |
| `applications` | Job applications | job_id, applicant_id, resume_url, status |

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

### Migration File

`supabase/migrations/001_initial_schema.sql` — run in Supabase SQL Editor

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

### Phase 3: Applications
- [ ] Apply to job (resume upload + cover letter)
- [ ] Seeker: my applications view
- [ ] Employer: review applicants per job
- [ ] Application status workflow

### Phase 4: Admin & Polish
- [ ] Admin dashboard (stats, moderation)
- [ ] Admin: manage users, jobs, companies
- [ ] Loading states (Skeleton) + error boundaries
- [ ] SEO: generateMetadata on key pages
- [ ] Responsive design pass (mobile-first)
