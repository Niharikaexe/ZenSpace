# ZenSpace — Project Brief for Claude

---

## COMPANY CONTEXT

ZenSpace is a subscription-based online therapy platform focused exclusively
on the Indian market. It offers:
- Weekly therapy sessions (video) with globally trained therapists
- Unlimited async text messaging with your therapist between sessions
- A fully online experience — no clinics, no waiting rooms, no prescriptions
- The ability to switch therapists anytime, no explanation needed
- A therapist portal where therapists can write and publish SEO blogs
- Admin oversight of all therapist-client assignments
- A free 15-minute introductory call before any payment

**IMPORTANT CONSTRAINT:** ZenSpace does not prescribe medication. It is
a talk therapy and counselling platform only. Never imply or suggest
diagnostic or prescription services.

### PRICING TIERS
- **Essentials:** ₹2,999/week — 1 video session (50 min) + unlimited async text
- **Premium:** ₹4,499/week — 1 session + priority text + foreign therapist access
- **Couples:** ₹5,999/week — 1 couples session (60 min) + text for both partners
- **Monthly Bundle:** ₹9,999/month — 4 sessions + text + switch therapist anytime

---

## TONE OF VOICE — READ THIS BEFORE WRITING ANYTHING

The tone is: **HONEST. WARM. DIRECT. QUIETLY CONFIDENT.**

Think of how a very smart, very empathetic friend who happens to be a therapist
would text you — not a hospital, not a startup, not a motivational poster.

**WHAT THIS SOUNDS LIKE:**
- "You've probably Googled your symptoms at 2 AM. We've got something better."
- "Your Indian therapist told you to meditate. We're not going to do that."
- "You don't need to explain yourself before you start. Just show up."
- Sentences that end a little early. Like this. It feels real.
- Short paragraphs. One idea per paragraph. White space is trust.

**WHAT TO AVOID:**
- NEVER use: "holistic", "wellness journey", "safe space", "evidence-based",
  "on your terms", "world-class", "revolutionary", "cutting-edge",
  "certified professionals", "healing journey", "empower"
- NEVER start a page with a question like "Are you struggling?"
- NEVER use corporate wellness language — this is not an HR tool
- NEVER use clinical jargon unless it's on a blog explaining a concept simply
- NEVER write sentences that could be on a poster at a chemist shop

**THE BRAND VOICE IN ONE SENTENCE:**
"We say the things that everyone is thinking but no one in your life will say to you."

