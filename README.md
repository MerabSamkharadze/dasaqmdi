<h1 align="center">
  <br>
  <a href="https://www.dasaqmdi.com">dasaqmdi.com</a>
  <br>
</h1>

<h4 align="center">Job board platform for Georgia — built with Next.js, Supabase, and AI.</h4>

<p align="center">
  <a href="https://www.dasaqmdi.com">Live Site</a> &middot;
  <a href="https://t.me/dasaqmdi_bot">Telegram Bot</a>
</p>

---

## Overview

**dasaqmdi.com** (დასაქმდი) is a full-featured job board platform for the Georgian market. It connects job seekers with employers through smart matching, real-time Telegram notifications, AI-powered job drafting, and a bilingual (Georgian/English) interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (Georgian + English) |
| AI | Vercel AI SDK + Gemini 2.5 Flash |
| Payments | Lemon Squeezy |
| Email | Resend |
| Bot | Grammy (Telegram) |
| Analytics | Facebook Pixel + Vercel Speed Insights |
| Deploy | Vercel |

## Features

**For Job Seekers**
- Browse and search jobs with filters (category, city, type)
- Smart matching — skills matched against job tags with percentage score
- Preferred categories — personalized feed based on profile settings
- Save jobs and track applications
- Public portfolio page with privacy toggle
- Telegram bot notifications for new jobs

**For Employers**
- Post and manage job listings
- AI-powered job description generator (bilingual)
- Review applicants with match scores
- Custom email templates for accept/reject notifications
- Company profile with culture section (tech stack, benefits)
- Subscription plans (Free / Pro / Verified)

**For Admins**
- User, job, and company management
- Job moderation (approve/reject workflow)
- Activity logs with full audit trail
- Platform statistics dashboard

**Platform**
- Bilingual — Georgian (default) + English
- Dark/Light theme
- SEO optimized (JSON-LD, dynamic OG images, sitemap)
- Telegram bot with category and company subscriptions
- Responsive design (mobile-first)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- npm

### Setup

```bash
# Install dependencies
npm install

# Pull environment variables from Vercel (if linked)
vercel env pull

# Or create .env.local manually with required variables
# (see Environment Variables section below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://www.dasaqmdi.com

# AI
GOOGLE_GENERATIVE_AI_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# Payments
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_VERIFIED_VARIANT_ID=

# Security
CRON_SECRET=
```

## Project Structure

```
app/
  [locale]/
    (auth)/          # Login, signup, password reset
    (public)/        # Homepage, jobs, companies, salaries, pricing
    (dashboard)/     # Dashboard, profile, employer tools, admin
  api/               # AI draft, Telegram webhook, email, payments

lib/
  actions/           # Server actions (mutations)
  queries/           # Database reads
  validations/       # Zod schemas
  email/             # Email templates + HTML builder
  supabase/          # Client configuration
  config.ts          # Centralized site config

components/
  ui/                # shadcn/ui primitives
  layout/            # Header, footer, language switcher
  dashboard/         # Sidebar, forms, dashboards
  jobs/              # Job cards, filters, pagination
  shared/            # File upload, modals, buttons
```

## Database

PostgreSQL via Supabase with Row Level Security on all tables. Key tables:

- `profiles` — user data, skills, preferences
- `companies` — employer profiles with culture info
- `jobs` — listings with expiry, tags, salary
- `applications` — applicant tracking with status workflow
- `subscriptions` — Lemon Squeezy plan management
- `telegram_subscriptions` — bot notification preferences
- `email_templates` — custom employer email templates
- `admin_logs` — audit trail for admin actions

Migrations are in `supabase/migrations/` (001–013).

## License

Private. All rights reserved.
