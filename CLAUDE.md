# MindCanopy — Project Brief for Claude

---

## COMPANY CONTEXT

MindCanopy is a subscription-based online therapy platform focused exclusively
on the Indian market. It offers:
- Weekly therapy sessions (video) with globally trained therapists
- Unlimited async text messaging with your therapist between sessions
- A fully online experience — no clinics, no waiting rooms, no prescriptions
- The ability to switch therapists anytime, no explanation needed
- A therapist portal where therapists can write and publish SEO blogs
- Admin oversight of all therapist-client assignments
- A free introductory chat before any payment

**IMPORTANT CONSTRAINT:** MindCanopy does not prescribe medication. It is
a talk therapy and counselling platform only. Never imply or suggest
diagnostic or prescription services.

### PRICING TIERS
- **Essentials:** ₹2,999/week — 1 video session (50 min) + unlimited async text
- **Premium:** ₹4,499/week — 1 session + priority text + foreign therapist access
- **Couples:** ₹5,999/week — 1 couples session (60 min) + text for both partners
- **Monthly Bundle:** ₹9,999/month — 4 sessions + text + switch therapist anytime

### PER-SESSION PRICING (dual-therapist match flow)
After matching, the client picks between a **Standard** and a **Professional** therapist and pays
**per session** (or a monthly bundle of 4 sessions at 15% off). Per-session prices vary by category
and tier — single source of truth is `SESSION_PRICING` in `lib/plans.ts`:

| Category | Standard | Professional |
|---|---|---|
| Adult / Individual | ₹1,300 | ₹3,200 |
| Teen | ₹1,800 | ₹4,000 |
| Couples | ₹2,400 | ₹5,000 |

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
4. **Dashboard — Pending Match state** (no proposals yet)
   - Message: "We're matching you with the most aligned therapists." **No payment prompt and no
     pricing plans on this screen** — the client only pays once they've chosen a therapist and book
     a session.
   - **Questionnaire unanswered** → prompt the user to take the questionnaire so we can match them.
   - Carousel of sample/anonymised therapist profiles (to build trust).
5. **Dashboard — Choose your therapist state** (after admin proposes two therapists)
   - The admin hand-picks **two** therapists: a **Standard** (basic-tier) and a **Professional**
     (premium-tier) therapist. Both are stored as `pending` matches.
   - The client sees a two-tab UI ("Standard" / "Professional"). Each tab shows that therapist's
     full profile: photo, name, credentials, quote/tagline, bio, specializations, approach, an
     optional admin "Why we think you'll click" summary, how sessions work, and **per-session
     pricing** for that tier (pay-as-you-go, or a monthly bundle of 4 sessions at 15% off).
   - A **"Start a free chat"** button attaches that therapist (flips the chosen match to `active`,
     ends the other proposal) and drops the client into the chat/sessions dashboard.
   - Component: `components/client/TherapistMatchSelection.tsx`; action:
     `app/actions/choose-therapist.ts`.
6. **Dashboard — Matched state** (after the client starts a chat)
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
2. View all clients in "pending match" state with their full questionnaire answers
3. View all verified therapists and their capacity
4. **Propose two therapists** to a client — one **Standard** (basic-tier) and one **Professional**
   (premium-tier) — via the Match modal. This creates two `pending` match records (one per tier),
   each with an optional interview summary the client will see. Action: `createMatchProposals` in
   `app/admin/actions.ts`.
5. View all matches (proposals show as "Proposed · awaiting client"; the client's choice becomes the
   one `active` match), sessions, subscriptions
6. Verify therapist credentials (toggle `is_verified`)

### Matching model
- `matches.status`: `pending` = a proposed therapist awaiting the client's choice; `active` = the
  therapist the client started a chat with; `ended` = a declined proposal or an ended match.
- `matches.tier` = `'standard'` | `'professional'`; `matches.admin_summary` = the per-therapist
  blurb shown on the client's selection card.
