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
| Payments | Lemon Squeezy (`@lemonsqueezy/lemonsqueezy.js`) | MoR model |

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
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Email digest (server-only)
ANTHROPIC_API_KEY=<api-key>                   # AI Job Draft
RESEND_API_KEY=<resend-api-key>               # Email digest
CRON_SECRET=<random-secret>                   # Digest API auth
NEXT_PUBLIC_SITE_URL=https://dasakmdi.com     # Email links
LEMONSQUEEZY_API_KEY=<api-key>               # Lemon Squeezy payments
LEMONSQUEEZY_STORE_ID=<store-id>             # Lemon Squeezy store
LEMONSQUEEZY_WEBHOOK_SECRET=<webhook-secret> # Webhook HMAC verification
LEMONSQUEEZY_PRO_VARIANT_ID=<variant-id>     # Pro plan variant
LEMONSQUEEZY_VERIFIED_VARIANT_ID=<variant-id># Verified plan variant
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
| O2 | Query dedup — `React.cache()` on `getProfile` | `lib/queries/profile.ts` | DB load -50% | ✅ |
| O3 | Parallel fetching — `Promise.all` | `apply/page.tsx` | Page load -200ms | ✅ |
| O4 | Static generation — `revalidate: 3600` | companies pages | TTFB -80% | ✅ |

### P2 — SEO (ხილვადობა) — ✅ ALL DONE

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O5 | Sitemap — jobs + companies + static, ორენოვანი | `app/sitemap.ts` | Google ინდექსაცია | ✅ |
| O6 | robots.txt — dashboard/admin/profile დაბლოკილი | `app/robots.ts` | Crawl control | ✅ |
| O7 | JSON-LD JobPosting | `jobs/[id]/page.tsx` | Google Jobs | ✅ |
| O8 | Dynamic OG images — Indigo gradient | `jobs/[id]/opengraph-image.tsx` | Social CTR | ✅ |

### P3 — Database (მოთხოვნები) — ✅ ALL DONE

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O9 | N+1 fix — batch viewed | 2 employer pages | N queries → 1 | ✅ |
| O10 | Sidebar badge — `head: true` count | `layout.tsx` | Data transfer -90% | ✅ |

### P4 — UX (გამოცდილება) — ✅ ALL DONE

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O11 | Search debounce 350ms | `job-filters.tsx` | UX responsiveness | ✅ |
| O12 | Auto-submit status — select change → instant save | `application-status-update.tsx` | Snappy UX | ✅ |

### P5 — Caching (კეშირება) — ✅ ALL DONE

| # | ამოცანა | ფაილები | ეფექტი | სტატუსი |
|---|---------|---------|--------|---------|
| O13 | `unstable_cache` — categories 1hr | `lib/queries/categories.ts` | DB calls -80% | ✅ |
| O14 | `revalidatePath("/")` → `"/jobs"` | `lib/actions/jobs.ts` | Cache hit rate ↑ | ✅ |

---

## Phase 7: ნდობა და გამჭვირვალობა (Trust & Transparency)

**მიზანი**: Jobs.ge-სგან დიფერენციაცია გამჭვირვალობით. მომხმარებლები მოვლენ მონაცემებისთვის, დარჩებიან ვაკანსიებისთვის.

### T1 — ხელფასების აგრეგაციის დეშბორდი (`/salaries`)

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T1.1 | Supabase query — ხელფასების აგრეგაცია | `lib/queries/salaries.ts` — AVG/MIN/MAX გროუპირებული category+city+currency-ით | ✅ |
| T1.2 | `/salaries` გვერდი — UI | Summary cards + category breakdown + ფილტრები + skeleton loading | ✅ |
| T1.3 | i18n — ტექსტები | `salaries` namespace ორივე ენაზე + `nav.salaries` | ✅ |
| T1.4 | SEO — metadata | `generateMetadata()` ორენოვანი | ✅ |
| T1.5 | Nav ლინკი | Header-ში ვაკანსიები/კომპანიები/ხელფასები ლინკები | ✅ |

