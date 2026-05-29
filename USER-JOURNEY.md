# MindCanopy User Journey & Sitemap

Reference for every user type, traffic source, page, action, and email touchpoint on MindCanopy. Each Mermaid block below is paste-ready into Notion.

## User types

| Type | DB role | Auth required |
|---|---|---|
| Visitor | none | no |
| Client | `client` | yes |
| Therapist | `therapist` | yes |
| Admin (Niharika) | `admin` | yes |

## Diagrams index

1. Acquisition sources to landing pages
2. Full sitemap by role
3a. Client journey: visitor to matched
3b. Client journey: ongoing engagement
3c. Client journey: switch, cancel, delete
4a. Therapist journey: applicant to onboarded
4b. Therapist journey: active practice
5. Admin operations
6. Email touchpoints (trigger to recipient)

---

## 1. Acquisition sources to landing pages

```mermaid
flowchart LR
    GSEO["Google SEO"] --> Home["/"]
    GSEO --> ForI["/for/individuals"]
    GSEO --> ForC["/for/couples"]
    GSEO --> ForA["/for/adolescents"]
    GSEO --> Blog["/blog and /blog/[slug]"]
    GSEO --> Reports["/market-reports and /market-reports/[slug]"]
    GSEO --> HelpP["/help and /help/[topic]"]

    GAds["Google Ads"] --> ForI
    GAds --> ForC
    GAds --> ForA
    GAds --> QI["/questionnaire/individual"]
    GAds --> QC["/questionnaire/couples"]
    GAds --> QT["/questionnaire/teen"]

    MAds["Meta Ads / IG / FB"] --> ForI
    MAds --> ForC
    MAds --> ForA
    MAds --> QI
    MAds --> QC
    MAds --> QT
    MAds --> TJoin["/therapist/join (recruitment)"]

    LI["LinkedIn"] --> Home
    LI --> About["/about"]
    LI --> TJoin

    XT["X / Threads"] --> Home
    XT --> Blog

    Direct["Direct / typed URL"] --> Home

    EmailLinks["Email links"] --> AuthCB["/auth/callback"]
    EmailLinks --> Reset["/auth/reset-password"]
    EmailLinks --> TVerify["/therapist/verify-email"]
    EmailLinks --> TOnboard["/therapist/onboard"]
    EmailLinks --> CDash["/dashboard"]
    EmailLinks --> TDash["/therapist/dashboard"]
    EmailLinks --> Admin["/admin"]

    Ref["Referral / shared link"] --> Home
    Ref --> Blog
    Ref --> Reports
```

---

## 2. Full sitemap by role

```mermaid
flowchart TB
    Root["mindcanopy.in"]

    Root --> PUB["Public no auth"]
    Root --> CL["Client role=client"]
    Root --> TH["Therapist role=therapist"]
    Root --> AD["Admin role=admin"]

    PUB --> P_Home["/"]
    PUB --> P_Brand["/about, /contact"]
    PUB --> P_Legal["/privacy, /terms"]
    PUB --> P_Content["/blog, /market-reports, /help"]
    PUB --> P_For["/for/individuals, /for/couples, /for/adolescents"]
    PUB --> P_Quest["/questionnaire/individual, /questionnaire/couples, /questionnaire/teen"]
    PUB --> P_Auth["/signup, /login, /forgot-password"]
    PUB --> P_AuthCB["/auth/callback, /auth/confirmed, /auth/reset-password"]
    PUB --> P_TFun["/therapist/join, /therapist/apply, /therapist/verify-email, /therapist/onboard"]
    PUB --> P_Gates["/therapist/login, /admin/login"]

    CL --> C_Dash["/dashboard"]
    C_Dash --> C_Profile["/dashboard/account, /dashboard/subscription, /dashboard/subscribe"]
    C_Dash --> C_Therapy["/dashboard/my-therapist, /dashboard/change-therapist"]
    C_Dash --> C_Comm["/dashboard/chat, /dashboard/video, /dashboard/notes, /dashboard/sessions"]
    C_Dash --> C_Support["/dashboard/faq, /dashboard/reviews, /dashboard/contact"]

    TH --> T_Dash["/therapist/dashboard"]
    T_Dash --> T_Profile["/therapist/dashboard/account, /therapist/dashboard/payment"]
    T_Dash --> T_Clients["/therapist/dashboard/client/[matchId]"]
    T_Dash --> T_Comm["/therapist/dashboard/chat, /therapist/dashboard/video, /therapist/dashboard/notes"]
    T_Dash --> T_Support["/therapist/dashboard/faq, /therapist/dashboard/contact"]

    AD --> A_Dash["/admin"]
```