- A client may have **two** `pending` proposals but only **one** `active` match (enforced by the
  partial unique index `idx_matches_one_active_per_client`). Choosing one ends the other.

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
- Landing page (BetterHelp-inspired with MindCanopy branding)
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
- [x] `/terms` page — Terms of Service (required for Razorpay merchant approval) ✅
- [x] `/privacy` page — Privacy Policy (required under DPDP Act 2023) ✅
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
- **Always pull/merge `main` into `dev` before pushing to `dev`.** `main` sometimes gets direct changes (e.g. an analytics tag merged via its own PR), so pulling main in first keeps the branches from diverging and stops conflicts piling up on the eventual `dev → main` PR. **Do NOT rely on git's auto-merge** when main and dev have both changed code — auto-merge can silently duplicate/garble blocks. Prefer a `-s ours` merge that keeps dev's tree, then explicitly bring in only the file(s) main uniquely changed; or resolve each conflict by hand keeping dev's version of feature files. Always typecheck after.
- Build one feature/phase at a time — do not jump ahead.
- Keep components small and focused.
- Use server components by default; client components only when needed (interactivity, hooks).
- All DB access from server-side (Server Components, Route Handlers, Server Actions).
- Use the admin Supabase client only in server-side code, never expose service role key to client.
- Validate all inputs with Zod before DB writes.
- No dummy data in production paths — use real Supabase queries.


---

## Legal & Platform Protection

### What You Should Actually Do to Protect Yourself
Even though no one is actively checking right now, do these things from Day 1:

**1. Terms of Service must clearly state:**
- You are a marketplace platform, not a therapy provider
- Therapists are independent contractors, not your employees
- You don't verify or guarantee therapist credentials (or alternatively — you do verify, and state how)
- Users engage with therapists at their own discretion

**2. Therapist onboarding agreement must state:**
- They are responsible for holding valid licenses in their own country
- They are responsible for complying with laws in the countries they serve clients in
- They indemnify your platform for any malpractice claims

**3. Consider basic credential verification:**
- Not legally required for your platform
- But it builds massive trust with Indian users who are skeptical about online therapy
- Even a simple "we verify degree certificates" goes a long way
- Look at how Practo or Therapize India does this


---

## Cashfree Payments — Integration Skills

You are helping a developer integrate Cashfree Payments.

### How to use these skills

