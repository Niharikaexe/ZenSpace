# MindCanopy Email Templates

Standalone HTML previews of every email the platform sends. Open any `.html` file in a browser to see the rendered email.

These are previews. The truth still lives in `lib/email.ts` (the live wired templates) and the two new ones in this folder (`client-welcome.html`, `client-match-made.html`) waiting to be wired.

## Naming convention

`<recipient>-<purpose>.html`. Recipient is one of `client`, `applicant`, `therapist`, `admin`.

---

## Status overview

**18 templates total.** 16 live in `lib/email.ts` (wired and sending today). 2 written this session (`client-welcome.html`, `client-match-made.html`) but not yet wired into `lib/email.ts`.

| Recipient | Count | Live? |
|---|---|---|
| Client | 3 | 1 live, 2 pending wire |
| Applicant | 2 | 2 live |
| Therapist | 6 | 6 live |
| Admin | 7 | 7 live |

---

## Full list

### Client (3)

| File | Status | Trigger | TOV audit |
|---|---|---|---|
| `client-welcome.html` | **PENDING WIRE** | Post-signup | In voice. Founder-approved. |
| `client-match-made.html` | **PENDING WIRE** | Admin assigns therapist | In voice. Founder-approved. |
| `client-session-reminder.html` | LIVE | Daily cron, 25h before session | OK. Footer says "verified therapist" which is wrong for client recipients (base template issue, see Action 1 below). |

### Applicant (2)

| File | Status | Trigger | TOV audit |
|---|---|---|---|
| `applicant-received.html` | LIVE | `/therapist/apply` submit | **Contains "15-minute intro call" violation** in step 3 of the "what happens next" list. Also 5 `&mdash;` em-dash entities throughout the steps list. Custom footer (no "verified therapist" issue here). |
| `applicant-approved.html` | LIVE | Admin approves application | OK. Has the invite code box. Custom footer. |

### Therapist (6)

| File | Status | Trigger | TOV audit |
|---|---|---|---|
| `therapist-client-matched.html` | LIVE | Admin creates match | OK. Direct, functional. |
| `therapist-client-unmatched.html` | LIVE | Admin actions switch request | **Cold and corporate.** "The MindCanopy admin has ended this match. If you have questions, please contact support." Doesn't match the brand voice. Worth a rewrite. |
| `therapist-client-message.html` | LIVE | Client sends chat (debounced 5 min) | OK, terse. |
| `therapist-profile-verified.html` | LIVE | Admin toggles `is_verified` | OK. |
| `therapist-session-scheduled.html` | LIVE | Therapist schedules session | OK. Could be warmer. |
| `therapist-session-reminder.html` | LIVE | Daily cron, 25h before session | OK. |

### Admin (7)

These are operational alerts to the admin inbox. They don't need brand voice (Niharika reads them), but they should be functional.

| File | Status | Trigger | TOV audit |
|---|---|---|---|
| `admin-new-application.html` | LIVE | Therapist submits apply form | OK. |
| `admin-new-client-signup.html` | LIVE | Client signs up | OK. |
| `admin-new-subscription.html` | LIVE | Razorpay payment verified | OK. |
| `admin-therapist-onboarded.html` | LIVE | Therapist completes onboarding | OK. |
| `admin-contact-form.html` | LIVE | Visitor submits `/contact` | OK. |
| `admin-payout-request.html` | LIVE | Therapist clicks "Request payout" | Has a `⚠️` emoji when payment info is missing. Acceptable for admin alert. |
| `admin-switch-request.html` | LIVE | Client requests new therapist | OK. |

---

## Tone-of-voice action items

The four real issues worth fixing:

### Action 1. Shared "verified therapist" footer

`lib/email.ts:54` defines `base()` which wraps most templates in HTML and adds a footer that reads:

> "You're receiving this because you're a verified therapist on MindCanopy."

That line is wrong when the recipient is a client (session reminder) or admin (every admin alert). The two new templates we wrote bypass this and use a custom footer. The fix is to either:
- a. Branch the footer logic by recipient inside `base()`, or
- b. Replace `base()` with three role-aware variants (`baseTherapist`, `baseClient`, `baseAdmin`).

### Action 2. "15-minute intro call" in `applicant-received.html`

Inside the "what happens next" list, step 3 currently reads:

> "**15-minute intro call** — if it looks like a fit, we'll set one up within 3-5 working days."

Already flagged in `CONTENT-CLEANUP.md` section 2. Rewrite as "**Intro call** — if it looks like a fit, we'll set one up within 3-5 working days." Or drop entirely.

### Action 3. Em-dash entities (`&mdash;`) in `applicant-received.html`

Five `&mdash;` in the steps list of that email. Replace with comma, colon, or two short sentences. The HTML entities weren't caught by the literal-character sed sweep.

### Action 4. `therapist-client-unmatched.html` is cold

Current body:
> "Your match with Priya has ended. The MindCanopy admin has ended this match. If you have questions, please contact support."

Suggested rewrite (founder review):
> "Your match with Priya has ended. The client has moved on. If anything about how it ended needs talking through, write to admin@mindcanopy.in."

Or whatever lands in voice. The current copy is platform-default, not MindCanopy-default.

---

## What's NOT covered (gaps)

Per the founder's "don't bombard" rule, the only client-facing emails approved are welcome and match-made. The following are not yet built and were either explicitly parked or low-priority:

- **Match-ended to client** — currently silent. (Match-ended to *therapist* exists.)
- **Subscription renewing reminder** — Razorpay auto-renews; founder said no email needed.
- **Subscription expired** — low priority, parked.
- **Therapist application rejected** — low priority, parked.
- **Payment receipt to client** — Razorpay sends its own; founder said leave it.
- **Welcome-back / re-engagement** — parked.

These are tracked in the main `TODO.md` if priorities change.

---

## How to wire the two pending templates

Both `client-welcome.html` and `client-match-made.html` need to be converted into Resend send functions inside `lib/email.ts`. The dev task lives in `TODO.md` as **"Client email templates (build + wire)"**. The steps:

1. Add `tplClientWelcome(firstName)` and `tplClientMatchMade(firstName, therapistFirstName, therapistFullName, adminMatchNote)` functions to `lib/email.ts`. Each returns HTML matching the standalone files in this folder.
2. Use a client-specific `base()` wrapper (Action 1 above), or replace the "verified therapist" footer text with a generic line for these two templates.
3. Add `sendClientWelcomeEmail` after `auth.signUp` succeeds in `app/actions/auth.ts`.
4. Add `sendClientMatchMadeEmail` after `createMatch` succeeds in `app/admin/actions.ts`. Pass `matches.notes` as the `adminMatchNote` placeholder.
5. Update the admin match modal so the `notes` field has a hint clarifying it will appear in the client's email (TODO item: "Admin match-notes UI label").

---

## Regenerating these previews

A node script lives at `scripts/render-emails.js`. It imports the same template helpers and renders each with realistic sample data. To regenerate after any template change:

```bash
node scripts/render-emails.js
```

The script does NOT touch `client-welcome.html` or `client-match-made.html` since those were hand-written. Edit those directly.
