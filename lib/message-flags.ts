// Cheap keyword/regex content flagging for chat messages.
//
// Runs server-side at message-send time (see app/actions/sessions.ts) and on
// parsed session transcripts. It never blocks the message — it only records WHY
// a message tripped a rule so the admin can review (categories, not content).
//
// Reason codes are intentionally coarse (category-level) so the admin dashboard
// can surface "this conversation has a phone_number + off_platform flag" without
// the admin reading the actual message text.

export type FlagReason =
  | 'phone_number'
  | 'email_address'
  | 'whatsapp'
  | 'off_platform'
  | 'off_platform_payment'
  | 'self_harm'

export interface FlagResult {
  flagged: boolean
  /** Distinct reason codes, comma-joined for storage in messages.flag_reason. */
  reason: string | null
  /** Structured list (same data as `reason`), handy for callers/tests. */
  reasons: FlagReason[]
}

// ── Detectors ─────────────────────────────────────────────────────────────────
// Each entry maps a reason code to a test. Keyword lists are matched
// case-insensitively as whole-ish substrings; regexes handle structured data.

// 10+ digit runs allowing spaces / + / - / ( ) between digits. Anchored on a
// digit boundary so it won't fire on short codes (OTP 6-digit, years, prices).
const PHONE_RE = /(?:\+?\d[\s().-]?){10,}/

// Standard email shape.
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/

const WHATSAPP_RE = /\b(whats\s?app|w[\s.]?app|wapp)\b/i

// Other off-platform contact / channels.
const OFF_PLATFORM_RE = new RegExp(
  [
    'telegram', 'insta(gram)?', 'snapchat', 'snap chat', '\\bsignal\\b',
    'facebook', '\\bfb\\b', 'discord', 'skype',
    'google\\s?meet', '\\bzoom\\b', 'g[\\s-]?meet',
    'my (number|cell|mobile|phone|email|mail|id)',
    '(call|text|message|dm|reach|contact) me (at|on|directly)',
    'outside the (app|platform)', 'off the (app|platform)', 'off[\\s-]?platform',
  ].join('|'),
  'i',
)

// Off-platform payment attempts.
const OFF_PLATFORM_PAYMENT_RE = new RegExp(
  [
    'pay me directly', 'directly to me', '\\bupi\\b', 'g[\\s-]?pay', 'google pay',
    'paytm', 'phonepe', 'phone pe', 'bank (transfer|account)', '\\bifsc\\b',
    '\\bvenmo\\b', '\\bpaypal\\b', 'cash (app|payment)', 'outside.*(pay|payment)',
  ].join('|'),
  'i',
)

// Self-harm / crisis language. Coarse on purpose; false positives here are
// preferable to misses given the duty-of-care context.
const SELF_HARM_RE = new RegExp(
  [
    'kill (myself|me)', 'suicid', 'end (my|it all|my life)', 'want to die',
    'wanna die', 'better off dead', 'self[\\s-]?harm', 'harm myself',
    'hurt myself', 'cut(ting)? myself', "don'?t want to live", 'take my (own )?life',
  ].join('|'),
  'i',
)

const DETECTORS: { reason: FlagReason; re: RegExp }[] = [
  { reason: 'self_harm', re: SELF_HARM_RE },
  { reason: 'phone_number', re: PHONE_RE },
  { reason: 'email_address', re: EMAIL_RE },
  { reason: 'whatsapp', re: WHATSAPP_RE },
  { reason: 'off_platform', re: OFF_PLATFORM_RE },
  { reason: 'off_platform_payment', re: OFF_PLATFORM_PAYMENT_RE },
]

/**
 * Scan a single chunk of text and return which (if any) policy/safety
 * categories it trips. Pure + synchronous — safe to call inline before a DB
 * write or while looping a transcript.
 */
export function scanText(text: string): FlagResult {
  if (!text || !text.trim()) return { flagged: false, reason: null, reasons: [] }
  // Bound the work: cap the scanned length so a very long paste can never cause
  // a pathological regex cost. 5000 chars is far longer than any real message.
  const input = text.length > 5000 ? text.slice(0, 5000) : text
  const reasons: FlagReason[] = []
  for (const { reason, re } of DETECTORS) {
    if (re.test(input)) reasons.push(reason)
  }
  return {
    flagged: reasons.length > 0,
    reason: reasons.length > 0 ? reasons.join(', ') : null,
    reasons,
  }
}

/** Human-readable labels for reason codes (admin UI). */
export const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  phone_number: 'Phone number',
  email_address: 'Email address',
  whatsapp: 'WhatsApp',
  off_platform: 'Off-platform contact',
  off_platform_payment: 'Off-platform payment',
  self_harm: 'Self-harm / crisis',
}

/** Map a stored comma-separated flag_reason string back to readable labels. */
export function labelReasons(flagReason: string | null | undefined): string[] {
  if (!flagReason) return []
  return flagReason
    .split(',')
    .map(r => r.trim())
    .filter(Boolean)
    .map(r => FLAG_REASON_LABELS[r as FlagReason] ?? r)
}
