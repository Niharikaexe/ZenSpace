'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createNotification } from '@/lib/notifications'
import { sendApplicationInviteEmail, sendApplicationReceivedEmail, sendCustomEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mindcanopy.in'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (profile?.role !== 'admin') redirect('/dashboard')
  return user
}

export async function createMatch(clientId: string, therapistId: string, notes: string) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  // B-19: prevent double-matching — reject if client already has an active match
  const { data: existingMatch } = await (admin as any)
    .from('matches')
    .select('id')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  if (existingMatch) {
    throw new Error('This client already has an active match. End the current match before creating a new one.')
  }

  const { error } = await (admin as any).from('matches').insert({
    client_id: clientId,
    therapist_id: therapistId,
    matched_by: adminUser.id,
    notes: notes || null,
    status: 'active',
    started_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)

  // Look up names so both emails can be personalized
  const { data: profiles } = await (admin as any)
    .from('profiles').select('id, full_name').in('id', [clientId, therapistId])
  const clientProfile = (profiles ?? []).find((p: any) => p.id === clientId)
  const therapistProfile = (profiles ?? []).find((p: any) => p.id === therapistId)
  const clientName = (clientProfile?.full_name as string | undefined) ?? 'A new client'
  const therapistFullName = (therapistProfile?.full_name as string | undefined) ?? 'Your therapist'
  const therapistFirstName = therapistFullName.split(' ')[0]

  // after(): deliver post-response so it isn't killed when the action returns.
  after(() => createNotification({
    userId: therapistId,
    type: 'client_matched',
    title: 'New client matched',
    body: `${clientName} has been assigned to you. Check their profile and reach out.`,
    metadata: { clientId, clientName },
  }).catch(() => {}))

  // Notify the client with the admin's match note as the blurb
  after(() => createNotification({
    userId: clientId,
    type: 'client_match_made',
    title: `Meet ${therapistFirstName}`,
    body: 'We have matched you with someone we think will be a good fit.',
    metadata: {
      therapistId,
      therapistFirstName,
      therapistFullName,
      adminMatchNote: notes || '',
    },
  }).catch(() => {}))

  revalidatePath('/admin')
}

type Proposal = { tier: 'standard' | 'professional'; therapistId: string; summary: string }

/**
 * Therapist match proposals: the admin proposes ONE or TWO therapists as
 * `pending` matches — typically a Standard (basic-tier) and a Professional
 * (premium-tier) therapist, but the second is optional. The client picks one
 * via "Start a free chat" (see app/actions/choose-therapist.ts); if only one
 * was proposed they simply see that single profile.
 *
 * Only the client is notified here — therapists are notified when chosen.
 */
