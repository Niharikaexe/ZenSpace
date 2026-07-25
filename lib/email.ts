// Email sender via Resend REST API (no SDK required).
// Set RESEND_API_KEY in .env.local to enable emails.
// Without it, emails are silently skipped (non-fatal).

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'
import { firstSessionPriceInr, sessionPriceInr, formatInr, type SessionCategory } from '@/lib/plans'
import { catalogueEntry } from '@/lib/email-catalogue'

// ── email_logs audit trail ───────────────────────────────────────────────────
// Every Resend send attempt is recorded so the admin dashboard can debug
// "did this person actually get the email?". Failures here are swallowed —
// a logging glitch must never block an email send.

type EmailSendStatus = 'sent' | 'failed_no_api_key' | 'failed_resend_rejected' | 'failed_threw'

interface RelatedRefs {
  userId?: string | null
  applicationId?: string | null
  matchId?: string | null
}

interface LogEmailArgs {
  recipient: string
  template: string
  subject: string
  send_status: EmailSendStatus
  resend_id?: string | null
  resend_status_code?: number | null
  send_error?: string | null
  related?: RelatedRefs
}

async function logEmailAttempt(args: LogEmailArgs): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    await admin.from('email_logs').insert({
      recipient: args.recipient,
      template: args.template,
      subject: args.subject,
      send_status: args.send_status,
      resend_id: args.resend_id ?? null,
      resend_status_code: args.resend_status_code ?? null,
      send_error: args.send_error ?? null,
      related_user_id: args.related?.userId ?? null,
      related_application_id: args.related?.applicationId ?? null,
      related_match_id: args.related?.matchId ?? null,
    })
  } catch (err) {
    logger.warn('email/log', 'Failed to write email_logs row', {
      recipient: args.recipient,
      template: args.template,
      err: err instanceof Error ? err.message : String(err),
    })
  }
}

