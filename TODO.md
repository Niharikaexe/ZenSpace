# MindCanopy TODO

Working list. Tackle one at a time. Status: `[ ]` not started, `[~]` in progress, `[x]` done.

---

## Session log (last updated 2026-05-26)

Active branch: **`dev2`** (tracks `origin/main` semantically; founder will merge to main manually).

**Reference docs in this repo (read these first):**
- `CLAUDE.md` — project brief, tone of voice rules, banned words list.
- `TODO.md` — this file. Current state of every workstream.
- `USER-JOURNEY.md` — full sitemap + 7 Mermaid diagrams of every user flow + email matrix.
- `SEO-CONTENT-PLAN.md` — 90-day content plan, 16 articles, 103-keyword target set.
- `CONTENT-CLEANUP.md` — full audit of brand-rebrand misses, "15-minute" leftovers, em-dashes, contrast patterns. ~870 lines, file:line precision. Founder fixes manually.
- `email-templates/README.md` — status of all 27 emails + tone-of-voice audit notes.
- `email-templates/*.html` — standalone previews of every email. Open in a browser.
- `scripts/render-emails.js` — regenerates email previews. Run with `node scripts/render-emails.js`.

**Done in the previous session (still applies):**
- Branch hygiene: synced `main` to `asu` (force-pushed), created `dev2` from `origin/main` as the new clean working branch. Tone-sweep work and `TONE-OF-VOICE.md` live on `asu` only and were intentionally NOT carried to `dev2`.
- Therapist apply form: country-code picker with search, DOB 18+ validation, years-experience cap of 40 (enforced in canAdvance, not just HTML max), success screen rewritten to lead with email verification.
- Email system: 17 templates expanded to 27, all wired in `lib/email.ts` with audience-aware footer. Welcome on signup, match-made to client, session emails split by recipient role (fixes CTA bug), message email includes full body. Admin match-modal hint added.
- 6 new cron routes: `availability-nudge`, `chat-not-started`, `no-subscribe-nudge`, `message-overdue-3h`, `reply-overdue`, `missed-sessions`. All scheduled in `vercel.json`.
- Cancellation-pattern detection wired into `updateSessionStatus`.
- New planning docs: `SEO-CONTENT-PLAN.md`, `USER-JOURNEY.md`, `CONTENT-CLEANUP.md`.
- Quality review of email work: 4 introduced issues + 2 pre-existing logged under Dev > Email below.

**Done THIS session (SEO indexing + low-risk fixes pass):**
- `/contact` page now has its own metadata (title, description, canonical, OG) via `app/contact/layout.tsx`. Page itself is a client component so metadata couldn't live on it directly; layout wrapper follows the same pattern `app/admin/login/layout.tsx` already uses.
- Sitemap converted from static `public/sitemap.xml` to dynamic `app/sitemap.ts`. Auto-updates per build, served at `/sitemap.xml` by Next.js. Added `/privacy`, `/terms`, `/help`, `/market-reports` to the URL list (were missing before). One file to maintain when content ships.
- Auth pages (`/login`, `/signup`, `/forgot-password`) now carry `robots: { index: false, follow: false }` via `app/(auth)/layout.tsx`. Stops Google from indexing thin transactional pages; doesn't change anything user-facing.
- Welcome-email + admin-notification on signup are now dispatched in parallel via `Promise.all` instead of two sequential `await`s. Saves ~500ms to ~1s on the signup response on Vercel serverless. From the known-issues list.
- `escapeHtml()` helper added to `lib/email.ts` and applied to every template that interpolates user- or admin-supplied text into HTML: `tplAdminContactForm` (visitor-supplied message + sender name + email), `tplApplicationApproved` (applicant name + admin notes + invite code), `tplApplicationReceived` (applicant name), `tplClientWelcome` (signup name), `tplClientMatchMade` (admin match note + therapist full name), `tplTherapistAccountPaused` (admin note + therapist name), `tplAdminNewApplication` (applicant name), `tplAdminNewClientSignup` (client name + email), `tplAdminTherapistOnboarded` (therapist name), `tplAdminSwitchRequest` (client name + reason). Pre-existing message-body escape in `tplTherapistClientMessage` left as-is, it already does the right thing including newline-to-`<br/>`. Closes the HTML-injection items on Dev > Email known issues and the pre-existing high-severity contact form item.
- `OG image` task added to Marketing > Content + planning; tracks the missing `/public/og-image.png` referenced by `app/layout.tsx`.

