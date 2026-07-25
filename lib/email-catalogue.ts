// Catalogue of every email MindCanopy can send.
//
// Pure data — no Supabase, Resend, or Node imports — so the admin UI (a client
// component) can render this list directly, while the server uses the same
// entries to render and test-send. One source of truth: if an email exists, it
// is described here.
//
// `key` must match exactly what lib/email.ts writes to email_logs.template, so
// the admin console can join on it for "last sent" and totals. Notification
// emails are logged as `notification:<type>`; the standalone senders use their
// own ctx string.

export type EmailAudience = 'client' | 'therapist' | 'applicant' | 'admin'

export interface EmailCatalogueEntry {
  /** Matches email_logs.template. */
  key: string
  /** Human name for the admin list. */
  label: string
  audience: EmailAudience
  /** Plain-English answer to "when does this go out?" */
  trigger: string
  /** Set when a Vercel cron drives it. */
  schedule?: { cron: string; human: string }
  /** False when the template exists but nothing in the app calls it. */
  wired: boolean
  /** Sample values used when test-sending, so the preview looks real. */
  sampleMeta?: Record<string, string>
}

// Cron times are UTC in vercel.json; the human string is IST (UTC+5:30).
const CRON = {
  sessionReminders: { cron: '0 4 * * *', human: 'Daily, 9:30 AM IST' },
  missedSessions: { cron: '0 5 * * *', human: 'Daily, 10:30 AM IST' },
  replyOverdue: { cron: '0 9 * * *', human: 'Daily, 2:30 PM IST' },
  messageOverdue: { cron: '0 */3 * * *', human: 'Every 3 hours' },
  chatNotStarted: { cron: '0 10 * * *', human: 'Daily, 3:30 PM IST' },
  noSubscribeNudge: { cron: '0 11 * * *', human: 'Daily, 4:30 PM IST' },
  availabilityNudge: { cron: '0 14 * * *', human: 'Daily, 7:30 PM IST' },
} as const

const SAMPLE = {
  therapistFirstName: 'Priya',
  therapistFullName: 'Priya Menon',
  clientName: 'Tanisha Rao',
  clientFirstName: 'Tanisha',
  dateStr: 'Thu, 16 Jul, 06:30 PM',
}