### T2 — კომპანიის კულტურის სექცია

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T2.1 | DB მიგრაცია | `supabase/migrations/002_company_culture.sql` — tech_stack, why_work_here, benefits | ✅ |
| T2.2 | ტიპების განახლება | `database.ts` — Company Row/Insert/Update-ში ახალი ველები | ✅ |
| T2.3 | Zod ვალიდაცია | `lib/validations/company.ts` — tech_stack, benefits, why_work_here | ✅ |
| T2.4 | CompanyForm — ახალი ველები | "კულტურა და გარემო" სექცია: tech_stack, benefits, why_work_here | ✅ |
| T2.5 | საჯარო გვერდი — კულტურის ბლოკი | `/companies/[slug]` — ტექ სტეკის pills, ბენეფიტები, "რატომ ჩვენ" | ✅ |
| T2.6 | Server Action | create + update actions-ში `parseTagsFromForm()` helper | ✅ |
| T2.7 | i18n | `company` namespace — 12 ახალი key ორივე ენაზე | ✅ |

---

## Phase 8: შეკავების ძრავა (Retention Engine)

**მიზანი**: მომხმარებელი საიტის გახსნის გარეშეც ურთიერთქმედებს. ჩვევის ფორმირება.

### T3 — "შენთვის შერჩეული" სექცია მთავარ გვერდზე

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T3.1 | Match logic | არსებული `calculateMatchScores()` გამოყენება, top 5 სორტირება score-ით | ✅ |
| T3.2 | UI — `TopMatches` კომპონენტი | `components/jobs/top-matches.tsx` — ფიდის ზემოთ, seeker-ისთვის, 1-ელ გვერდზე ფილტრების გარეშე | ✅ |
| T3.3 | Empty state — `TopMatchesEmpty` | skills ცარიელია → CTA "პროფილის შევსება" ლინკით | ✅ |
| T3.4 | i18n | `home.topMatches`, `home.noSkills`, `home.noSkillsCta` ორივე ენაზე | ✅ |

### T4 — Daily Match Digest (ელფოსტა) — ⏸️ გადავადებული

**სტეკი**: Resend + Vercel Cron + `/api/digest/send` API route
**DB**: `email_digest BOOLEAN DEFAULT true` ველი + ProfileForm checkbox — უკვე მზადაა
**როდის გააქტიურდეს**: მომხმარებლების რაოდენობის ზრდისას (100+ seeker). Free tier = 100 email/დღეში, Pro = $20/თვე 50k-ისთვის
**საჭირო**: Resend API key, dasakmdi.com domain verification (DNS records), `CRON_SECRET` env var

---

## Phase 9: პროფილის რევოლუცია (Profile Revolution)

**მიზანი**: პროფილი გახდეს პროდუქტი — რაღაც, რისი გაზიარებაც მაძიებელს თავად უნდა.

### T5 — საჯარო მაძიებლის პორტფოლიო

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T5.1 | გვერდის რედიზაინი | Read.cv ესთეტიკა: hero card, gradient avatar ring, staggered animations | ✅ |
| T5.2 | უნარების ვიზუალიზაცია | skills[] → primary-colored pill badges, per-item animation delay | ✅ |
| T5.3 | გამოცდილების სექცია | experience_years + bio hero card-ში ინტეგრირებული | ✅ |
| T5.4 | გაზიარების ღილაკი | `ShareButton` კომპონენტი — clipboard copy + "ლინკი დაკოპირდა" feedback | ✅ |
| T5.5 | OG Meta | `generateMetadata` — name, skills, openGraph type: "profile" | ✅ |
| T5.6 | Privacy toggle | `getPublicProfile()` — `is_public=false` → null (404) | ✅ |
| T5.7 | DB მიგრაცია | `003_profile_public.sql` — `is_public BOOLEAN DEFAULT true` | ✅ |

---

## Phase 10: მონეტიზაცია (Monetization)

**მიზანი**: მდგრადი შემოსავლის მოდელი, რომელიც არ ზღუდავს მომხმარებელს.

### T6 — პაკეტების სისტემა

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| T6.1 | Pricing გვერდი | `/pricing` — 3 პაკეტი: Free, Pro (50₾/თვე), Verified (100₾/თვე). Quiet Design, ორენოვანი | ✅ |
| T6.2 | DB — subscriptions ცხრილი | `005_subscriptions.sql`: company_id, plan, status, lemon_squeezy_id, period dates + `is_featured` on jobs | ✅ |
| T6.3 | Payment ინტეგრაცია | Lemon Squeezy SDK + checkout action + webhook handler (`/api/webhooks/lemonsqueezy`) | ✅ |
| T6.4 | Feature gating | Free: 3 აქტიური ვაკანსია. Pro: unlimited + AI draft + match scores. Verified: badge + featured | ✅ |
| T6.5 | Employer dashboard — billing | `/employer/billing` — მიმდინარე პაკეტი, LS customer portal, upgrade CTA | ✅ |
| T6.6 | "Featured" ვაკანსიები | `is_featured` ordering + Star badge + BadgeCheck verified badge on job cards | ✅ |