**Founder action items from THIS session (you do, not me):**
- Confirm `mindcanopy.in` is live and the sitemap at `https://mindcanopy.in/sitemap.xml` returns the new dynamic XML.
- Set up Google Search Console: add `mindcanopy.in` as a Domain property, verify via TXT DNS record at the registrar, submit `sitemap.xml`, then use the URL inspector to request indexing on `/`, `/for/individuals`, `/for/couples`, `/for/adolescents`, `/about`. Repeat on Bing Webmaster Tools.
- Produce `/public/og-image.png` (1200x630) — Figma export or similar.
- The Vercel deployment on PR #18 (which has the same SEO commit cherry-picked here) failed; local `next build` passes cleanly. Likely an env-var issue on Vercel, not a code regression. Worth checking the Vercel deployment logs from the dashboard once.

**Branches:**
- `main` — production. Not touched directly this session.
- `dev2` — current working branch. All today's code work is here, on top of yesterday's.
- `claude/jolly-shannon-nYTRB` — earlier-this-session branch that PR #18 targets. Same SEO commit as the first commit here on dev2; you'll merge dev2 manually so PR #18 can probably be closed unmerged.
- `asu` — corrupted branch. Contains the tone-sweep + `TONE-OF-VOICE.md` (founder decided not to merge this work, see `CONTENT-CLEANUP.md` for the manual fix list instead).
- `claude/tender-knuth-3Uja6` — older automated session branch. Ignore.

---

## Dev

### General

- [ ] **Therapist verification.** Credential checks (RCI status, license number, degree), document upload, admin verify toggle wiring, public verified badge on therapist cards.
- [ ] **User journey audit.** Walk every flow end to end: signup, questionnaire, match, subscribe, chat, session, notes. Find broken links, dead ends, missing states.
- [ ] **Subscription.** Razorpay plan IDs wired in env, webhook idempotency live, cancel semantics correct (audit B-14), enum mismatch fixed (B-15), tested end to end with live Razorpay.
- [ ] **CRM of all users + mobile version.** Admin can see every client, therapist, admin in one view. Mobile responsive layout for admin dashboard.
- [ ] **Google Ads tracking link.** gtag installed in layout, UTM convention defined, conversion events on questionnaire submit and signup complete.
- [ ] **Meta Ads tracking link.** Meta Pixel installed, Conversion API for server-side events, UTM convention shared with Google Ads.
- [ ] **Supabase account audit.** List every real user, drop test data, verify RLS policies hold, confirm admin role assignments.
- [ ] **Mobile UI redesign.** Better mobile layout for the whole product, driven by a Claude / Figma design pass. Audit every public page on a 375px viewport.
- [ ] **Profile picture uploads.** Audit client and therapist photo upload flow. Confirm Supabase storage bucket, RLS, and image rendering via `next/image` remotePatterns.
- [ ] **Therapist availability conflict logic.** When a therapist has a scheduled session for a slot, that slot disappears from the available-slots list shown to all clients.
- [ ] **Therapist monitoring.** Admin can see: which therapists are active, last login, session count, response latency to client messages, complaint history. Probably a new tab on the admin dashboard.
- [~] **Page indexing.** Foundation work done in code: `app/sitemap.ts` (dynamic, auto-includes all listed routes), `robots.txt` correctly allows public and blocks dashboards/API, `app/(auth)/layout.tsx` carries `noindex` for `/login`, `/signup`, `/forgot-password`, `app/contact/layout.tsx` carries per-page metadata. **Still on founder:** verify `mindcanopy.in` is live, set up Google Search Console (verify via DNS TXT, submit `sitemap.xml`, request indexing on `/`, `/for/*`, `/about`), repeat on Bing Webmaster Tools, confirm canonical and OG metadata on every public route once you have the live URL.
- [ ] **AI content pipeline (build).** Build the pipeline that takes a writer brief + brand-voice rules and outputs draft blog posts and market reports for founder editing. Decide model, template structure, fact-checking step.
- [ ] **`/pricing` page routing.** The `PricingPlans.tsx` component exists in code but isn't routed. Route it as `/pricing` so it's publicly accessible. Copy comes from marketing.