---

## 3a. Client journey: visitor to matched

```mermaid
flowchart TD
    Start(["Visitor lands"]) --> Discover["Marketing / content page"]
    Discover --> CTA{"Pick category"}
    CTA -->|individual| QI["/questionnaire/individual"]
    CTA -->|couples| QC["/questionnaire/couples"]
    CTA -->|teen| QT["/questionnaire/teen"]

    QI --> Saved["Responses cached in sessionStorage"]
    QC --> Saved
    QT --> Saved

    Saved --> Signup["/signup"]
    Signup -->|submit| Persist["Insert auth.users + profiles + questionnaire_responses + backfill client_profiles"]
    Persist --> Email1["EMAIL: Supabase confirmation link to user"]
    Persist --> EmailA1["EMAIL: New client signup to admin"]

    Email1 --> Click["User clicks email link"]
    Click --> CB["/auth/callback"]
    CB --> Confirmed["/auth/confirmed"]
    Confirmed --> Pending["/dashboard pending state"]

    Pending --> PendUI["Sees pending UI: therapist carousel + subscribe CTA"]
    PendUI --> SubFlow["/dashboard/subscribe"]
    SubFlow --> Razor["Razorpay checkout"]
    Razor --> RVerify["/api/payment/verify"]
    RVerify --> Hook["/api/webhooks/razorpay"]
    Hook --> SubActive["subscriptions.status = active"]
    SubActive --> EmailA2["EMAIL: New subscription to admin"]

    SubActive --> WaitMatch["Waiting for admin match"]
    WaitMatch -.->|admin matches in /admin| MatchActive["matches.status = active"]
    MatchActive --> EmailT1["EMAIL: Client matched to therapist + in-app notification"]
    MatchActive --> Matched["/dashboard matched state unlocks chat, sessions, video, notes"]
```

---

## 3b. Client journey: ongoing engagement

```mermaid
flowchart TD
    M["/dashboard matched state"]

    M --> Chat["/dashboard/chat"]
    M --> Sessions["/dashboard/sessions"]
    M --> Notes["/dashboard/notes read-only"]
    M --> MyT["/dashboard/my-therapist"]
    M --> Account["/dashboard/account"]
    M --> Sub["/dashboard/subscription"]

    Chat --> Send["Send message"]
    Send -.->|first 10 messages free, then gated| IntroLimit{"Intro chat counter"}
    IntroLimit -->|exceeded, no sub| Paywall["Paywall: send to /dashboard/subscribe"]
    IntroLimit -->|active sub| Delivered["Message stored, realtime push"]
    Delivered -.->|debounced 5 min| EmailT2["EMAIL: New message to therapist"]

    Sessions -.->|therapist schedules in /therapist/dashboard| SesRow["sessions row created with Daily.co room URL"]
    SesRow --> Cron["Daily cron at /api/cron/session-reminders"]
    Cron -.->|25h window| EmailR["EMAIL: Session reminder to both client + therapist"]
    SesRow --> JoinTime["Session time arrives"]
    JoinTime --> Join["/dashboard/video joins Daily.co room"]
    Join --> Ended["Session ended"]
    Ended --> TherapistNotes["Therapist writes notes in /therapist/dashboard/notes"]
    TherapistNotes --> ClientReads["Client reads at /dashboard/notes"]
```

---

## 3c. Client journey: switch, cancel, delete

```mermaid
flowchart TD
    M["/dashboard matched state"]

    M --> Change["/dashboard/change-therapist"]
    Change --> Req["Submit switch request"]
    Req --> SwitchRow["therapist_switch_requests row"]
    SwitchRow --> EmailA3["EMAIL: Switch request to admin"]
    EmailA3 -.->|admin actions in /admin| MatchEnded["matches.status = ended"]
    MatchEnded --> EmailT3["EMAIL: Match ended to therapist"]
    MatchEnded --> BackPending["Client back to /dashboard pending state, queue for re-match"]

    M --> SubPage["/dashboard/subscription"]
    SubPage --> Cancel["Cancel subscription"]
    Cancel --> CancelCall["Razorpay cancel_at_cycle_end"]
    CancelCall --> StillActive["status stays active until current_period_end"]
    StillActive --> NextCharge["Webhook on next charge attempt"]
    NextCharge --> Expired["subscriptions.status = cancelled"]
    Expired --> Gated["Chat + sessions gated, client sees subscribe banner"]

    M --> Acct["/dashboard/account"]
    Acct --> DeleteStep1["Delete account, step 1"]
    DeleteStep1 --> DeleteStep2["Confirm with typed phrase"]
    DeleteStep2 --> AuthDelete["admin.auth.admin.deleteUser cascades all rows"]
    AuthDelete --> Goodbye["Redirect to /?deleted=1"]
```

