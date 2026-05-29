# Content Cleanup Audit

Generated against the `dev2` branch (which mirrors `main` for every file flagged below). I made **no changes**. Every entry has the exact `file:line` so you can jump straight to it. Audit and fix yourself.

The categories are ordered by your priority signal: brand rebrand misses first, then "15-minute" leftovers, then everything else the brand voice cares about.

---

## 1. "Zen Space" / "ZenSpace" rebrand misses

These display to users and should read **MindCanopy**.

- `app/for/adolescents/AdolescentsPageClient.tsx:180` — "...Zen Space is a room of your own..."
- `app/for/individuals/IndividualsPageClient.tsx:107` — "Your privacy is built into the foundation of Zen Space."
- `app/for/individuals/IndividualsPageClient.tsx:173` — "...Zen Space can be that room..."
- `app/for/couples/CouplesPageClient.tsx:424` — "...Zen Space stays strictly private."
- `components/home/PrivacySection.tsx:65` — "We've built Zen Space to ensure it stays that way."
- `components/home/TherapistCards.tsx:144` — "...every therapist on Zen Space..."
- `app/therapist/onboard/page.tsx:143` — `placeholder="ZENSPACE2026"` (visible in the invite-code field on the onboarding form)

### Functional code (separate decision)

- `app/therapist/onboard/actions.ts:11` — `const TEST_CODE = 'ZENSPACE2026'`. This is a backdoor invite-code that bypasses real validation. Changing the string changes what code is accepted in the onboarding form. **Treat as a security task, not a rebrand task.**

---

## 2. "15-minute" / "15 min" leftovers

Per the rename to "free intro chat" (no duration anchor).

- `app/blog/page.tsx:119` — "Before you pay anything, talk to your potential therapist for 15 minutes. No pressure. No invoice."
- `app/blog/[slug]/page.tsx:161` — "Talk to a therapist for 15 minutes, free. No payment until you're sure."
- `app/therapist/join/page.tsx:121` — "...a short 15-minute intro chat..."
- `app/therapist/join/page.tsx:165` — "Every new client gets a 15-minute intro chat with you."
- `app/therapist/join/page.tsx:218` — "...you'll offer them a 15-minute intro chat..."
- `app/help/[topic]/page.tsx:134` — "...free 15-minute call with a potential therapist..."
- `components/home/HowItWorks.tsx:178` — "Talk for 15 minutes free."

### In email templates (lib/email.ts)

- `lib/email.ts:265` — Inside `tplApplicationReceived`: `<strong>15-minute intro call</strong> — if it looks like a fit, we'll set one up within 3-5 working days.` (This email goes to therapist applicants.)

---

## 3. "International / internationally trained therapists"

