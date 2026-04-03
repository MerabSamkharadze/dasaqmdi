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