---

## 4a. Therapist journey: applicant to onboarded

```mermaid
flowchart TD
    Start(["Visitor lands"]) --> Recruit["/therapist/join"]
    Recruit --> Apply["/therapist/apply 3-step form"]
    Apply -->|submit| AppRow["therapist_applications row, status=pending, verify_token generated"]
    AppRow --> EmailA4["EMAIL: Application received + verify link to applicant"]
    AppRow --> EmailA5["EMAIL: New application to admin"]

    EmailA4 --> ClickVerify["Applicant clicks verify link"]
    ClickVerify --> Verify["/therapist/verify-email?token=..."]
    Verify --> Stamped["email_verified_at timestamp set"]

    Stamped --> AdminReview["Admin reviews in /admin"]
    AdminReview --> AdminDecide{"Approve or reject"}
    AdminDecide -->|reject| Rejected["status=rejected, optional admin notes"]
    AdminDecide -->|approve| Invite["therapist_invites row created with one-time code"]
    Invite --> EmailA6["EMAIL: Application approved + invite code to applicant"]

    EmailA6 --> ClickInvite["Applicant clicks invite link"]
    ClickInvite --> Onboard["/therapist/onboard?code=... 6-step form"]
    Onboard -->|submit| TProfile["therapist_profiles row, profile linked to auth user, photo + docs in Supabase Storage"]
    TProfile --> EmailA7["EMAIL: Therapist onboarded to admin"]
    TProfile --> TDashRedir["Redirect to /therapist/dashboard"]
```

---

## 4b. Therapist journey: active practice

```mermaid
flowchart TD
    TDash["/therapist/dashboard"]

    TDash --> Verify["Admin verifies credentials"]
    Verify --> VerifyFlag["therapist_profiles.is_verified = true"]
    VerifyFlag --> EmailT4["EMAIL: Profile verified to therapist"]
    VerifyFlag --> Eligible["Eligible for client matches"]

    Eligible --> Matched["Admin matches a client"]
    Matched --> EmailT1["EMAIL: New client matched to therapist + in-app notification"]
    Matched --> ClientCard["/therapist/dashboard shows client card"]

    ClientCard --> ClientView["/therapist/dashboard/client/[matchId]"]
    ClientView --> Chat["/therapist/dashboard/chat"]
    ClientView --> Sched["Schedule sessions, opens Daily.co room"]
    Sched --> EmailT5["EMAIL: Session scheduled to therapist (and client notification)"]
    ClientView --> Notes["/therapist/dashboard/notes per session"]
    ClientView --> VideoP["/therapist/dashboard/video joins session"]

    TDash --> TAccount["/therapist/dashboard/account"]
    TAccount --> Availability["Weekly availability JSONB editor"]

    TDash --> Payment["/therapist/dashboard/payment"]
    Payment --> RequestPay["Request payout button"]
    RequestPay --> EmailA8["EMAIL: Payout request to admin"]

    TDash --> SwitchEnd["Admin ends match (switch request actioned)"]
    SwitchEnd --> EmailT3["EMAIL: Match ended to therapist"]
```

---

## 5. Admin operations

