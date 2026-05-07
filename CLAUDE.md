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
- A free introductory chat before any payment

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

**USP 5 — FREE INTRO CHAT**
Before you pay anything, send a few messages to your matched therapist.
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
2. **Questionnaire** (unauthenticated) → captures mental health concerns, goals, preferences, and which category the client belongs to couples, indiviudal or teenager.
3. **Create account** → email/password via Supabase Auth
4. **Dashboard — Pending Match state**
   **Questionnaire unanswered** -> prompt the user to take the questionnaire to match with best therapist
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
   3. Join as Therapist page: Send in basic deatils to be shared invite code for onboarding of therapist.

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

### 🔐 SECRETS & ENV — DO BEFORE ANY OTHER WORK

**🚨 Compromised secrets in `.env.example` (committed to git)**
- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase dashboard (currently `sb_secret_...` exposed in `.env.example` line 4)
- [ ] Rotate `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (line 2)
- [ ] Rotate `NEXT_PUBLIC_SUPABASE_ANON_KEY` (line 3)
- [ ] Replace all values in `.env.example` with placeholders (`your_supabase_url`, `your_service_role_key`, etc.)
- [ ] Scrub git history with `git filter-repo` (or accept the rotation and move on)
- [ ] Confirm no old keys remain valid in any environment

**Env var standardization**
- [ ] Pick ONE: `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL`. Currently 4 files use APP_URL (`app/actions/auth.ts:52,218`, `app/actions/profile.ts:64`) and 3 use SITE_URL (`lib/email.ts:6`, `app/admin/actions.ts:155`, `app/actions/therapist-profile.ts:87`). Whichever is unset in Vercel produces `undefined/auth/callback` links.
- [ ] Update all 7 files to use the chosen var
- [ ] Set the chosen var in Vercel for production + preview environments
- [ ] Remove the other from `.env.example`

**Missing env vars to add to `.env.example` as placeholders**
- [ ] `RAZORPAY_WEBHOOK_SECRET=your_webhook_secret`
- [ ] `RESEND_API_KEY=your_resend_api_key`
- [ ] `CRON_SECRET=your_cron_secret`
- [ ] `RAZORPAY_PLAN_BASIC_WEEKLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_BASIC_MONTHLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_PREMIUM_WEEKLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_PREMIUM_MONTHLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_COUPLES_BASIC_WEEKLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_COUPLES_BASIC_MONTHLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_COUPLES_PREMIUM_WEEKLY=plan_xxx`
- [ ] `RAZORPAY_PLAN_COUPLES_PREMIUM_MONTHLY=plan_xxx`

**Dead env vars to remove from `.env.example` (not read by any code)**
- [ ] `NEXT_PUBLIC_DAILY_DOMAIN` (line 13)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (line 9) — duplicate of `RAZORPAY_KEY_ID`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (line 3) — code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

**Vercel production env (set before deploy)**
- [ ] All keys above in production AND preview scopes
- [ ] `CRON_SECRET` — required, code currently no-ops auth check if unset (security hole)
- [ ] Verify Supabase project region is `ap-south-1` (Mumbai)
- [ ] Verify Vercel serverless function region is `bom1` (Mumbai)

---

### 🔴 CRITICAL — Cannot go live without these

**Payments**
- [ ] Razorpay subscription plans created in Razorpay dashboard (Essentials, Premium, Couples, Monthly)
- [ ] Client plan selection UI → Razorpay checkout flow wired up
- [ ] Razorpay webhook handler (`/api/webhooks/razorpay`) — listens for `subscription.activated`, `subscription.charged`, `payment.failed`, updates `subscriptions` table
- [ ] Webhook signature verification (HMAC) — security requirement
- [ ] Subscription status gate — clients without an active subscription cannot access chat or video

**Auth flow gaps**
- [x] `/auth/callback` route — handles Supabase email confirmation links and magic links ✅
- [x] `/auth/reset-password` page — landing page for password reset emails ✅
- [ ] Test full signup → email confirmation → dashboard redirect flow end-to-end

**Legal**
- [ ] `/terms` page — Terms of Service (required for Razorpay merchant approval)
- [ ] `/privacy` page — Privacy Policy (required under DPDP Act 2023)
- [ ] Cookie consent banner (if using analytics)

**Infrastructure (one-time setup)**
- [ ] Run `supabase/migrations/20260329_notifications.sql` in Supabase SQL editor
- [ ] Run `alter publication supabase_realtime add table notifications;` in Supabase SQL editor
- [ ] Set `CRON_SECRET` env var in Vercel before deploy
- [ ] Set `NEXT_PUBLIC_SITE_URL` env var in Vercel (used for password reset redirect links)
- [ ] Move Supabase project to `ap-south-1` (Mumbai) region — Pro plan required
- [ ] Set Vercel serverless function region to `ap-south-1`

---

### 🟡 HIGH PRIORITY — Should be live at launch

**Core USPs — DONE ✅**
- [x] Free intro chat — 10 free messages within 7-day window, counter shown to client, server-enforced
- [x] Switch therapist flow — request form, admin Switch Requests tab, `therapist_switch_requests` table

**Client account & subscription management — DONE ✅**
- [x] Client account/profile page — update name, email, preferences at `/dashboard/account`
- [x] Client subscription page — view current plan, billing date at `/dashboard/subscription`
- [x] Graceful subscription expiry banner on chat + sessions pages

**Session notes for clients — DONE ✅**
- [x] Client-facing session notes view (read-only) on client dashboard at `/dashboard/notes`

**Loading & error states — DONE ✅**
- [x] `loading.tsx` for root, client dashboard, therapist dashboard
- [x] Custom `not-found.tsx` (404 page)
- [x] Custom `error.tsx` (500 / unexpected error page)
- [ ] Remove `force-dynamic` from static pages: FAQ, contact, landing — use ISR instead

**Therapist pending dashboard — DONE ✅**
- [x] Anonymised therapist carousel on pending client dashboard

---

### 🟠 IMPORTANT — Before scaling

**Landing page — DONE ✅**
- [x] TrustBar: "International Therapists", "DPDP Compliant", "Complete Privacy", "Licensed & Verified"
- [x] TherapyNeeds: removed three dots below headline
- [x] HowItWorks: cleaned up connector arrows, updated "50+ International Therapists" stat
- [x] Testimonials: 5 cards, updated grid layout
- [x] Section separation fixed (removed duplicate top waves from TherapistCards + Testimonials)
- [x] HeroSection: Individual + Teen category boxes both green; all boxes same height
- [x] Global: "15 min intro call" → "Free intro chat" across all files

**New pages — DONE ✅**
- [x] `/about` — About Us page with full copy, routed from navbar
- [x] `/contact` — Contact page with office/phone/email/social + message form

**Therapist dashboard improvements — DONE ✅**
- [x] Removed specialisations list from dashboard welcome section
- [x] Home icon → "Home" text in TherapistNav
- [x] Notes nav item added to TherapistNav, linking to proper notes page
- [x] Client cards clickable → `/therapist/dashboard/client/[matchId]` detail page
- [x] "New" badge on client cards matched within last 7 days
- [x] Payment page: removed Rate Card; "Request Cash Out" → email link; removed Bank/UPI section
- [x] Account form: removed Availability + Therapeutic Approach fields; added "Others" for specialisations/languages
- [x] Reset email redirect fixed (was pointing to account page; now correctly redirects to `/auth/reset-password`)
- [x] Therapist Notes page (`/therapist/dashboard/notes`) — full page with per-session editors

**Client dashboard improvements — DONE ✅**
- [x] Removed "View plans" tagline from chat input bar; replaced with cleaner subscribe CTA
- [x] Sessions banner: no longer says "plan expired" — now says "subscription required"
- [x] Help dropdown: removed "Reviews" link

**Therapist application page**
- [ ] Redesign to match brand colors fully (current form is functional but needs visual refresh)
- [ ] Add CV/document upload field
- [ ] Add "Others" + text input for specialisations/languages (done in account form, not yet in apply form)
- [ ] Redirect to new tab for onboarding after submission

**Therapist onboarding form**
- [ ] Brand-aligned redesign
- [ ] Add document upload (CV, certificates)
- [ ] Remove sign-in prompt

**Trust & profile completeness**
- [ ] Verified badge shown on therapist card (client-facing) when `is_verified = true`
- [ ] Profile photo upload on therapist account page (currently placeholder)
- [ ] Profile photo upload on client account page

**Availability calendar**
- [ ] Therapist DB-backed availability (currently shows hardcoded WEEKLY_SCHEDULE in client sessions view)
- [ ] Admin and clients should see therapist's actual set availability

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

### 🐛 KNOWN BUGS / ISSUES — Production Audit 2026-05-02

Each bug has: severity, file:line, description, and suggested fix.

---

#### 🔴 CRITICAL — Security & data loss

**B-01. Service role key + anon JWT committed to `.env.example`**
- File: `.env.example` lines 1–4
- Description: Production Supabase URL, anon JWT, publishable key, and `SUPABASE_SERVICE_ROLE_KEY=sb_secret_...` are all in plaintext in a tracked file. Anyone with repo read access can fully bypass RLS and access the live database. This is the single most consequential finding in the audit.
- Fix: Rotate all three keys in Supabase dashboard, scrub git history (or accept rotation as the mitigation), replace `.env.example` with placeholder values. Tracked in the SECRETS & ENV section above.

**B-02. IDOR — `saveSessionNotes` has no ownership check**
- File: `app/actions/sessions.ts` lines 202–219
- Description: Function uses the admin Supabase client (RLS bypass) and only checks that the caller is authenticated, not that they own the session. Any logged-in user (including a client) can pass any `sessionId` and overwrite the therapist's session notes. Directly contradicts the "therapists write, clients read" rule.
- Fix: Before update, fetch `session.match_id`, then `match.therapist_id`, and verify `match.therapist_id === user.id`. Reject otherwise.

**B-03. IDOR — `updateSessionStatus` has no ownership check**
- File: `app/actions/sessions.ts` lines 221–238
- Description: Same pattern as B-02 — admin client, no ownership check. Any auth'd user can flip any session to `cancelled` / `completed` / `ongoing`.
- Fix: Same ownership check (therapist OR client of the session's match) before update.

**B-04. IDOR — `scheduleSession` has no ownership check**
- File: `app/actions/sessions.ts` lines 117–198
- Description: Accepts any `matchId` without verifying caller is the therapist or client of that match. Triggers Daily.co room creation (cost burn) and writes a `sessions` row attributed to a match the user doesn't belong to.
- Fix: Fetch the match first; reject unless `match.therapist_id === user.id` (sessions are scheduled by therapists per CLAUDE.md flow).

**B-05. Cron auth is conditional**
- File: `app/api/cron/session-reminders/route.ts` lines 11–16
- Description: `if (cronSecret) { ... check ... }` — if `CRON_SECRET` env var is unset in Vercel, the route is publicly callable and will spam emails for every upcoming session each call.
- Fix: Make the check unconditional. Return 500 if `CRON_SECRET` is unset in production.

**B-06. Forgot-password leaks user existence + 1k user cap**
- File: `app/actions/auth.ts` lines 199–214
- Description: Returns the explicit message `"We don't have an account with that email."`, enabling email enumeration. Also calls `listUsers({ perPage: 1000 })` which silently caps; once the platform crosses 1k users, password reset stops working for the (1001 + n)th user.
- Fix: Always return the same success message regardless of whether the email exists. Replace `listUsers` with a direct lookup or paginated scan.

**B-07. Two Razorpay webhook handlers wired**
- Files: `app/api/webhooks/razorpay/route.ts` (canonical) and `app/api/payment/webhook/route.ts` (legacy). Both whitelisted in `lib/supabase/middleware.ts:72–73`.
- Description: If both URLs are configured in Razorpay, every event triggers double-writes. If only the legacy URL is set, the canonical handler never sees events. Either way, subscription state is wrong.
- Fix: Delete `app/api/payment/webhook/route.ts` and remove `/api/payment/webhook` from middleware allowlist. Confirm only `/api/webhooks/razorpay` is configured in Razorpay dashboard.

**B-08. HMAC comparison uses `===` (not timing-safe)**
- Files: `app/api/payment/verify/route.ts:55` and `app/api/webhooks/razorpay/route.ts:41`
- Description: Direct string equality on HMAC signatures is theoretically vulnerable to timing attacks. Practical exposure is small for short HMACs over TLS, but it's a one-line fix that should be done before production.
- Fix: Use `crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))` after length-equality guard.

**B-09. Webhook idempotency missing on `subscription.charged`**
- File: `app/api/webhooks/razorpay/route.ts` line 104 onward
- Description: No event-ID dedup. Razorpay retries on 5xx (and sometimes on 2xx slow responses); a single charge event can land twice and double-extend `current_period_end`.
- Fix: Add a `processed_webhook_events` table keyed on Razorpay event ID with a unique constraint, OR dedupe on `(razorpay_payment_id, event_type)` before applying state changes.

**B-10. `/api/payment/verify` trusts client-supplied `plan`**
- File: `app/api/payment/verify/route.ts` lines 12, 67–68
- Description: The Zod schema accepts `plan` from the client and uses it to compute `current_period_end`. A client can pay weekly, send `plan=monthly`, and get a longer billing period.
- Fix: Look up the actual subscription cadence from the Razorpay subscription/order or from the existing DB row instead of trusting client input.

**B-11. Race in subscription creation**
- File: `app/api/payment/create-subscription/route.ts` lines 56–68
- Description: Check-then-act: queries for existing active subs, then cancels pending ones, then creates new. Two parallel calls can both pass the check and both create, resulting in two active subscriptions for the same client.
- Fix: Wrap in a Postgres transaction with `SELECT ... FOR UPDATE`, or add a unique partial index `WHERE status IN ('active','pending')` on `subscriptions.client_id` to make the second insert fail.

---

#### 🔴 CRITICAL — Functional / data correctness

**B-12. Questionnaire data never reaches the database**
- Files: `app/questionnaire/page.tsx` (legacy), `app/questionnaire/individual/page.tsx`, `app/questionnaire/couples/page.tsx`, `app/questionnaire/teen/page.tsx`
- Description: ALL FOUR questionnaire flows save responses to `sessionStorage` only. None call `saveQuestionnaire()` or write to the `questionnaire_responses` table. Combined with B-13 below, the admin's Pending Clients screen has nothing to show because nothing is being persisted in the first place.
- Fix: Add a server action `saveQuestionnaire` that writes to `questionnaire_responses` keyed by an anonymous session ID, then on signup associate the row with the new `auth.user.id`.

**B-13. Admin pending clients show empty fields**
- Files: signup at `app/actions/auth.ts:73` (comment "Stored in questionnaire_responses table only") + admin UI reads from `client_profiles`.
- Description: Signup deliberately skips writing to `client_profiles`. Admin match modal renders Gender, Therapy goals, Therapist preference, etc. — all blank for every client. Admin cannot make informed matches.
- Fix: Either backfill `client_profiles` from `questionnaire_responses` at signup, OR change the admin UI to read from `questionnaire_responses` directly.

**B-14. Cancel-subscription contradicts its stated behavior**
- File: `app/actions/subscription.ts` lines 40, 70–77; gate at `app/actions/sessions.ts:34–38`
- Description: The Razorpay API call uses `cancel_at_cycle_end: 1` (correct) but the DB write flips status to `'cancelled'` immediately. The chat/session gate requires `status='active'`. Result: a user pays for a month, clicks cancel, loses chat access instantly — contradicting the inline comment that claims "client keeps access until period_end".
- Fix: Pick one model and align all three pieces (Razorpay flag, DB status, gate). Recommended: keep status `active` until `current_period_end` passes, with a separate `cancellation_pending` flag for UI; a daily cron flips to `cancelled` when the period ends.

**B-15. `subscription_plan` enum mismatch**
- Files: `supabase/schema.sql:14` (only `weekly`/`monthly`), `supabase/migrations/20260402_subscription_plans.sql` (adds 8 named keys), `app/api/payment/create-order/route.ts:96` (writes old keys), `app/api/payment/create-subscription/route.ts:115` (writes new keys), `lib/plans.ts:5–157`
- Description: Two payment paths writing two incompatible plan vocabularies into the same enum column. Fresh environments (bootstrapped from `schema.sql`) will reject the new values entirely.
- Fix: Pick one vocabulary (recommend the 8-key set since it encodes plan tier + cadence). Drop unused enum values, update both code paths, fold migration back into `schema.sql`.

**B-16. Therapist payment page hardcodes plan keys that don't exist**
- File: `app/therapist/dashboard/payment/page.tsx` lines 8–13
- Description: Uses keys `essentials/premium/couples/monthly`. None match the canonical 8-key set in `lib/plans.ts`. Plan-name lookups silently return `null`, displaying empty values.
- Fix: Replace with the actual plan keys from `lib/plans.ts`. Pull plan metadata from the same source the rest of the app uses.

**B-17. `razorpay_plan_id` column abused as order-ID dump**
- File: `app/api/payment/create-order/route.ts:100` writes `order.id` into `razorpay_plan_id`; `app/api/payment/webhook/route.ts:64,86,110` queries on it.
- Description: The legacy webhook works "by accident" because it queries the same wrong column the order route writes. Any new code that reads `razorpay_plan_id` expecting an actual plan ID will break.
- Fix: Add a `razorpay_order_id` column (or use the existing `razorpay_payment_id`). Fix the writer and the webhook query.

**B-18. `profiles.email` is selected but doesn't exist on the table**
- Files: `app/therapist/dashboard/page.tsx:93`, `app/therapist/dashboard/client/[matchId]/page.tsx:49,151`. Schema (`supabase/schema.sql:24–33`) has no `email` column.
- Description: Therapist client cards select `email` and render `{c.email}` as empty / falsy. The subscribe page does it correctly — it uses `admin.auth.admin.getUserById` and passes email as a prop.
- Fix: Either add `email` to `profiles` (denormalized, kept in sync via a trigger from `auth.users`), or remove all selects and use `auth.admin.getUserById` server-side everywhere.

**B-19. Admin `createMatch` allows double-matching**
- File: `app/admin/actions.ts` lines 24–53
- Description: Doesn't check whether the client already has an active match. Schema has no unique constraint either. Violates the "one active match per client" rule from CLAUDE.md.
- Fix: Add a check before insert (`SELECT 1 FROM matches WHERE client_id=$1 AND status='active'` → reject), AND add a unique partial index `CREATE UNIQUE INDEX ON matches (client_id) WHERE status = 'active'`.

**B-20. Cron dedup filter is broken**
- File: `app/api/cron/session-reminders/route.ts` line 47
- Description: `.filter('metadata->sessionId', 'eq', `"${s.id}"`)` wraps the value in literal double-quotes, which won't match raw JSON values stored in the metadata column. The dedup never matches → reminders are likely sent every cron run.
- Fix: Remove the literal quotes. Use `.eq('metadata->>sessionId', s.id)` (the `->>` operator returns text, matching the unquoted UUID).

**B-21. Cron email title says "Session in 1 Hour" but window is 25 hours**
- Files: `vercel.json` cron schedule + `lib/email.ts` lines 21 (`25 * 3_600_000` ms window) and 114–122 (template title "Session in 1 Hour")
- Description: Cron runs daily at 05:00 UTC and emails every session in the next 25 hours. Recipients get an email saying "Session in 1 Hour" up to 25 hours in advance.
- Fix: Either run cron hourly with a 1-hour window, or change template copy to "Your session is tomorrow at {time}" and run daily.

**B-22. Contact form never sends anything**
- File: `app/contact/page.tsx` lines 14–21
- Description: `handleSubmit` does `await new Promise(r => setTimeout(r, 800))` and shows "Sent. We'll get back to you within one business day." The message is silently dropped.
- Fix: Either POST to a server action that writes to a `contact_messages` table, or send via Resend, or both.

---

#### 🟠 HIGH — Missing pages, broken links, infra

**B-23. `/terms` page doesn't exist** — Referenced from `components/home/Footer.tsx:106` and `app/(auth)/signup/page.tsx:222`. Required for Razorpay merchant approval and DPDP compliance.

**B-24. `/pricing` page doesn't exist; `components/home/PricingPlans.tsx` is unused** — Component exists but is imported nowhere. Either build the page or delete the component.

**B-25. Footer links broken** — `components/home/Footer.tsx`:
  - About + Contact use `href="#"` (should be `/about`, `/contact`)
  - All social icons `href="#"`
  - Services links use `/questionnaire?type=individual|couples|teen` query that the legacy questionnaire page ignores; real routes are `/questionnaire/{individual,couples,teen}`

**B-26. JSON-LD says `medicalSpecialty: "Psychiatry"`**
- File: `app/layout.tsx` line 96
- Description: ZenSpace explicitly does not prescribe medication or offer psychiatry. This SEO claim is incorrect and could mislead users / crawlers.
- Fix: Change to `"Psychotherapy"` or `"CounselingPsychology"`.

**B-27. Missing static assets** — `og-image.png`, `robots.txt`, `sitemap.xml` all absent from `/public`. Social previews 404; SEO crawl is unguided. `app/layout.tsx:56,68` references `og-image.png`.

**B-28. `next.config.ts` is empty** — No `images.remotePatterns` for Supabase storage. Avatar uploads will fail to render via `<Image>`.

**B-29. Tone-of-voice violations** — `app/(auth)/login/page.tsx:114` uses "therapy journey"; `app/(auth)/signup/page.tsx:153` uses "on your terms". Both on the explicit avoid list in CLAUDE.md.

**B-30. Demo phone number in contact page** — `app/contact/page.tsx:79` shows `+91 98765 43210`. Replace or remove the phone block.

**B-31. Missing `error.tsx` and `not-found.tsx` for dashboards**
  - No `app/(client)/dashboard/error.tsx`
  - No `app/therapist/dashboard/error.tsx`
  - No `not-found.tsx` for `app/therapist/dashboard/client/[matchId]` — a `notFound()` call lands on the global 404 instead of the dashboard-shaped 404.

**B-32. `force-dynamic` on static pages wastes SSR**
  - `app/(client)/dashboard/faq/page.tsx`
  - `app/(client)/dashboard/reviews/page.tsx`
  - Possibly `/about`, `/contact`, `/blog`, `/faq` (verify)
  - Fix: remove `export const dynamic = 'force-dynamic'`; use ISR (`export const revalidate = N`).

---

#### 🟠 HIGH — Design synchronicity

**B-33. Legacy questionnaire uses non-brand colors**
- File: `app/questionnaire/page.tsx`
- Description: Uses generic `teal-50`, `teal-600`, `cyan-100`, `text-teal-700` — Tailwind defaults that don't match the brand palette (`#233551` navy, `#7EC0B7` teal, `#E8926A` coral, `#FFF5F2` cream). Also the page doesn't read query strings, doesn't save to DB, and is now superseded by `/questionnaire/{individual,couples,teen}`.
- Fix: Delete the page, or redirect to `/questionnaire/individual` as the default landing.