1. **Always** read `.claude/skills/cashfree-skills/getting-started/SKILL.md` first if the user is new to Cashfree
2. The moment a task turns into **real Cashfree integration work** (you are about to add or modify Cashfree-specific code or config), follow the "Before You Start" section of `.claude/skills/cashfree-skills/getting-started/SKILL.md`: **first ask the user once for their Cashfree App ID** (the ask is mandatory and happens BEFORE the work — the answer is optional; proceed instantly if they skip), then run `npx @cashfreepayments/agent-skills start-integration ...` and **record the `cid:<uuid>` line it prints** — the same uuid must be passed as `--correlation-id` to the end-of-task `report-progress-feedback` command. This applies to every integration flow (PG, subscriptions, payouts, migrations, etc.), not only ones that start from getting-started
3. Read `.claude/skills/cashfree-skills/eligible-payment-modes/SKILL.md` early in any new integration. **If `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` are already available** (in the codebase, `.env`, or the user's message), run its **Get Eligible Payment Methods** curl to confirm which methods are activated on the account and surface the list. **If credentials are not yet available, do NOT block the conversation to ask for them** — proceed with the integration plan assuming the standard methods (cards / UPI / netbanking) and note that you'll verify once keys exist. Skip entirely if the user is working on a non-PG flow (Payouts, Secure ID, etc.)
4. Match the user's goal to a skill below and read that file
5. After any integration code is written, **ALWAYS** read `.claude/skills/cashfree-skills/validation-and-testing/SKILL.md`
6. **Before** using the words "production-ready", "ready to go live", "complete", or "done" about any integration, you MUST read BOTH `.claude/skills/cashfree-skills/validation-and-testing/SKILL.md` AND `.claude/skills/cashfree-skills/pg/go-live/SKILL.md` and surface every unmet item. Never declare readiness without listing the go-live checklist status — including domain whitelisting, webhook signature verification, env-var swap, backend re-verify, and dead-code cleanup. Phrase your verdict as "the integration looks correct, but X / Y / Z must be done before going live" — not as a blanket "production-ready"
7. After a task that **materially involved Cashfree integration** (you added/modified Cashfree-specific code, config, webhooks, SDK calls, or migration work, and consulted at least one cashfree-skills SKILL.md), read `.claude/skills/cashfree-skills/progress-and-skill-feedback/SKILL.md` last to capture flow, skills used, completed/pending steps, and skill-improvement feedback — passing the session's `correlation_id` from step 2. **Skip entirely** if the task did not touch Cashfree code — e.g. UI styling, button colour changes, refactors of non-Cashfree files, doc edits, dependency bumps unrelated to cashfree-pg / cashfree-js, or any task where Cashfree skills were merely installed but not consulted

### Skill Map

| User wants to... | Read this skill |
|---|---|
| Understand what Cashfree offers, get API keys, setup | `.claude/skills/cashfree-skills/getting-started/SKILL.md` |
| Know which payment modes are enabled/supported | `.claude/skills/cashfree-skills/eligible-payment-modes/SKILL.md` |
| Integrate Payment Gateway (overview) | `.claude/skills/cashfree-skills/pg/SKILL.md` |
| Integrate PG via backend SDK (Node.js, Python, Java, Go) | `.claude/skills/cashfree-skills/pg/backend-sdks/SKILL.md` |
| Integrate PG via direct REST/S2S API calls | `.claude/skills/cashfree-skills/pg/apis/SKILL.md` |
| Integrate PG into mobile apps (Android, iOS, RN, Flutter) | `.claude/skills/cashfree-skills/pg/mobile-sdks/SKILL.md` |
| Set up webhooks and handle payment events | `.claude/skills/cashfree-skills/pg/webhooks/SKILL.md` |
| Go live — switch from sandbox to production | `.claude/skills/cashfree-skills/pg/go-live/SKILL.md` |
| Issue, track, or handle refunds (partial, instant, multi) | `.claude/skills/cashfree-skills/pg/refunds/SKILL.md` |
| Respond to a dispute / chargeback / retrieval request | `.claude/skills/cashfree-skills/pg/disputes/SKILL.md` |
| Create, share, or handle payment links (hosted URLs) | `.claude/skills/cashfree-skills/pg/payment-links/SKILL.md` |
| Save cards (RBI tokenization / card-on-file / OneClick) | `.claude/skills/cashfree-skills/pg/token-vault/SKILL.md` |
| Integrate Cashfree.js v3 into a web frontend (Drop-in / Elements) | `.claude/skills/cashfree-skills/pg/web-sdk/SKILL.md` |
| Build a marketplace with Easy Split / vendor settlements | `.claude/skills/cashfree-skills/pg/easy-split/SKILL.md` |
| Run bank/BIN offers, instant discounts, no-cost EMI | `.claude/skills/cashfree-skills/pg/offers/SKILL.md` |
| Integrate Secure ID (KYC / bank verification) | `.claude/skills/cashfree-skills/secure-id/SKILL.md` |
| Set up Subscriptions / recurring billing | `.claude/skills/cashfree-skills/subscriptions/SKILL.md` |
| Process cross-border / international payments | `.claude/skills/cashfree-skills/cross-border/SKILL.md` |
| Send payouts / disbursements | `.claude/skills/cashfree-skills/payouts/SKILL.md` |
| Understand settlements, reconcile against bank, match UTRs | `.claude/skills/cashfree-skills/settlements-and-reconciliation/SKILL.md` |
| Accept inbound via virtual bank accounts / static VPAs / QR | `.claude/skills/cashfree-skills/auto-collect/SKILL.md` |
| Migrate an existing Razorpay integration to Cashfree | `.claude/skills/cashfree-skills/migrate-from-razorpay/SKILL.md` |
| Migrate an existing Juspay integration to Cashfree | `.claude/skills/cashfree-skills/migrate-from-juspay/SKILL.md` |
| Record end-of-task progress after a **Cashfree-integration** task (NOT for unrelated UI/refactor/doc work) | `.claude/skills/cashfree-skills/progress-and-skill-feedback/SKILL.md` |
| Validate or test the integration | `.claude/skills/cashfree-skills/validation-and-testing/SKILL.md` |
| Debug a broken integration, fix errors, troubleshoot | `.claude/skills/cashfree-skills/common-mistakes/SKILL.md` |

### Shared Conventions

- Sandbox base URL: `https://sandbox.cashfree.com`
- Production base URL: `https://api.cashfree.com`
- Always use env vars for `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY`
- Latest PG API version: `2025-01-01`