Handoff brief said you pulled back from this USP. Audit each spot. Some are marketing claims (cut), some are functional (e.g., "PayPal for international therapists" is informing therapists who can use PayPal — that's not the USP claim).

### Marketing / positioning claims (likely cut)

- `app/about/page.tsx:59` — Section heading "Why international therapists."
- `app/about/page.tsx:62` — Paragraph 1: "A therapist trained in an environment where mental health is openly discussed..."
- `app/about/page.tsx:64-66` — Paragraph 2: "...they understand India. We only work with therapists who have experience..."
- `components/home/TrustBar.tsx:7` — Pill label `"International Therapists"`
- `components/home/PricingPlans.tsx:33` — Feature line "International therapist access"
- `components/client/SubscriptionModal.tsx:32` — Plan feature "International therapist access"
- `components/client/SubscriptionModal.tsx:49` — Same on second plan

### Functional / operational (decide case by case)

- `app/therapist/onboard/page.tsx:457` — "(for international therapists)" inside payout-setup copy. Tells the therapist when to provide PayPal vs Indian bank. Operational, not marketing.
- `app/therapist/onboard/page.tsx:489` — Field hint "for international therapists" on the PayPal field. Same.
- `app/privacy/page.tsx:274` — Legal H2 "9. International Therapists and Cross-Border Access". Section title inside the Privacy Policy. Likely needs to stay since DPDP requires the disclosure.
- `app/terms/page.tsx:443` — Generic "international law" inside legal clause. Not a USP claim.

---

## 4. "On your terms" / variants

Banned phrase.

- `app/for/adolescents/AdolescentsPageClient.tsx:369` — "...a weekly habit that helps you navigate your world on your own terms."

(Only one instance found.)

---

## 5. "Not X. Not Y." / "No X. No Y." contrast patterns

Forbidden pattern per TOV. Rewrite as single-thought sentences.

### Strong violations (period-separated multiple negations)

- `app/about/page.tsx:30` — "Not a startup. Not a wellness brand. Just a platform that takes the idea of talking to someone seriously."
- `app/about/page.tsx:77` — "We don't sell your data. We don't use it for targeting. We don't ask you to connect your social accounts." (triplet)
- `app/about/page.tsx:80` — "Not because we're hiding something. Because it's yours."
- `app/about/page.tsx:91-92` — Section opening: "We are not a crisis line. We are not a diagnostic service. We do not prescribe medication." (triplet)
- `app/blog/page.tsx:119` — "...No pressure. No invoice."
- `app/(auth)/login/page.tsx:31` — Side-panel body: "No cultural stake in your choices. No judgment."
- `app/(auth)/signup/page.tsx:31` — Same line on signup.
- `app/(client)/dashboard/subscribe/SubscribeCheckout.tsx:271` — "...No clinics. No waiting rooms."

### Borderline (comma-separated or single inline; same family)

- `app/layout.tsx:33` — Meta description: "...No waiting rooms. No prescriptions..." (two short sentences in a row)
- `app/about/page.tsx:127` — CTA paragraph: "No bots, no auto-replies."
- `app/help/[topic]/page.tsx:134` — "No commitment, no invoice."

---

## 6. Standalone "wellness" use

Banned word. The "No wellness speak" cases on /blog are meta-rejection (we're explicitly saying we don't do wellness speak) so might be intentional — your call.

- `app/blog/page.tsx:10` — metadata description: "...No wellness speak. No poster copy. Just things worth reading."
- `app/blog/page.tsx:59` — page body: "No wellness speak. No poster copy."
- `app/about/page.tsx:30` — "Not a wellness brand." (also part of #5 above)

---

## 7. Emojis in user copy

TOV says no emojis in copy. UI iconography (✓ for "Saved" state, ✕ for "remove") is borderline — likely fine. Real emoji-in-copy cases below:

- `app/(auth)/forgot-password/page.tsx:75` — `<div className="text-5xl mb-4">📬</div>` (large mailbox emoji shown after "we sent you a reset email")
- `app/(auth)/signup/page.tsx:186` — Same 📬 pattern on signup "check your email" screen
- `app/therapist/dashboard/page.tsx:370` — Button text: `💬 Chat`
- `app/therapist/dashboard/page.tsx:381` — Button text: `📹 Sessions`
- `components/therapist/MessengerLayout.tsx:327` — `<span className="text-3xl">💬</span>` (empty-state speech bubble)
- `components/home/CTASection.tsx:75` — `4.9★` star glyph in social-proof stat
- `components/home/TherapistCards.tsx:150` — `4.9★` same pattern

### Iconography (probably keep)

These are visual feedback / UI primitives, not copy. Listed for awareness:

- `✓` used as "Saved" / "Copied" / step-complete indicator across signup, login, apply, onboard, admin dashboard, etc.
- `✕` used as a "remove" button in `WeeklyAvailabilityEditor.tsx:232`
- `✉` envelope icon in `forgot-password/page.tsx:34`

---

## 8. Banned phrases — clean

Confirmed **not present** in the codebase:

- `holistic` — 0 occurrences
- `wellness journey` — 0
- `safe space` — 0
- `evidence-based` — 0
- `healing journey` — 0
- `therapy journey` — 0
- `world-class` — 0
- `revolutionary` — 0
- `cutting-edge` — 0
- `certified professionals` — 0
- `empower` / `empowerment` — 0
- `platform built around one quiet idea` — 0
- `That's the whole job` — 0

So those parts of the TOV need no work.

---

## 9. Em-dashes in code

Em-dashes are banned per TOV. **432 instances** across **89 files**. They show up in three places:

1. **User-facing copy** (JSX text, hero headlines, body paragraphs, error messages). Definitely fix.
2. **Page-title metadata / email subjects**. Convention is to use ` | ` (pipe). Fix.
3. **Code comments** (`// foo — bar`). Not user-facing. Optional fix.

Full listing follows, grouped by file. Each line is shown as `LineNumber: snippet` (truncated to ~140 chars).

You can also reproduce the listing yourself with:

```bash
grep -rnE "—" app components lib --include="*.tsx" --include="*.ts" | grep -v node_modules
```

---

**`app/(auth)/login/page.tsx`**

- L39: `// Client-side debug wrapper around the server action — logs every submit`

**`app/(auth)/signup/page.tsx`**

- L107: `// Inline validation — only shown after the field has been blurred`
- L214: `? 'Almost there — just a few details to get started'`
- L56: `// Server-side redirect() throws a NEXT_REDIRECT — that's expected,`
- L80: `// Local copy of server error — cleared as soon as user edits any field`

**`app/(client)/dashboard/change-therapist/page.tsx`**

- L12: `"Personal reasons — I'd rather not say",`
- L71: `No explanation required — but if you'd like to share why, it helps us find a better match faster. Your reason is private.`

**`app/(client)/dashboard/faq/page.tsx`**

- L37: `a: 'Once you\'re matched and subscribed, you can schedule a 50-minute video session directly with your therapist through the platform. Sessi`

**`app/(client)/dashboard/page.tsx`**

- L127: `// Malformed questionnaire JSON — treat as no questionnaire.`
- L47: `// Fetch active match — use admin client to bypass any RLS issues on matches table`

**`app/(client)/dashboard/reviews/page.tsx`**

- L11: `text: 'I was skeptical at first, but my therapist completely changed the way I approach conflict at home. The async messaging between sessio`
- L18: `text: 'We\'d tried couples therapy before and it felt too clinical. MindCanopy was different — our therapist actually understood the speci`
- L32: `text: 'The fact that I could switch therapists without drama was huge for me. First one wasn\'t a great fit — I was nervous to say anythin`

**`app/(client)/dashboard/subscribe/SubscribeCheckout.tsx`**

- L122: `// Determine locked category from questionnaire — couples users only see couples plans,`
- L166: `description: `${selectedPlan.name} — ${selectedPlan.price}/${selectedPlan.per}`,`
- L290: `{/* Plan cards — Basic and Premium for the selected category + cadence */}`
- L309: `{selectedPlan.name} — {selectedPlan.price}/{selectedPlan.per}`
- L339: `: `Subscribe — ${selectedPlan.price}/${selectedPlan.per} →`}`

**`app/about/page.tsx`**

- L47: `Most people in India who need therapy don't go. Not because they don't know it helps. Because the version of therapy that exists here still `
- L65: `That said, they understand India. We make sure of it. We only work with therapists who have experience with Indian clients or the specific p`
- L6: `title: 'About Us — MindCanopy',`
- L80: `Your sessions, your messages, your notes — they exist inside MindCanopy and nowhere else. Not because we're hiding something. Because it's`
- L92: `We are not a crisis line. We are not a diagnostic service. We do not prescribe medication. MindCanopy is a talk therapy platform — which m`

**`app/actions/auth.ts`**

- L117: `// is already registered — Supabase obfuscates and returns a user object with`
- L118: `// an empty `identities` array to prevent enumeration — or (b) the user was`
- L238: `surfaced = "We've sent you a confirmation email — please click the link in it before signing in. Check spam, or contact admin@mindcanopy.i`
- L260: `// Safety net: profile missing (user created before schema was applied) — create it now`
- L302: `// Supabase silently no-ops for unknown emails — this prevents user enumeration.`
- L72: `// Full structured log — keep this verbose so when prod breaks we have`
- L80: `// No bypass — if Supabase couldn't create the user or send the email,`

**`app/actions/questionnaire.ts`**

- L101: `// then insert fresh — ensures at most one row per client.`

**`app/actions/sessions.ts`**

- L184: `// Daily.co failure is non-fatal — session is still created, just without`
- L318: `// Non-fatal but log — a cancelled room left up means the join URL still`
- L71: `// Notify the OTHER party (debounced — once per 5 min per match)`
- L99: `// Notification failure must not break message send — but log so we can see`

**`app/actions/subscription.ts`**

- L40: `// Cancel in Razorpay at end of current billing cycle — client keeps access until period_end`

**`app/actions/therapist-profile.ts`**

- L151: `// Lightweight payment-field validation — empty values are allowed`

**`app/admin/actions.ts`**

- L28: `// B-19: prevent double-matching — reject if client already has an active match`

**`app/admin/login/page.tsx`**

- L42: `Restricted access — authorised personnel only`

**`app/admin/page.tsx`**

- L150: `// 1-hour expiry — admin re-fetches the page if links go stale.`

**`app/api/cron/session-reminders/route.ts`**

- L5: `// Vercel Cron — runs once daily at 5:00 AM UTC (10:30 AM IST).`

**`app/api/payment/create-order/route.ts`**

- L94: `// Non-fatal — order was created in Razorpay, proceed`

**`app/api/payment/create-subscription/route.ts`**

- L147: `// Non-fatal — webhook will activate on payment`
- L66: `// the hard guarantee — a concurrent insert will hit a 23505 violation and be`

**`app/api/payment/verify/route.ts`**

- L130: `// Notify admin — awaited so the Resend POST completes before Vercel freezes`
- L71: `// B-10: fetch plan from DB — do not trust client-supplied value`
- L9: `// B-10: plan is NOT accepted from the client — fetched from DB to prevent`

**`app/api/webhooks/razorpay/route.ts`**

- L122: `// B-09: idempotency — skip if we've already processed this payment ID`
- L1: `// Razorpay webhook handler — /api/webhooks/razorpay`

**`app/auth/callback/route.ts`**

- L42: `// Safety net: profile missing — create it from auth metadata`

**`app/auth/confirmed/page.tsx`**

- L4: `title: 'Email verified — MindCanopy',`

**`app/blog/[slug]/page.tsx`**

- L34: `/* Minimal Markdown-like renderer — handles ## headings, **bold**, and paragraphs */`

**`app/blog/page.tsx`**

- L12: `title: "MindCanopy Blog — Mental Health in Plain Language",`
- L37: `description: "What anxiety is actually doing — and what helps.",`
- L59: `No wellness speak. No poster copy. Just honest writing about what people actually go through — burnout, anxiety, relationships, and what t`
- L8: `title: "Blog — Mental Health, Work, Relationships & Anxiety",`

**`app/contact/page.tsx`**

- L118: `See what practising through MindCanopy looks like — how the matching works, what we ask of you, and what we don&apos;t.`
- L36: `Drop us a note about anything — questions, feedback, or just to say hi. We&apos;ll write back.`
- L84: `<p className="text-xs text-[#233551]/40 mt-0.5">India — we operate fully online</p>`

**`app/for/adolescents/AdolescentsPageClient.tsx`**

- L118: `a: "It’s just a free intro chat. You’ll get a feel for the therapist and the environment. No pressure, no “fixing” — just a conver`
- L180: `Between exams, family expectations, and the constant noise of being online, it’s easy to feel like your own voice is getting drowned out. `
- L369: `Your subscription is a dedicated space for you — a weekly habit that helps you navigate your world on your own terms.`

**`app/for/adolescents/page.tsx`**

- L9: `'Exam anxiety, social pressure, and feeling alone — teen struggles are real. Online therapy for Indian adolescents aged 14–20. Safe, pri`

**`app/for/couples/CouplesPageClient.tsx`**

- L100: `body: "Your conversations stay inside the platform. We don’t share records with anyone — no family members, no employers, no exceptions.`
- L378: `Your subscription is a dedicated space for your relationship — a weekly habit that keeps the conversation moving forward.`

**`app/for/individuals/IndividualsPageClient.tsx`**

- L173: `You’ve been looking for a room where you can finally hear yourself think. Zen Space can be that room. It’s a habit for your head — a p`

**`app/for/individuals/page.tsx`**

- L10: `'Feeling burned out, anxious, or just off? Talk to a real therapist online. Free intro chat before you pay. No waiting rooms, no judgment. M`

**`app/global-error.tsx`**

- L3: `// Fallback for errors thrown inside the root layout itself — font loaders,`
- L61: `MindCanopy hit an unexpected error while loading. We've logged it. Try again — if it keeps happening, email{' '}`

**`app/help/[topic]/page.tsx`**

- L27: `/* Minimal content renderer — handles ## headings, **bold**, - bullets, paragraphs */`

**`app/help/page.tsx`**

- L39: `Not a terms and conditions page. Just answers — written like a person, not a compliance team.`
- L77: `Write to us. We respond — usually within a few hours.`
- L8: `title: "Help Centre — How MindCanopy Works",`

**`app/layout.tsx`**

- L29: `default: "MindCanopy — Online Therapy for India",`
- L54: `title: "MindCanopy — Online Therapy for India",`
- L62: `alt: "MindCanopy — Online Therapy for India",`
- L68: `title: "MindCanopy — Online Therapy for India",`

**`app/market-reports/[slug]/page.tsx`**

- L19: `title: `${report.title} — ${report.subtitle}`,`
- L218: `{s.org} — {s.year}`

**`app/market-reports/page.tsx`**

- L124: `Read full report — {r.findings.length} findings →`
- L12: `title: "MindCanopy Market Reports — India Mental Health Index",`
- L185: `Read full report — {r.findings.length} findings →`
- L202: `Where you live in India shapes what&apos;s available — and what&apos;s socially acceptable.`
- L23: `{ figure: "83%", label: "Treatment gap — needs care, receives none", source: "WHO, 2020" },`
- L257: `Read full report — {r.findings.length} findings →`
- L39: `{ region: "Rural India", access: "Negligible", stigma: "Very high", note: "96.7% treatment gap — near-total absence" },`
- L60: `Six reports on how mental health works — and doesn&apos;t — in India. Numbers from WHO, NIMHANS, Lancet Psychiatry, and Deloitte. Each r`
- L8: `title: "Market Reports — India Mental Health Index",`

**`app/privacy/page.tsx`**

- L5: `title: 'Privacy Policy — MindCanopy',`

**`app/questionnaire/couples/page.tsx`**

- L296: `You&apos;ll answer some questions about your relationship together, then each partner answers a few private questions separately. Private an`
- L339: `Hand the device to Partner 2. Their answers are private — Partner 1 shouldn&apos;t see them. Only your therapist reads both.`
- L34: `c6Other: string // Areas of conflict — free-text "other"`
- L384: `: 'Private — your partner does not see this'}`
- L38: `c9Other: string // Goals — free-text "other"`
- L406: `'Very strained — unsure what the future looks like',`
- L612: `'Structured and practical — tools and homework',`
- L614: `'Not sure yet — open',`
- L646: `<p className="text-sm text-[#233551]/50">Optional — select all that apply.</p>`
- L672: `<p className="text-sm text-[#233551]/50">Pick one or more — we&apos;ll match you with a therapist who speaks the language you both feel mo`
- L712: `<p className="text-sm text-[#233551]/50">Optional — your partner won&apos;t see this.</p>`
- L784: `'Mixed — up and down',`
- L82: `if (step === 'c1' || step === 'c2' || step === 'c3') return 'Section A — Where the relationship is right now'`
- L83: `if (step === 'c4' || step === 'c5' || step === 'c6') return 'Section B — The basics'`
- L84: `if (step === 'c7' || step === 'c8') return "Section C — How it's working"`
- L85: `if (step === 'c9') return 'Section D — Goals'`
- L86: `if (step === 'c11' || step === 'c12') return 'Section E — Your therapist'`
- L87: `return 'Section F — Past therapy'`

**`app/questionnaire/individual/page.tsx`**

- L193: `'I want to understand myself better — no crisis, just growth',`
- L194: `"I'm not sure yet — I just know something feels off",`
- L252: `"Mostly positive — I have a stable sense of who I am and what I'm worth",`
- L253: `'Mixed — I have good days but struggle with self-doubt',`
- L254: `'Fairly critical — I tend to see my flaws more clearly than my strengths',`
- L255: `"Harsh — I find it difficult to feel like I'm good enough",`
- L270: `'Good — I fall asleep easily and wake up rested',`
- L271: `"Inconsistent — some nights are fine, others aren't",`
- L272: `'Poor — I often struggle to fall or stay asleep',`
- L273: `'Very poor — sleep problems are significantly affecting my daily life',`
- L297: `How do you feel about social situations — meeting new people, being in groups, speaking up?`
- L301: `'Comfortable — I generally enjoy being social',`
- L303: `'Anxious in most social situations — I usually push through but it takes effort',`
- L304: `'Significantly anxious — I often avoid social situations because of how they make me feel',`
- L337: `'I tend to numb out — phone, food, alcohol, or other distractions',`
- L415: `<p className="text-sm text-[#233551]/50">Optional — this helps us match you better.</p>`
- L434: `'More structured — practical tools and exercises',`
- L435: `'More insight-oriented — connecting patterns from the past',`
- L436: `'Direct and challenging — I want someone who pushes me',`
- L437: `"I'm open — I'd rather they decide what's right",`
- L468: `<p className="text-sm text-[#233551]/50">Optional — select all that apply.</p>`
- L492: `<p className="text-sm text-[#233551]/50">Pick one or more — we&apos;ll match you with a therapist who speaks the language you&apos;re most`
- L67: `if (step === 'q1' || step === 'q2' || step === 'q3') return "Section A — What's bringing you here"`
- L68: `if (step === 'q4' || step === 'q5' || step === 'q6' || step === 'q7' || step === 'q8' || step === 'q9' || step === 'q10' || step === 'q11' |`
- L70: `return 'Section C — Your therapist'`

**`app/questionnaire/teen/page.tsx`**

- L256: `"Not really — I don't feel understood",`
- L275: `"A lot — I'm struggling to keep up",`
- L291: `'Mixed — good days and hard days',`
- L408: `'Very negative — I dislike myself',`
- L497: `'Mostly listening and supportive — giving me space to talk',`
- L498: `'Balanced — both listening and gently challenging me',`
- L499: `'More structured and practical — tools, exercises, homework',`
- L500: `'Very direct and honest — willing to challenge my patterns',`
- L501: `"I'm not sure yet — open to different styles",`
- L514: `<p className="text-sm text-[#233551]/50">Optional — totally fine to skip.</p>`
- L532: `<p className="text-sm text-[#233551]/50">Pick one or more — we&apos;ll match you with a therapist who speaks the language you&apos;re most`
- L75: `if (step === 'q1' || step === 'q2' || step === 'q3' || step === 'q4') return "Section A — Where you're at"`
- L76: `if (step === 'q5' || step === 'q6' || step === 'q7' || step === 'q8' || step === 'q9') return 'Section B — Your world'`
- L77: `if (step === 'q10' || step === 'q11' || step === 'q12' || step === 'q13') return "Section C — How you've been feeling"`
- L78: `return 'Section D — Your therapist'`

**`app/terms/page.tsx`**

- L186: `You acknowledge that information you share through the Platform — including information shared during therapy sessions and through messagi`
- L463: `You understand, agree, and acknowledge that we may modify, suspend, disrupt, or discontinue the Platform, any part of the Platform, or your `
- L5: `title: 'Terms and Conditions — MindCanopy',`

**`app/therapist/apply/actions.ts`**

- L127: `// Best-effort — log failure but don't block the success response.`
- L131: `// Notify admin — non-blocking, best-effort`

**`app/therapist/apply/page.tsx`**

- L1157: `{/* Hidden fields — sent on final submit */}`
- L14: `// Client groups — shown prominently at the top of the specialisation picker.`
- L69: `// Country list — India at top, then alphabetical (UN member states + key territories)`
- L794: `<Field label="Certificates" hint="optional — degree, licence, training certificates">`
- L866: `<Field label="Areas of specialisation" required hint="modalities and presenting issues — pick all that apply">`
- L867: `{/* Client groups — three prominent picks in a row */}`

**`app/therapist/dashboard/page.tsx`**

- L229: `{/* Weekly availability — moved above clients */}`
- L259: `{/* Upcoming sessions — next 14 days */}`
- L264: `Upcoming — Next 14 Days`
- L317: `{/* Card header — clickable */}`
- L444: `'Make sure your bio is warm and human — clients read it before accepting',`
- L445: `'List all languages you work in — it increases match chances',`

**`app/therapist/dashboard/payment/page.tsx`**

- L117: `// Sessions for clients with no subscription on record (edge case — e.g.`
- L15: `// Updates the moment a session is marked `completed` — no cron, no snapshot`
- L41: `// All matches this therapist has ever had (any status) — past clients still`
- L54: `// Bulk fetches — three independent queries can run in parallel.`
- L57: `// over time, historical sessions are priced at the current plan — a`

**`app/therapist/dashboard/video/page.tsx`**

- L201: `Past Sessions — {m.clientName}`

**`app/therapist/join/page.tsx`**

- L105: `Each subscribed client books one <span className="font-semibold text-[#233551]">50-minute</span> video session a week — straight into a sl`
- L113: `Clients can message you between sessions. We ask you to reply within <span className="font-semibold text-[#233551]">48 hours</span> — that`
- L140: `d: 'Fill in the application form — takes about five minutes.',`
- L155: `d: 'Pick the hours you can hold sessions. Our clients live in IST — we hope you can find some overlap.',`
- L165: `d: 'Every new client gets a 15-minute intro chat with you. After that, sessions get booked into your slots — by you or by them.',`
- L222: `d: "Subscribed clients can message you between sessions. We ask you to reply within 48 hours — it's the one promise we make to them.",`
- L250: `'Stay within your scope of training — we\'re a counselling platform, not a medical one.',`
- L253: `'Sessions stay private — no recording without written consent from both sides.',`
- L68: `Peace isn&apos;t a destination —<br />it&apos;s a practice.`
- L6: `title: 'Practice with us — MindCanopy',`
- L71: `We give you a platform to reach quality clients. Every person who comes to us completes an assessment first — and we route them to the the`
- L8: `"Practice through MindCanopy. No clinic rent, no hard contracts, weekly payouts. We bring you clients — you do the work you trained for.",`

**`app/therapist/onboard/actions.ts`**

- L104: `// Payment details are now optional at onboarding — therapists add them`
- L196: `// verification + payout — address removed from onboarding`
- L64: `// Address fields removed from onboarding — therapists can fill these in`

**`app/therapist/onboard/page.tsx`**

- L13: `// Country list — India at top, then alphabetical (UN member states + key territories)`
- L417: `<Field label="Proof of identification" required hint="Aadhaar, Passport, or Driving Licence — PDF or image">`
- L48: `// Common timezone abbreviations — IST pinned at top, then ordered roughly west-to-east.`
- L520: `Clients see this before they choose to work with you. JPG, PNG, or WebP — max 5 MB.`
- L589: `<Field label="One-line philosophy" hint="optional — shown on your profile card">`
- L611: `<Field label="What clients can expect from your sessions" hint="optional — sets expectations for the first session">`

**`app/therapist/verify-email/page.tsx`**

- L6: `title: 'Email verified — MindCanopy',`
- L73: `? 'Looks like you\'ve already confirmed this email. We\'re reviewing your application — we\'ll be in touch soon.'`

**`components/admin/AdminDashboard.tsx`**

- L353: `<p className="text-sm text-slate-700 font-medium mt-0.5">{app.languages.join(', ') || '—'}</p>`
- L452: `Admin notes <span className="font-normal text-slate-400">(optional — included in approval email)</span>`

**`components/admin/MatchModal.tsx`**

- L161: `{atCapacity && ' — full'}`

**`components/auth/RotatingTestimonial.tsx`**

- L22: `text: "My parents don't know I go to therapy. Not because I'm hiding it — just because it's mine. That distinction matters more than I tho`
- L27: `text: "Three therapists before this one. The first two were fine. This one actually gets the specific version of my problems — the Indian-`
- L32: `text: "I didn't know what I needed. I just knew something wasn't right. My therapist helped me name it — slowly, without any rush. That pa`
- L64: `— {review.name}, {review.location}`

**`components/client/ClientNav.tsx`**

- L40: `{/* Center nav tabs — desktop only */}`

**`components/client/ClientSessionsView.tsx`**

- L314: `<p className="text-sm font-semibold text-[#3D8A80]">Session requested — {bookedLabel}</p>`

**`components/client/SubscriptionModal.tsx`**

- L67: `: 'Text your therapist anytime — between sessions, after a hard day, whenever.'`

**`components/client/TherapistSidePanel.tsx`**

- L1: `// Therapist profile side panel — shown on both Chat and Sessions pages.`

**`components/dashboard/MatchedDashboard.tsx`**

- L50: `sub: 'Send a text to your therapist — right now, or whenever something comes up.',`

**`components/dashboard/PendingDashboard.tsx`**

- L266: `{/* Questionnaire prompt — shown if user signed up without answering */}`
- L289: `{/* Subscribe prompt — shown if no active subscription */}`
- L324: `'You will begin communicating with your therapist online — and your therapy process begins.',`
- L358: `'Someone with no cultural stake in your choices — they\'re here for you, not your family',`
- L376: `You have two ways to connect. You can send text messages to your therapist at any time — between sessions, on a Tuesday evening, whenever `
- L424: `{/* Subscription plans — if not subscribed */}`
- L72: `{ feature: 'Complete privacy — no one in your network knows', mindcanopy: true, traditional: false },`

**`components/dashboard/SubscriptionPlans.tsx`**

- L203: `{isLoading ? 'Opening payment...' : `Subscribe — ${selected.price} / ${selected.per}`}`
- L91: `description: `${PLANS[selectedKey].name} — ${PLANS[selectedKey].cadence}`,`

**`components/home/CTASection.tsx`**

- L13: `{/* Top wave — teal section → navy (preserved) */}`
- L20: `{/* Tree+owl — mobile background layer */}`
- L85: `{/* Tree + owl illustration — desktop only */}`
- L99: `{/* Bottom wave — navy → white (preserved) */}`

**`components/home/FAQ.tsx`**

- L26: `a: "We don't. MindCanopy is a talk therapy and counselling platform — no prescriptions, no diagnoses. If you think you need medication, we`

**`components/home/Footer.tsx`**

- L30: `{/* Brand column — wider */}`

**`components/home/HeroSection.tsx`**

- L111: `{/* Tree + owl animation — mobile background layer */}`
- L188: `{/* Arrow — desktop only */}`
- L204: `{/* ── RIGHT: Owl Mascot — desktop only ── */}`
- L96: `{/* Background peach blob — desktop only */}`

**`components/home/HowItWorks.tsx`**

- L108: `/* ─── Step 03 — Two phones (chat + booking) ─── */`
- L32: `/* ─── Step 01 — Grid of human faces with a selection ring ─── */`
- L77: `/* ─── Step 02 — Human on laptop video call ─── */`

**`components/home/OwlMascot.tsx`**

- L178: `{/* Lashes — two light strokes at outer corners only */}`

**`components/home/PricingPlans.tsx`**

- L111: `{/* Decorative glow — featured card only */}`
- L205: `{PLANS.couples_basic_weekly.price}/{PLANS.couples_basic_weekly.per} — one session for both partners →`
- L32: `"Priority chat — faster responses",`
- L92: `You&apos;re not locked in. No contracts, no hidden fees. Start with the intro chat — it&apos;s free.`

**`components/home/ProblemRecognition.tsx`**

- L15: `{/* Asymmetric color blobs — mc-anim-bg fades them to 12% on mobile */}`

**`components/home/TherapistCards.tsx`**

- L68: `// Skip continuous scroll on mobile — let users swipe naturally`

**`components/home/TherapyNeeds.tsx`**

- L113: `{/* Centre text — absolutely centred */}`
- L125: `Whatever it is —<br />there&apos;s a name for it.`
- L138: `{/* Background bubbles — scattered at edges, center clear */}`
- L163: `{/* Heading — centered over the bubble field */}`
- L173: `Whatever it is —<br />there&apos;s a name for it.`
- L47: `// Fewer bubbles for mobile — scattered at edges, center kept clear for the heading`

**`components/shared/AssessmentButton.tsx`**

- L15: `// modal and go straight to the matching questionnaire — the user has already`

**`components/shared/ChatInterface.tsx`**

- L119: `// Server rejected — intro limit or window expired; trigger paywall`

**`components/shared/Initials.tsx`**

- L36: `// Local <img> — url may be from a Supabase storage signed URL whose host`

**`components/therapist/MessengerLayout.tsx`**

- L183: `// Track which matches the therapist has opened — clear unread badge locally`
- L264: `{/* Chat header — relative so schedule form can anchor to it */}`
- L302: `{/* Inline schedule form — drops below header */}`

**`components/therapist/MultiScheduleForm.tsx`**

- L76: `{/* Client — dropdown if multiple, read-only label if single */}`

**`components/therapist/NotificationBell.tsx`**

- L53: `// Supabase Realtime subscription — adds new notifications live`

**`components/therapist/TherapistAccountForm.tsx`**

- L133: `// Payment info — two tabs (PayPal + Bank)`
- L14: `// Client groups — three prominent picks shown above the full specialisations list`
- L256: `<p className="text-[10px] text-[#233551]/40">JPG, PNG, or WebP — max 5 MB</p>`
- L372: `{/* Client groups — three prominent picks in a row */}`

**`components/therapist/TherapistNav.tsx`**

- L86: `{/* Notifications — real-time bell */}`

**`components/therapist/WeeklyAvailabilityEditor.tsx`**

- L173: `Click or drag to mark available ranges — each generates 50-min slots for clients`

**`lib/blog-data.ts`**

- L113: `What they can do is help you understand the patterns that made burnout possible in the first place — and work through them in a way that a`
- L131: `Not every hard week needs therapy. Some stress is just stress — a deadline, a difficult project, a manager who communicates poorly. You ha`
- L147: `The project ends, but you don't feel relieved — you're already anxious about the next one. The presentation goes well, but you replay ever`
- L153: `**It's following you home.** Not just thoughts about work — genuine dread, difficulty sleeping, physical symptoms like headaches or stomac`
- L165: `If your stress is situational, often the most useful thing is practical — better time management, clearer communication with your team, so`
- L167: `If it's not situational — if the anxiety or exhaustion or emptiness is following you regardless of what's actually happening at work — t`
- L195: `Attachment theory — originally developed by John Bowlby, later expanded by researchers like Mary Ainsworth — describes how our early rel`
- L199: `If they were inconsistently available — sometimes warm, sometimes absent — you may have developed anxious attachment. You tend to crave `
- L209: `They find it enormously validating — finally, a framework that explains so much. Then they use it to explain their behaviour to other peop`
- L211: `The reason is that attachment patterns are stored in what researchers call implicit memory — the part of your brain that doesn't respond t`
- L219: `**Repeated new experiences in relationships.** Your nervous system updates its predictions based on experience. When the people in your life`
- L221: `**Noticing the body, not just the thought.** The anxious reach for your phone happens before you've consciously decided to reach for it. Lea`
- L223: `**Therapy.** Specifically, a therapist who understands relational patterns and works with you in a way that itself becomes a new relational `
- L247: `Your triggers are triggers because they connect to something older — usually an experience from early in your life where a similar thing f`
- L255: `**Slowing down the moment between trigger and response.** This is harder than it sounds. It's not about suppressing the reaction — that te`
- L257: `**Understanding the need underneath the reaction.** Triggers are usually protective. They're covering for something that needs something —`
- L259: `**Letting the pattern play out differently over time.** Actual change in trigger responses tends to come from accumulated experiences where `
- L295: `- Experience physical symptoms — heart racing, sweating, difficulty speaking`
- L29: `## What burnout is — and what it isn't`
- L305: `Introversion doesn't need treatment. It needs accommodation — and some cultural acceptance that not everyone wants to be the loudest perso`
- L345: `The reason for the delay is usually hope — hope that it'll sort itself out, that a holiday will reset things, that the other person will s`
- L37: `- **Exhaustion** — not just physical, but emotional and mental`
- L38: `- **Cynicism** — a growing distance from your work, your colleagues, maybe yourself`
- L391: `Your therapist will usually start by understanding what brings you in — not just the presenting complaint, but the pattern underneath it. `
- L393: `Over time, you'll learn to talk about things differently. Not nicer — more accurately. There's a difference between "you always dismiss wh`
- L39: `- **Reduced efficacy** — feeling like nothing you do is actually good enough`
- L405: `Ideally, couples go before things have become very entrenched — when they notice a pattern forming and want to address it before it calcif`
- L441: `The people who don't suggest it — who notice problems and say nothing — often stay in that pattern until it becomes unmanageable.`
- L445: `Individual therapy can help, even when the issue feels relational. Understanding your own patterns in the relationship — what you bring to`
- L455: `The alternative — not going, waiting for it to resolve — has a track record. It's not a good one.`
- L475: `Your body has a threat response system — often called fight-or-flight — that evolved over millions of years to help you survive genuine `
- L485: `This is a panic attack. All of those sensations — the racing heart, the difficulty breathing, the tingling in your hands, the feeling of u`
- L497: `**Slowing your exhale.** Longer exhales activate the parasympathetic nervous system — the system that counteracts the threat response. Thi`
- L499: `**Grounding yourself in the present.** Name five things you can see. Four you can touch. Three you can hear. This isn't magic — it's givin`
- L49: `Here's what's actually happening inside your body when you're burned out. Your cortisol — the stress hormone — has been elevated for so `
- L51: `Your brain, specifically the prefrontal cortex, starts functioning differently under chronic stress. Decision-making gets harder. Focus narr`
- L551: `**Physical symptoms.** Muscle tension, fatigue, difficulty concentrating, stomach issues — these are common in anxiety that's gone past a `
- L555: `If your worry is productive — situational, proportionate, action-oriented — you probably don't need to do much except keep an eye on it.`
- L567: `"OCD in India is often invisible — not because it isn't there, but because it doesn't look the way most people expect it to.",`
- L577: `Obsessive-compulsive disorder involves obsessions — intrusive, unwanted thoughts, images, or urges — and compulsions, which are the beha`
- L57: `Real recovery from burnout is slow. Slower than you want it to be. And it usually requires looking honestly at the conditions that caused it`
- L585: `**Harm OCD** involves intrusive thoughts about harming yourself or someone you love. Not a desire to harm — a terrifying, unwanted thought`
- L587: `**Relationship OCD** involves constant, exhausting doubt about your relationship. Do you really love your partner? Is this person right for `
- L591: `**Pure O** (purely obsessional OCD) involves obsessions with few visible compulsions — the compulsions tend to be mental. Repeated interna`
- L605: `OCD has one of the best evidence profiles of any mental health condition. Exposure and Response Prevention (ERP) therapy — a specific type`
- L609: `If any of this sounds familiar — the intrusive thoughts, the exhausting mental loops, the temporary relief that doesn't last — that's wo`
- L69: `The thing about burnout is that it often comes with a side of shame — a feeling that you should have been able to handle it. That you shou`
- L93: `Research on burnout recovery consistently shows that short breaks — even proper vacations — have limited long-term impact when the under`

**`lib/email.ts`**

- L211: `// ── Application received — applicant confirmation ───────────────────────────`
- L249: `<strong style="color:#233551;">Verify your email</strong> — click the button above.`
- L257: `<strong style="color:#233551;">We review your application</strong> — your education, CV, and credentials. We read every application person`
- L265: `<strong style="color:#233551;">15-minute intro call</strong> — if it looks like a fit, we&rsquo;ll set one up within 3&ndash;5 working day`
- L273: `<strong style="color:#233551;">Onboarding</strong> — we&rsquo;ll share an invite code so you can set up your therapist profile.`
- L281: `<strong style="color:#233551;">Match with clients</strong> — once you&rsquo;re live, we&rsquo;ll match you with clients aligned to your ap`
- L324: `subject: 'Your MindCanopy therapist application — please verify your email',`
- L340: `// ── New application — admin notification ──────────────────────────────�`
- L367: `subject: `New therapist application — ${fullName}`,`
- L543: ``New client signup — ${clientName}`,`
- L551: ``New subscription — ${clientName} (${planName})`,`
- L559: ``Therapist onboarded — ${therapistName}`,`
- L567: ``Contact form — ${senderName}`,`
- L591: ``Payout request — ${therapistName}`,`
- L623: `subject = `New client matched — ${meta.clientName ?? 'a new client'}``
- L627: `subject = `Match ended — ${meta.clientName ?? 'client'}``
- L639: `subject = `Session confirmed — ${meta.dateStr ?? ''}``
- L643: `subject = `Session reminder — ${meta.dateStr ?? ''}``
- L647: `subject = `Switch request — ${meta.clientName ?? 'A client'} wants a new therapist``
- L666: `// Best-effort — never block the main action, but log so we can see failures`

**`lib/help-data.ts`**

- L106: `**Give you somewhere to say things you can't say elsewhere.** This is more valuable than it sounds. There are things most people can't say t`
- L108: `**Reduce the intensity of certain experiences.** Anxiety, depression, trauma responses — these don't usually disappear overnight, but they`
- L116: `**Fix your circumstances.** A difficult job, a difficult relationship, real financial stress — therapy can help you navigate these, but it`
- L126: `Our therapists are not psychiatrists. They can help you understand what you're experiencing, but they don't provide formal diagnoses. If you`
- L144: `**You don't need to prepare anything specific.** That said, if something particular is on your mind — a recent event, something you keep t`
- L158: `**If you're holding back because you're embarrassed or worried about being judged** — this is worth knowing: therapists hear everything. T`
- L166: `**Between sessions, you don't have to do anything in particular.** But if something comes up — a thought, a realisation, a thing you wante`
- L180: `Most people who start therapy aren't sure they need it. They have a vague sense that something isn't quite right — not dramatic enough to `
- L187: `- Relationship patterns that keep repeating — with different people, same dynamic`
- L192: `- Nothing catastrophic — just a growing sense that you're not quite okay`
- L200: `The things that bring people to therapy tend not to get better through avoidance. Some of them consolidate — become more habitual, more en`
- L222: `All data on MindCanopy is encrypted — in transit and at rest. Your sessions, your messages, your intake information, your payment details.`
- L232: `**Our admin team.** Only in specific, limited circumstances — for example, to resolve a technical issue you've raised with us, or if there`
- L246: `MindCanopy is not a HIPAA jurisdiction — that's US legislation. Our data practices follow applicable Indian data protection law and the pr`
- L264: `Therapist fit is not a minor detail. Research consistently shows that the relationship between client and therapist — what researchers cal`
- L26: `It's slower than a quiz that spits out an instant result. It's also more considered. The person making the match knows our therapists — no`
- L286: `Contact us through the platform. We'll arrange a new match. The process is the same as the initial matching — we'll review what you're loo`
- L294: `The goal is finding someone who can actually help you. Everything else — including the switching — is in service of that.`
- L310: `A therapist — which may also be called a counsellor, psychologist, or psychotherapist, depending on their specific training — is trained`
- L324: `Psychiatrists typically work with more complex presentations — bipolar disorder, schizophrenia, severe depression requiring medication, AD`
- L330: `If you're dealing with anxiety, depression that isn't severe, relationship difficulties, burnout, grief, life transitions, or a general sens`
- L332: `If you're experiencing symptoms that significantly impair your daily functioning — severe depression where you're not able to function, sy`
- L40: `You'll get a notification with your therapist's profile — their background, their approach, a bit about how they work.`
- L62: `Your therapist will want to understand what's going on for you — in their own words, not just the questionnaire. They'll ask questions. Th`
- L80: `They'll also be thinking about what kind of work might be useful — whether that's a more structured approach like CBT, or something more e`
- L84: `Most therapists will briefly discuss what the next steps look like — how often to meet, what the focus might be, anything to keep in mind `

**`lib/logger.ts`**

- L22: `// Plain object — Supabase sometimes returns these. Walk keys explicitly because`

**`lib/market-reports-data.ts`**

- L100: `body: "India's per-capita mental health expenditure of ₹2,443 per year sounds significant until you examine what it covers: primarily inpa`
- L106: `body: "Government hospital psychiatry departments charge nominal fees but operate at extreme capacity. A 2022 NIMHANS audit found average ou`
- L112: `body: "A 2021 meta-analysis of Indian stigma research (published in the International Journal of Social Psychiatry) found that over 60% of I`
- L120: `body: "India's mental health system was architected around psychiatry — specialist medical care requiring years of postgraduate training. `
- L124: `body: "The National Mental Health Policy (2014) and the Mental Healthcare Act (2017) both established strong principles. Implementation has `
- L128: `body: "Mental distress in India is frequently understood through religious, supernatural, or somatic frameworks — karma, spirit possession`
- L132: `"The treatment gap is a public health emergency that receives no emergency-level response. Online therapy — while not a substitute for a f`
- L170: `subtitle: "What the official numbers miss — and what the research shows",`
- L175: `"India accounts for approximately 17% of global crisis-related deaths. The recorded numbers are likely an undercount. The patterns behind th`
- L179: `label: "Recorded crisis-related deaths in India in 2021 — highest ever recorded",`
- L189: `label: "Female crisis mortality rate per 100,000 — more than double the global average for women",`
- L194: `label: "Estimated undercount factor — actual deaths believed to exceed official records",`
- L217: `body: "Adults aged 18–45 account for the majority of crisis-related deaths in India. The 18–30 cohort is the single largest age group in`
- L223: `body: "In rural India, pesticide ingestion is the leading method involved in crisis deaths — and one of the most lethal. WHO research esti`
- L229: `body: "India has recorded farmer crisis deaths as a separate category since 1995. The NCRB recorded 10,881 farmer and agricultural labourer `
- L235: `body: "Section 309 of the Indian Penal Code criminalised crisis-related acts until its effective repeal through the Mental Healthcare Act 20`
- L241: `body: "An estimated 90% of crisis-related deaths globally occur in the context of a diagnosable mental health condition (WHO). In India, whe`
- L249: `body: "For 150 years, the criminal status of crisis-related acts meant families had active legal and financial reasons to record deaths diff`
- L253: `body: "India's pattern of suicide differs from high-income countries in the prominence of economic stressors as proximate causes. NCRB data `
- L261: `"Crisis mortality in India requires responses at multiple levels simultaneously: means restriction at the policy level, mental health workfo`
- L312: `"Burnout is categorised by the WHO as an occupational phenomenon. It is not a personal failing or a productivity problem — it is the predi`
- L326: `label: "Average working week for Indian professionals — above the ILO's 48-hour maximum",`
- L348: `body: "The International Labour Organization's recommended maximum of 48 hours per week is a safety threshold, not a productivity optimisati`
- L354: `body: "Deloitte's 2023 Global Gen Z and Millennial Survey — which included a large India sample — found that 38% of Gen Z respondents in`
- L360: `body: "The WHO's 2019 estimate — that depression and anxiety cost the global economy $1 trillion annually in lost productivity — has bee`
- L366: `body: "Employee Assistance Programs (EAPs) have expanded significantly in Indian companies since 2020 — particularly in tech, financial se`
- L372: `body: "A 2023 Inc42 survey of 400 Indian startup employees found that 71% reported working more than 50 hours per week, 58% reported being a`
- L378: `body: "The EY Work Reimagined Survey (2022) found that 43% of Indian professionals reported that work had negatively affected their physical`
- L386: `body: "Indian professional culture — particularly in tech and finance — has absorbed and amplified the Silicon Valley equation of overwo`
- L390: `body: "WhatsApp, Slack, and email have made professional availability a social norm rather than a formal expectation. Non-response after wor`
- L394: `body: "For many urban Indian professionals, their job is not primarily about self-actualisation — it is the financial lifeline for multipl`
- L398: `"Burnout in Indian workplaces is not a wellness problem that meditation apps can solve. It is a structural problem requiring structural resp`
- L46: `"India has one of the largest mental health treatment gaps in the world. The distance between who needs care and who receives it is not a ro`
- L477: `body: "Research consistently shows that mental health disclosure in workplace settings correlates with negative career outcomes in a statist`
- L483: `body: "Most Indian EAP programs are administered by or through HR departments. HR's institutional obligation is to the organisation, not the`
- L489: `body: "The gap between the 72% of HR leaders who say their company has a mental health policy and the 31% of employees who are aware one exi`
- L495: `body: "A 2023 study published in the Journal of Occupational Health Psychology found that workplace mental health awareness campaigns withou`
- L501: `body: "Deloitte's 2023 Global Gen Z Survey found that 46% of Indian respondents had left or were considering leaving a job specifically due `
- L507: `body: "Gallup's State of the Global Workplace 2023 found that manager behaviour accounts for 70% of variance in team engagement. SHRM India'`
- L515: `body: "Mental health programs in Indian organisations almost universally sit within HR. HR's primary function is workforce management in ser`
- L519: `body: "The return on investment in employee mental health support accrues over 18–36 months — through reduced attrition, lower absenteei`
- L523: `body: "The Mental Healthcare Act 2017 establishes rights for people with mental illness but provides limited workplace-specific protections.`
- L527: `"The disclosure problem is solvable, but not through campaigns. It requires structural changes: genuinely independent mental health support `
- L542: `title: "EAP Benchmarking and Utilisation Report — India",`
- L55: `label: "Treatment gap — those who need care but receive none",`
- L572: `"India's metro cities — Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata — contain the overwhelming majority of the country's menta`
- L596: `label: "Of India's workforce in informal sector — zero employer mental health benefits",`
- L608: `body: "Mumbai has approximately 800–1,000 registered psychologists and psychiatrists for a population of 20 million. The psychiatrist-to-p`
- L614: `body: "The median monthly income in Mumbai's formal sector is approximately ₹25,000–30,000. In the informal sector — domestic workers,`
- L620: `body: "Government hospital psychiatry OPDs in metro cities are technically free or near-free. In practice, they operate at extreme capacity.`
- L626: `body: "90% of India's workforce is in the informal sector — gig workers, domestic workers, construction workers, street vendors, daily wag`
- L638: `body: "Metro populations, particularly English-educated younger cohorts, show measurably lower mental health stigma than rural populations (`
- L640: `statLabel: "Indian Journal of Psychiatry — metro stigma study",`
- L646: `body: "India's mental health private sector emerged primarily to serve an English-educated, upper-middle-class clientele. Pricing, language `
- L654: `body: "Digital-first mental health services reduce the cost and geographic barriers — but not to zero. Smartphones are near-universal in u`
- L658: `"The assumption that metro India has a mental health access solution is incorrect and consequential — it leads to policy attention being c`
- L661: `title: "Human Resources in Mental Health — India Profile",`
- L696: `subtitle: "For 900 million people, mental healthcare is not expensive — it is absent",`
- L701: `"Rural India — approximately 65% of the country's population — is almost entirely absent from India's formal mental health system. This `
- L705: `label: "Of India's population in rural areas — fewer than 10% of mental health professionals serve them",`
- L736: `heading: "Prevalence is comparable to urban — infrastructure is not",`
- L737: `body: "The National Mental Health Survey (2016) found mental disorder prevalence in rural India at 11.3% — only marginally below the urban`
- L743: `body: "The District Mental Health Programme (DMHP) was launched in 1996 with the goal of extending mental health services to all of India's `
- L748: `heading: "The ASHA worker is the logical frontline — but is undertrained",`
- L749: `body: "India's 1.1 million ASHA (Accredited Social Health Activists) workers are the world's largest community health workforce and the prim`
- L751: `statLabel: "ASHA workers — undertrained for mental health",`
- L767: `body: "Multiple randomised controlled trials have demonstrated that mental health care can be effectively delivered in rural India through t`
- L769: `statLabel: "proving rural delivery works — none scaled nationally",`
- L775: `body: "India's primary health system — PHCs, sub-centres, ASHA workers — was designed around communicable disease, maternal health, and `
- L779: `body: "Even if India dramatically increased psychiatric training capacity, newly trained psychiatrists would not locate in rural districts i`
- L787: `"Rural India's mental health gap will not be closed by the private sector. It requires public investment in community health worker training`
- L796: `title: "Effectiveness of interventions for common mental disorders — MANAS trial",`
- L82: `body: "The 197 million figure from Lancet Psychiatry (2017) is considered a conservative estimate. The National Mental Health Survey (2016) `
- L88: `body: "India has approximately 9,000 psychiatrists for a population of 1.4 billion — a ratio of 0.3 per 100,000. The WHO recommends a mini`
- L94: `body: "The NMHS (2016) found that the median duration of untreated illness (DUI) — the gap between symptom onset and first professional co`

**`lib/notifications.ts`**

- L1: `// Server-side utility — call from server actions only.`
- L27: `// 1. Write to DB (fire-and-forget style — don't block on error)`
- L53: `// Fire email without awaiting — never block the calling action`

**`lib/plans.ts`**

- L170: `* Therapist's default revenue share per completed session — 75% of the`

**`lib/supabase/middleware.ts`**

- L145: `// Public /therapist/* routes — skip role check (apply, onboard, verify-email, join)`
- L69: `// AuthSessionMissingError is normal for unauthenticated visitors — not a real error`
- L87: `// Public routes — no auth required`

**`lib/supabase/server.ts`**

- L23: `// Called from Server Component — cookies can be read but not set`

---

End of audit. Generated 2026-05-26 on branch `dev2`.
