// Email sender via Resend REST API (no SDK required).
// Set RESEND_API_KEY in .env.local to enable emails.
// Without it, emails are silently skipped (non-fatal).

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'

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

// ── CLIENT TEMPLATES ─────────────────────────────────────────────────────────

function tplClientWelcome(firstName: string) {
  return base(`
    ${h1(`Welcome to MindCanopy, ${escapeHtml(firstName)}.`)}
    ${p('Glad you came our way. We hope MindCanopy can be the home your mind has been looking for.')}
    ${p(`When we have a therapist for you, we&rsquo;ll write back with a short introduction. You&rsquo;ll have an intro chat with them first. If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    ${p('You can log in any time.')}
    ${btn('Go to your dashboard →', `${SITE}/dashboard`)}
    <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">More soon.</p>
    ${signOff}
  `, 'client')
}

function tplClientMatchMade(
  therapistFirstName: string,
  therapistFullName: string,
  adminMatchNote: string,
) {
  return base(`
    ${h1(`Meet ${escapeHtml(therapistFullName)}.`)}
    ${p(`We&rsquo;ve gone through your responses and matched you with someone we think will be a good fit.`)}
    ${adminMatchNote ? p(escapeHtml(adminMatchNote)) : ''}
    ${p(`Your next step is an intro chat. Say hi when you&rsquo;re ready.`)}
    ${btn(`Say hi →`, `${SITE}/dashboard/chat`)}
    ${p(`If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">We hope they&rsquo;re the right one.</p>
    ${signOff}
  `, 'client')
}

function tplClientProposalsReady(firstName: string) {
  return base(`
    ${h1(`${escapeHtml(firstName)}, your matches are ready.`)}
    ${p(`We&rsquo;ve gone through your responses and hand-picked two therapists for you &mdash; a Standard and a Professional option.`)}
    ${p(`Take a look at both, read what they&rsquo;re about, and start a free chat with whoever feels right. There&rsquo;s no payment until you book a session.`)}
    ${btn('See your therapists →', `${SITE}/dashboard`)}
    ${p(`If neither feels like the right fit, just let us know and we&rsquo;ll keep looking.`)}
    ${signOff}
  `, 'client')
}

function tplClientSessionScheduled(
  firstName: string,
  therapistFirstName: string,
  dateStr: string,
) {
  return base(`
    ${h1(`${therapistFirstName} scheduled a session.`)}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`Your therapist <strong>${therapistFirstName}</strong> has scheduled a session for <strong>${dateStr}</strong>. We&rsquo;ll send you a reminder the day before.`)}
    ${btn('View session details →', `${SITE}/dashboard/sessions`)}
    ${signOff}
  `, 'client')
}

function tplClientSessionReminder(firstName: string, dateStr: string) {
  return base(`
    ${h1('Your session is tomorrow.')}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`Just a heads-up: you have an upcoming session at <strong>${dateStr}</strong>.`)}
    ${p(`Find a quiet, private spot before it starts. You don&rsquo;t need to prepare. Whatever&rsquo;s on your mind is the right thing to bring.`)}
    ${btn('View session details →', `${SITE}/dashboard/sessions`)}
    ${signOff}
  `, 'client')
}

function tplClientChatNotStarted(firstName: string, therapistFirstName: string) {
  return base(`
    ${h1(`Have you said hi to ${therapistFirstName} yet?`)}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`We noticed you haven&rsquo;t started chatting with <strong>${therapistFirstName}</strong> yet. The first message doesn&rsquo;t have to be a big one. Even a &ldquo;hi&rdquo; gets the conversation going.`)}
    ${p('Whenever you&rsquo;re ready.')}
    ${btn(`Say hi to ${therapistFirstName} →`, `${SITE}/dashboard/chat`)}
    ${signOff}
  `, 'client')
}

function tplClientNotSubscribed(firstName: string, therapistFirstName: string) {
  return base(`
    ${h1('Want to try a different therapist?')}
    ${p(`Hi ${firstName}, hope you&rsquo;re doing okay.`)}
    ${p(`You started a chat with <strong>${therapistFirstName}</strong> but haven&rsquo;t subscribed yet. If they didn&rsquo;t feel like the right fit, that&rsquo;s okay. Not every match clicks the first time.`)}
    ${p(`Just let us know and we&rsquo;ll find someone else for you.`)}
    ${btn('View dashboard →', `${SITE}/dashboard`)}
    ${signOff}
  `, 'client')
}

// ── THERAPIST TEMPLATES ──────────────────────────────────────────────────────

function tplTherapistClientMatched(
  therapistFirstName: string,
  clientFullName: string,
) {
  return base(`
    ${tag('New Client')}
    <br/><br/>
    ${h1(`Hi ${therapistFirstName}, good news.`)}
    ${p(`<strong>${clientFullName}</strong> has been matched with you by the MindCanopy team. We pair clients carefully, by hand, and we think you&rsquo;re a good fit for them.`)}
    ${p('Head to your dashboard to read their questionnaire before you reach out.')}
    ${btn('View their profile →', `${SITE}/therapist/dashboard`)}
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
                  <strong style="color:#233551;">Onboarding</strong>, we&rsquo;ll share an invite code so you can set up your therapist profile.
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

// ── Generic send helper (admin emails) ───────────────────────────────────────

async function sendAdminEmail(subject: string, html: string, ctx: string, related?: RelatedRefs): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn(`email/${ctx}`, 'RESEND_API_KEY not set, email skipped', { subject })
    await logEmailAttempt({ recipient: ADMIN_EMAIL, template: ctx, subject, send_status: 'failed_no_api_key', related })
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, to: ADMIN_EMAIL, subject, html }),
    })
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
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from, to, subject, html }),
    })
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
  | 'client_match_made'
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
}

export async function sendNotificationEmail({ to, name, type, meta = {} }: EmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Still log the skip so admin can see what would have gone out
    await logEmailAttempt({ recipient: to, template: `notification:${type}`, subject: 'Notification from MindCanopy', send_status: 'failed_no_api_key' })
    return
  }

  let subject = 'Notification from MindCanopy'
  let html = ''

  switch (type) {
    case 'client_welcome':
      subject = `Welcome, ${name}.`
      html = tplClientWelcome(name)
      break
    case 'client_proposals_ready':
      subject = `${name}, your therapist matches are ready.`
      html = tplClientProposalsReady(name)
      break
    case 'client_match_made':
      subject = `Meet ${meta.therapistFirstName ?? 'your therapist'}.`
      html = tplClientMatchMade(meta.therapistFirstName ?? 'your therapist', meta.therapistFullName ?? 'Your therapist', meta.adminMatchNote ?? '')
      break
    case 'client_matched':
      subject = `You have a new client — ${meta.clientName ?? 'someone new'}`
      html = tplTherapistClientMatched(name, meta.clientName ?? 'Your new client')
      break
    case 'client_unmatched':
      subject = `Your match with ${(meta.clientName ?? 'a client').split(' ')[0]} has ended`
      html = tplTherapistClientUnmatched(name, meta.clientName ?? 'Your client')
      break
    case 'client_message':
      subject = `${meta.clientName ?? 'Your client'} sent you a message`
      html = tplTherapistClientMessage(name, meta.clientName ?? 'Your client', meta.messageBody ?? '')
      break
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
      html = tplClientSessionScheduled(name, meta.therapistFirstName ?? 'your therapist', meta.dateStr ?? '')
      break
    case 'session_reminder_therapist':
      subject = `Session with ${meta.clientFirstName ?? 'your client'} tomorrow`
      html = tplTherapistSessionReminder(name, meta.clientFirstName ?? 'your client', meta.dateStr ?? '')
      break
    case 'session_reminder_client':
      subject = 'Your session is tomorrow'
      html = tplClientSessionReminder(name, meta.dateStr ?? '')
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
      html = tplClientChatNotStarted(name, meta.therapistFirstName ?? 'your therapist')
      break
    case 'client_not_subscribed':
      subject = 'Want to try a different therapist?'
      html = tplClientNotSubscribed(name, meta.therapistFirstName ?? 'your therapist')
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

  const template = `notification:${type}`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
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
