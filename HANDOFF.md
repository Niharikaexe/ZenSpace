# MindCanopy session handoff brief

Paste this into a new Claude session as your opening prompt. It carries enough context to pick up where the previous session left off.

---

## To paste into the new Claude session

I'm continuing work on MindCanopy, a subscription-based online therapy platform for the Indian market. The codebase is at the repo root.

**Before anything, please read these files in this order:**

1. **`CLAUDE.md`** — the project brief. Has the company context, tone-of-voice rules, banned word list ("holistic", "wellness journey", "safe space", "evidence-based", "on your terms", "world-class", "revolutionary", "cutting-edge", "certified professionals", "healing journey", "empower", "therapy journey", "wellness"), and the long pre-launch checklist with bug audit numbers (B-01 to B-52). Read the tone-of-voice section especially carefully — strict rules.

2. **`TODO.md`** — current working list. The top of the file has a "Session log" block summarising where we are and which branches exist. Sections are Dev (with General and Email sub-sections), QA and Testing, Marketing (with Emails and Content + planning sub-sections), Others, and Later. Tackle items in the order the founder asks, not by section order.

3. **`USER-JOURNEY.md`** — full sitemap and 7 Mermaid diagrams covering every user flow plus the email matrix. Paste any Mermaid block into a renderer if you need to visualise.

4. **`SEO-CONTENT-PLAN.md`** — 90-day content plan, 16 articles in 3 tiers. "Free online therapy in India" is the highest-leverage single piece; city pages (Mumbai, Bangalore, Delhi, Pune) are Tier 1.

5. **`CONTENT-CLEANUP.md`** — ~870-line audit of brand violations on the codebase (Zen Space → MindCanopy rebrand misses, "15-minute" leftovers, em-dashes, "Not X. Not Y." contrast patterns, banned words). Every entry has `file:line` so you can jump straight to it. **Important:** the founder is fixing these manually, NOT me. Don't run sweeps or batch fixes unless explicitly asked.

6. **`email-templates/README.md`** — status of all 27 email templates, tone audit, cron schedule table, and the templates that still need admin UI hooks.

## Project quick context

- Tech: Next.js 16 + TypeScript + Tailwind 4 + Supabase (auth/DB/realtime) + Razorpay + Daily.co + Resend + Vercel.
- Pricing: ₹2,999/wk Essentials, ₹4,499/wk Premium, ₹5,999/wk Couples, ₹9,999/mo Monthly Bundle.
- Three roles: client, therapist, admin (Niharika). Admin manually matches every client.
- Categories: individual, couples, teen.
- Founder name: Niharika.

## Branch layout

Three branches matter:

- **`dev2`** — current working branch. All recent code work lives here. Check it out and work from it.
  ```bash
  git checkout dev2 && git pull origin dev2
  ```
- **`main`** — production. Not touched directly. Founder merges from `dev2` manually.
- **`asu`** — corrupted history. Has a tone-of-voice doc and a tone-sweep commit that the founder explicitly does NOT want merged. Ignore `asu` unless the founder references it.

## Tone of voice (strict)

Read `CLAUDE.md` for full rules. Key constraints:

- **No em-dashes anywhere.** Use commas or two short sentences. If you find yourself typing `—`, stop.
- **No "Not X. Not Y. Not Z." or "X, Y, Z. But this." contrast patterns.** The founder hates these and has rejected them multiple times.
- **No "journey" in any wellness context** ("wellness journey", "therapy journey", "healing journey" all banned). "Mental health" replaces "wellness" everywhere.
- **No emojis in copy.** UI iconography like ✓ for "Saved" is fine.
- **Don't lean into "small team" or name the founder.** The brand should read established.
- **Don't mention "internationally trained therapists" in marketing copy.** Founder pulled back from this USP.
- The gold standard is the founder's LinkedIn intro post (quoted in full in `CLAUDE.md`). Match that voice.
- The brand promise: "We say the things that everyone is thinking but no one in your life will say to you."

## Workflow preferences