export const EMAIL_CATALOGUE: EmailCatalogueEntry[] = [
  // ── Client ────────────────────────────────────────────────────────────────
  {
    key: 'notification:client_welcome_matched',
    label: 'Welcome + matched',
    audience: 'client',
    trigger: 'Right after signup, once auto-match finds them a therapist. The main post-signup email.',
    wired: true,
    sampleMeta: {
      therapistFirstName: SAMPLE.therapistFirstName,
      therapistFullName: SAMPLE.therapistFullName,
      adminMatchNote: 'Priya works a lot with early-career burnout, which matches what you described.',
    },
  },
  {
    key: 'notification:client_match_made',
    label: 'Meet your therapist (manual match)',
    audience: 'client',
    trigger: 'When an admin matches or re-matches them by hand from the dashboard.',
    wired: true,
    sampleMeta: {
      therapistFirstName: SAMPLE.therapistFirstName,
      therapistFullName: SAMPLE.therapistFullName,
      adminMatchNote: '',
    },
  },
  {
    key: 'notification:client_proposals_ready',
    label: 'Two therapists to choose from',
    audience: 'client',
    trigger: 'When an admin proposes two therapists for the client to pick between.',
    wired: true,
  },
  {
    key: 'notification:client_message',
    label: 'New message from your therapist',
    audience: 'client',
    trigger: 'A message has sat unread for 3 hours. Same type also emails therapists about client messages.',
    schedule: CRON.messageOverdue,
    wired: true,
    sampleMeta: {
      recipientRole: 'client',
      clientName: SAMPLE.therapistFullName,
      messageBody: 'Hi Tanisha, just checking in before Thursday. Anything you want to start with?',
    },
  },
  {
    key: 'notification:session_scheduled_client',
    label: 'Session scheduled',
    audience: 'client',
    trigger: 'Immediately after a session is booked and paid for.',
    wired: true,
    sampleMeta: { therapistFirstName: SAMPLE.therapistFirstName, dateStr: SAMPLE.dateStr },
  },
  {
    key: 'notification:session_reminder_client',
    label: 'Session reminder (day before)',
    audience: 'client',
    trigger: 'The day before a scheduled session.',
    schedule: CRON.sessionReminders,
    wired: true,
    sampleMeta: { dateStr: SAMPLE.dateStr },
  },
  {
    key: 'notification:client_chat_not_started',
    label: 'Nudge: say hi to your therapist',
    audience: 'client',
    trigger: 'Matched but has not sent a first message yet.',
    schedule: CRON.chatNotStarted,
    wired: true,
    sampleMeta: { therapistFirstName: SAMPLE.therapistFirstName },
  },
  {
    key: 'notification:client_not_subscribed',
    label: 'Nudge: want a different therapist?',
    audience: 'client',
    trigger: 'Started a chat but has not booked or subscribed.',
    schedule: CRON.noSubscribeNudge,
    wired: true,
    sampleMeta: { therapistFirstName: SAMPLE.therapistFirstName },
  },
  {
    key: 'notification:client_session_feedback',
    label: 'How was your session? (feedback)',
    audience: 'client',
    trigger: 'The morning after a session they actually attended. Once per session. Stars and options are tappable in the email; the written note is on the page.',
    schedule: { cron: '30 5 * * *', human: 'Daily, 11:00 AM IST' },
    wired: true,
    sampleMeta: {
      therapistFirstName: SAMPLE.therapistFirstName,
      dateStr: 'Thursday',
      // A real send passes the session's UUID; this is a harmless placeholder so
      // a test email renders with working-looking links.
      sessionId: '00000000-0000-0000-0000-000000000000',
    },
  },
  {
    key: 'client-discount-offer',
    label: 'First-session discount offer',
    audience: 'client',
    trigger: 'Sent by hand from admin, to one client or in bulk to all. Never automatic.',
    wired: true,
  },
  {
    key: 'notification:client_welcome',
    label: 'Welcome (no match yet)',
    audience: 'client',
    trigger: 'Nothing calls this any more. Superseded by "Welcome + matched" once auto-match went in at signup.',
    wired: false,
  },

  // ── Therapist ─────────────────────────────────────────────────────────────
  {
    key: 'notification:client_matched',
    label: 'You have a new client',
    audience: 'therapist',
    trigger: 'A client is matched to them, by auto-match, admin, or the client choosing them.',
    wired: true,
    sampleMeta: { clientName: SAMPLE.clientName },
  },
  {
    key: 'notification:client_unmatched',
    label: 'A match has ended',
    audience: 'therapist',
    trigger: 'An admin ends one of their matches.',
    wired: true,
    sampleMeta: { clientName: SAMPLE.clientName },
  },
  {
    key: 'notification:profile_verified',
    label: 'Profile verified',
    audience: 'therapist',
    trigger: 'An admin verifies them, or they finish onboarding.',
    wired: true,
  },
  {
    key: 'notification:session_scheduled_therapist',
    label: 'Session booked with your client',
    audience: 'therapist',
    trigger: 'A client books and pays for a session with them.',
    wired: true,
    sampleMeta: { clientFirstName: SAMPLE.clientFirstName, dateStr: SAMPLE.dateStr },
  },
  {
    key: 'notification:session_reminder_therapist',
    label: 'Session reminder (day before)',
    audience: 'therapist',
    trigger: 'The day before a scheduled session.',
    schedule: CRON.sessionReminders,
    wired: true,
    sampleMeta: { clientFirstName: SAMPLE.clientFirstName, dateStr: SAMPLE.dateStr },
  },
  {
    key: 'notification:therapist_reply_overdue',
    label: 'A client is waiting for your reply',
    audience: 'therapist',
    trigger: 'A client message has gone unanswered for 48 hours.',
    schedule: CRON.replyOverdue,
    wired: true,
    sampleMeta: { clientFirstName: SAMPLE.clientFirstName },
  },
  {
    key: 'notification:therapist_missed_session',
    label: 'You missed a session',
    audience: 'therapist',
    trigger: 'A scheduled session passed without them joining.',
    schedule: CRON.missedSessions,
    wired: true,
    sampleMeta: { clientFirstName: SAMPLE.clientFirstName, dateStr: SAMPLE.dateStr },
  },
  {
    key: 'notification:therapist_availability_nudge',
    label: 'Your availability is not set',
    audience: 'therapist',
    trigger: 'Verified but has no weekly availability saved, so clients cannot book.',
    schedule: CRON.availabilityNudge,
    wired: true,
  },
  {
    key: 'notification:therapist_cancellation_pattern',
    label: 'Pattern of cancellations',
    audience: 'therapist',
    trigger: 'They cancel repeatedly inside a rolling window.',
    wired: true,
    sampleMeta: { cancelCount: '3', timeWindow: '30 days' },
  },
  {
    key: 'notification:therapist_account_paused',
    label: 'Account paused',
    audience: 'therapist',
    trigger: 'Written, but nothing calls it yet. Needs wiring to an admin pause action.',
    wired: false,
    sampleMeta: { adminNote: 'Paused while we look into a session report.' },
  },
  {
    key: 'notification:therapist_concern_raised',
    label: 'A concern was raised',
    audience: 'therapist',
    trigger: 'Written, but nothing calls it yet. Needs wiring to the transcript-flag review flow.',
    wired: false,
  },

  // ── Applicant ─────────────────────────────────────────────────────────────
  {
    key: 'application-received',
    label: 'Application received, verify your email',
    audience: 'applicant',
    trigger: 'A therapist submits the application form at /therapist/apply.',
    wired: true,
  },
  {
    key: 'application-invite',
    label: 'Application approved, invite code',
    audience: 'applicant',
    trigger: 'An admin approves their application. Carries the one-time onboarding code.',
    wired: true,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    key: 'notification:switch_request',
    label: 'Client requested a therapist switch',
    audience: 'admin',
    trigger: 'A client submits a switch request.',
    wired: true,
    sampleMeta: { clientName: SAMPLE.clientName, reason: 'Felt like we were not clicking.' },
  },
  {
    key: 'admin-new-application',
    label: 'New therapist application',
    audience: 'admin',
    trigger: 'Someone submits the therapist application form.',
    wired: true,
  },
  {
    key: 'admin-client-signup',
    label: 'New client signup',
    audience: 'admin',
    trigger: 'A client creates an account.',
    wired: true,
  },
  {
    key: 'admin-new-subscription',
    label: 'New subscription',
    audience: 'admin',
    trigger: 'A client starts a subscription.',
    wired: true,
  },
  {
    key: 'admin-session-payment',
    label: 'Session payment received',
    audience: 'admin',
    trigger: 'A pay-as-you-go session payment clears.',
    wired: true,
  },
  {
    key: 'admin-therapist-onboarded',
    label: 'Therapist finished onboarding',
    audience: 'admin',
    trigger: 'A therapist completes onboarding with their invite code.',
    wired: true,
  },
  {
    key: 'admin-contact-form',
    label: 'Contact form submission',
    audience: 'admin',
    trigger: 'Someone submits the form at /contact.',
    wired: true,
  },
  {
    key: 'admin-transcript-flag',
    label: 'Session transcript flagged',
    audience: 'admin',
    trigger: 'The automated transcript scan flags a session for review.',
    wired: true,
  },
  {
    key: 'payout-request',
    label: 'Therapist requested a payout',
    audience: 'admin',
    trigger: 'A therapist requests their outstanding payout.',
    wired: true,
  },
  {
    key: 'admin-compose',
    label: 'Custom one-off email',
    audience: 'admin',
    trigger: 'Sent by hand from the Compose tab. Never automatic.',
    wired: true,
  },
]

export const AUDIENCE_ORDER: EmailAudience[] = ['client', 'therapist', 'applicant', 'admin']

export const AUDIENCE_LABEL: Record<EmailAudience, string> = {
  client: 'To clients',
  therapist: 'To therapists',
  applicant: 'To applicants',
  admin: 'To you (admin)',
}

export function catalogueEntry(key: string): EmailCatalogueEntry | undefined {
  return EMAIL_CATALOGUE.find((e) => e.key === key)
}