### Email

**Status as of this push:** 27 templates wired in `lib/email.ts`. 18 trigger on events. 6 cron routes added. HTML previews live in `email-templates/`. Two templates still need admin-UI hooks + schema migrations (deferred for founder approval before touching DB).

**Done:**
- [x] Templates: all 27 written in `lib/email.ts` with founder-approved copy + audience-aware base() footer.
- [x] Welcome email wired on signup (`app/actions/auth.ts`).
- [x] Match-made email wired to client on admin `createMatch` (`app/admin/actions.ts`). Passes `matches.notes` as the personalized blurb.
- [x] Session-scheduled split into client + therapist variants. Each gets the right CTA URL for their dashboard. Fixes the hardcoded-therapist-URL bug from earlier.
- [x] Session-reminder split into client + therapist variants in the daily cron.
- [x] Full message body now included in `tplTherapistClientMessage` via metadata.
- [x] **Admin match-notes UI label.** Added hint copy to the textarea in `components/admin/MatchModal.tsx`: "The client will see this in their match-made email. Write one or two lines explaining why this therapist feels right for them."
- [x] **Therapist new-message email: 3-hour-unread gate.** Decoupled the email from `createNotification` via a new `skipEmail` flag. `sendMessage` now writes only the in-app notification (no immediate email). New cron route `/api/cron/message-overdue-3h` (hourly) finds messages unread 3+ hours old and fires the email then. Dedupes via a `client_message_email_sent` marker row in `notifications`.
- [x] **Cancellation-pattern detection.** `updateSessionStatus` in `app/actions/sessions.ts` now counts cancellations per therapist in the last 30 days. If >= 3 and no pattern email already sent in that window, dispatches `therapist_cancellation_pattern`.
- [x] 6 cron routes total: availability-nudge, chat-not-started, no-subscribe-nudge, message-overdue-3h, reply-overdue, missed-sessions. All in `app/api/cron/`. All auth via `CRON_SECRET`. All dedupe via `notifications` table.
- [x] `vercel.json` updated with all seven cron schedules.

**Still pending (need founder go-ahead):**
- [ ] **Account paused admin UI + schema.** `tplTherapistAccountPaused` template exists and is dispatchable via `sendNotificationEmail({type:'therapist_account_paused'})`, but no code path fires it. Needs: (a) new migration adding `is_paused boolean default false` + `paused_at timestamptz` to `therapist_profiles`, (b) a "Pause therapist" button + textarea in the admin therapists tab, (c) a `pauseTherapist(therapistId, adminNote)` server action that flips the flag and dispatches the email, (d) block new matches when paused (check `is_paused` in `createMatch`).
- [ ] **Concern raised admin UI + schema.** `tplTherapistConcernRaised` template exists. Needs: (a) new migration creating a `concerns` table (client_id, therapist_id, match_id, reason, status, raised_at, responded_at), (b) admin UI to log a concern (probably from the match detail view), (c) server action that inserts the row and dispatches the email, (d) follow-up logic: if therapist doesn't respond within 2 days, auto-pause their interaction with this client.

**Founder action required (skipped from this push):**
- [ ] **Vercel cron deployment.** Once dev2 is merged to main and deployed, set `CRON_SECRET` in Vercel env (production + preview). Confirm all seven cron schedules show up in the Vercel dashboard. Manually invoke each route once with the bearer header to smoke-test.