- **Be terse.** No long preambles. State results directly. End-of-turn summaries are one or two sentences.
- **Ask before pushing content changes.** The founder said: "do you like this, can we push this, or should I make changes?" — go back and forth in chat first, push only when approved. The harness fires a stop-hook on uncommitted changes, and the founder usually says push after seeing it. Don't auto-push every change.
- **Content vs code split.** You can edit website CONTENT without asking. Functionality / core code changes need explicit permission first. Schema migrations and env-var changes are always founder-side.
- **Multi-platform content.** Whenever copy is requested, produce versions for LinkedIn, Facebook, Instagram, X, AND Threads. Each platform has different length/format constraints; do not copy-paste one across all five.
- **Email policy: don't bombard.** Only fire emails at real, useful moments. 27 templates already wired; the founder explicitly rejected drip sequences and abandoned-funnel emails.

## State of the work (as of handoff)

### Code work completed this session

- Therapist apply form: country code picker, DOB 18+ check, years-experience cap of 40 (enforced via `canAdvance`).
- Therapist apply success screen: rewritten to lead with "verify your email" before review.
- Email system overhaul:
  - 27 templates in `lib/email.ts` with audience-aware base() footer.
  - Welcome email on signup, match-made email to client on `createMatch`.
  - Session-scheduled and session-reminder split into client + therapist variants (fixes the hardcoded-CTA bug).
  - Full message body now included in chat-message email.
  - Admin match-modal has a hint label explaining that the notes go into the client email.
  - 3-hour-unread gate for the message email via new `message-overdue-3h` cron + `skipEmail` flag on `createNotification`.
  - Cancellation-pattern detection (>= 3 cancellations in 30 days → therapist gets the warning email).
- 6 new cron routes registered in `vercel.json`:
  - `/api/cron/availability-nudge` (daily)
  - `/api/cron/chat-not-started` (daily)
  - `/api/cron/no-subscribe-nudge` (daily)
  - `/api/cron/message-overdue-3h` (hourly)
  - `/api/cron/reply-overdue` (hourly)
  - `/api/cron/missed-sessions` (hourly)
- Quality review caught 4 issues introduced this session (logged under TODO Dev > Email "Known issues to fix"). Notable: marker rows pollute NotificationBell, welcome email blocks signup ~1s, HTML injection risk in some new templates, cancellation-pattern undercount on null `ended_at`.
- Type check across the repo: 0 errors.

### Planning docs created

- `SEO-CONTENT-PLAN.md`, `USER-JOURNEY.md`, `CONTENT-CLEANUP.md` (all on `dev2`).
- `TONE-OF-VOICE.md` lives on `asu` only (intentional).

### Pending / open decisions

- **Marketing copy work** (active): 15 items under TODO Marketing > Content + planning. Top three by ROI: `/pricing` page content (unlocks Razorpay merchant approval), SEO content plan kick-off, audience angle research.
- **Dev tasks needing founder go-ahead** (deferred this session, require schema migrations the founder must apply):
  - Account paused admin UI + `is_paused` column on `therapist_profiles`.
  - Concern raised admin UI + new `concerns` table.
- **Founder action items:**
  - Apply the manual fixes from `CONTENT-CLEANUP.md` (Zen Space rebrand misses, "15-minute" leftovers, em-dashes in copy).
  - Set `CRON_SECRET` in Vercel env (production + preview) once `dev2` is merged.
  - Verify all 7 cron schedules show up in Vercel dashboard.
  - Manually smoke-test each cron route with the bearer header.

## How to verify everything works

When you start, run a sanity check:

```bash
git status                                # confirm clean working tree
git log --oneline origin/main..HEAD       # see what's ahead of main on this branch
npx tsc --noEmit -p tsconfig.json         # should be 0 errors
ls email-templates/                       # 27 .html files + README + script
node scripts/render-emails.js             # regenerates the previews
```

To preview the emails, open any file in `email-templates/` in a browser.

To see the user journey diagrams, copy any Mermaid block from `USER-JOURNEY.md` into a Mermaid renderer (Notion has built-in Mermaid support).

## When in doubt

The founder's LinkedIn intro post (in `CLAUDE.md`) is the brand voice tuning fork. The match-made email (`email-templates/client-match-made.html`) is the gold-standard for warm, in-voice copy. If a piece of writing doesn't feel like it could land in either of those, rewrite it.
