// Renders all email templates from lib/email.ts into standalone HTML files
// for preview in email-templates/. Run with: node scripts/render-emails.js

const fs = require('fs');
const path = require('path');

const SITE = 'https://mindcanopy.in';
const LOGO_URL = `${SITE}/icon.svg`;

// ─── Helpers (copied from lib/email.ts) ──────────────────────────────────────

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

function base(content) {
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
              You&rsquo;re receiving this because you&rsquo;re a verified therapist on MindCanopy.
              <br/>Questions? Email us at <a href="mailto:admin@mindcanopy.in" style="color:#3D8A80;">admin@mindcanopy.in</a>
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
  `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">${text}</h1>`;

const p = (text) =>
  `<p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">${text}</p>`;

const tag = (text, color = '#7EC0B7') =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:100px;background:${color}22;color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`;

// ─── Sample data ─────────────────────────────────────────────────────────────

const samples = {
  therapistFirstName: 'Aisha',
  therapistFullName: 'Aisha Khan',
  clientName: 'Priya Sharma',
  adminName: 'Niharika',
  dateStr: 'Saturday, May 30 at 6:00 PM',
  sessionType: 'video',
  switchReason: 'I felt like I was just talking at her, not with her.',
  inviteCode: 'ABC123XY',
  inviteUrl: `${SITE}/therapist/onboard?code=ABC123XY`,
  verifyUrl: `${SITE}/therapist/verify-email?token=abc123def456`,
  adminNotes: 'Strong fit on the cultural-context angle, schedule the intro call this week.',
  planName: 'Essentials Weekly',
  clientEmail: 'priya@example.com',
  senderName: 'Vikram',
  senderEmail: 'vikram@example.com',
  message: 'Hi, I had a quick question about how the matching process works. How long does it usually take after signup?',
  applicantFullName: 'Aisha Khan',
  sessionsCompleted: 4,
  pendingPayout: '₹6,000',
  paypalEmail: 'aisha.khan@example.com',
  bankAccountName: 'AISHA KHAN',
  bankAccountNumber: '12345678901234',
  bankIfsc: 'HDFC0001234',
};

// ─── Templates (copied from lib/email.ts) ────────────────────────────────────

function tplClientMatched(name, clientName) {
  return base(`
    ${tag('New Client')}
    <br/><br/>
    ${h1(`Hi ${name}, you have a new client.`)}
    ${p(`<strong>${clientName}</strong> has been matched with you by the MindCanopy admin. Head to your dashboard to review their profile and reach out.`)}
    ${btn('View Dashboard →', `${SITE}/therapist/dashboard`)}
  `);
}

function tplClientUnmatched(name, clientName) {
  return base(`
    ${tag('Match Ended', '#E8926A')}
    <br/><br/>
    ${h1(`Your match with ${clientName} has ended.`)}
    ${p('The MindCanopy admin has ended this match. If you have questions, please contact support.')}
    ${btn('Go to Dashboard →', `${SITE}/therapist/dashboard`)}
  `);
}

function tplClientMessage(name, clientName) {
  return base(`
    ${tag('New Message')}
    <br/><br/>
    ${h1(`${clientName} sent you a message.`)}
    ${p('Log in to your dashboard to read and reply.')}
    ${btn('Open Chat →', `${SITE}/therapist/dashboard/chat`)}
  `);
}

function tplProfileVerified(name) {
  return base(`
    ${tag('Account Verified', '#3D8A80')}
    <br/><br/>
    ${h1(`Your profile has been verified, ${name}.`)}
    ${p('You&rsquo;re now eligible to receive client matches on MindCanopy. Keep your profile up to date so clients can find the best fit.')}
    ${btn('View Profile →', `${SITE}/therapist/dashboard/account`)}
  `);
}

function tplSessionScheduled(name, dateStr, sessionType) {
  return base(`
    ${tag('Session Scheduled')}
    <br/><br/>
    ${h1('A session has been scheduled.')}
    ${p(`A <strong>${sessionType}</strong> session is confirmed for <strong>${dateStr}</strong>. Join from your dashboard at the scheduled time.`)}
    ${btn('View Sessions →', `${SITE}/therapist/dashboard/video`)}
  `);
}

function tplSessionReminder(name, dateStr, sessionType) {
  return base(`
    ${tag('Session Reminder', '#E8926A')}
    <br/><br/>
    ${h1(`You have an upcoming session.`)}
    ${p(`Your <strong>${sessionType}</strong> session is on <strong>${dateStr}</strong>. Make sure you&rsquo;re in a quiet, private space before it starts.`)}
    ${btn('View Sessions →', `${SITE}/therapist/dashboard/video`)}
  `);
}

function tplSwitchRequest(adminName, clientName, reason) {
  const reasonBlock = reason
    ? `<div style="margin:16px 0;padding:12px 16px;background:#fff8f5;border-left:3px solid #E8926A;border-radius:4px;font-size:14px;color:#4a5568;font-style:italic;">${reason}</div>`
    : '';
  return base(`
    ${tag('Switch Request', '#E8926A')}
    <br/><br/>
    ${h1(`${clientName} wants a new therapist.`)}
    ${p(`A client on MindCanopy has requested a different therapist match.`)}
    ${reasonBlock}
    ${p(`Log in to the admin panel, end their current match, and re-queue them for matching.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

function tplApplicationApproved(name, inviteUrl, inviteCode, adminNotes) {
  const notesBlock = adminNotes
    ? `<div style="margin-top:20px;padding:16px;background:#f0faf9;border-left:3px solid #7EC0B7;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#4a5568;font-style:italic;">${adminNotes}</p>
       </div>`
    : '';
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
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#233551;">Welcome to MindCanopy, ${name}.</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4a5568;line-height:1.7;">Your application has been reviewed and approved. Use the link below to complete your onboarding and set up your therapist profile.</p>
          ${notesBlock}
          <a href="${inviteUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#233551;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">Complete Onboarding →</a>
          <div style="margin-top:24px;padding:14px 16px;background:#f8f9fa;border:1px dashed #cbd5e0;border-radius:8px;">
            <p style="margin:0;font-size:12px;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Your invite code</p>
            <p style="margin:6px 0 0;font-size:18px;color:#233551;font-weight:900;letter-spacing:0.1em;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">${inviteCode}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9aa3ad;line-height:1.5;">If the button above doesn't work, go to <a href="${SITE}/therapist/onboard" style="color:#3D8A80;">${SITE}/therapist/onboard</a> and paste this code on the first step.</p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#9aa3ad;">This code is one-time use. Don't share it.</p>
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
</html>`;
}

function tplApplicationReceived(name, verifyUrl) {
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
          ${h1(`Thanks for applying, ${name}.`)}
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
                  <strong style="color:#233551;">Verify your email</strong> &mdash; click the button above.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">2</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">We review your application</strong> &mdash; your education, CV, and credentials. We read every application personally.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">3</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">15-minute intro call</strong> &mdash; if it looks like a fit, we&rsquo;ll set one up within 3&ndash;5 working days.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">4</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Onboarding</strong> &mdash; we&rsquo;ll share an invite code so you can set up your therapist profile.
                </td>
              </tr>
              <tr>
                <td style="padding:6px 12px 6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:#7EC0B722;color:#3D8A80;font-size:11px;font-weight:900;">5</span>
                </td>
                <td style="padding:6px 0;font-size:14px;color:#4a5568;line-height:1.6;">
                  <strong style="color:#233551;">Match with clients</strong> &mdash; once you&rsquo;re live, we&rsquo;ll match you with clients aligned to your approach.
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
</html>`;
}

function tplNewApplication(fullName) {
  return base(`
    ${tag('New Application', '#E8926A')}
    <br/><br/>
    ${h1(`${fullName} applied to join MindCanopy.`)}
    ${p('Head to your admin dashboard to review the application.')}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

function tplAdminNewClientSignup(clientName, email) {
  return base(`
    ${tag('New Client Signup', '#7EC0B7')}
    <br/><br/>
    ${h1(`${clientName} just signed up.`)}
    ${p(`Email: <strong>${email}</strong><br/>They are now in the pending match queue. Review their questionnaire and assign a therapist.`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

function tplAdminNewSubscription(clientName, planName) {
  return base(`
    ${tag('New Subscription', '#7EC0B7')}
    <br/><br/>
    ${h1(`${clientName} subscribed.`)}
    ${p(`Plan: <strong>${planName}</strong>`)}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

function tplAdminTherapistOnboarded(therapistName) {
  return base(`
    ${tag('Therapist Onboarded', '#7EC0B7')}
    <br/><br/>
    ${h1(`${therapistName} has completed onboarding.`)}
    ${p('Their profile is ready for review. Verify their credentials and start assigning clients.')}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

function tplAdminContactForm(senderName, senderEmail, message) {
  return base(`
    ${tag('Contact Form', '#E8926A')}
    <br/><br/>
    ${h1(`Message from ${senderName}`)}
    ${p(`Email: <strong>${senderEmail}</strong>`)}
    <div style="margin:16px 0;padding:14px 16px;background:#f8f9fa;border-left:3px solid #7EC0B7;border-radius:4px;font-size:14px;color:#4a5568;line-height:1.7;">${message}</div>
  `);
}

function tplPayoutRequest({ therapistName, sessionsCompleted, pendingPayout, paypalEmail, bankAccountName, bankAccountNumber, bankIfsc }) {
  const paymentRows = [
    paypalEmail        && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">PayPal</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${paypalEmail}</td></tr>`,
    bankAccountName    && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account name</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankAccountName}</td></tr>`,
    bankAccountNumber  && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">Account number</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankAccountNumber}</td></tr>`,
    bankIfsc           && `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#9aa3ad;white-space:nowrap;">IFSC</td><td style="padding:6px 0;font-size:13px;color:#233551;font-weight:600;">${bankIfsc}</td></tr>`,
  ].filter(Boolean).join('');

  const paymentBlock = paymentRows
    ? `<div style="margin:20px 0;padding:16px;background:#f8f9fa;border:1px solid #e8ecef;border-radius:10px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#9aa3ad;text-transform:uppercase;letter-spacing:0.08em;">Payment details</p>
        <table cellpadding="0" cellspacing="0" border="0">${paymentRows}</table>
       </div>`
    : `<p style="color:#E8926A;font-size:13px;margin:16px 0;">⚠️ No payment details on file. Ask the therapist to update their account settings.</p>`;

  return base(`
    ${tag('Payout Request', '#E8926A')}
    <br/><br/>
    ${h1(`${therapistName} has requested a payout.`)}
    ${p(`<strong>${sessionsCompleted}</strong> completed session${sessionsCompleted !== 1 ? 's' : ''} in the last 7 days · Amount due: <strong>${pendingPayout}</strong>`)}
    ${paymentBlock}
    ${btn('Open Admin Panel →', `${SITE}/admin`)}
  `);
}

// ─── Outputs ─────────────────────────────────────────────────────────────────

const outputs = {
  // Applicant emails
  'applicant-received.html':         tplApplicationReceived(samples.applicantFullName, samples.verifyUrl),
  'applicant-approved.html':         tplApplicationApproved(samples.applicantFullName, samples.inviteUrl, samples.inviteCode, samples.adminNotes),

  // Therapist emails
  'therapist-client-matched.html':   tplClientMatched(samples.therapistFirstName, samples.clientName),
  'therapist-client-unmatched.html': tplClientUnmatched(samples.therapistFirstName, samples.clientName),
  'therapist-client-message.html':   tplClientMessage(samples.therapistFirstName, samples.clientName),
  'therapist-profile-verified.html': tplProfileVerified(samples.therapistFirstName),
  'therapist-session-scheduled.html': tplSessionScheduled(samples.therapistFirstName, samples.dateStr, samples.sessionType),
  'therapist-session-reminder.html': tplSessionReminder(samples.therapistFirstName, samples.dateStr, samples.sessionType),

  // Client emails (same templates but recipient is client)
  'client-session-reminder.html':    tplSessionReminder('Priya', samples.dateStr, samples.sessionType),

  // Admin emails
  'admin-new-application.html':      tplNewApplication(samples.applicantFullName),
  'admin-new-client-signup.html':    tplAdminNewClientSignup(samples.clientName, samples.clientEmail),
  'admin-new-subscription.html':     tplAdminNewSubscription(samples.clientName, samples.planName),
  'admin-therapist-onboarded.html':  tplAdminTherapistOnboarded(samples.applicantFullName),
  'admin-contact-form.html':         tplAdminContactForm(samples.senderName, samples.senderEmail, samples.message),
  'admin-payout-request.html':       tplPayoutRequest({
    therapistName: samples.applicantFullName,
    sessionsCompleted: samples.sessionsCompleted,
    pendingPayout: samples.pendingPayout,
    paypalEmail: samples.paypalEmail,
    bankAccountName: samples.bankAccountName,
    bankAccountNumber: samples.bankAccountNumber,
    bankIfsc: samples.bankIfsc,
  }),
  'admin-switch-request.html':       tplSwitchRequest(samples.adminName, samples.clientName, samples.switchReason),
};

const outDir = path.join(__dirname, '..', 'email-templates');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

let count = 0;
for (const [name, html] of Object.entries(outputs)) {
  const full = path.join(outDir, name);
  fs.writeFileSync(full, html);
  count++;
}
console.log(`Wrote ${count} email preview files to ${outDir}`);