**PERSONALITY TRAITS:**
- Culturally self-aware (knows India, doesn't preach India)
- Comfortable with nuance — doesn't oversimplify mental health
- Never exploits pain — acknowledges it and moves forward
- Slightly dry humor is okay. Never sarcastic about pain.
- Treats the reader as intelligent, not fragile

### CORE USPs (weave in as felt truths, never list as features)

**USP 1 — FOREIGN & GLOBALLY TRAINED THERAPISTS**
Our therapists trained in environments where mental health isn't seen as something
to be ashamed of. They've worked with people from very different backgrounds.
They have no cultural stake in your choices.

**USP 2 — SWITCH YOUR THERAPIST ANYTIME**
If the fit isn't right, you change. No guilt trip, no explanation required.
You're not firing anyone — you're finding your person.

**USP 3 — TEXT YOUR THERAPIST BETWEEN SESSIONS**
A week is a long time. When something happens on a Tuesday, you don't have
to wait until Sunday to tell someone.

**USP 4 — COMPLETE PRIVACY**
No one in your building, your office, or your family will know you're here.
Not because we're hiding something — because it's yours.

**USP 5 — FREE INTRO CALL**
Before you pay anything, talk to your potential therapist for 15 minutes.
If it doesn't feel right, you pick someone else. No pressure. No invoice.

---

## What We Are Building

A BetterHelp/TalkSpace-style therapy marketplace MVP where:
- Clients find and get matched with a licensed therapist
- The **admin (Niharika)** manually matches clients to therapists — no algorithm
- All communication (chat, video, notes) happens exclusively inside the platform
- Revenue model: subscription-based (per-session, weekly, monthly)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (chat) |
| Payments | Razorpay Subscriptions |
| Video | Daily.co |
| State | Zustand |
| Forms | React Hook Form + Zod |

---

## User Roles

1. **Client** — seeks therapy, pays subscription, communicates with matched therapist
2. **Therapist** — licensed professional, onboarded manually by admin, sees matched clients
3. **Admin (Niharika)** — matches clients to therapists, manages platform

---

## Client Flow

1. **Landing page** → CTA to get started
2. **Questionnaire** (unauthenticated) → captures mental health concerns, goals, preferences
3. **Create account** → email/password via Supabase Auth
4. **Dashboard — Pending Match state**
   - Message: "We are finding your perfect therapist..."
   - Carousel of sample/anonymised therapist profiles (to build trust)
   - Prompt to choose a subscription plan (per-session / weekly / monthly) and pay via Razorpay
5. **Dashboard — Matched state** (after admin assigns a therapist)
   - Therapist profile card (name, photo, specialization, bio)
   - Chat (Supabase Realtime)
   - Video session (Daily.co)
   - Session notes (read-only for client)

---

## Therapist Flow

1. **Therapist onboarding page** (invite code link shared by admin)
   - Name, photo, license number, specializations, bio, approach, languages, availability
2. **Dashboard**
   - Matched client's profile (name, concerns, goals)
   - Chat with client (Supabase Realtime)
   - Schedule & join video sessions (Daily.co)
   - Write session notes (private to therapist)

---

## Admin Flow

1. **Admin dashboard** (protected route, role = admin)
2. View all clients in "pending match" state with their questionnaire answers
3. View all verified therapists and their capacity
4. **Manually assign** a therapist to a client (creates a `match` record)
5. View all active matches, sessions, subscriptions
6. Verify therapist credentials (toggle `is_verified`)

---

## Database Tables (already in supabase/schema.sql)

- `profiles` — all users
- `client_profiles` — questionnaire + preferences
- `therapist_profiles` — credentials, specializations, capacity
- `subscriptions` — Razorpay subscription records
- `matches` — admin-created client ↔ therapist assignments
- `sessions` — scheduled video/chat appointments
- `messages` — realtime chat messages
- `questionnaire_responses` — full intake form JSON

---

## Execution Plan (Phase by Phase)

### PHASE 1 — Foundation (Done ✅)
- [x] Next.js 14 + TypeScript + Tailwind scaffold
- [x] shadcn/ui components installed
- [x] Supabase SSR client (browser + server + admin)
- [x] Full Postgres schema with RLS
- [x] TypeScript database types
- [x] GitHub repo + dev branch

---

### PHASE 2 — Auth & Routing
- Supabase Auth (email/password)
- Middleware to protect routes by role
- `/login`, `/signup` pages
- Auto-redirect based on role: client → `/dashboard`, therapist → `/therapist/dashboard`, admin → `/admin`
- Auth context / session handling

---

### PHASE 3 — Client Questionnaire & Onboarding
- Multi-step questionnaire form (unauthenticated)
- Questions: concerns, goals, previous therapy, therapist gender preference, session type preference
- Store answers in `questionnaire_responses` + populate `client_profiles`
- Redirect to account creation after questionnaire

---

### PHASE 4 — Subscription & Payment (Razorpay)
- Razorpay subscription plans (per-session / weekly / monthly)
- Checkout flow on client dashboard
- Webhook handler to update `subscriptions` table on payment events
- Subscription status gate: client can only access chat/video if subscription is `active`

---

### PHASE 5 — Admin Dashboard
- Protected `/admin` route (role = admin only)
- View unmatched clients + their questionnaire answers
- View available therapists + their capacity
- Match client to therapist (create `matches` record)
- View all active matches
- Verify therapist credentials

---

### PHASE 6 — Therapist Onboarding
- Unique onboarding link (admin generates and sends)
- Therapist profile form: license, bio, specializations, photo upload
- Creates `therapist_profiles` record
- Redirect to therapist dashboard on completion

---

### PHASE 7 — Client Dashboard
- **Pending state**: "Finding your therapist" UI + therapist carousel + subscription prompt
- **Matched state**: therapist profile card + nav to chat/video/notes
- Subscription status checks

---

### PHASE 8 — Therapist Dashboard
- Matched client profile view
- Session scheduling interface
- Notes editor (per session)
- Nav to chat and video

---

### PHASE 9 — Real-time Chat
- Supabase Realtime channel per `match_id`
- Message list with auto-scroll
- Send/receive text messages
- Read receipts
- File/image sharing (Supabase Storage)

---

### PHASE 10 — Video Sessions (Daily.co)
- Admin or therapist creates a Daily.co room per session
- Join button activates on scheduled session time
- In-app video UI (camera, mic, end call)
- Session duration tracked in `sessions` table

---

### PHASE 11 — Session Notes
- Therapist writes notes per session
- Stored in `sessions.therapist_notes`
- Visible to admin, hidden from client (configurable)

---

### PHASE 12 — Polish & Launch Prep
- Landing page (BetterHelp-inspired with ZenSpace branding)
- Email notifications (Supabase Edge Functions or Resend)
- Mobile responsiveness audit
- Error handling, loading states, empty states
- Environment setup for production (Vercel)

---

## Gaps / Open Questions (to clarify with Niharika)

1. **Currency & pricing** — Pricing will be in INR, with options for session-wise, weekly or monthhly
2. **Therapist onboarding link** — fixed `/therapist/onboard` page with an invite code?
3. **Session notes visibility** — Clients can view the session notes, therapists add session notes, and admin can't view them.
4. **Video scheduling** — The therapist will schedule a time suitable for them, in the client's timezone. Hourly based sessions.
5. **Notifications** — email and in-app
6. **Therapist payout** — The therapist payout is handled off-app for now
7. **Multiple therapists** — Client can be re-matched to a different therapist if not aligned, by contacting admin/support. No multiple therapists for one client.
8. **Client cancellation** — The subscription is non-refundable.

---

## Pre-Launch Checklist

Remove items as they are completed.

---

### 🔴 CRITICAL — Cannot go live without these

**Payments**
- [ ] Razorpay subscription plans created in Razorpay dashboard (Essentials, Premium, Couples, Monthly)
- [ ] Client plan selection UI → Razorpay checkout flow wired up
- [ ] Razorpay webhook handler (`/api/webhooks/razorpay`) — listens for `subscription.activated`, `subscription.charged`, `payment.failed`, updates `subscriptions` table
- [ ] Webhook signature verification (HMAC) — security requirement
- [ ] Subscription status gate — clients without an active subscription cannot access chat or video

**Auth flow gaps**
- [ ] `/auth/callback` route — handles Supabase email confirmation links and magic links
- [ ] `/auth/reset-password` page — landing page for password reset emails
- [ ] Test full signup → email confirmation → dashboard redirect flow end-to-end

**Legal**
- [ ] `/terms` page — Terms of Service (required for Razorpay merchant approval)
- [ ] `/privacy` page — Privacy Policy (required under DPDP Act 2023)
- [ ] Cookie consent banner (if using analytics)

**Admin: therapist application management**
- [ ] Admin view for pending therapist applications (`therapist_applications` table)
- [ ] Approve / reject action with admin notes
- [ ] Generate invite code and send it to approved applicant via email

**Infrastructure (one-time setup)**
- [ ] Run `supabase/migrations/20260329_notifications.sql` in Supabase SQL editor
- [ ] Run `alter publication supabase_realtime add table notifications;` in Supabase SQL editor
- [ ] Set `CRON_SECRET` env var in Vercel before deploy
- [ ] Move Supabase project to `ap-south-1` (Mumbai) region — Pro plan required
- [ ] Set Vercel serverless function region to `ap-south-1`

---

### 🟡 HIGH PRIORITY — Should be live at launch

**Core USPs not yet built**
- [ ] Free intro call flow — client can request a 15-min intro call before subscribing; therapist accepts; Daily.co room created
- [ ] Switch therapist flow — client can request a switch from their dashboard; admin is notified; re-matching happens

**Client account & subscription management**
- [ ] Client account/profile page — update name, email, preferences
- [ ] Client subscription page — view current plan, billing date, cancel subscription
- [ ] Graceful subscription expiry — what the client sees when plan lapses or payment fails

**Session notes for clients**
- [ ] Client-facing session notes view (read-only) on client dashboard — per CLAUDE.md gap #3

**Loading & error states**
- [ ] `loading.tsx` files for all dashboard routes (prevents blank white screens during SSR)
- [ ] Custom `not-found.tsx` (404 page)
- [ ] Custom `error.tsx` (500 / unexpected error page)
- [ ] Remove `force-dynamic` from static pages: FAQ, contact, landing — use ISR instead

**Therapist pending dashboard**
- [ ] Anonymised therapist profile carousel on client pending-match dashboard (builds trust while waiting)

---

### 🟠 IMPORTANT — Before scaling

**Trust & profile completeness**
- [ ] Verified badge shown on therapist card (client-facing) when `is_verified = true`
- [ ] Full therapist profile visible to matched client (specialisations, years experience, approach, bio)
- [ ] Profile photo upload on therapist account page (currently placeholder)
- [ ] Profile photo upload on client account page

**Couples therapy**
- [ ] Couples questionnaire path leads to a differentiated matching/dashboard experience
- [ ] Admin matching UI distinguishes couples sessions from individual

**SEO & content**
- [ ] Therapist blog system — therapists can write and publish SEO articles from their dashboard
- [ ] `/blog` public listing page
- [ ] Sitemap (`/sitemap.xml`) and robots.txt
- [ ] OG tags and metadata on all public pages

**Security & abuse prevention**
- [ ] Rate limiting on signup, questionnaire submit, message send, and session schedule actions
- [ ] Data deletion flow — user can request account + data deletion (DPDP Act requirement)

**Monitoring**
- [ ] Sentry error tracking installed and configured
- [ ] Uptime monitor set up (BetterStack or UptimeRobot)

---

### 🔵 KNOWN DECISIONS & CONTEXT

- Therapist payout is off-platform for now — handled directly by admin
- Subscription is non-refundable — state this clearly on pricing and checkout pages
- Client can be re-matched by contacting admin — no self-serve re-match
- No multiple therapists per client — one active match at a time
- Admin (Niharika) manually matches all clients — no algorithm
- Session notes: therapists write, clients can read, admin cannot

---

## Coding Rules for Claude

- Always work on the `dev` branch. Never push to `main`.
- Build one feature/phase at a time — do not jump ahead.
- Keep components small and focused.
- Use server components by default; client components only when needed (interactivity, hooks).
- All DB access from server-side (Server Components, Route Handlers, Server Actions).
- Use the admin Supabase client only in server-side code, never expose service role key to client.
- Validate all inputs with Zod before DB writes.
- No dummy data in production paths — use real Supabase queries.