export async function createMatchProposals(
  clientId: string,
  proposals: Proposal[],
) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  const picked = proposals.filter((p) => p.therapistId)
  if (picked.length < 1) {
    throw new Error('Pick at least one therapist to propose.')
  }
  if (picked.length > 2) {
    throw new Error('You can propose at most two therapists.')
  }
  if (picked.length === 2 && picked[0].therapistId === picked[1].therapistId) {
    throw new Error('The two therapists must be different people.')
  }

  // Reject if the client already has an active match OR pending proposals.
  const { data: existing } = await (admin as any)
    .from('matches')
    .select('id')
    .eq('client_id', clientId)
    .in('status', ['active', 'pending']) as { data: { id: string }[] | null; error: unknown }

  if (existing && existing.length > 0) {
    throw new Error('This client already has an active match or pending proposals. End those first.')
  }

  const now = new Date().toISOString()

  // Single proposal → auto-match: there's nothing for the client to choose
  // between, so skip the proposal/selection screen and activate immediately.
  // Two proposals stay 'pending' for the client to pick via "Start a free chat".
  const autoMatch = picked.length === 1

  const rows = picked.map((p) => ({
    client_id: clientId,
    therapist_id: p.therapistId,
    matched_by: adminUser.id,
    tier: p.tier,
    admin_summary: p.summary || null,
    status: autoMatch ? 'active' : 'pending',
    created_at: now,
    ...(autoMatch ? { started_at: now } : {}),
  }))

  const { error } = await (admin as any).from('matches').insert(rows)
  if (error) throw new Error(error.message)

  if (autoMatch) {
    // Notify both sides as a real match (mirrors chooseTherapist): the therapist
    // gets the new-client email, the client gets "meet your therapist".
    const therapistId = picked[0].therapistId as string
    const [{ data: clientP }, { data: therapistP }] = await Promise.all([
      (admin as any).from('profiles').select('full_name').eq('id', clientId).single(),
      (admin as any).from('profiles').select('full_name').eq('id', therapistId).single(),
    ])
    const clientName = (clientP?.full_name as string | undefined) ?? 'A new client'
    const therapistFullName = (therapistP?.full_name as string | undefined) ?? 'your therapist'
    const therapistFirstName = therapistFullName.split(' ')[0]

    // Await both so the emails actually send before the action returns
    // (un-awaited promises are killed on serverless).
    await Promise.allSettled([
      createNotification({
        userId: therapistId,
        type: 'client_matched',
        title: 'New client matched',
        body: `${clientName} has been matched with you. Say hello when you can.`,
        metadata: { clientId, clientName },
      }),
      createNotification({
        userId: clientId,
        type: 'client_match_made',
        title: 'Your therapist is ready',
        body: `You’ve been matched with ${therapistFirstName}. Start a free chat whenever you’re ready.`,
        metadata: { therapistFirstName, therapistFullName, adminMatchNote: picked[0].summary || '' },
      }),
    ])
  } else {
    // Two proposals → client reviews and picks.
    await createNotification({
      userId: clientId,
      type: 'client_proposals_ready',
      title: 'Your therapist matches are ready',
      body: 'We’ve hand-picked two therapists for you. Take a look and start a free chat with whoever feels right.',
      metadata: { proposals: picked.length },
    }).catch(() => {})
  }

  revalidatePath('/admin')
}

export async function toggleTherapistVerification(therapistProfileId: string, currentValue: boolean) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_profiles')
    .update({ is_verified: !currentValue })
    .eq('id', therapistProfileId)

  if (error) throw new Error(error.message)

  // Notify therapist when newly verified (not when revoked)
  if (!currentValue) {
    const { data: tProfile } = await (admin as any)
      .from('therapist_profiles').select('user_id').eq('id', therapistProfileId).single()
    if (tProfile?.user_id) {
      after(() => createNotification({
        userId: tProfile.user_id,
        type: 'profile_verified',
        title: 'Profile verified',
        body: 'Your MindCanopy profile has been verified. You are now eligible to receive client matches.',
        metadata: {},
      }).catch(() => {}))
    }
  }

  revalidatePath('/admin')
}

function makeInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = 'ZS'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function generateInviteCode() {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  const code = makeInviteCode()

  const { error } = await (admin as any).from('therapist_invites').insert({
    code,
    created_by: adminUser.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function revokeInviteCode(inviteId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_invites')
    .delete()
    .eq('id', inviteId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function approveApplication(applicationId: string, adminNotes: string) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  // Fetch the application to get name + email
  const { data: application, error: fetchErr } = await (admin as any)
    .from('therapist_applications')
    .select('full_name, email, status')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !application) throw new Error('Application not found')
  if (application.status === 'invited') throw new Error('Already approved')

  // Generate invite code, linked back to this application for prefill on onboard
  const code = makeInviteCode()
  const { error: inviteErr } = await (admin as any).from('therapist_invites').insert({
    code,
    created_by: adminUser.id,
    application_id: applicationId,
  })
  if (inviteErr) throw new Error(inviteErr.message)

  // Mark application as invited
  const { error: updateErr } = await (admin as any)
    .from('therapist_applications')
    .update({
      status: 'invited',
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
  if (updateErr) throw new Error(updateErr.message)

  // Send the invite email — this is the only way the therapist gets their
  // onboarding link + code. Awaited so the Resend POST completes before the
  // serverless function freezes, and logged on failure so a silent drop is
  // visible (admin can then re-share the link/code manually).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mindcanopy.in'
  const inviteUrl = `${siteUrl}/therapist/onboard?code=${code}`
  const inviteSent = await sendApplicationInviteEmail({
    to: application.email,
    name: application.full_name,
    inviteCode: code,
    inviteUrl,
    adminNotes: adminNotes || '',
  })
  if (!inviteSent) {
    logger.error('admin/approveApplication', 'Invite email failed to send', null, {
      applicationId,
      to: application.email,
      inviteCode: code,
    })
  }

  revalidatePath('/admin')
}

export async function rejectApplication(applicationId: string, adminNotes: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_applications')
    .update({
      status: 'rejected',
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function actionSwitchRequest(requestId: string, matchId: string) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  // End the current match → client returns to pending state and can be re-matched
  const { error: matchErr } = await (admin as any)
    .from('matches')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', matchId)

  if (matchErr) throw new Error(matchErr.message)

  // Mark the switch request as actioned
  const { error: reqErr } = await (admin as any)
    .from('therapist_switch_requests')
    .update({
      status: 'actioned',
      actioned_at: new Date().toISOString(),
      actioned_by: adminUser.id,
    })
    .eq('id', requestId)

  if (reqErr) throw new Error(reqErr.message)

  revalidatePath('/admin')
}

export async function endMatch(matchId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  // Fetch match details before ending so we can notify
  const { data: match } = await (admin as any)
    .from('matches')
    .select('therapist_id, client_id')
    .eq('id', matchId)
    .single()

  const { error } = await (admin as any)
    .from('matches')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw new Error(error.message)

  if (match) {
    const { data: clientProfile } = await (admin as any)
      .from('profiles').select('full_name').eq('id', match.client_id).single()
    const clientName = clientProfile?.full_name ?? 'Your client'

    after(() => createNotification({
      userId: match.therapist_id,
      type: 'client_unmatched',
      title: 'Match ended',
      body: `Your match with ${clientName} has been ended by the admin.`,
      metadata: { clientId: match.client_id, clientName },
    }).catch(() => {}))
  }

  revalidatePath('/admin')
}

// Re-send the email-verification link to a therapist applicant whose email is
// not yet verified. Generates a token if the application doesn't have one.
// ── Free-compose: admin sends a one-off branded email to anyone ──────────────

const composeEmailSchema = z.object({
  to: z.string().trim().email('Enter a valid recipient email address.'),
  subject: z.string().trim().min(1, 'Subject is required.').max(200, 'Subject is too long.'),
  heading: z.string().trim().max(200, 'Heading is too long.').optional(),
  body: z.string().trim().min(1, 'Write a message before sending.').max(10000, 'Message is too long.'),
  ctaLabel: z.string().trim().max(60, 'Button label is too long.').optional(),
  ctaUrl: z.string().trim().url('The button link must be a full URL (https://…).').optional().or(z.literal('')),
  from: z.enum(['marketing', 'admin']).catch('marketing'),
})

export async function sendComposedEmail(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()

  const parsed = composeEmailSchema.safeParse({
    to: formData.get('to') ?? '',
    subject: formData.get('subject') ?? '',
    heading: (formData.get('heading') as string) || undefined,
    body: formData.get('body') ?? '',
    ctaLabel: (formData.get('ctaLabel') as string) || undefined,
    ctaUrl: (formData.get('ctaUrl') as string) || undefined,
    from: (formData.get('from') as string) || 'marketing',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' }
  }

  const { to, subject, heading, body, ctaLabel, ctaUrl, from } = parsed.data

  // A button needs both a label and a link — or neither.
  const hasLabel = !!ctaLabel && ctaLabel.length > 0
  const hasUrl = !!ctaUrl && ctaUrl.length > 0
  if (hasLabel !== hasUrl) {
    return { ok: false, error: 'The button needs both a label and a link, or leave both empty.' }
  }

  const sent = await sendCustomEmail({
    to,
    subject,
    heading,
    body,
    ctaLabel: hasLabel ? ctaLabel : undefined,
    ctaUrl: hasUrl ? ctaUrl : undefined,
    fromAdmin: from === 'admin',
  })

  if (!sent) {
    return {
      ok: false,
      error: 'Send failed. Make sure RESEND_API_KEY is set for this environment, then check the Emails tab for the error.',
    }
  }

  logger.info('admin/sendComposedEmail', 'Custom email sent', { to, subject })
  revalidatePath('/admin')
  return { ok: true }
}

export async function sendApplicationVerificationEmail(applicationId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data: app } = await (admin as any)
    .from('therapist_applications')
    .select('id, full_name, email, email_verified_at, email_verification_token')
    .eq('id', applicationId)
    .maybeSingle() as { data: { id: string; full_name: string; email: string; email_verified_at: string | null; email_verification_token: string | null } | null; error: unknown }

  if (!app) throw new Error('Application not found')
  if (app.email_verified_at) return { ok: true, alreadyVerified: true }

  let token = app.email_verification_token
  if (!token) {
    token = randomBytes(32).toString('hex')
    const { error } = await (admin as any)
      .from('therapist_applications')
      .update({ email_verification_token: token })
      .eq('id', applicationId)
    if (error) throw new Error(error.message)
  }

  const verifyUrl = `${SITE_URL}/therapist/verify-email?token=${token}`
  await sendApplicationReceivedEmail({ to: app.email, name: app.full_name, verifyUrl })

  logger.info('admin/sendApplicationVerificationEmail', 'Verification email re-sent', { applicationId, email: app.email })
  revalidatePath('/admin')
  return { ok: true }
}

// Settle a therapist's outstanding payout: records a payout batch and flips all
// their completed + paid + unpaid sessions to payout_status='paid'. Off-platform
// payment is done separately by the admin; this just tracks that it happened so
// the therapist payment page shows true outstanding amounts (no double-paying).
export async function markTherapistPayout(therapistId: string, note?: string) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  // All matches this therapist has had (any status — past clients still count).
  const { data: matches } = await (admin as any)
    .from('matches').select('id').eq('therapist_id', therapistId) as { data: { id: string }[] | null; error: unknown }
  const matchIds = (matches ?? []).map(m => m.id)
  if (matchIds.length === 0) return { ok: true, count: 0, totalPaise: 0 }

  // Outstanding = completed + paid sessions not yet settled.
  const { data: sessions } = await (admin as any)
    .from('sessions')
    .select('id, therapist_payout_paise, scheduled_at')
    .in('match_id', matchIds)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')
    .eq('payout_status', 'unpaid') as { data: { id: string; therapist_payout_paise: number | null; scheduled_at: string }[] | null; error: unknown }

  const rows = sessions ?? []
  if (rows.length === 0) return { ok: true, count: 0, totalPaise: 0 }

  const totalPaise = rows.reduce((sum, r) => sum + (r.therapist_payout_paise ?? 0), 0)
  const times = rows.map(r => new Date(r.scheduled_at).getTime())

  const { data: batch, error: batchErr } = await (admin as any)
    .from('therapist_payouts')
    .insert({
      therapist_id: therapistId,
      total_paise: totalPaise,
      session_count: rows.length,
      period_start: new Date(Math.min(...times)).toISOString(),
      period_end: new Date(Math.max(...times)).toISOString(),
      note: note || null,
      marked_by: adminUser.id,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (batchErr || !batch) throw new Error((batchErr as { message?: string } | null)?.message ?? 'Failed to record payout')

  // Flip only the rows still unpaid (guards against a concurrent settle).
  const { error: updErr } = await (admin as any)
    .from('sessions')
    .update({ payout_status: 'paid', payout_paid_at: new Date().toISOString(), payout_batch_id: batch.id })
    .in('id', rows.map(r => r.id))
    .eq('payout_status', 'unpaid')

  if (updErr) throw new Error(updErr.message)

  logger.info('admin/markTherapistPayout', 'Payout settled', {
    therapistId, batchId: batch.id, count: rows.length, totalPaise,
  })

  revalidatePath('/admin')
  return { ok: true, count: rows.length, totalPaise }
}
