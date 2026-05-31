# MindCanopy

A subscription-based online therapy platform for the Indian market. Clients are matched with globally trained therapists for weekly video sessions and unlimited async text between sessions — fully online, no clinics, no prescriptions.

> Talk therapy and counselling only. MindCanopy does not provide diagnosis or medication.

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime (chat) |
| Storage | Supabase Storage (avatars, documents) |
| Payments | Razorpay Subscriptions |
| Video | Daily.co |
| Email | Resend (transactional) + Supabase Auth SMTP |
| Forms | React Hook Form + Zod |

## User roles

- **Client** — completes an intake questionnaire, subscribes, and communicates with their matched therapist via chat and video.
- **Therapist** — onboarded via an admin-issued invite code; sees matched clients, schedules sessions, writes session notes.
- **Admin** — manually matches clients to therapists, verifies therapist credentials, and oversees all matches and subscriptions.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in real values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App URLs (used for auth redirects + email links)
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
# ...plus one RAZORPAY_PLAN_* id per plan in lib/plans.ts

# Daily.co
DAILY_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM=
RESEND_FROM_ADMIN=
ADMIN_EMAIL=

# Cron (session reminders)
CRON_SECRET=
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose it to the client.

### Database setup

Run `supabase/schema.sql` in the Supabase SQL editor on a fresh project, then apply any newer files in `supabase/migrations/`. The `notifications` table also needs realtime enabled:

```sql
alter publication supabase_realtime add table notifications;
```

## Project structure

```
app/
  (auth)/            login, signup, password reset
  (client)/dashboard chat, sessions, notes, subscription, account
  therapist/         apply, onboard, dashboard (clients, notes, payment)
  admin/             matching, verification, switch requests
  api/               payment (Razorpay), webhooks, cron
  actions/           server actions (auth, sessions, subscription, ...)
components/          UI (shadcn/ui + feature components)
lib/                 supabase clients, email, plans, logger, notifications
supabase/            schema.sql + migrations
types/               generated database types
```

## Conventions

- All database access is server-side (Server Components, Route Handlers, Server Actions).
- Inputs are validated with Zod before any DB write.
- Server-side logging goes through `lib/logger.ts` (structured: timestamp, level, context, optional userId).
- Work happens on the `dev` branch; `main` is the release branch.

## Deployment

Deployed on Vercel. Set all environment variables for Production and Preview scopes, point the Razorpay webhook at `/api/webhooks/razorpay`, and configure Supabase Auth SMTP to send through Resend on a verified domain.
