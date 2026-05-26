# MindCanopy TODO

Working list. Tackle one at a time. Status: `[ ]` not started, `[~]` in progress, `[x]` done.

---

## Dev

- [ ] **Therapist verification.** Credential checks (RCI status, license number, degree), document upload, admin verify toggle wiring, public verified badge on therapist cards.
- [ ] **User journey audit.** Walk every flow end to end: signup, questionnaire, match, subscribe, chat, session, notes. Find broken links, dead ends, missing states.
- [ ] **Subscription.** Razorpay plan IDs wired in env, webhook idempotency live, cancel semantics correct (audit B-14), enum mismatch fixed (B-15), tested end to end with live Razorpay.
- [ ] **Client email templates (build + wire).** Build the two new client-facing emails (welcome on signup, match-made when admin creates the match) as Resend templates. Wire the triggers in the server actions. Brand-voice copy comes from marketing.
- [ ] **Admin match-notes UI label.** The `matches.notes` textarea in the match modal at `/admin` becomes the personalized blurb in the match-made email to the client. Label or hint the field so the admin knows what they're writing for. Example: "Tell the client why this match feels right. They'll see this in their email."
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