**B-34. Form input borders inconsistent**
- Description: Auth pages use `border` (1px). Contact page, therapist apply, and questionnaires use `border-2` (heavier). Reads as visual incoherence between sibling forms.
- Fix: Standardize to `border border-slate-200 h-11 rounded-xl` for inputs everywhere.

**B-35. Button radii inconsistent**
- Description: Landing + auth CTAs use `rounded-full` (pill). Questionnaire option buttons + therapist apply submit use `rounded-xl`. Pills feel premium; rounded-xl feels utilitarian.
- Fix: Standardize primary CTAs to `rounded-full`; keep `rounded-2xl`/`rounded-3xl` for card containers only.

**B-36. Page padding inconsistent**
- Description: Landing uses `px-6`. Questionnaires use `px-4`. Dashboard mixes `px-4` and `px-5`.
- Fix: Standardize `px-6` for desktop, `px-4` only on narrow mobile widths.

**B-37. Hex colors hardcoded everywhere**
- Description: `bg-[#233551]`, `text-[#7EC0B7]`, etc. used 100+ times across components. No central token. Future palette changes require a search-and-replace.
- Fix: Add `brand.navy`, `brand.teal`, `brand.coral`, `brand.cream` to `tailwind.config.ts` `theme.extend.colors`. Refactor incrementally.