**Known issues to fix (from the quality review of this session's email work):**

- [ ] **Marker rows pollute NotificationBell.** Severity: medium. The `message-overdue-3h` cron writes `client_message_email_sent` rows to the `notifications` table to dedupe email sends. `components/therapist/NotificationBell.tsx` doesn't filter by type, so the user sees a literal "New message email sent" entry with body "Internal marker; user does not see this" in their bell dropdown. The markers also push real notifications out of the 30-row buffer faster. **Fix options:** (a) move marker tracking to a separate `email_send_log` table, OR (b) add `type NOT IN (...)` filter in `app/actions/notifications.ts` (the loader used by NotificationBell) AND in the realtime subscription channel. Option (a) is cleaner long-term. *Not done — touches user-facing UI + realtime channel, needs a careful test.*
- [x] ~~**Welcome email blocks signup form by ~1 second.**~~ Fixed 2026-05-26: `app/actions/auth.ts` signUp now dispatches both emails in parallel via `Promise.all`.
- [x] ~~**HTML injection in new email templates (account-paused, match-made).**~~ Fixed 2026-05-26: `escapeHtml()` helper added to `lib/email.ts` and wrapped across `tplAdminContactForm`, `tplApplicationApproved`, `tplApplicationReceived`, `tplClientWelcome`, `tplClientMatchMade`, `tplTherapistAccountPaused`, `tplAdminNewApplication`, `tplAdminNewClientSignup`, `tplAdminTherapistOnboarded`, and `tplAdminSwitchRequest`. Pre-existing `tplTherapistClientMessage` was already escaping. Closes both this and the pre-existing high-severity contact form item below.
- [ ] **Cancellation-pattern undercounts null `ended_at` rows.** Severity: low-medium. The check in `app/actions/sessions.ts updateSessionStatus()` uses `gte('ended_at', windowStart)`. Pre-existing session rows where `ended_at IS NULL` (set by a different code path, never set) are silently excluded from the threshold count. **Fix:** swap `ended_at` for `updated_at` (which is always set), OR coalesce: filter on `COALESCE(ended_at, updated_at) >= windowStart`. The second avoids changing semantics for existing healthy rows. *Not done — changes a query semantic, founder picks which option.*

**Known pre-existing bugs flagged during the review (not introduced this session, but worth a separate cleanup):**

- [ ] **Session-reminders cron dedup keyed only on sessionId.** Severity: medium. The dedup query in `app/api/cron/session-reminders/route.ts` checks any notification with `type IN (session_reminder_client, session_reminder_therapist)` for the same sessionId. If the first cron run's `Promise.all` partially fails (e.g. client notif written, therapist notif write errors silently inside `createNotification`), the next run finds the successful one and skips both. The party that didn't get a notification the first time never gets a reminder for that session. **Fix:** dedup per `(sessionId, recipient_role)`, e.g. two separate dedup checks before each `createNotification`.
- [x] ~~**Multiple email templates interpolate untrusted input as HTML.**~~ Fixed 2026-05-26 in the same pass — see the entry above.

---

## QA and Testing

Things to verify end to end before (and after) launch. None are coding tasks per se, all are hands-on checks. Tackle these once features are built and before any spend goes live.

### Mobile and responsive

- [ ] **Dashboard mobile audit.** Walk every client-dashboard page on a 375px viewport (iPhone SE size). `PendingDashboard.tsx`, `AccountForm.tsx`, `TherapistSidePanel.tsx`, and most page wrappers have zero responsive classes today, so likely break. Fix list comes from this audit.
- [ ] **Therapist dashboard mobile audit.** Same exercise on the `/therapist/dashboard/*` routes. Therapists will check messages on phone.
- [ ] **Admin dashboard mobile audit.** Niharika uses this to match clients. Almost certainly not mobile-ready today.
- [ ] **Questionnaire on mobile.** Long forms with many tap targets. Verify keyboard doesn't cover the next button, progress bar stays visible.
- [ ] **Signup, login, forgot-password on mobile.** Side-panel testimonials should hide or stack.
- [ ] **Chat interface on mobile.** Keyboard behavior, scroll position when message sent, attachment uploads.
- [ ] **Video session on mobile.** Daily.co handles most of this but verify the join screen, mic/camera permissions prompt, ending a call.

### Cross-browser

- [ ] **Chrome desktop + Android.** Baseline.
- [ ] **Safari desktop + iOS.** Different behaviour around dates, sticky positioning, autofill.
- [ ] **Samsung Internet.** Popular in India, often missed.
- [ ] **Firefox.** Lower priority but a sanity pass.

### Functional end-to-end (test each from scratch with fresh users)

- [ ] **Client happy path.** Land on `/` → pick category → questionnaire → signup → email confirms → dashboard pending → subscribe via Razorpay → admin matches → match email → chat with therapist → session scheduled → join video → therapist writes notes → client reads notes.
- [ ] **Therapist happy path.** Land on `/therapist/join` → apply → receive verify email → click verify → admin approves → invite code email → onboard → first client matched → reply to chat → schedule session → conduct session → write notes.
- [ ] **Switch therapist flow.** Client requests new therapist → admin sees in panel → actions request → match ends → client re-queued → admin re-matches.
- [ ] **Cancel subscription flow.** Active sub → click cancel → still active until period_end → after period end, status flips to cancelled → chat and sessions properly gated.
- [ ] **Delete account flow.** Two-step confirmation → all data cascades correctly → redirect to home → can't log back in.
- [ ] **Forgot password flow.** Submit email → reset email arrives → click link → land on reset page → enter new password → log in successfully.

### Payments (Razorpay)

- [ ] **Test-mode end-to-end with real Razorpay.** Confirm success, failure, webhook delivery.
- [ ] **Webhook idempotency.** Replay the same webhook event, confirm no double-extend of `current_period_end`.
- [ ] **Webhook signature verification.** Send a fake event with bad signature, confirm 401.
- [ ] **Subscription cancel via Razorpay.** Confirm `cancel_at_cycle_end` works as expected, no surprise charge after cancel date.
- [ ] **Currency display.** Verify ₹ formatting everywhere, no `$` or other accidental currency.

### Email deliverability

- [ ] **Inbox vs spam test.** Send each of the 17 templates to a Gmail, Yahoo, Outlook, ProtonMail, and a corporate Gmail Workspace address. Note which land in spam.
- [ ] **DKIM, SPF, DMARC records.** Confirm Resend records are configured for `mindcanopy.in`. Check at mxtoolbox.
- [ ] **From-address sanity.** `marketing@mindcanopy.in` and `admin@mindcanopy.in` resolve correctly, replies route somewhere a human reads.
- [ ] **Session reminder cron timing.** Run the cron manually with a fixture session 25 hours away; confirm both client and therapist get the email.

### Accessibility (a11y)

- [ ] **Keyboard navigation.** Tab through every page; nothing trapped, focus states visible.
- [ ] **Screen reader pass.** VoiceOver on Safari and NVDA on Chrome. Form labels read correctly, button text describes action.
- [ ] **Color contrast.** Run an automated check (axe DevTools or Lighthouse) on every public page. Brand teal on white can be borderline.
- [ ] **Form labels.** Every input has an associated `<label>` or `aria-label`.

### Security

- [ ] **RLS policy verification.** Try (as user A) to fetch user B's match, message, session, subscription, profile. Confirm Supabase rejects.
- [ ] **Rate limiting actually fires.** Run 20 signup attempts in 60s from one IP. Confirm middleware returns 429.
- [ ] **XSS attempts.** Paste `<script>alert(1)</script>` into free-text fields (questionnaire, chat, therapist bio, contact form). Confirm rendered as text, not executed.
- [ ] **Auth bypass attempts.** Hit `/api/payment/verify` and `/api/cron/session-reminders` without auth/cron secret. Confirm rejected.
- [ ] **TEST_CODE backdoor scope.** Confirm whether `ZENSPACE2026` works in production or only in dev. Decide if it should be removed entirely.

### Performance

- [ ] **Lighthouse on every public page.** Target 90+ on Performance, SEO, Accessibility, Best Practices. Capture current baseline.
- [ ] **Realistic data load test.** Seed the dev DB with 100 clients, 20 therapists, 200 messages, 50 sessions. Verify admin dashboard still renders quickly.
- [ ] **Bundle size on landing.** Run `npm run build` and check the route bundle sizes. Anything over 200kb gets investigated.
- [ ] **Image rendering.** Confirm `next/image` `remotePatterns` for Supabase storage works (avatars).

### Error states

- [ ] **Offline behavior.** Disable network mid-flow. Does the UI handle gracefully?
- [ ] **500 from server.** Force an error in a server action. Does `error.tsx` render with brand voice, not a stack trace?
- [ ] **404.** Visit `/this-page-doesnt-exist`. Does `not-found.tsx` render correctly?
- [ ] **Empty states.** New therapist with zero clients, new client with no match yet, admin with zero pending applications. All render cleanly?
- [ ] **Broken images.** Force avatar URLs to 404. Do initials show as fallback?
- [ ] **Daily.co room URL invalid.** What does the client see if a room is malformed? (Audit B-45 said this was fixed, verify.)

### Form input edge cases

- [ ] **Very long inputs.** Paste 5000 characters into name, bio, message. Anything break?
- [ ] **Special characters.** Try emoji, RTL text, smart quotes, currency symbols.
- [ ] **Copy-paste hazards.** Paste a URL with tracking params into a textarea. Anything blow up?
- [ ] **Duplicate submission.** Double-click submit on signup, on payment, on apply form. Confirm only one row written.

### Content / SEO

- [ ] **OG tags render correctly.** Share each public URL on WhatsApp, LinkedIn, X. Verify thumbnail, title, description.
- [ ] **Sitemap.xml is valid.** Hit `/sitemap.xml` and validate the XML.
- [ ] **Robots.txt.** Confirm allow rules are correct, no accidental blocks on public pages.
- [ ] **Canonical tags.** Every public page has a `<link rel="canonical">` pointing to itself.

---

## Marketing

### Emails

We don't bombard. One purposeful email per real moment. All template + trigger work has shifted to Dev > Email (lib/email.ts is the source of truth). This section now only tracks copy / voice work that the marketing side still needs to weigh in on.

**Open marketing decisions:**
- [ ] **Tone-of-voice review of all 27 templates.** `email-templates/README.md` flags which templates have had a founder voice pass. Walk through the remaining ones and tighten copy. Especially the 6 cron-triggered ones added late.
- [ ] **Marketing emails beyond operational.** Currently we send purely operational emails (welcome, match-made, session reminder, payment failed, etc.). No drip, no newsletters, no re-engagement. Decide if and when to add: monthly mental-health note from the founder, content digest, anything else. Default: stay parked.

**Already in the system (shipped, no work needed):**
- [x] All 27 templates wired in `lib/email.ts` with audience-aware footer (client / therapist / admin / applicant)
- [x] Welcome email on signup → client (in `app/actions/auth.ts`)
- [x] Match-made email on admin match → client (in `app/admin/actions.ts`)
- [x] Email confirmation on signup (Supabase, automatic)
- [x] Password reset (Supabase, automatic)
- [x] Session reminder, 25h before → both client and therapist (cron)
- [x] Therapist application received + verify email
- [x] Therapist application approved + invite code
- [x] 6 nudge / warning cron emails: availability, chat-not-started, no-subscribe, message-overdue-3h, reply-overdue, missed-session
- [x] HTML escape across all user-input-bearing templates (XSS / injection hardening, 2026-05-26)

### Content + planning

- [ ] **SEO content plan execution.** Full 90-day plan in `SEO-CONTENT-PLAN.md`. 16 articles, city pages first, "Free online therapy" piece as the highest single ROI move.
- [ ] **Marketing timeline.** Calendar of every post, ad, article shipped or planned. Where it lives (Notion?), who owns it.
- [ ] **SEO strategy + CMS decision.** Keep articles as MDX in repo, or move to headless CMS (Sanity, Contentful, Payload)? Decide before article 1 ships.
- [ ] **`/pricing` page content.** Hero copy, tier comparison, FAQ for the `/pricing` page. Dev routes the existing component once copy is ready.
- [ ] **`/privacy` page content refresh.** Current `/privacy` is a brand-voice version with no DPDP / legal framing. Decide whether to keep as is, expand with legal language, or both (consumer summary on top, full legal beneath).
- [ ] **Social post templates.** Reusable layouts for LinkedIn, Facebook, Instagram, X, Threads. Brand-voice tested against the LinkedIn intro post.
- [ ] **Meta ads creative brainstorm.** Angles for Meta paid creative. Include the recruitment angle (we need therapists too), not just client acquisition.
- [ ] **Audience angle research.** Validate Semrush volume across: individuals, couples, teens, therapist recruitment, generic mental health, use-case focused (e.g., "in-laws marriage stress", "therapy when family doesn't know"). Decide which 3 to 4 angles to lead with.
- [ ] **AI ad creative production.** Test what Claude plus AI video tools (Runway, Sora, etc.) can produce for paid ads and organic posts. Cost vs. quality check before committing budget.
- [ ] **Non-UGC engagement content.** Posts designed to land without UGC: quotes, illustrated insights, brand-voice mini-essays, founder POV. Same content shape across all five platforms.
- [ ] **Paid media plan (Google + Meta).** Budget allocation, campaign structure, objective per campaign. Builds on the prior Google Ads draft (Couples + Individual ad groups, ₹60k per month).
- [ ] **Launch Meta.** Decide objective: traffic, lead form, or website conversion. Start small. First spend.
- [ ] **Launch Google.** First spend on the drafted Couples + Individual campaign.
- [ ] **Moodboard.** Visual reference deck for the brand. Lives in Figma or Notion.
- [ ] **OG image (`/public/og-image.png`).** 1200x630 PNG with MindCanopy mark and tagline. Referenced in `app/layout.tsx` for social previews (WhatsApp, LinkedIn, X, Facebook). Currently the file is missing so shares render with a broken image. Either export from Figma or commission a quick design.
- [ ] **AI content (production).** Once the pipeline is live, run articles from `SEO-CONTENT-PLAN.md` through it, founder edits, publish.

---

## Others (decisions, legal, conversations)

- [ ] **Signup consent checkbox.** Today there's a passive "By signing up you agree to our Terms and Privacy Policy" line under the Create Account button. DPDP Act 2023 may want an explicit ticked checkbox for processing sensitive personal data (mental health qualifies). Decision: keep as passive line, or upgrade to an explicit checkbox? Worth running past Indian counsel.
- [ ] **`/about` "Why international therapists" section.** Lines ~54-67. Handoff brief said we'd pulled back from this USP. Section still live. Decision: cut, rephrase, or leave?
- [ ] **TEST_CODE backdoor in therapist onboarding.** `app/therapist/onboard/actions.ts:11` has `const TEST_CODE = 'ZENSPACE2026'` that bypasses real invite validation. Security review: remove it, rename it, or scope it to a non-prod env variable.
- [ ] **Email verification signal to admin.** Today the admin sees a new application the moment a therapist submits, regardless of whether they've verified their email. The verify step only sets a timestamp. Decision: gate admin approval on verified email? Surface verified vs. unverified in the admin dashboard? Or leave as-is?

---

## Later (parked, don't start)

- **UGC engagement content.** Posts designed to invite UGC replies. Wait until we have a customer base.
- **Adjacent peaceful-activity content.** Painting, yoga, hula hoop, flow, chakra. Sits next to therapy in the brand world but only makes sense once a community exists. Brainstorm ideas as they come up, build later.
- **Questionnaire drop-off recovery.** Questionnaire runs before signup, so we don't have an email to nudge with. Skip unless we add an early email-capture step to the funnel.
- **Trust-signal strip at conversion moments.** Testimonials / privacy badges on subscribe and signup pages. Not now.
- **Public `/therapists` directory page.** Letting visitors browse therapist profiles before signup. Not now.

---

## Operating notes

- **Multi-platform content.** Every time content is requested, produce versions for LinkedIn, Facebook, Instagram, X, and Threads. Each platform has different length and format constraints, do not just copy-paste one across all five.
- **Tone rules.** No em-dashes. No "Not X. Not Y." contrast patterns. Banned word list lives in CLAUDE.md.
- **Order.** Tackle items in the order the founder requests, not in section order.
- **Content vs. code rule.** Claude is only allowed to change website content without asking. Functionality or core code changes need explicit permission first.
- **Lead-form pages don't need footer.** The main marketing site has the footer with privacy/terms. Side-chain lead-form pages (questionnaire, signup, therapist apply/onboard) intentionally don't carry the footer to keep the funnel focused.
- **Email policy.** Don't bombard. Send only when there's a real, useful moment. Two client-facing marketing emails to start: welcome + match-made. Everything else stays operational or stays parked.
