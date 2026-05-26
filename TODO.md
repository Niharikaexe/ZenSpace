# MindCanopy TODO

Working list. Tackle one at a time. Status: `[ ]` not started, `[~]` in progress, `[x]` done.

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
- [ ] **Page indexing.** Submit sitemap.xml to Google Search Console and Bing Webmaster Tools, confirm robots.txt allows indexing, request indexing on priority pages, verify canonical tags and OG metadata on every public route.
- [ ] **AI content pipeline (build).** Build the pipeline that takes a writer brief + brand-voice rules and outputs draft blog posts and market reports for founder editing. Decide model, template structure, fact-checking step.
- [ ] **`/pricing` page routing.** The `PricingPlans.tsx` component exists in code but isn't routed. Route it as `/pricing` so it's publicly accessible. Copy comes from marketing.

### Email

**Status as of this push:** 27 templates wired in `lib/email.ts`. 18 trigger on events (signup, match, message, schedule, etc.). 5 cron routes added for recurring nudges. HTML previews live in `email-templates/`. Three templates still need admin-UI hooks (listed below).

**Done in this batch:**
- [x] Templates: all 27 written in `lib/email.ts` with founder-approved copy + audience-aware base() footer.
- [x] Welcome email wired on signup (`app/actions/auth.ts`).
- [x] Match-made email wired to client on admin `createMatch` (`app/admin/actions.ts`). Passes `matches.notes` as the personalized blurb.
- [x] Session-scheduled split into client + therapist variants. Each gets the right CTA URL for their dashboard. Fixes the hardcoded-therapist-URL bug from earlier.
- [x] Session-reminder split into client + therapist variants in the daily cron.
- [x] Full message body now included in `tplTherapistClientMessage` via metadata.
- [x] 5 new cron routes: availability-nudge, chat-not-started, no-subscribe-nudge, reply-overdue, missed-sessions. All in `app/api/cron/`. All auth via `CRON_SECRET`. All dedupe via `notifications` table.
- [x] `vercel.json` updated with all six cron schedules.

**Still pending:**
- [ ] **Admin match-notes UI label.** The `matches.notes` textarea in the match modal at `/admin` is now sent as the personalised blurb in the client's match-made email. Add a visible label or hint so the admin knows what they're writing for. Example: "Tell the client why this match feels right. They'll see this in their email." Pure frontend tweak in `components/admin/MatchModal.tsx`.
- [ ] **Therapist new-message email: 3-hour-unread gate.** Today the immediate email still fires within a 5-min debounce. The desired behaviour is: do not send immediately. Wait 3 hours, then check if the message is still unread (`messages.is_read = false`). If still unread, send. If already read, skip. Implementation: either move the email-fire out of `createNotification` for this type and into a new cron route at `/api/cron/message-overdue-3h` (similar to the existing 48h reply-overdue cron), OR refactor `shouldNotifyMessage` to defer sends.
- [ ] **Cancellation-pattern detection.** `tplTherapistCancellationPattern` exists and is dispatchable via `sendNotificationEmail({type:'therapist_cancellation_pattern'})`, but nothing in the codebase counts cancellations or fires it. Wire into the session-cancel action (`updateSessionStatus` in `app/actions/sessions.ts`): after cancelling a session, count `status='cancelled'` rows for this therapist within the last 30 days. If count >= 3, dispatch the email.
- [ ] **Account paused admin UI.** `tplTherapistAccountPaused` exists. Needs: (a) a `is_paused` boolean column on `therapist_profiles` (or use `accepts_new_clients=false` as proxy), (b) a "Pause therapist" button + textarea (reason) in the admin therapists tab, (c) a `pauseTherapist(therapistId, adminNote)` server action that flips the flag and dispatches the email. Should also block new matches when paused.
- [ ] **Concern raised admin UI.** `tplTherapistConcernRaised` exists. Needs: (a) a `concerns` table tracking client → therapist → reason → status, (b) an admin flow to log a concern (probably from the match detail view), (c) the dispatch on log. Also needs the auto-pause logic: if therapist doesn't respond within 2 days of the concern, pause their interaction with this client.
- [ ] **Vercel cron deployment.** Once dev2 is merged to main and deployed, confirm `CRON_SECRET` is set in Vercel env (production + preview). Confirm all six cron schedules are registered in the Vercel dashboard. Manually invoke each route once with the bearer header to smoke-test.

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

We don't bombard. One purposeful email per real moment. Tackle one at a time.

**To ship (copy):**
- [ ] **Welcome email.** Sent post-signup. Sets expectation for what happens next, surfaces the free intro chat path, brand voice.
- [ ] **Match-made email.** Sent when admin matches the client to a therapist. Introduces the therapist (name, photo, approach), links to dashboard, brand voice.

**Already in the system (no work needed):**
- [x] Email confirmation on signup (Supabase, automatic)
- [x] Password reset (Supabase, automatic)
- [x] Session reminder, 25h before session (cron, exists)
- [x] Therapist application received + verify email
- [x] Therapist application approved + invite code

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
