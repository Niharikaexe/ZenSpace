// Renders all email templates as standalone HTML previews in email-templates/.
// Mirrors lib/email.ts. Run with: node scripts/render-emails.js

const fs = require('fs');
const path = require('path');

const SITE = 'https://mindcanopy.in';
const LOGO_URL = `${SITE}/icon.svg`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  </td>`;
}

function footerLine(audience) {
  if (audience === 'therapist') return 'You&rsquo;re receiving this because you&rsquo;re a therapist on MindCanopy.';
  if (audience === 'admin') return 'Admin notification.';
  return '';
}

function base(content, audience = 'therapist') {
  const fline = footerLine(audience);
  const footer = fline
    ? `${fline}<br/>Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>`
    : `Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>`;
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
</html>`;
}

const btn = (label, href) =>
  `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">${label}</a>`;
const h1 = (text) =>
  `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;line-height:1.3;">${text}</h1>`;
const p = (text) =>
  `<p style="margin:16px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">${text}</p>`;
const tag = (text, color = '#7EC0B7') =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${color}22;color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`;

const signOff = `
  <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">
    - MindCanopy team
  </p>
`;

// ─── Sample data ─────────────────────────────────────────────────────────────

const s = {
  firstName: 'Priya',
  therapistFirstName: 'Aisha',
  therapistFullName: 'Aisha Khan',
  clientFirstName: 'Priya',
  clientFullName: 'Priya Sharma',
  clientName: 'Priya Sharma',
  dateStr: 'Saturday, May 30 at 6:00 PM',
  adminMatchNote: 'She specifically called out family-system pressure in her own training, and you mentioned in-laws coming up a few times. Felt right.',
  messageBody: "I've been thinking about what you said in the last session about boundaries. It came up again this week and I wasn't sure how to handle it.",
  applicantFullName: 'Aisha Khan',
  verifyUrl: `${SITE}/therapist/verify-email?token=abc123def456`,
  inviteUrl: `${SITE}/therapist/onboard?code=ABC123XY`,
  inviteCode: 'ABC123XY',
  adminNotes: 'Strong fit on the cultural-context angle, schedule the intro call this week.',
  switchReason: 'I felt like I was just talking at her, not with her.',
  planName: 'Essentials Weekly',
  clientEmail: 'priya@example.com',
  senderName: 'Vikram',
  senderEmail: 'vikram@example.com',
  message: 'Hi, I had a quick question about how the matching process works. How long does it usually take after signup?',
  cancelCount: 3,
  timeWindow: '30 days',
  adminPauseNote: 'Following up on the concern raised by your last client. Please write to us.',
  sessionsCompleted: 4,
  pendingPayout: '₹6,000',
  paypalEmail: 'aisha.khan@example.com',
  bankAccountName: 'AISHA KHAN',
  bankAccountNumber: '12345678901234',
  bankIfsc: 'HDFC0001234',
};

// ─── Client templates ────────────────────────────────────────────────────────

const clientWelcome = base(`
  ${h1(`Welcome to MindCanopy, ${s.firstName}.`)}
  ${p('Glad you came our way. We hope MindCanopy can be the home your mind has been looking for.')}
  ${p(`When we have a therapist for you, we&rsquo;ll write back with a short introduction. You&rsquo;ll have an intro chat with them first. If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
  ${p('You can log in any time.')}
  ${btn('Go to your dashboard →', `${SITE}/dashboard`)}
  <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">More soon.</p>
  ${signOff}
`, 'client');

const clientMatchMade = base(`
  ${h1(`Meet ${s.therapistFullName}.`)}
  ${p(`We&rsquo;ve gone through your responses and matched you with someone we think will be a good fit.`)}
  ${p(s.adminMatchNote)}
  ${p(`Your next step is an intro chat. Say hi when you&rsquo;re ready.`)}
  ${btn(`Say hi →`, `${SITE}/dashboard/chat`)}
  ${p(`If it doesn&rsquo;t feel like the right fit, just let us know and we&rsquo;ll keep looking.`)}
  <p style="margin:32px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">We hope they&rsquo;re the right one.</p>
  ${signOff}
`, 'client');

const clientSessionScheduled = base(`
  ${h1(`${s.therapistFirstName} scheduled a session.`)}
  ${p(`Hi ${s.firstName}, hope you&rsquo;re doing okay.`)}
  ${p(`Your therapist <strong>${s.therapistFirstName}</strong> has scheduled a session for <strong>${s.dateStr}</strong>. We&rsquo;ll send you a reminder the day before.`)}
  ${btn('View session details →', `${SITE}/dashboard/sessions`)}
  ${signOff}
`, 'client');

const clientSessionReminder = base(`
  ${h1('Your session is tomorrow.')}
  ${p(`Hi ${s.firstName}, hope you&rsquo;re doing okay.`)}
  ${p(`Just a heads-up: you have an upcoming session at <strong>${s.dateStr}</strong>.`)}
  ${p(`Find a quiet, private spot before it starts. You don&rsquo;t need to prepare. Whatever&rsquo;s on your mind is the right thing to bring.`)}
  ${btn('View session details →', `${SITE}/dashboard/sessions`)}
  ${signOff}
`, 'client');

const clientChatNotStarted = base(`
  ${h1(`Have you said hi to ${s.therapistFirstName} yet?`)}
  ${p(`Hi ${s.firstName}, hope you&rsquo;re doing okay.`)}
  ${p(`We noticed you haven&rsquo;t started chatting with <strong>${s.therapistFirstName}</strong> yet. The first message doesn&rsquo;t have to be a big one. Even a &ldquo;hi&rdquo; gets the conversation going.`)}
  ${p('Whenever you&rsquo;re ready.')}
  ${btn(`Say hi to ${s.therapistFirstName} →`, `${SITE}/dashboard/chat`)}
  ${signOff}
`, 'client');

const clientNotSubscribed = base(`
  ${h1('Want to try a different therapist?')}
  ${p(`Hi ${s.firstName}, hope you&rsquo;re doing okay.`)}
  ${p(`You started a chat with <strong>${s.therapistFirstName}</strong> but haven&rsquo;t subscribed yet. If they didn&rsquo;t feel like the right fit, that&rsquo;s okay. Not every match clicks the first time.`)}
  ${p(`Just let us know and we&rsquo;ll find someone else for you.`)}
  ${btn('View dashboard →', `${SITE}/dashboard`)}
  ${signOff}
`, 'client');

// ─── Therapist templates ─────────────────────────────────────────────────────

const therapistClientMatched = base(`
  ${tag('New Client')}
  <br/><br/>
  ${h1(`Hi ${s.therapistFirstName}, good news.`)}
  ${p(`<strong>${s.clientFullName}</strong> has been matched with you by the MindCanopy team. We pair clients carefully, by hand, and we think you&rsquo;re a good fit for them.`)}
  ${p('Head to your dashboard to read their questionnaire before you reach out.')}
  ${btn('View their profile →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistClientUnmatched = base(`
  ${tag('Match Ended', '#E8926A')}
  <br/><br/>
  ${h1(`Your match with ${s.clientFirstName} has ended.`)}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p(`This usually isn&rsquo;t about you. Sometimes a therapist and client just don&rsquo;t click, and that&rsquo;s no one&rsquo;s fault. It happens.`)}
  ${p(`We&rsquo;ll send you a new match as soon as we have one. Thanks for showing up for them.`)}
  ${btn('Go to dashboard →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistClientMessage = base(`
  ${tag('New Message')}
  <br/><br/>
  ${h1(`${s.clientFirstName} sent you a message.`)}
  <div style="margin:20px 0;padding:16px 18px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#233551;line-height:1.7;">${s.messageBody}</div>
  ${p('Log in to reply.')}
  ${btn('Open chat →', `${SITE}/therapist/dashboard/chat`)}
  ${signOff}
`, 'therapist');

const therapistProfileVerified = base(`
  ${tag('Verified', '#3D8A80')}
  <br/><br/>
  ${h1(`You&rsquo;re verified, ${s.therapistFirstName}.`)}
  ${p('Good news. Your profile has been verified. You&rsquo;re ready to start seeing clients on MindCanopy.')}
  ${p('Head to your dashboard, get familiar with how things work, and have a look around.')}
  <p style="margin:16px 0 0;font-size:15px;color:#233551;line-height:1.7;font-weight:700;">
    One thing before we can match you with a client: please set your weekly availability and the number of clients you can handle at one time. We can only match you once these are in.
  </p>
  ${btn('Set your availability →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistAvailabilityNudge = base(`
  ${tag('Reminder', '#E8926A')}
  <br/><br/>
  ${h1(`Your availability isn&rsquo;t set yet.`)}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p('Just checking in. You haven&rsquo;t set your weekly availability or your client capacity yet. We can&rsquo;t assign you a client until you do.')}
  ${p('It takes about five minutes.')}
  ${btn('Set your availability →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistSessionScheduled = base(`
  ${h1(`Session scheduled with ${s.clientFirstName}.`)}
  ${p(`Hi ${s.therapistFirstName}, hope you&rsquo;re doing okay.`)}
  ${p(`A session with <strong>${s.clientFirstName}</strong> has been scheduled for <strong>${s.dateStr}</strong>. We&rsquo;ll send you a reminder the day before.`)}
  ${btn('View session details →', `${SITE}/therapist/dashboard/video`)}
  ${signOff}
`, 'therapist');

const therapistSessionReminder = base(`
  ${h1(`Session with ${s.clientFirstName} tomorrow.`)}
  ${p(`Hi ${s.therapistFirstName}, hope you&rsquo;re doing okay.`)}
  ${p(`Just a heads-up: you have an upcoming session with <strong>${s.clientFirstName}</strong> at <strong>${s.dateStr}</strong>.`)}
  ${p('Take a minute to glance at your last session notes if it helps.')}
  ${btn('View session details →', `${SITE}/therapist/dashboard/video`)}
  ${signOff}
`, 'therapist');

const therapistMissedSession = base(`
  ${tag('Missed Session', '#E8926A')}
  <br/><br/>
  ${h1('You missed a session.')}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p(`You were scheduled with <strong>${s.clientFirstName}</strong> at <strong>${s.dateStr}</strong> and didn&rsquo;t join.`)}
  ${p('If something came up, write to admin@mindcanopy.in so we can let them know and help reschedule.')}
  ${p('We log every missed session. Repeated misses affect the client&rsquo;s experience and your standing on the platform. If your availability has changed, please update it from your dashboard so we don&rsquo;t book you when you can&rsquo;t be there.')}
  ${btn('Update your availability →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistReplyOverdue = base(`
  ${tag('Reply Reminder', '#E8926A')}
  <br/><br/>
  ${h1('A client is waiting for your reply.')}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p(`<strong>${s.clientFirstName}</strong> sent you a message 48 hours ago and we haven&rsquo;t seen a reply yet.`)}
  ${p('Part of our promise to clients is that you reply within 48 hours. Falling behind on this affects their trust and your standing on the platform.')}
  ${p('If you&rsquo;re unavailable for a stretch, write to admin@mindcanopy.in so we can let your clients know.')}
  ${btn(`Open chat with ${s.clientFirstName} →`, `${SITE}/therapist/dashboard/chat`)}
  ${signOff}
`, 'therapist');

const therapistCancellationPattern = base(`
  ${tag('Pattern Detected', '#E8926A')}
  <br/><br/>
  ${h1('Pattern of cancellations.')}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p(`We&rsquo;ve noticed you&rsquo;ve cancelled <strong>${s.cancelCount}</strong> sessions in the last <strong>${s.timeWindow}</strong>. Things come up, but a repeated pattern is hard on your clients and on the trust we ask them to extend.`)}
  ${p('If something is going on that&rsquo;s making consistency hard right now, we&rsquo;d rather hear about it. Write to admin@mindcanopy.in. We can pause your availability or work out a plan together.')}
  ${p('Until then, please review your availability and only keep the slots you can reliably hold.')}
  ${btn('Review your availability →', `${SITE}/therapist/dashboard`)}
  ${signOff}
`, 'therapist');

const therapistAccountPaused = base(`
  ${tag('Account Paused', '#E8926A')}
  <br/><br/>
  ${h1('Your account has been paused.')}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p('Your therapist account on MindCanopy has been paused. You won&rsquo;t be matched with new clients, and your existing matches are under review.')}
  <div style="margin:20px 0;padding:14px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;line-height:1.7;">${s.adminPauseNote}</div>
  ${p('If you have questions or want to discuss next steps, write to admin@mindcanopy.in. We&rsquo;re happy to talk.')}
  ${signOff}
`, 'therapist');

const therapistConcernRaised = base(`
  ${tag('Concern Raised', '#E8926A')}
  <br/><br/>
  ${h1('A concern was raised about a session.')}
  ${p(`Hi ${s.therapistFirstName},`)}
  ${p('A client has shared a concern about a recent session with you. We take these seriously and we review every one before deciding anything.')}
  ${p(`Before we act, we want to hear from you. Please write to admin@mindcanopy.in within <strong>2 days</strong> so we can talk about what happened.`)}
  ${p('If you miss this window, we&rsquo;ll pause your interaction with this client until we hear from you. Your other matches and your account stay active.')}
  ${signOff}
`, 'therapist');

// ─── Applicant templates (custom HTML, not using base()) ────────────────────

const applicantReceived = `<!DOCTYPE html>
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
        <tr>${brandHeader()}</tr>
        <tr><td style="padding:32px;">
          ${tag('Application Received', '#7EC0B7')}
          <br/><br/>
          ${h1(`Thanks for applying, ${s.applicantFullName}.`)}
          ${p(`We&rsquo;ve received your application and our team is taking a look. Before we move forward, please verify your email so we know we can reach you.`)}
          <a href="${s.verifyUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Verify my email →</a>
          <p style="margin:14px 0 0;font-size:12px;color:#9aa3ad;line-height:1.6;">
            If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
            <a href="${s.verifyUrl}" style="color:#3D8A80;word-break:break-all;">${s.verifyUrl}</a>
          </p>
          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8ecef;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr><td style="padding:6px 12px 6px 0;vertical-align:top;width:24px;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">1</span></td>
              <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;"><strong style="color:#233551;">Verify your email</strong>, click the button above.</td></tr>
              <tr><td style="padding:6px 12px 6px 0;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">2</span></td>
              <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;"><strong style="color:#233551;">We review your application</strong>, your education, CV, and credentials. We read every application personally.</td></tr>
              <tr><td style="padding:6px 12px 6px 0;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">3</span></td>
              <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;"><strong style="color:#233551;">Intro call</strong>, if it looks like a fit, we&rsquo;ll set one up within 3 to 5 working days.</td></tr>
              <tr><td style="padding:6px 12px 6px 0;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">4</span></td>
              <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;"><strong style="color:#233551;">Onboarding</strong>, we&rsquo;ll share an invite code so you can set up your therapist profile.</td></tr>
              <tr><td style="padding:6px 12px 6px 0;vertical-align:top;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">5</span></td>
              <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;"><strong style="color:#233551;">Match with clients</strong>, once you&rsquo;re live, we&rsquo;ll match you with clients aligned to your approach.</td></tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;"><p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a></p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const applicantApproved = `<!DOCTYPE html>
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
        <tr>${brandHeader()}</tr>
        <tr><td style="padding:32px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#7EC0B722;color:#7EC0B7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Application Approved</span>
          <br/><br/>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">Welcome to MindCanopy, ${s.applicantFullName}.</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">Your application has been reviewed and approved. Use the link below to complete your onboarding and set up your therapist profile.</p>
          <div style="margin-top:20px;padding:16px;background:#f0faf9;border-left:3px solid #7EC0B7;border-radius:4px;"><p style="margin:0;font-size:13px;color:#4a5568;font-style:italic;">${s.adminNotes}</p></div>
          <a href="${s.inviteUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Complete Onboarding →</a>
          <div style="margin-top:24px;padding:14px 16px;background:#f8f9fa;border:1px dashed #cbd5e0;border-radius:8px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Your invite code</p>
            <p style="margin:6px 0 0;font-size:18px;color:#233551;font-weight:900;letter-spacing:0.1em;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">${s.inviteCode}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9aa3ad;line-height:1.5;">If the button above doesn&rsquo;t work, go to <a href="${SITE}/therapist/onboard" style="color:#3D8A80;">${SITE}/therapist/onboard</a> and paste this code on the first step.</p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#9aa3ad;">This code is one-time use. Don&rsquo;t share it.</p>
        </td></tr>
        <tr><td style="background:#f8f9fa;border-top:1px solid #e8ecef;padding:20px 32px;"><p style="margin:0;font-size:12px;color:#9aa3ad;line-height:1.6;">Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a></p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// ─── Admin templates ─────────────────────────────────────────────────────────

const adminNewApplication = base(`
  ${tag('New Application', '#E8926A')}
  <br/><br/>
  ${h1(`${s.applicantFullName} applied to join MindCanopy.`)}
  ${p('Head to your admin dashboard to review the application.')}
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

const adminNewClientSignup = base(`
  ${tag('New Client Signup', '#7EC0B7')}
  <br/><br/>
  ${h1(`${s.clientName} just signed up.`)}
  ${p(`Email: <strong>${s.clientEmail}</strong><br/>They are now in the pending match queue. Review their questionnaire and assign a therapist.`)}
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

const adminNewSubscription = base(`
  ${tag('New Subscription', '#7EC0B7')}
  <br/><br/>
  ${h1(`${s.clientName} subscribed.`)}
  ${p(`Plan: <strong>${s.planName}</strong>`)}
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

const adminTherapistOnboarded = base(`
  ${tag('Therapist Onboarded', '#7EC0B7')}
  <br/><br/>
  ${h1(`${s.applicantFullName} has completed onboarding.`)}
  ${p('Their profile is ready for review. Verify their credentials and start assigning clients.')}
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

const adminContactForm = base(`
  ${tag('Contact Form', '#E8926A')}
  <br/><br/>
  ${h1(`Message from ${s.senderName}`)}
  ${p(`Email: <strong>${s.senderEmail}</strong>`)}
  <div style="margin:16px 0;padding:14px 16px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#4a5568;line-height:1.7;">${s.message}</div>
`, 'admin');

const adminSwitchRequest = base(`
  ${tag('Switch Request', '#E8926A')}
  <br/><br/>
  ${h1(`${s.clientName} wants a new therapist.`)}
  ${p(`A client on MindCanopy has requested a different therapist match.`)}
  <div style="margin:16px 0;padding:12px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;font-style:italic;">${s.switchReason}</div>
  ${p(`Log in to the admin panel, end their current match, and re-queue them for matching.`)}
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

const adminPayoutRequest = base(`
  ${tag('Payout Request', '#E8926A')}
  <br/><br/>
  ${h1(`${s.applicantFullName} has requested a payout.`)}
  ${p(`<strong>${s.sessionsCompleted}</strong> completed sessions in the last 7 days. Amount due: <strong>${s.pendingPayout}</strong>`)}
  <div style="margin:20px 0;padding:16px;background:#f8f9fa;border:1px solid #e8ecef;border-radius:10px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;">Payment details</p>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">PayPal</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${s.paypalEmail}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account name</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${s.bankAccountName}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account number</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${s.bankAccountNumber}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">IFSC</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${s.bankIfsc}</td></tr>
    </table>
  </div>
  ${btn('Open Admin Panel →', `${SITE}/admin`)}
`, 'admin');

// ─── Write all previews ──────────────────────────────────────────────────────

const outputs = {
  // Client
  'client-welcome.html':              clientWelcome,
  'client-match-made.html':           clientMatchMade,
  'client-session-scheduled.html':    clientSessionScheduled,
  'client-session-reminder.html':     clientSessionReminder,
  'client-chat-not-started.html':     clientChatNotStarted,
  'client-not-subscribed.html':       clientNotSubscribed,
  // Therapist
  'therapist-client-matched.html':    therapistClientMatched,
  'therapist-client-unmatched.html':  therapistClientUnmatched,
  'therapist-client-message.html':    therapistClientMessage,
  'therapist-profile-verified.html':  therapistProfileVerified,
  'therapist-availability-nudge.html': therapistAvailabilityNudge,
  'therapist-session-scheduled.html': therapistSessionScheduled,
  'therapist-session-reminder.html':  therapistSessionReminder,
  'therapist-missed-session.html':    therapistMissedSession,
  'therapist-reply-overdue.html':     therapistReplyOverdue,
  'therapist-cancellation-pattern.html': therapistCancellationPattern,
  'therapist-account-paused.html':    therapistAccountPaused,
  'therapist-concern-raised.html':    therapistConcernRaised,
  // Applicant
  'applicant-received.html':          applicantReceived,
  'applicant-approved.html':          applicantApproved,
  // Admin
  'admin-new-application.html':       adminNewApplication,
  'admin-new-client-signup.html':     adminNewClientSignup,
  'admin-new-subscription.html':      adminNewSubscription,
  'admin-therapist-onboarded.html':   adminTherapistOnboarded,
  'admin-contact-form.html':          adminContactForm,
  'admin-switch-request.html':        adminSwitchRequest,
  'admin-payout-request.html':        adminPayoutRequest,
};

const outDir = path.join(__dirname, '..', 'email-templates');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

let count = 0;
for (const [name, html] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(outDir, name), html);
  count++;
}
console.log(`Wrote ${count} email preview files to ${outDir}`);