---

## Phase 11: Telegram Bot ინტეგრაცია

**მიზანი**: ახალი ვაკანსიები რეალურ დროში მიუვიდეს გამომწერებს Telegram-ით. უფასო, 80-90% open rate.

### არქიტექტურა

```
საიტზე "გამოიწერე" ღილაკი → t.me/dasakmdi_bot → /start → კატეგორიის არჩევა → DB
Employer posts job → createJobAction() → /api/telegram/notify → bot.sendMessage() → გამომწერები
```

### TB1 — Bot Setup & Infrastructure

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| TB1.1 | BotFather-ით ბოტის შექმნა | `@dasakmdi_bot` — **შენ უნდა შექმნა BotFather-ში და token .env.local-ში ჩასვა** | ⏳ შენზეა |
| TB1.2 | `npm install grammy` | Grammy TS framework | ✅ |
| TB1.3 | DB მიგრაცია | `006_telegram_subscriptions.sql` | ✅ |
| TB1.4 | ტიპების განახლება | `database.ts` — TelegramSubscription Row/Insert/Update | ✅ |

### TB2 — Bot Commands (Webhook Handler)

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| TB2.1 | `/api/telegram/webhook` route | Grammy webhookCallback + service client | ✅ |
| TB2.2 | `/start` command | მისალმება + inline keyboard კატეგორიებით | ✅ |
| TB2.3 | კატეგორიის არჩევა | callback_query toggle + DB upsert | ✅ |
| TB2.4 | `/categories` command | მიმდინარე გამოწერების ჩვენება | ✅ |
| TB2.5 | `/stop` command | `is_active = false` | ✅ |
| TB2.6 | `/language` command | ka↔en toggle | ✅ |

### TB3 — ვაკანსიის Notification

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| TB3.1 | `/api/telegram/notify` route | POST, CRON_SECRET-ით, category filter, batch send | ✅ |
| TB3.2 | შეტყობინების ფორმატი | Markdown: title, company, city, salary, link — ორენოვანი | ✅ |
| TB3.3 | `createJobAction` hook | fire-and-forget fetch notify endpoint | ✅ |
| TB3.4 | Rate limiting | 25 msg/batch → 1sec pause | ✅ |

### TB4 — საიტზე ინტეგრაცია

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| TB4.1 | "გამოიწერე" ღილაკი | Header/Footer-ში `t.me/dasakmdi_bot` ლინკი — **TB1.1 შემდეგ** | ⏳ TB1.1-ზე დამოკიდებული |
| TB4.2 | i18n | `nav.telegramSubscribe` ka/en | ✅ |

### TB5 — Telegram Channel (ბონუს)

| # | ამოცანა | დეტალები | სტატუსი |
|---|---------|----------|---------|
| TB5.1 | Public channel | `@dasakmdi_jobs` channel შექმნა — **შენ უნდა შექმნა** | ⏳ შენზეა |
| TB5.2 | Auto-post channel-ში | notify route-ში channel_id-ზე sendMessage | ⏳ TB5.1 შემდეგ |

### შესრულების თანმიმდევრობა

```
TB1.1 → TB1.2 → TB1.3 → TB1.4 → TB2.1 → TB2.2 → TB2.3 → TB3.1 → TB3.2 → TB3.3 → TB4.1 → TB4.2
(TB2.4-TB2.6 და TB3.4 პარალელურად)
(TB5 ბონუსი — ბოლოს)
```

---

## შესრულების თანმიმდევრობა (Phase 7-10)

```
Phase 7 (ნდობა):     T1.1→T1.2→T1.3→T1.4→T1.5  ║  T2.1→T2.2→T2.3→T2.4→T2.5→T2.6→T2.7
Phase 8 (შეკავება):   T3.1→T3.2→T3.3→T3.4        ║  T4.1→T4.2→T4.3→T4.4→T4.5
Phase 9 (პროფილი):   T5.7→T5.1→T5.2→T5.3→T5.4→T5.5→T5.6
Phase 10 (ფული):     T6.1→T6.2→T6.3→T6.4→T6.5→T6.6
```

**რეკომენდებული სტარტი**: T1 (ხელფასები) → T3 (შერჩეული) → T2 (კულტურა) → T5 (პორტფოლიო) → T4 (digest) → T6 (მონეტიზაცია)