```mermaid
flowchart TD
    Login["/admin/login"] --> Dash["/admin"]

    Dash --> PendingClients["Tab: Unmatched clients with questionnaire answers"]
    Dash --> Therapists["Tab: Verified therapists + capacity"]
    Dash --> Apps["Tab: Pending applications"]
    Dash --> Switches["Tab: Switch requests"]
    Dash --> ActiveMatches["Tab: Active matches"]
    Dash --> Invites["Tab: Generated invite codes"]

    PendingClients -->|select therapist| Match["Create matches row (unique partial index enforces one active match per client)"]
    Match --> EmailT1["EMAIL: Client matched to therapist"]

    Therapists -->|toggle| VerifyToggle["Set is_verified true/false"]
    VerifyToggle --> EmailT4["EMAIL: Profile verified to therapist"]

    Apps -->|approve| GenInvite["Generate invite code + send"]
    GenInvite --> EmailA6["EMAIL: Application approved to applicant"]
    Apps -->|reject| RejectApp["Set application status to rejected"]

    Switches -->|action| EndMatch["End active match, re-queue client"]
    EndMatch --> EmailT3["EMAIL: Match ended to therapist"]

    Dash -.receives.-> Inbox["EMAIL inbox: new applications, new client signups, new subscriptions, therapist onboarded, switch requests, contact forms, payout requests"]
```

---

## 6. Email touchpoints

Every email currently sent by the system, grouped by recipient.

### To applicant / new user
| Trigger | Template | Sender route | Recipient |
|---|---|---|---|
| Signup form submit | Supabase confirmation link | `supabase.auth.signUp` | New user |
| Forgot password form | Supabase reset link | `supabase.auth.resetPasswordForEmail` | Existing user |
| Therapist apply submit | Application received + verify-email link | `sendApplicationReceivedEmail` | Applicant |
| Admin approves application | Application approved + invite code | `sendApplicationInviteEmail` | Applicant |

### To therapist (in-app + email)
| Trigger | Template | Type |
|---|---|---|
| Admin creates match | Client matched | `client_matched` |
| Admin ends match | Match ended | `client_unmatched` |
| Client sends message (debounced 5 min) | New message | `client_message` |
| Admin sets is_verified | Profile verified | `profile_verified` |
| Therapist schedules session | Session scheduled | `session_scheduled` |
| Daily cron, session within 25h | Session reminder | `session_reminder` |

### To client (in-app + email)
| Trigger | Template | Type |
|---|---|---|
| Daily cron, session within 25h | Session reminder | `session_reminder` |

Note: no welcome email, no match-confirmation email, no payment-confirmation email to clients today. Clients get the in-app notification when matched, but the only email they ever receive after signup is the session reminder cron. **See `TODO.md` Dev section, "Email templates".**

### To admin (admin@mindcanopy.in)
| Trigger | Template |
|---|---|
| Therapist submits application | New application |
| New client signs up | New client signup |
| Client completes Razorpay payment | New subscription |
| Therapist completes onboarding | Therapist onboarded |
| Client submits switch request | Switch request (`tplSwitchRequest`, via `sendNotificationEmail`) |
| Visitor submits `/contact` form | Contact form |
| Therapist clicks "Request payout" | Payout request |

### Currently NOT sent (gaps)
- Welcome email to new client after signup
- Match-made email to client (only therapist gets one)
- Payment confirmation / receipt to client (Razorpay sends its own; we don't)
- Switch request status update to client (after admin actions)
- Session-scheduled email to client (therapist gets one, client only sees in-app)
- Session-ended / notes-available email to client
- Subscription expiring / renewal reminder to client
- Onboarding nudge emails (questionnaire abandoned, signed up but not subscribed, etc.) — see TODO Dev section "Marketing nudge emails"
- Therapist application rejected email to applicant
- Payout completed email to therapist

---

## Key observations

1. **No global welcome email for clients.** The Supabase confirmation link is the only post-signup email. Worth adding a branded welcome.
2. **Client only ever gets one type of email** after signup: session reminders. All match, message, and subscription events are silent on email for clients.
3. **Lead-form pages (questionnaire, signup, therapist apply/onboard) don't carry the footer.** Intentional. Privacy and Terms are only surfaced on main marketing pages and as a passive disclaimer on `/signup`.
4. **Verify-email step doesn't notify admin or change visible state.** The application appears in admin's queue at submit time, not at verify time. The `email_verified_at` timestamp is recorded but not currently used to gate approval.
5. **`TEST_CODE = 'ZENSPACE2026'`** in `app/therapist/onboard/actions.ts:11` is a backdoor invite-code that bypasses validation. Anyone who types it gets through onboarding.
6. **No reminder or drip for stalled funnels.** A visitor who completes the questionnaire but doesn't sign up, or signs up but doesn't subscribe, receives nothing.
7. **Razorpay merchant approval expects Terms link in checkout.** Today Terms is only in the footer and the signup disclaimer line.