function parseResendId(body: string): string | null {
  try {
    const json = JSON.parse(body) as { id?: unknown }
    return typeof json.id === 'string' ? json.id : null
  } catch {
    return null
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Resend transport (rate-limit safe) ───────────────────────────────────────
// Every Resend HTTP call goes through here. Two protections against the account
// rate limit (2 req/s):
//   1. In-process serialization + a minimum gap between calls, so a burst inside
//      one request (e.g. the 3 emails a new signup fires) is spread under 2/s.
//   2. Exponential backoff with jitter on 429 / 5xx, honoring Retry-After.
// Returns the final Response; callers read the body exactly as before.
let _resendChain: Promise<unknown> = Promise.resolve()
let _lastResendAt = 0
const RESEND_MIN_INTERVAL_MS = 550   // ~2 req/s ceiling
const RESEND_MAX_RETRIES = 4

async function resendFetch(url: string, payload: unknown): Promise<Response> {
  const run = async (): Promise<Response> => {
    for (let attempt = 0; ; attempt++) {
      const gap = RESEND_MIN_INTERVAL_MS - (Date.now() - _lastResendAt)
      if (gap > 0) await sleep(gap)
      _lastResendAt = Date.now()

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify(payload),
      })

      // Success or a non-retryable client error → return as-is.
      if (res.status !== 429 && res.status < 500) return res
      if (attempt >= RESEND_MAX_RETRIES) return res

      const retryAfter = Number(res.headers.get('retry-after'))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(8000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
      logger.warn('email/resend', 'Rate-limited / 5xx — backing off', { status: res.status, attempt, backoff })
      await sleep(backoff)
    }
  }
  // Chain so concurrent callers in the same process run one-at-a-time.
  const result = _resendChain.then(run, run)
  _resendChain = result.then(() => undefined, () => undefined)
  return result
}

const FROM = process.env.RESEND_FROM ?? 'MindCanopy <marketing@mindcanopy.in>'
const FROM_ADMIN = process.env.RESEND_FROM_ADMIN ?? 'MindCanopy Admin <admin@mindcanopy.in>'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mindcanopy.in'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@mindcanopy.in'

const LOGO_URL = `${SITE}/icon.svg`

// ── Template helpers ─────────────────────────────────────────────────────────

type Audience = 'client' | 'therapist' | 'admin' | 'applicant'

function escapeHtml(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function brandHeader() {
  return `<td style="background:#233551;padding:20px 32px;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:12px;vertical-align:middle;">
        <img src="${LOGO_URL}" width="32" height="32" alt="MindCanopy" style="display:block;border-radius:6px;background:#FFF5F2;" />
      </td>
      <td style="vertical-align:middle;">
        <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">MindCanopy</span>
      </td>
    </tr></table>
  </td>`
}

function footerLine(audience: Audience): string {
  if (audience === 'therapist') return 'You&rsquo;re receiving this because you&rsquo;re a therapist on MindCanopy.'
  if (audience === 'admin') return 'Admin notification.'
  return ''
}

function base(content: string, audience: Audience = 'therapist') {
  const fline = footerLine(audience)
  const footer = fline
    ? `${fline}<br/>Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>`
    : `Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MindCanopy</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ecef;overflow:hidden;">
        <tr>
          ${brandHeader()}
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">
              ${footer}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">${label}</a>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;line-height:1.3;">${text}</h1>`
}

function p(text: string) {
  return `<p style="margin:16px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">${text}</p>`
}

function tag(text: string, color = '#7EC0B7') {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${color}22;color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`
}

const signOff = `
  <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">
    - MindCanopy team
  </p>
`

// First-session discount callout, used in the client "matched" emails and the
// standalone discount-offer email. Only ever mentions the discounted first-
// session price (we don't anchor on or announce the regular price in emails).
function offerBox(firstInr: number) {
  return `
    <div style="margin:20px 0 0;padding:16px 18px;background:#FFF5F2;border:1px solid #E8926A33;border-radius:12px;">
      <p style="margin:0;font-size:12px;font-weight:800;color:#C56A42;text-transform:uppercase;letter-spacing:0.06em;">A little something to start</p>
      <p style="margin:8px 0 0;font-size:16px;color:#233551;line-height:1.6;">
        Starting therapy can often feel like a big leap. To help you begin your journey, your first session is available for just <strong>${formatInr(firstInr)}</strong>.
      </p>
    </div>`
}

type FirstSessionOffer = { firstInr: number; regularInr: number }

// Build a one-time login URL for a client's email button: clicking it logs the
// recipient in (via /auth/confirm → verifyOtp) and lands them on `nextPath`,
// even in a fresh browser (e.g. Gmail's in-app browser) with no session.
//
// Falls back to the plain in-app URL if link generation fails for any reason,
// so the button always works — at worst it behaves like before (may prompt
// login). Only used for CLIENT emails; therapist/admin emails keep plain URLs.
//
// Security note: this is a full-account login link. Tokens are single-use and
// expire per the Supabase project's OTP-expiry setting (lower it in Auth
// settings if forwarded-email risk is a concern on a health platform).
async function magicLinkFor(email: string, nextPath: string): Promise<string> {
  const fallback = `${SITE}${nextPath}`
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    const hashed = data?.properties?.hashed_token
    if (error || !hashed) {
      logger.warn('email/magiclink', 'generateLink failed; using plain URL', {
        email, err: error?.message,
      })
      return fallback
    }
    return `${SITE}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=magiclink&next=${encodeURIComponent(nextPath)}`
  } catch (err) {
    logger.warn('email/magiclink', 'generateLink threw; using plain URL', {
      email, err: err instanceof Error ? err.message : String(err),
    })
    return fallback
  }
}

// ── CLIENT TEMPLATES ─────────────────────────────────────────────────────────

function tplClientWelcome(firstName: string, ctaUrl?: string) {
  return base(`
    ${h1(`Welcome to MindCanopy, ${escapeHtml(firstName)}.`)}
    ${p('Glad you came our way. We hope MindCanopy can be the home your mind has been looking for.')}
    ${p(`When we have a therapist for you, we&rsquo;ll write back with a short introduction. You&rsquo;ll have an intro chat with them first. If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    ${p('You can log in any time.')}
    ${btn('Go to your dashboard →', ctaUrl ?? `${SITE}/dashboard`)}
    <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">More soon.</p>
    ${signOff}
  `, 'client')
}

// Admin manual-match email: the client already onboarded and is being matched
// (or re-matched) by the admin. Plain "meet your therapist" copy — no welcome.
function tplClientMatchMade(
  therapistFirstName: string,
  therapistFullName: string,
  adminMatchNote: string,
  ctaUrl?: string,
  offer?: FirstSessionOffer,
) {
  const cta = offer
    ? btn(`Start your session now at ${formatInr(offer.firstInr)} →`, ctaUrl ?? `${SITE}/dashboard/sessions`)
    : btn(`Say hi →`, ctaUrl ?? `${SITE}/dashboard`)
  return base(`
    ${h1(`Meet ${escapeHtml(therapistFullName)}.`)}
    ${p(`We&rsquo;ve gone through your responses and matched you with someone we think will be a good fit.`)}
    ${adminMatchNote ? p(escapeHtml(adminMatchNote)) : ''}
    ${offer ? offerBox(offer.firstInr) : ''}
    ${p(`Your next step is an intro chat. Say hi when you&rsquo;re ready.`)}
    ${cta}
    ${p(`If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">We hope they&rsquo;re the right one.</p>
    ${signOff}
  `, 'client')
}

// Signup auto-match email: the single combined "welcome + you've been matched"
// email a brand-new client receives. Sent by autoMatchClient.
function tplClientWelcomeMatched(
  clientFirstName: string,
  therapistFirstName: string,
  therapistFullName: string,
  adminMatchNote: string,
  ctaUrl?: string,
  offer?: FirstSessionOffer,
) {
  const cta = offer
    ? btn(`Start your session now at ${formatInr(offer.firstInr)} →`, ctaUrl ?? `${SITE}/dashboard/sessions`)
    : btn(`Say hi to ${escapeHtml(therapistFirstName)} →`, ctaUrl ?? `${SITE}/dashboard`)
  return base(`
    ${h1(`Welcome to MindCanopy, ${escapeHtml(clientFirstName)}.`)}
    ${p(`You&rsquo;re in &mdash; and you&rsquo;re not on a waitlist. We&rsquo;ve already matched you with someone.`)}
    ${p(`Meet <strong>${escapeHtml(therapistFullName)}</strong>. We read through your responses and think they&rsquo;ll be a good fit for you.`)}
    ${adminMatchNote ? p(escapeHtml(adminMatchNote)) : ''}
    ${offer ? offerBox(offer.firstInr) : ''}
    ${p(`Your first step is a free intro chat. ${escapeHtml(therapistFirstName)} is ready when you are &mdash; just open your dashboard and say hi.`)}
    ${cta}
    ${p(`If it doesn&rsquo;t feel like the right fit, tell us and we&rsquo;ll keep looking. No explanation needed.`)}
    <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">Glad you came our way.</p>
    ${signOff}
  `, 'client')
}

// Standalone discount-offer email for existing clients ("Special — only for
// you"). Same brand shell + helpers as every other template. Mentions only the
// discounted ₹799 first session — no old/new regular price.
function tplClientDiscountOffer(firstName: string, firstInr: number, ctaUrl?: string) {
  return base(`
    ${h1(`A warm welcome gift to you, ${escapeHtml(firstName)}.`)}
    ${p(`We&rsquo;re really glad you&rsquo;re here, and we want to make it easier for you.`)}
    ${offerBox(firstInr)}
    ${p(`Say hi if you haven&rsquo;t already, pick a time that works and meet your therapist.`)}
    ${btn(`Book your session at ${formatInr(firstInr)} →`, ctaUrl ?? `${SITE}/dashboard/sessions`)}
    ${signOff}
  `, 'client')
}

function tplClientProposalsReady(firstName: string, ctaUrl?: string) {
  return base(`
    ${h1(`${escapeHtml(firstName)}, your matches are ready.`)}
    ${p(`We&rsquo;ve gone through your responses and hand-picked two therapists for you &mdash; a Standard and a Professional option.`)}
    ${p(`Take a look at both, read what they&rsquo;re about, and start a free chat with whoever feels right. There&rsquo;s no payment until you book a session.`)}
    ${btn('See your therapists →', ctaUrl ?? `${SITE}/dashboard`)}
    ${p(`If neither feels like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    ${signOff}
  `, 'client')
}

function tplClientSessionScheduled(
  firstName: string,
  therapistFirstName: string,
  dateStr: string,
  ctaUrl?: string,
) {
  return base(`
    ${h1(`${therapistFirstName} scheduled a session.`)}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`Your therapist <strong>${therapistFirstName}</strong> has scheduled a session for <strong>${dateStr}</strong>. We&rsquo;ll send you a reminder the day before.`)}
    ${btn('View session details →', ctaUrl ?? `${SITE}/dashboard/sessions`)}
    ${signOff}
  `, 'client')
}

function tplClientSessionReminder(firstName: string, dateStr: string, ctaUrl?: string) {
  return base(`
    ${h1('Your session is tomorrow.')}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`Just a heads-up: you have an upcoming session at <strong>${dateStr}</strong>.`)}
    ${p(`Find a quiet, private spot before it starts. You don&rsquo;t need to prepare. Whatever&rsquo;s on your mind is the right thing to bring.`)}
    ${btn('View session details →', ctaUrl ?? `${SITE}/dashboard/sessions`)}
    ${signOff}
  `, 'client')
}

function tplClientChatNotStarted(firstName: string, therapistFirstName: string, ctaUrl?: string) {
  return base(`
    ${h1(`Have you said hi to ${therapistFirstName} yet?`)}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`We noticed you haven&rsquo;t started chatting with <strong>${therapistFirstName}</strong> yet. The first message doesn&rsquo;t have to be a big one. Even a &ldquo;hi&rdquo; gets the conversation going.`)}
    ${p('Whenever you&rsquo;re ready.')}
    ${btn(`Say hi to ${therapistFirstName} →`, ctaUrl ?? `${SITE}/dashboard/chat`)}
    ${signOff}
  `, 'client')
}

function tplClientNotSubscribed(firstName: string, therapistFirstName: string, ctaUrl?: string) {
  return base(`
    ${h1('Want to try a different therapist?')}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`You started a chat with <strong>${therapistFirstName}</strong> but haven&rsquo;t subscribed yet. If they didn&rsquo;t feel like the right fit, that&rsquo;s okay. Not every match clicks the first time.`)}
    ${p(`Just let us know and we&rsquo;ll find someone else for you.`)}
    ${btn('View dashboard →', ctaUrl ?? `${SITE}/dashboard`)}
    ${signOff}
  `, 'client')
}

// Post-session feedback. One button into the feedback page, where the questions
// live. Deliberately not asking anything in the email itself: mail clients strip
// forms, so in-email answers have to be links, and link-prefetching by mail
// servers can record answers the person never gave.
//
// The session id doubles as the token (it is an unguessable UUID), so nobody has
// to log in and the link works in whichever browser their mail app opens.
function tplClientSessionFeedback(
  clientFirstName: string,
  therapistFirstName: string,
  sessionDateStr: string,
  sessionId: string,
) {
  const t = escapeHtml(therapistFirstName)
  return base(`
    ${tag('Your session')}
    <br/><br/>
    ${h1(`How was your session with ${t}?`)}
    ${p(`Hi ${escapeHtml(clientFirstName)},`)}
    ${p(`You met ${t} on ${escapeHtml(sessionDateStr)}. We&rsquo;d like to know how it went.`)}
    ${p(`It takes a minute, and it tells us whether we matched you well. If something wasn&rsquo;t right, we would much rather hear it from you than not know. It is how we get better at this.`)}
    ${btn('Share feedback →', `${SITE}/feedback?s=${encodeURIComponent(sessionId)}`)}
    ${p(`Only the MindCanopy team sees this. ${t} does not.`)}
    ${signOff}
  `, 'client')
}

function tplTherapistClientMatched(
  therapistFirstName: string,
  clientFullName: string,
) {
  return base(`
    ${tag('New Client')}
    <br/><br/>
    ${h1(`Hi ${therapistFirstName}, good news.`)}
    ${p(`<strong>${clientFullName}</strong> has been matched with you by the MindCanopy team. We pair clients carefully, by hand, and we think you&rsquo;re a good fit for them.`)}
    ${p('Open your chat to say hello — and read their questionnaire from their profile before you reach out.')}
    ${btn('Go to your chat →', `${SITE}/therapist/dashboard/chat`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistClientUnmatched(
  therapistFirstName: string,
  clientFullName: string,
) {
  return base(`
    ${tag('Match Ended', '#E8926A')}
    <br/><br/>
    ${h1(`Your match with ${clientFullName.split(' ')[0]} has ended.`)}
    ${p(`Hi ${therapistFirstName},`)}
    ${p(`This usually isn&rsquo;t about you. Sometimes a therapist and client just don&rsquo;t click, and that&rsquo;s no one&rsquo;s fault. It happens.`)}
    ${p(`We&rsquo;ll send you a new match as soon as we have one. Thanks for showing up for them.`)}
    ${btn('Go to dashboard →', `${SITE}/therapist/dashboard`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistClientMessage(
  therapistFirstName: string,
  clientFirstName: string,
  messageBody: string,
) {
  // Truncate to 1000 chars for safety; longer message says "..."
  const truncated = messageBody.length > 1000 ? messageBody.slice(0, 1000) + '…' : messageBody
  const escaped = truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return base(`
    ${tag('New Message')}
    <br/><br/>
    ${h1(`${clientFirstName} sent you a message.`)}
    <div style="margin:20px 0;padding:16px 18px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#233551;line-height:1.7;">${escaped}</div>
    ${p('Log in to reply.')}
    ${btn('Open chat →', `${SITE}/therapist/dashboard/chat`)}
    ${signOff}
  `, 'therapist')
}

// Client-facing version of the "new message" email (their therapist messaged
// them). Same look, but the button points at the CLIENT chat (/dashboard/chat)
// — not the therapist dashboard — and the footer uses the neutral client tone.
function tplClientMessageFromTherapist(
  therapistFirstName: string,
  messageBody: string,
  ctaUrl?: string,
) {
  const truncated = messageBody.length > 1000 ? messageBody.slice(0, 1000) + '…' : messageBody
  const escaped = truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return base(`
    ${tag('New Message')}
    <br/><br/>
    ${h1(`${therapistFirstName} sent you a message.`)}
    <div style="margin:20px 0;padding:16px 18px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#233551;line-height:1.7;">${escaped}</div>
    ${p('Open the chat and reply whenever you&rsquo;re ready — even a line keeps the conversation going.')}
    ${btn('Open chat →', ctaUrl ?? `${SITE}/dashboard/chat`)}
    ${signOff}
  `, 'client')
}

function tplTherapistProfileVerified(therapistFirstName: string) {
  return base(`
    ${tag('Verified', '#3D8A80')}
    <br/><br/>
    ${h1(`You&rsquo;re verified, ${therapistFirstName}.`)}
    ${p('Good news. Your profile has been verified. You&rsquo;re ready to start seeing clients on MindCanopy.')}
    ${p('Head to your dashboard, get familiar with how things work, and have a look around.')}
    <p style="margin:16px 0 0;font-size:15px;color:#233551;line-height:1.7;font-weight:700;">
      One thing before we can match you with a client: please set your weekly availability and the number of clients you can handle at one time. We can only match you once these are in.
    </p>
    ${btn('Set your availability →', `${SITE}/therapist/dashboard`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistAvailabilityNudge(therapistFirstName: string) {
  return base(`
    ${tag('Reminder', '#E8926A')}
    <br/><br/>
    ${h1(`Your availability isn&rsquo;t set yet.`)}
    ${p(`Hi ${therapistFirstName},`)}
    ${p('Just checking in. You haven&rsquo;t set your weekly availability or your client capacity yet. We can&rsquo;t assign you a client until you do.')}
    ${p('It takes about five minutes.')}
    ${btn('Set your availability →', `${SITE}/therapist/dashboard`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistSessionScheduled(
  therapistFirstName: string,
  clientFirstName: string,
  dateStr: string,
) {
  return base(`
    ${h1(`Session scheduled with ${clientFirstName}.`)}
    ${p(`Hi ${therapistFirstName}, hope you&rsquo;re doing okay.`)}
    ${p(`A session with <strong>${clientFirstName}</strong> has been scheduled for <strong>${dateStr}</strong>. We&rsquo;ll send you a reminder the day before.`)}
    ${btn('View session details →', `${SITE}/therapist/dashboard/video`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistSessionReminder(
  therapistFirstName: string,
  clientFirstName: string,
  dateStr: string,
) {
  return base(`
    ${h1(`Session with ${clientFirstName} tomorrow.`)}
    ${p(`Hi ${therapistFirstName}, hope you&rsquo;re doing okay.`)}
    ${p(`Just a heads-up: you have an upcoming session with <strong>${clientFirstName}</strong> at <strong>${dateStr}</strong>.`)}
    ${p('Take a minute to glance at your last session notes if it helps.')}
    ${btn('View session details →', `${SITE}/therapist/dashboard/video`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistMissedSession(
  therapistFirstName: string,
  clientFirstName: string,
  dateStr: string,
) {
  return base(`
    ${tag('Missed Session', '#E8926A')}
    <br/><br/>
    ${h1('You missed a session.')}
    ${p(`Hi ${therapistFirstName},`)}
    ${p(`You were scheduled with <strong>${clientFirstName}</strong> at <strong>${dateStr}</strong> and didn&rsquo;t join.`)}
    ${p('If something came up, write to admin@mindcanopy.in so we can let them know and help reschedule.')}
    ${p('We log every missed session. Repeated misses affect the client&rsquo;s experience and your standing on the platform. If your availability has changed, please update it from your dashboard so we don&rsquo;t book you when you can&rsquo;t be there.')}
    ${btn('Update your availability →', `${SITE}/therapist/dashboard`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistReplyOverdue(
  therapistFirstName: string,
  clientFirstName: string,
) {
  return base(`
    ${tag('Reply Reminder', '#E8926A')}
    <br/><br/>
    ${h1('A client is waiting for your reply.')}
    ${p(`Hi ${therapistFirstName},`)}
    ${p(`<strong>${clientFirstName}</strong> sent you a message 48 hours ago and we haven&rsquo;t seen a reply yet.`)}
    ${p('Part of our promise to clients is that you reply within 48 hours. Falling behind on this affects their trust and your standing on the platform.')}
    ${p('If you&rsquo;re unavailable for a stretch, write to admin@mindcanopy.in so we can let your clients know.')}
    ${btn(`Open chat with ${clientFirstName} →`, `${SITE}/therapist/dashboard/chat`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistCancellationPattern(
  therapistFirstName: string,
  cancelCount: number,
  timeWindow: string,
) {
  return base(`
    ${tag('Pattern Detected', '#E8926A')}
    <br/><br/>
    ${h1('Pattern of cancellations.')}
    ${p(`Hi ${therapistFirstName},`)}
    ${p(`We&rsquo;ve noticed you&rsquo;ve cancelled <strong>${cancelCount}</strong> sessions in the last <strong>${timeWindow}</strong>. Things come up, but a repeated pattern is hard on your clients and on the trust we ask them to extend.`)}
    ${p('If something is going on that&rsquo;s making consistency hard right now, we&rsquo;d rather hear about it. Write to admin@mindcanopy.in. We can pause your availability or work out a plan together.')}
    ${p('Until then, please review your availability and only keep the slots you can reliably hold.')}
    ${btn('Review your availability →', `${SITE}/therapist/dashboard`)}
    ${signOff}
  `, 'therapist')
}

function tplTherapistAccountPaused(
  therapistFirstName: string,
  adminNote: string,
) {
  const noteBlock = adminNote
    ? `<div style="margin:20px 0;padding:14px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;line-height:1.7;">${escapeHtml(adminNote)}</div>`
    : ''
  return base(`
    ${tag('Account Paused', '#E8926A')}
    <br/><br/>
    ${h1('Your account has been paused.')}
    ${p(`Hi ${escapeHtml(therapistFirstName)},`)}
    ${p('Your therapist account on MindCanopy has been paused. You won&rsquo;t be matched with new clients, and your existing matches are under review.')}
    ${noteBlock}
    ${p('If you have questions or want to discuss next steps, write to admin@mindcanopy.in. We&rsquo;re happy to talk.')}
    ${signOff}
  `, 'therapist')
}

function tplTherapistConcernRaised(therapistFirstName: string) {
  return base(`
    ${tag('Concern Raised', '#E8926A')}
    <br/><br/>
    ${h1('A concern was raised about a session.')}
    ${p(`Hi ${therapistFirstName},`)}
    ${p('A client has shared a concern about a recent session with you. We take these seriously and we review every one before deciding anything.')}
    ${p(`Before we act, we want to hear from you. Please write to admin@mindcanopy.in within <strong>2 days</strong> so we can talk about what happened.`)}
    ${p('If you miss this window, we&rsquo;ll pause your interaction with this client until we hear from you. Your other matches and your account stay active.')}
    ${signOff}
  `, 'therapist')
}

// ── APPLICANT TEMPLATES ──────────────────────────────────────────────────────

function tplApplicationReceived(name: string, verifyUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MindCanopy</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ecef;overflow:hidden;">
        <tr>
          ${brandHeader()}
        </tr>
        <tr><td style="padding:32px;">
          ${tag('Application Received', '#7EC0B7')}
          <br/><br/>
          ${h1(`Thanks for applying, ${escapeHtml(name)}.`)}
          ${p(`We&rsquo;ve received your application and our team is taking a look. Before we move forward, please verify your email so we know we can reach you.`)}

          <a href="${verifyUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Verify my email →</a>

          <p style="margin:14px 0 0;font-size:12px;color:#9aa3ad;line-height:1.6;">
            If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color:#3D8A80;word-break:break-all;">${verifyUrl}</a>
          </p>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8ecef;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;width:24px;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">1</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Verify your email</strong>, click the button above.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">2</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">We review your application</strong>, your education, CV, and credentials. We read every application personally.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">3</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Intro call</strong>, if it looks like a fit, we&rsquo;ll set one up within 3 to 5 working days.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">4</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Onboarding</strong>, we&rsquo;ll share an invite link so you can set up your therapist profile.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">5</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Match with clients</strong>, once you&rsquo;re live, we&rsquo;ll match you with clients aligned to your approach.
                </td>
              </tr>
            </table>
          </div>
        </td></tr>
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">
              Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function tplApplicationApproved(name: string, inviteUrl: string, inviteCode: string, adminNotes: string) {
  const notesBlock = adminNotes
    ? `<div style="margin-top:20px;padding:16px;background:#f0faf9;border-left:3px solid #7EC0B7;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#4a5568;font-style:italic;">${escapeHtml(adminNotes)}</p>
       </div>`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MindCanopy</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ecef;overflow:hidden;">
        <tr>
          ${brandHeader()}
        </tr>
        <tr><td style="padding:32px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#7EC0B722;color:#7EC0B7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Application Approved</span>
          <br/><br/>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">Welcome to MindCanopy, ${escapeHtml(name)}.</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">Your application has been reviewed and approved. Use the link below to complete your onboarding and set up your therapist profile.</p>
          ${notesBlock}
          <a href="${inviteUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Complete Onboarding →</a>
          <div style="margin-top:24px;padding:14px 16px;background:#f8f9fa;border:1px dashed #cbd5e0;border-radius:8px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">If the button doesn&rsquo;t work</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9aa3ad;line-height:1.5;">Copy and paste this link into your browser:</p>
            <p style="margin:6px 0 0;font-size:12px;word-break:break-all;"><a href="${inviteUrl}" style="color:#3D8A80;">${inviteUrl}</a></p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#9aa3ad;">This link is unique to you and one-time use — please don&rsquo;t share it.</p>
          ${inviteCode ? '' : ''}
        </td></tr>
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">
              Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── ADMIN TEMPLATES ──────────────────────────────────────────────────────────

function tplAdminNewApplication(fullName: string) {
  return base(`
    ${tag('New Application', '#E8926A')}
    <br/><br/>
    ${h1(`${escapeHtml(fullName)} applied to join MindCanopy.`)}
    ${p('Head to your admin dashboard to review the application.')}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminNewClientSignup(clientName: string, email: string) {
  return base(`
    ${tag('New Client Signup', '#7EC0B7')}
    <br/><br/>
    ${h1(`${escapeHtml(clientName)} just signed up.`)}
    ${p(`Email: <strong>${escapeHtml(email)}</strong><br/>They are now in the pending match queue. Review their questionnaire and assign a therapist.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminNewSubscription(clientName: string, planName: string) {
  return base(`
    ${tag('New Subscription', '#7EC0B7')}
    <br/><br/>
    ${h1(`${clientName} subscribed.`)}
    ${p(`Plan: <strong>${planName}</strong>`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminSessionPayment(params: {
  clientName: string
  therapistName: string
  amountInr: string
  dateStr: string
  paymentId: string
}) {
  return base(`
    ${tag('Payment Received', '#3D8A80')}
    <br/><br/>
    ${h1(`${escapeHtml(params.clientName)} paid for a session.`)}
    ${p(`Amount: <strong>${escapeHtml(params.amountInr)}</strong><br/>
        Therapist: <strong>${escapeHtml(params.therapistName)}</strong><br/>
        Session: <strong>${escapeHtml(params.dateStr)} IST</strong><br/>
        Payment ID: <strong>${escapeHtml(params.paymentId)}</strong>`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminTherapistOnboarded(therapistName: string) {
  return base(`
    ${tag('Therapist Onboarded', '#7EC0B7')}
    <br/><br/>
    ${h1(`${escapeHtml(therapistName)} has completed onboarding.`)}
    ${p('Their profile is ready for review. Verify their credentials and start assigning clients.')}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminContactForm(senderName: string, senderEmail: string, message: string) {
  const messageHtml = escapeHtml(message).replace(/\n/g, '<br/>')
  return base(`
    ${tag('Contact Form', '#E8926A')}
    <br/><br/>
    ${h1(`Message from ${escapeHtml(senderName)}`)}
    ${p(`Email: <strong>${escapeHtml(senderEmail)}</strong>`)}
    <div style="margin:16px 0;padding:14px 16px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#4a5568;line-height:1.7;">${messageHtml}</div>
  `, 'admin')
}

function tplAdminSwitchRequest(clientName: string, reason: string) {
  const reasonBlock = reason
    ? `<div style="margin:16px 0;padding:12px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;font-style:italic;">${escapeHtml(reason)}</div>`
    : ''
  return base(`
    ${tag('Switch Request', '#E8926A')}
    <br/><br/>
    ${h1(`${escapeHtml(clientName)} wants a new therapist.`)}
    ${p(`A client on MindCanopy has requested a different therapist match.`)}
    ${reasonBlock}
    ${p(`Log in to the admin panel, end their current match, and re-queue them for matching.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminPayoutRequest({
  therapistName,
  sessionsCompleted,
  pendingPayout,
  paypalEmail,
  bankAccountName,
  bankAccountNumber,
  bankIfsc,
}: {
  therapistName: string
  sessionsCompleted: number
  pendingPayout: string
  paypalEmail: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankIfsc: string | null
}) {
  const paymentRows = [
    paypalEmail        && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">PayPal</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${paypalEmail}</td></tr>`,
    bankAccountName    && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account name</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankAccountName}</td></tr>`,
    bankAccountNumber  && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account number</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankAccountNumber}</td></tr>`,
    bankIfsc           && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">IFSC</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankIfsc}</td></tr>`,
  ].filter(Boolean).join('')

  const paymentBlock = paymentRows
    ? `<div style="margin:20px 0;padding:16px;background:#f8f9fa;border:1px solid #e8ecef;border-radius:10px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;">Payment details</p>
        <table cellpadding="0" cellspacing="0" border="0">${paymentRows}</table>
       </div>`
    : `<p style="color:#E8926A;font-size:13px;margin:16px 0;">No payment details on file. Ask the therapist to update their account settings.</p>`

  return base(`
    ${tag('Payout Request', '#E8926A')}
    <br/><br/>
    ${h1(`${therapistName} has requested a payout.`)}
    ${p(`<strong>${sessionsCompleted}</strong> completed session${sessionsCompleted !== 1 ? 's' : ''} in the last 7 days. Amount due: <strong>${pendingPayout}</strong>`)}
    ${paymentBlock}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

function tplAdminTranscriptFlag(clientName: string, therapistName: string, sessionDate: string, reasonLabels: string[]) {
  const chips = reasonLabels
    .map(l => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;background:#fdecec;color:#c0392b;border-radius:999px;font-size:12px;font-weight:600;">${escapeHtml(l)}</span>`)
    .join('')
  return base(`
    ${tag('Session Flag', '#c0392b')}
    <br/><br/>
    ${h1('A session transcript tripped a content rule.')}
    ${p(`Session between <strong>${escapeHtml(clientName)}</strong> and <strong>${escapeHtml(therapistName)}</strong> on ${escapeHtml(sessionDate)}.`)}
    <div style="margin:16px 0;">${chips}</div>
    ${p(`Only the rule categories are shown — the transcript itself was scanned in the backend and then deleted. Review the conversation in the admin panel if needed.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `, 'admin')
}

export async function sendAdminTranscriptFlagEmail(params: {
  clientName: string; therapistName: string; sessionDate: string; reasonLabels: string[]; matchId?: string | null
}): Promise<boolean> {
  return sendAdminEmail(
    `Session flag, ${params.clientName} ↔ ${params.therapistName}`,
    tplAdminTranscriptFlag(params.clientName, params.therapistName, params.sessionDate, params.reasonLabels),
    'admin-transcript-flag',
    params.matchId ? { matchId: params.matchId } : undefined,
  )
}

// ── Generic send helper (admin emails) ───────────────────────────────────────

async function sendAdminEmail(subject: string, html: string, ctx: string, related?: RelatedRefs): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn(`email/${ctx}`, 'RESEND_API_KEY not set, email skipped', { subject })
    await logEmailAttempt({ recipient: ADMIN_EMAIL, template: ctx, subject, send_status: 'failed_no_api_key', related })
    return false
  }
  try {
    const res = await resendFetch('https://api.resend.com/emails', { from: FROM, to: ADMIN_EMAIL, subject, html })
    const body = await res.text()
    if (!res.ok) {
      logger.error(`email/${ctx}`, 'Resend rejected', null, { subject, status: res.status, body })
      await logEmailAttempt({
        recipient: ADMIN_EMAIL, template: ctx, subject, send_status: 'failed_resend_rejected',
        resend_status_code: res.status, send_error: body.slice(0, 500), related,
      })
      return false
    }
    await logEmailAttempt({
      recipient: ADMIN_EMAIL, template: ctx, subject, send_status: 'sent',
      resend_id: parseResendId(body), resend_status_code: res.status, related,
    })
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(`email/${ctx}`, 'Send failed', err, { subject })
    await logEmailAttempt({
      recipient: ADMIN_EMAIL, template: ctx, subject, send_status: 'failed_threw',
      send_error: msg.slice(0, 500), related,
    })
    return false
  }
}

// ── Generic send helper (any recipient) ──────────────────────────────────────

async function sendEmail(
  to: string,
  from: string,
  subject: string,
  html: string,
  ctx: string,
  related?: RelatedRefs,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn(`email/${ctx}`, 'RESEND_API_KEY not set, email skipped', { to })
    await logEmailAttempt({ recipient: to, template: ctx, subject, send_status: 'failed_no_api_key', related })
    return false
  }
  try {
    const res = await resendFetch('https://api.resend.com/emails', { from, to, subject, html })
    const body = await res.text()
    if (!res.ok) {
      logger.error(`email/${ctx}`, 'Resend rejected', null, { to, status: res.status, body })
      await logEmailAttempt({
        recipient: to, template: ctx, subject, send_status: 'failed_resend_rejected',
        resend_status_code: res.status, send_error: body.slice(0, 500), related,
      })
      return false
    }
    await logEmailAttempt({
      recipient: to, template: ctx, subject, send_status: 'sent',
      resend_id: parseResendId(body), resend_status_code: res.status, related,
    })
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(`email/${ctx}`, 'Send failed', err, { to })
    await logEmailAttempt({
      recipient: to, template: ctx, subject, send_status: 'failed_threw',
      send_error: msg.slice(0, 500), related,
    })
    return false
  }
}

// ── Exported senders, applicant-facing ───────────────────────────────────────

export async function sendApplicationReceivedEmail({
  to, name, verifyUrl,
}: { to: string; name: string; verifyUrl: string }): Promise<boolean> {
  return sendEmail(to, FROM_ADMIN, 'Your MindCanopy therapist application, please verify your email', tplApplicationReceived(name, verifyUrl), 'application-received')
}

export async function sendApplicationInviteEmail({
  to, name, inviteCode, inviteUrl, adminNotes = '',
}: { to: string; name: string; inviteCode: string; inviteUrl: string; adminNotes?: string }): Promise<boolean> {
  return sendEmail(to, FROM_ADMIN, 'Your MindCanopy therapist application has been approved', tplApplicationApproved(name, inviteUrl, inviteCode, adminNotes), 'application-invite')
}

// ── Exported sender, admin free-compose ──────────────────────────────────────
// One-off, fully custom email wrapped in the MindCanopy brand shell (navy
// header + owl, signature, footer) — same look as every other email we send.
// Powers the admin "Send Email" tab. The admin only types plain text; we never
// expose raw HTML. Logged in email_logs like every other send.

export async function sendCustomEmail({
  to, subject, heading, body, ctaLabel, ctaUrl, fromAdmin = false,
}: {
  to: string
  subject: string
  heading?: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  fromAdmin?: boolean
}): Promise<boolean> {
  // Blank lines separate paragraphs; single newlines become line breaks.
  const paragraphs = body
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => p(escapeHtml(block).replace(/\n/g, '<br/>')))
    .join('')

  const headingHtml = heading && heading.trim() ? h1(escapeHtml(heading.trim())) : ''
  const ctaHtml =
    ctaLabel && ctaLabel.trim() && ctaUrl && ctaUrl.trim()
      ? btn(escapeHtml(ctaLabel.trim()), escapeHtml(ctaUrl.trim()))
      : ''

  const html = base(`
    ${headingHtml}
    ${paragraphs}
    ${ctaHtml}
    ${signOff}
  `, 'client')

  return sendEmail(to, fromAdmin ? FROM_ADMIN : FROM, subject, html, 'admin-compose')
}

// ── Exported sender, client discount campaign ────────────────────────────────
// Sends the "Special — only for you" first-session discount email to ONE client.
// Used by the admin "send the offer to all clients" action. The CTA is a
// one-time login link so the recipient lands on their booking page signed in.
export async function sendDiscountOfferEmail({
  to, name, userId,
}: { to: string; name: string; userId?: string }): Promise<boolean> {
  const firstInr = firstSessionPriceInr('individual', 'standard') ?? 799
  const first = name?.trim()?.split(' ')[0] || 'there'
  const ctaUrl = await magicLinkFor(to, '/dashboard/sessions')
  const subject = first === 'there' ? 'Something special — just for you' : `${first}, something special — just for you`
  return sendEmail(
    to, FROM, subject,
    tplClientDiscountOffer(first, firstInr, ctaUrl),
    'client-discount-offer',
    userId ? { userId } : undefined,
  )
}

// Bulk variant: sends the discount offer to many clients using Resend's BATCH
// endpoint (POST /emails/batch, ≤100 emails per request) so we don't trip the
// 2 req/s per-email rate limit. Each recipient still gets their own one-time
// login CTA, and each send is recorded in email_logs. Chunks are spaced out to
// stay under the API rate limit. Returns { sent, failed, total }.
const RESEND_BATCH_SIZE = 100

export async function sendDiscountOfferBatch(
  recipients: { to: string; name: string; userId?: string }[],
): Promise<{ sent: number; failed: number; total: number }> {
  const total = recipients.length
  if (total === 0) return { sent: 0, failed: 0, total: 0 }

  const subjectFor = (name: string) => {
    const first = name?.trim()?.split(' ')[0] || 'there'
    return first === 'there' ? 'Something special — just for you' : `${first}, something special — just for you`
  }

  if (!process.env.RESEND_API_KEY) {
    for (const r of recipients) {
      await logEmailAttempt({
        recipient: r.to, template: 'client-discount-offer', subject: subjectFor(r.name),
        send_status: 'failed_no_api_key', related: r.userId ? { userId: r.userId } : undefined,
      })
    }
    return { sent: 0, failed: total, total }
  }

  const firstInr = firstSessionPriceInr('individual', 'standard') ?? 799

  // Build each recipient's payload (own magic-link CTA + subject). magicLinkFor
  // hits Supabase, not Resend, so it isn't subject to the Resend rate limit.
  const built = await Promise.all(recipients.map(async (r) => {
    const first = r.name?.trim()?.split(' ')[0] || 'there'
    const subject = subjectFor(r.name)
    const ctaUrl = await magicLinkFor(r.to, '/dashboard/sessions')
    return {
      recipient: r,
      subject,
      payload: { from: FROM, to: r.to, subject, html: tplClientDiscountOffer(first, firstInr, ctaUrl) },
    }
  }))

  let sent = 0
  let failed = 0

  for (let i = 0; i < built.length; i += RESEND_BATCH_SIZE) {
    const chunk = built.slice(i, i + RESEND_BATCH_SIZE)

    try {
      // resendFetch handles inter-call spacing + 429/5xx backoff for us.
      const res = await resendFetch('https://api.resend.com/emails/batch', chunk.map((c) => c.payload))
      const bodyText = await res.text()

      if (!res.ok) {
        logger.error('email/discount-batch', 'Resend batch rejected', null, { status: res.status, body: bodyText.slice(0, 500), size: chunk.length })
        for (const c of chunk) {
          failed += 1
          await logEmailAttempt({
            recipient: c.recipient.to, template: 'client-discount-offer', subject: c.subject,
            send_status: 'failed_resend_rejected', resend_status_code: res.status, send_error: bodyText.slice(0, 500),
            related: c.recipient.userId ? { userId: c.recipient.userId } : undefined,
          })
        }
        continue
      }

      // Success: { data: [{ id }, …] } aligned to the input order.
      let ids: (string | null)[] = []
      try {
        const json = JSON.parse(bodyText) as { data?: { id?: string }[] }
        ids = (json.data ?? []).map((d) => d?.id ?? null)
      } catch { /* keep ids empty — still count as sent */ }

      for (let j = 0; j < chunk.length; j++) {
        sent += 1
        await logEmailAttempt({
          recipient: chunk[j].recipient.to, template: 'client-discount-offer', subject: chunk[j].subject,
          send_status: 'sent', resend_id: ids[j] ?? null, resend_status_code: res.status,
          related: chunk[j].recipient.userId ? { userId: chunk[j].recipient.userId } : undefined,
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.error('email/discount-batch', 'Resend batch threw', err, { size: chunk.length })
      for (const c of chunk) {
        failed += 1
        await logEmailAttempt({
          recipient: c.recipient.to, template: 'client-discount-offer', subject: c.subject,
          send_status: 'failed_threw', send_error: msg.slice(0, 500),
          related: c.recipient.userId ? { userId: c.recipient.userId } : undefined,
        })
      }
    }
  }

  return { sent, failed, total }
}

// ── Exported senders, admin-facing ───────────────────────────────────────────

export async function sendNewApplicationAdminEmail(fullName: string): Promise<boolean> {
  return sendAdminEmail(`New therapist application, ${fullName}`, tplAdminNewApplication(fullName), 'admin-new-application')
}

export async function sendAdminNewClientSignupEmail(clientName: string, email: string): Promise<boolean> {
  return sendAdminEmail(`New client signup, ${clientName}`, tplAdminNewClientSignup(clientName, email), 'admin-client-signup')
}

export async function sendAdminNewSubscriptionEmail(clientName: string, planName: string): Promise<boolean> {
  return sendAdminEmail(`New subscription, ${clientName} (${planName})`, tplAdminNewSubscription(clientName, planName), 'admin-new-subscription')
}

export async function sendAdminSessionPaymentEmail(params: {
  clientName: string
  therapistName: string
  amountInr: string
  dateStr: string
  paymentId: string
}): Promise<boolean> {
  return sendAdminEmail(
    `Payment received, ${params.clientName} (${params.amountInr})`,
    tplAdminSessionPayment(params),
    'admin-session-payment',
  )
}

export async function sendAdminTherapistOnboardedEmail(therapistName: string): Promise<boolean> {
  return sendAdminEmail(`Therapist onboarded, ${therapistName}`, tplAdminTherapistOnboarded(therapistName), 'admin-therapist-onboarded')
}

export async function sendAdminContactFormEmail(senderName: string, senderEmail: string, message: string): Promise<boolean> {
  return sendAdminEmail(`Contact form, ${senderName}`, tplAdminContactForm(senderName, senderEmail, message), 'admin-contact-form')
}

export async function sendPayoutRequestEmail(params: {
  therapistName: string; sessionsCompleted: number; pendingPayout: string;
  paypalEmail: string | null; bankAccountName: string | null; bankAccountNumber: string | null; bankIfsc: string | null;
}): Promise<boolean> {
  return sendAdminEmail(`Payout request, ${params.therapistName}`, tplAdminPayoutRequest(params), 'payout-request')
}

// ── Notification dispatcher (in-app + email pair) ────────────────────────────

export type EmailNotificationType =
  | 'client_welcome'
  | 'client_proposals_ready'        // client gets this when admin proposes two therapists to choose from
  | 'client_match_made'             // client gets this on an admin manual match (plain "meet your therapist")
  | 'client_welcome_matched'        // client gets this single combined welcome+matched email on signup auto-match
  | 'client_matched'                // therapist gets this when a client is matched to them
  | 'client_unmatched'              // therapist gets this when match ends
  | 'client_message'                // therapist gets this when client sends a message
  | 'profile_verified'              // therapist
  | 'session_scheduled_therapist'
  | 'session_scheduled_client'
  | 'session_reminder_therapist'
  | 'session_reminder_client'
  | 'switch_request'                // admin
  | 'therapist_availability_nudge'
  | 'client_chat_not_started'
  | 'client_not_subscribed'
  | 'client_session_feedback'   // client, day after an attended session
  | 'therapist_missed_session'
  | 'therapist_reply_overdue'
  | 'therapist_cancellation_pattern'
  | 'therapist_account_paused'
  | 'therapist_concern_raised'

interface EmailParams {
  to: string
  name: string
  type: EmailNotificationType
  meta?: Record<string, string>
  /**
   * Admin test send. Renders through the exact same path as a real send (so a
   * test can never drift from what clients actually receive), but prefixes the
   * subject with [TEST] and logs under `test:notification:<type>` so it doesn't
   * pollute the per-template stats in the admin console.
   */
  testMode?: boolean
}

export async function sendNotificationEmail({ to, name, type, meta = {}, testMode = false }: EmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Still log the skip so admin can see what would have gone out
    await logEmailAttempt({ recipient: to, template: `notification:${type}`, subject: 'Notification from MindCanopy', send_status: 'failed_no_api_key' })
    return
  }

  let subject = 'Notification from MindCanopy'
  let html = ''

  // For client-facing emails, turn the primary button into a one-time login
  // link to the destination below, so the recipient lands there already signed
  // in. Keyed paths must match each template's plain-URL fallback. Therapist /
  // admin emails are absent here and keep their plain in-app URLs.
  const CLIENT_CTA_DEST: Partial<Record<EmailNotificationType, string>> = {
    client_welcome: '/dashboard',
    client_proposals_ready: '/dashboard',
    client_match_made: '/dashboard',
    client_welcome_matched: '/dashboard',
    session_scheduled_client: '/dashboard/sessions',
    session_reminder_client: '/dashboard/sessions',
    client_chat_not_started: '/dashboard/chat',
    client_not_subscribed: '/dashboard',
    client_message: '/dashboard/chat',
  }
  // First-session offer shown in the client "matched" emails — individual
  // standard only, driven by the client's category passed in meta. When present,
  // the CTA points at the booking page instead of the dashboard.
  const offerCategory = meta.category as SessionCategory | undefined
  const offerFirst = offerCategory ? firstSessionPriceInr(offerCategory, 'standard') : null
  const offerRegular = offerCategory ? sessionPriceInr(offerCategory, 'standard') : null
  const matchOffer: FirstSessionOffer | undefined =
    offerFirst != null && offerRegular != null ? { firstInr: offerFirst, regularInr: offerRegular } : undefined

  let ctaUrl: string | undefined
  let ctaDest = CLIENT_CTA_DEST[type]
  if (matchOffer && (type === 'client_welcome_matched' || type === 'client_match_made')) {
    ctaDest = '/dashboard/sessions'
  }
  // client_message fires in both directions — only magic-link the client's copy.
  if (ctaDest && (type !== 'client_message' || meta.recipientRole === 'client')) {
    ctaUrl = await magicLinkFor(to, ctaDest)
  }

  switch (type) {
    case 'client_welcome':
      subject = `Welcome, ${name}.`
      html = tplClientWelcome(name, ctaUrl)
      break
    case 'client_proposals_ready':
      subject = `${name}, your therapist matches are ready.`
      html = tplClientProposalsReady(name, ctaUrl)
      break
    case 'client_match_made':
      subject = `Meet ${meta.therapistFirstName ?? 'your therapist'}.`
      html = tplClientMatchMade(meta.therapistFirstName ?? 'your therapist', meta.therapistFullName ?? 'Your therapist', meta.adminMatchNote ?? '', ctaUrl, matchOffer)
      break
    case 'client_welcome_matched':
      subject = `Welcome to MindCanopy — meet ${meta.therapistFirstName ?? 'your therapist'}.`
      html = tplClientWelcomeMatched(name, meta.therapistFirstName ?? 'your therapist', meta.therapistFullName ?? 'Your therapist', meta.adminMatchNote ?? '', ctaUrl, matchOffer)
      break
    case 'client_matched':
      subject = `You have a new client — ${meta.clientName ?? 'someone new'}`
      html = tplTherapistClientMatched(name, meta.clientName ?? 'Your new client')
      break
    case 'client_unmatched':
      subject = `Your match with ${(meta.clientName ?? 'a client').split(' ')[0]} has ended`
      html = tplTherapistClientUnmatched(name, meta.clientName ?? 'Your client')
      break
    case 'client_message': {
      // Same notification type fires in both directions; the cron sets
      // meta.recipientRole so we pick the right template + chat link.
      const senderName = meta.clientName ?? 'Someone'
      const senderFirst = senderName.split(' ')[0]
      subject = `${senderName} sent you a message`
      html = meta.recipientRole === 'client'
        ? tplClientMessageFromTherapist(senderFirst, meta.messageBody ?? '', ctaUrl)
        : tplTherapistClientMessage(name, senderName, meta.messageBody ?? '')
      break
    }
    case 'profile_verified':
      subject = 'You are verified on MindCanopy'
      html = tplTherapistProfileVerified(name)
      break
    case 'session_scheduled_therapist':
      subject = `Session scheduled with ${meta.clientFirstName ?? 'your client'}`
      html = tplTherapistSessionScheduled(name, meta.clientFirstName ?? 'your client', meta.dateStr ?? '')
      break
    case 'session_scheduled_client':
      subject = `${meta.therapistFirstName ?? 'Your therapist'} scheduled a session`
      html = tplClientSessionScheduled(name, meta.therapistFirstName ?? 'your therapist', meta.dateStr ?? '', ctaUrl)
      break
    case 'session_reminder_therapist':
      subject = `Session with ${meta.clientFirstName ?? 'your client'} tomorrow`
      html = tplTherapistSessionReminder(name, meta.clientFirstName ?? 'your client', meta.dateStr ?? '')
      break
    case 'session_reminder_client':
      subject = 'Your session is tomorrow'
      html = tplClientSessionReminder(name, meta.dateStr ?? '', ctaUrl)
      break
    case 'switch_request':
      subject = `Switch request, ${meta.clientName ?? 'a client'} wants a new therapist`
      html = tplAdminSwitchRequest(meta.clientName ?? 'A client', meta.reason ?? '')
      break
    case 'therapist_availability_nudge':
      subject = 'Your availability is not set yet'
      html = tplTherapistAvailabilityNudge(name)
      break
    case 'client_chat_not_started':
      subject = `Have you said hi to ${meta.therapistFirstName ?? 'your therapist'} yet?`
      html = tplClientChatNotStarted(name, meta.therapistFirstName ?? 'your therapist', ctaUrl)
      break
    case 'client_not_subscribed':
      subject = 'Want to try a different therapist?'
      html = tplClientNotSubscribed(name, meta.therapistFirstName ?? 'your therapist', ctaUrl)
      break
    case 'client_session_feedback':
      subject = `How was your session with ${meta.therapistFirstName ?? 'your therapist'}?`
      html = tplClientSessionFeedback(
        name,
        meta.therapistFirstName ?? 'your therapist',
        meta.dateStr ?? 'your last session',
        meta.sessionId ?? '',
      )
      break
    case 'therapist_missed_session':
      subject = 'You missed a session'
      html = tplTherapistMissedSession(name, meta.clientFirstName ?? 'your client', meta.dateStr ?? '')
      break
    case 'therapist_reply_overdue':
      subject = 'A client is waiting for your reply'
      html = tplTherapistReplyOverdue(name, meta.clientFirstName ?? 'your client')
      break
    case 'therapist_cancellation_pattern':
      subject = 'Pattern of cancellations'
      html = tplTherapistCancellationPattern(name, parseInt(meta.cancelCount ?? '0', 10), meta.timeWindow ?? '30 days')
      break
    case 'therapist_account_paused':
      subject = 'Your MindCanopy account has been paused'
      html = tplTherapistAccountPaused(name, meta.adminNote ?? '')
      break
    case 'therapist_concern_raised':
      subject = 'A concern was raised about a session'
      html = tplTherapistConcernRaised(name)
      break
  }

  if (testMode) subject = `[TEST] ${subject}`
  const template = testMode ? `test:notification:${type}` : `notification:${type}`
  try {
    const res = await resendFetch('https://api.resend.com/emails', { from: FROM, to, subject, html })
    const body = await res.text()
    if (!res.ok) {
      logger.warn('email/notification', 'Resend rejected', { to, type, status: res.status, body })
      await logEmailAttempt({
        recipient: to, template, subject, send_status: 'failed_resend_rejected',
        resend_status_code: res.status, send_error: body.slice(0, 500),
      })
      return
    }
    await logEmailAttempt({
      recipient: to, template, subject, send_status: 'sent',
      resend_id: parseResendId(body), resend_status_code: res.status,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn('email/notification', 'Send failed', { to, type, err: msg })
    await logEmailAttempt({
      recipient: to, template, subject, send_status: 'failed_threw',
      send_error: msg.slice(0, 500),
    })
  }
}

// ── Admin test sends ─────────────────────────────────────────────────────────
// Sends any template in the catalogue to an arbitrary address so the admin can
// see exactly what lands in an inbox. Notification templates go through the real
// sendNotificationEmail path (testMode), so a test can never drift from the live
// email. The standalone senders are rendered here with sample data.
//
// Every test is subject-prefixed [TEST] and logged under `test:<key>`, keeping
// the per-template "last sent" and totals in the admin console honest.

export async function sendTemplateTest(
  key: string,
  to: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is not set in this environment.' }
  }

  const entry = catalogueEntry(key)
  if (!entry) return { ok: false, error: `Unknown template: ${key}` }

  const meta = entry.sampleMeta ?? {}
  const name = entry.audience === 'therapist' ? 'Priya' : 'Tanisha'

  // Notification templates: reuse the live rendering + send path.
  if (key.startsWith('notification:')) {
    const type = key.slice('notification:'.length) as EmailNotificationType
    await sendNotificationEmail({ to, name, type, meta, testMode: true })
    return { ok: true }
  }

  const S = {
    clientName: 'Tanisha Rao',
    therapistName: 'Priya Menon',
    dateStr: 'Thu, 16 Jul, 06:30 PM',
  }
  const testSubject = (s: string) => `[TEST] ${s}`
  const ctx = `test:${key}`

  switch (key) {
    case 'application-received':
      return okFrom(await sendEmail(to, FROM_ADMIN, testSubject('Your MindCanopy therapist application, please verify your email'),
        tplApplicationReceived(name, `${SITE}/therapist/verify-email?token=SAMPLE_TOKEN`), ctx))

    case 'application-invite':
      return okFrom(await sendEmail(to, FROM_ADMIN, testSubject('Your MindCanopy therapist application has been approved'),
        tplApplicationApproved(name, `${SITE}/therapist/onboard`, 'ZSAB12CD',
          'Strong fit on the cultural-context angle, schedule the intro call this week.'), ctx))

    case 'client-discount-offer': {
      const firstInr = firstSessionPriceInr('individual', 'standard') ?? 799
      return okFrom(await sendEmail(to, FROM, testSubject(`${name}, something special — just for you`),
        tplClientDiscountOffer(name, firstInr, `${SITE}/dashboard/sessions`), ctx))
    }

    case 'admin-new-application':
      return okFrom(await sendEmail(to, FROM, testSubject(`New therapist application, ${S.therapistName}`),
        tplAdminNewApplication(S.therapistName), ctx))

    case 'admin-client-signup':
      return okFrom(await sendEmail(to, FROM, testSubject(`New client signup, ${S.clientName}`),
        tplAdminNewClientSignup(S.clientName, 'tanisha@example.com'), ctx))

    case 'admin-new-subscription':
      return okFrom(await sendEmail(to, FROM, testSubject(`New subscription, ${S.clientName} (Monthly bundle)`),
        tplAdminNewSubscription(S.clientName, 'Monthly bundle'), ctx))

    case 'admin-session-payment':
      return okFrom(await sendEmail(to, FROM, testSubject(`Session payment, ${S.clientName}`),
        tplAdminSessionPayment({
          clientName: S.clientName, therapistName: S.therapistName,
          amountInr: '₹1,300', dateStr: S.dateStr, paymentId: 'pay_SAMPLE123',
        }), ctx))

    case 'admin-therapist-onboarded':
      return okFrom(await sendEmail(to, FROM, testSubject(`Therapist onboarded, ${S.therapistName}`),
        tplAdminTherapistOnboarded(S.therapistName), ctx))

    case 'admin-contact-form':
      return okFrom(await sendEmail(to, FROM, testSubject('Contact form, Tanisha Rao'),
        tplAdminContactForm(S.clientName, 'tanisha@example.com',
          'Hi, I wanted to ask whether sessions can happen on weekends.'), ctx))

    case 'admin-transcript-flag':
      return okFrom(await sendEmail(to, FROM, testSubject('Session flagged for review'),
        tplAdminTranscriptFlag(S.clientName, S.therapistName, S.dateStr,
          ['Contact details shared', 'Off-platform payment']), ctx))

    case 'payout-request':
      return okFrom(await sendEmail(to, FROM, testSubject(`Payout request, ${S.therapistName}`),
        tplAdminPayoutRequest({
          therapistName: S.therapistName, sessionsCompleted: 6, pendingPayout: '₹5,850',
          paypalEmail: null, bankAccountName: 'Priya Menon',
          bankAccountNumber: 'XXXXXX4321', bankIfsc: 'HDFC0001234',
        }), ctx))

    case 'admin-compose':
      return okFrom(await sendCustomEmail({
        to,
        subject: testSubject('A quick note from MindCanopy'),
        heading: `Hi ${name},`,
        body: 'This is what a custom one-off email looks like.\n\nEach blank line becomes a new paragraph, and the button below is optional.',
        ctaLabel: 'Open your dashboard →',
        ctaUrl: `${SITE}/dashboard`,
        fromAdmin: true,
      }))

    default:
      return { ok: false, error: `No test renderer for ${key}` }
  }
}

function okFrom(sent: boolean): { ok: boolean; error?: string } {
  return sent ? { ok: true } : { ok: false, error: 'Resend rejected the send. Check the Log tab for the error.' }
}
