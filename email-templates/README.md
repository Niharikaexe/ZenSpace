# MindCanopy Email Templates

Standalone HTML previews of every email the platform sends. Open any `.html` file in a browser to see the rendered email.

All templates live in `lib/email.ts` and are wired to their triggers. Previews in this folder are generated from `scripts/render-emails.js`. Re-run with:

```bash
node scripts/render-emails.js
```

## Status

**27 templates total, all wired.** All approved client-facing copy from the brand-voice review has been applied. Five new cron routes (in `app/api/cron/`) handle the recurring nudges and warning emails.

| Recipient | Count | Notes |
|---|---|---|
| Client | 6 | welcome, match-made, session scheduled, session reminder, chat-not-started nudge, not-subscribed nudge |
| Therapist | 12 | matched, unmatched, message, profile verified, availability nudge, session scheduled, session reminder, missed session, reply overdue, cancellation pattern, account paused, concern raised |
| Applicant | 2 | application received + verify, application approved + invite code |
| Admin | 7 | new application, new client signup, new subscription, therapist onboarded, contact form, switch request, payout request |

## Full list

### Client (6)

| File | Trigger |
|---|---|
| `client-welcome.html` | Post-signup (in `app/actions/auth.ts`) |
| `client-match-made.html` | Admin assigns a therapist (in `app/admin/actions.ts`). Uses `matches.notes` as the personalized blurb |
| `client-session-scheduled.html` | Therapist schedules a session (in `app/actions/sessions.ts`) |
| `client-session-reminder.html` | Daily cron, 25h before session (in `app/api/cron/session-reminders`) |
| `client-chat-not-started.html` | Daily cron, when client hasn't sent a message 7 days after match (in `app/api/cron/chat-not-started`). Max 5 sends. |
| `client-not-subscribed.html` | Daily cron, when client has chatted but no active sub (in `app/api/cron/no-subscribe-nudge`). Max 5 sends. |

### Therapist (12)

| File | Trigger |
|---|---|
| `therapist-client-matched.html` | Admin creates match (in `app/admin/actions.ts`) |
| `therapist-client-unmatched.html` | Admin actions switch request |
| `therapist-client-message.html` | Client sends a chat message (debounced) |
| `therapist-profile-verified.html` | Admin toggles `is_verified` |
| `therapist-availability-nudge.html` | Daily cron, every 3 days when availability not set. Max 5 sends. |
| `therapist-session-scheduled.html` | A session is scheduled for them |
| `therapist-session-reminder.html` | Daily cron, 25h before session |
| `therapist-missed-session.html` | Hourly cron, when session past + 15min grace and still `scheduled` |
| `therapist-reply-overdue.html` | Hourly cron, when a client message has been unread for 48h |
| `therapist-cancellation-pattern.html` | Triggered when therapist exceeds N cancellations in window (dev wiring TBD) |
| `therapist-account-paused.html` | Admin pauses account (admin UI button TBD) |
| `therapist-concern-raised.html` | Admin marks a concern raised by a client (admin UI TBD) |

### Applicant (2)

| File | Trigger |
|---|---|
| `applicant-received.html` | `/therapist/apply` submit |
| `applicant-approved.html` | Admin approves application |

### Admin (7)

| File | Trigger |
|---|---|
| `admin-new-application.html` | Therapist submits apply form |
| `admin-new-client-signup.html` | Client signs up |
| `admin-new-subscription.html` | Razorpay payment verified |
| `admin-therapist-onboarded.html` | Therapist completes onboarding |
| `admin-contact-form.html` | Visitor submits `/contact` |
| `admin-switch-request.html` | Client requests new therapist |
| `admin-payout-request.html` | Therapist clicks "Request payout" |

## Cron schedules

All routes use `CRON_SECRET` bearer auth. Schedules live in `vercel.json`:

| Route | Schedule (UTC) | Purpose |
|---|---|---|
| `/api/cron/session-reminders` | `0 5 * * *` (daily 05:00) | Session reminder, both parties |
| `/api/cron/availability-nudge` | `0 6 * * *` (daily 06:00) | Therapist availability nudge |
| `/api/cron/chat-not-started` | `0 7 * * *` (daily 07:00) | Client chat-not-started nudge |
| `/api/cron/no-subscribe-nudge` | `0 8 * * *` (daily 08:00) | Client not-subscribed nudge |
| `/api/cron/reply-overdue` | `0 * * * *` (hourly) | Therapist 48h reply overdue |
| `/api/cron/missed-sessions` | `0 * * * *` (hourly) | Therapist missed session |

## What's NOT yet wired

These templates exist but need triggers or admin UI to actually fire:

- **`therapist-cancellation-pattern.html`** — needs a hook in the session-cancel server action that counts cancellations per therapist per window and dispatches when threshold crossed. No code path fires it today.
- **`therapist-account-paused.html`** — needs an admin UI button "Pause therapist account" and a server action that updates a status field on `therapist_profiles` and dispatches. No code path fires it today.
- **`therapist-concern-raised.html`** — needs an admin UI flow to log a concern (probably a new `concerns` table) and a server action that dispatches the email. No code path fires it today.

All three are tracked in `TODO.md` under Dev > Email.