**B-38. Questionnaire pages have no Navbar/Footer wrapper**
- Description: `/questionnaire/{individual,couples,teen}` render in isolation, breaking the shell users see on every other page.
- Fix: Wrap each in `<Navbar /> ... <Footer />`.

**B-39. Section accent color inconsistent**
- Description: Some labels use `text-[#3D8A80]`, others `text-[#7EC0B7]` for the same UI role.
- Fix: Pick one for "section accent"; reserve the other for hover/active.

**B-40. Form heading sizes too small relative to landing**
- Description: Landing H1 is `text-4xl md:text-5xl lg:text-[3.6rem]`. Form headings are `text-xl`/`text-2xl`. Forms feel de-emphasized.
- Fix: Bump form primary headings to `text-3xl md:text-4xl`.

---

#### 🟡 MEDIUM — Code quality / pre-scale

**B-41. Pervasive `(supabase as any)` casts** — Disables type safety on most DB writes. The `Database` type is rarely actually used. Fix: replace casts with `createClient<Database>()` and let TS catch mismatches like B-18.

**B-42. SQL migrations not folded into `schema.sql`** — Fresh environments bootstrapped from `schema.sql` will be missing `notifications`, `therapist_applications`, `therapist_availability`, `therapist_switch_requests`, and the extended `subscription_plan` enum. Fix: regenerate `schema.sql` from a fresh apply of all migrations, or merge by hand.

