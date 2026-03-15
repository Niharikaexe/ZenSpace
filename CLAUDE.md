# ZenSpace — Project Brief for Claude

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

## Coding Rules for Claude

- Always work on the `dev` branch. Never push to `main`.
- Build one feature/phase at a time — do not jump ahead.
- Keep components small and focused.
- Use server components by default; client components only when needed (interactivity, hooks).
- All DB access from server-side (Server Components, Route Handlers, Server Actions).
- Use the admin Supabase client only in server-side code, never expose service role key to client.
- Validate all inputs with Zod before DB writes.
- No dummy data in production paths — use real Supabase queries.
