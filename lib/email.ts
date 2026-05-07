// Email sender via Resend REST API (no SDK required).
// Set RESEND_API_KEY in .env.local to enable emails.
// Without it, emails are silently skipped (non-fatal).

const FROM = 'ZenSpace <notifications@zenspace.in>'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenspace.in'

// ── Template helpers ─────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>ZenSpace</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ecef;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#233551;padding:24px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ZenSpace</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">
              You&rsquo;re receiving this because you&rsquo;re a verified therapist on ZenSpace.
              <br/>Questions? Email us at <a href="mailto:hello@zenspace.in" style="color:#3D8A80;">hello@zenspace.in</a>
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
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">${text}</h1>`
}

function p(text: string) {
  return `<p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">${text}</p>`
}

function tag(text: string, color = '#7EC0B7') {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${color}22;color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`
}

// ── Per-notification templates ───────────────────────────────────────────────

function tplClientMatched(name: string, clientName: string) {
  return base(`
    ${tag('New Client')}
    <br/><br/>
    ${h1(`Hi ${name}, you have a new client.`)}
    ${p(`<strong>${clientName}</strong> has been matched with you by the ZenSpace admin. Head to your dashboard to review their profile and reach out.`)}
    ${btn('View Dashboard →', `${SITE}/therapist/dashboard`)}
  `)
}

function tplClientUnmatched(name: string, clientName: string) {
  return base(`
    ${tag('Match Ended', '#E8926A')}
    <br/><br/>
    ${h1(`Your match with ${clientName} has ended.`)}
    ${p('The ZenSpace admin has ended this match. If you have questions, please contact support.')}
    ${btn('Go to Dashboard →', `${SITE}/therapist/dashboard`)}
  `)
}

function tplClientMessage(name: string, clientName: string) {
  return base(`
    ${tag('New Message')}
    <br/><br/>
    ${h1(`${clientName} sent you a message.`)}
    ${p('Log in to your dashboard to read and reply.')}
    ${btn('Open Chat →', `${SITE}/therapist/dashboard/chat`)}
  `)
}

function tplProfileVerified(name: string) {
  return base(`
    ${tag('Account Verified', '#3D8A80')}
    <br/><br/>
    ${h1(`Your profile has been verified, ${name}.`)}
    ${p('You&rsquo;re now eligible to receive client matches on ZenSpace. Keep your profile up to date so clients can find the best fit.')}
    ${btn('View Profile →', `${SITE}/therapist/dashboard/account`)}
  `)
}

function tplSessionScheduled(name: string, dateStr: string, sessionType: string) {
  return base(`
    ${tag('Session Scheduled')}
    <br/><br/>
    ${h1('A session has been scheduled.')}
    ${p(`A <strong>${sessionType}</strong> session is confirmed for <strong>${dateStr}</strong>. Join from your dashboard at the scheduled time.`)}
    ${btn('View Sessions →', `${SITE}/therapist/dashboard/video`)}
  `)
}

function tplSessionReminder(name: string, dateStr: string, sessionType: string) {
  return base(`
    ${tag('Session in 1 Hour', '#E8926A')}
    <br/><br/>
    ${h1(`Reminder: session in ~1 hour.`)}
    ${p(`Your <strong>${sessionType}</strong> session is at <strong>${dateStr}</strong>. Make sure you&rsquo;re in a quiet, private space.`)}
    ${btn('Join Session →', `${SITE}/therapist/dashboard/video`)}
  `)
}

// ── Switch request template (sent to admin) ──────────────────────────────────

function tplSwitchRequest(adminName: string, clientName: string, reason: string) {
  const reasonBlock = reason
    ? `<div style="margin:16px 0;padding:12px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;font-style:italic;">${reason}</div>`
    : ''
  return base(`
    ${tag('Switch Request', '#E8926A')}
    <br/><br/>
    ${h1(`${clientName} wants a new therapist.`)}
    ${p(`A client on ZenSpace has requested a different therapist match.`)}
    ${reasonBlock}
    ${p(`Log in to the admin panel, end their current match, and re-queue them for matching.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `)
}

// ── Application invite template ──────────────────────────────────────────────

function tplApplicationApproved(name: string, inviteUrl: string, adminNotes: string) {
  const notesBlock = adminNotes
    ? `<div style="margin-top:20px;padding:16px;background:#f0faf9;border-left:3px solid #7EC0B7;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#4a5568;font-style:italic;">${adminNotes}</p>
       </div>`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>ZenSpace</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ecef;overflow:hidden;">
        <tr>
          <td style="background:#233551;padding:24px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ZenSpace</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#7EC0B722;color:#7EC0B7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Application Approved</span>
          <br/><br/>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">Welcome to ZenSpace, ${name}.</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">Your application has been reviewed and approved. Use the link below to complete your onboarding and set up your therapist profile.</p>
          ${notesBlock}
          <a href="${inviteUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Complete Onboarding →</a>
          <p style="margin-top:20px;font-size:13px;color:#9aa3ad;">This link contains a one-time invite code. Don't share it.</p>
        </td></tr>
        <tr>
          <td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">
              Questions? Email us at <a href="mailto:hello@zenspace.in" style="color:#3D8A80;">hello@zenspace.in</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendApplicationInviteEmail({
  to,
  name,
  inviteUrl,
  adminNotes = '',
}: {
  to: string
  name: string
  inviteUrl: string
  adminNotes?: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: 'Your ZenSpace therapist application has been approved',
        html: tplApplicationApproved(name, inviteUrl, adminNotes),
      }),
    })
  } catch {
    // best-effort
  }
}

// ── Send helper ──────────────────────────────────────────────────────────────

export type EmailNotificationType =
  | 'client_matched'
  | 'client_unmatched'
  | 'client_message'
  | 'profile_verified'
  | 'session_scheduled'
  | 'session_reminder'
  | 'switch_request'

interface EmailParams {
  to: string
  name: string
  type: EmailNotificationType
  meta?: Record<string, string>
}

export async function sendNotificationEmail({ to, name, type, meta = {} }: EmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) return // silently skip if not configured

  let subject = 'Notification from ZenSpace'
  let html = ''

  switch (type) {
    case 'client_matched':
      subject = `New client matched — ${meta.clientName ?? 'a new client'}`
      html = tplClientMatched(name, meta.clientName ?? 'Your new client')
      break
    case 'client_unmatched':
      subject = `Match ended — ${meta.clientName ?? 'client'}`
      html = tplClientUnmatched(name, meta.clientName ?? 'Your client')
      break
    case 'client_message':
      subject = `New message from ${meta.clientName ?? 'your client'}`
      html = tplClientMessage(name, meta.clientName ?? 'Your client')
      break
    case 'profile_verified':
      subject = 'Your ZenSpace profile has been verified'
      html = tplProfileVerified(name)
      break
    case 'session_scheduled':
      subject = `Session confirmed — ${meta.dateStr ?? ''}`
      html = tplSessionScheduled(name, meta.dateStr ?? '', meta.sessionType ?? 'video')
      break
    case 'session_reminder':
      subject = `Session reminder — ${meta.dateStr ?? ''}`
      html = tplSessionReminder(name, meta.dateStr ?? '', meta.sessionType ?? 'video')
      break
    case 'switch_request':
      subject = `Switch request — ${meta.clientName ?? 'A client'} wants a new therapist`
      html = tplSwitchRequest(name, meta.clientName ?? 'A client', meta.reason ?? '')
      break
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
  } catch {
    // Email is best-effort — never block the main action
  }
}