**B-43. Realtime publication for `notifications` not auto-applied** — `alter publication supabase_realtime add table notifications;` must be run manually in production Supabase. Tracked in CRITICAL infra section.

**B-44. `WEEKLY_SCHEDULE` hardcoded** — `components/client/ClientSessionsView.tsx:39–47` ignores the therapist's actual `availability_text` from the DB and shows the same fake schedule for every therapist.

**B-45. Daily.co video frontend missing** — `@daily-co/daily-js` is in `package.json` but never imported. `JoinButton` opens the room URL in a new tab. Decide: build in-app video UI, or accept hosted-tab launch and update copy. If staying hosted, validate `roomUrl` matches `*.daily.co` before opening (anti-phishing).

**B-46. Notification fire-and-forget swallows errors** — `app/actions/sessions.ts:185–192` does `.catch(() => {})`. If both email and push fail, the user thinks they've been notified. Fix: log to Sentry/console with full context.

**B-47. `markMessagesRead` not awaited inside realtime callback** — `components/shared/ChatInterface.tsx:77`. Fast unmounts drop the DB write.

**B-48. Weekly session limit hardcoded `>= 1`** — `components/client/ClientSessionsView.tsx:232`. Couples or premium plans should support >1 session/week without a code change.

**B-49. Switch-request doesn't verify match is active** — `app/actions/switch-therapist.ts:37–42` only checks the match exists. A client could request a switch on a match that ended months ago.

**B-50. No rate limiting** — Signup, password reset, payment verify, message send, session schedule, contact form — all unbounded. Fix: add `@upstash/ratelimit` or middleware-level limits keyed on IP + user ID.

**B-51. No DPDP-compliant data deletion flow** — Required by Indian law (DPDP Act 2023) for any personal data collected. Users must be able to request account + data deletion.

**B-52. Admin login has no `noindex` metadata** — `/admin/login` is crawlable. Add `metadata: { robots: { index: false } }`.

---

#### ✅ Resolved / not actually bugs (cleared from prior list)

- ~~Therapist nav showing Notes when unmatched~~ — Audit confirmed the filter logic works correctly per render.
- ~~Chat intro count behavior~~ — Confirmed correct: counter resets on re-match because it scopes to `match_id + sender_id`.

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
