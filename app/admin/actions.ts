'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from '@/lib/notifications'
import { sendApplicationInviteEmail } from '@/lib/email'

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

  const { error } = await (admin as any).from('matches').insert({
    client_id: clientId,
    therapist_id: therapistId,
    matched_by: adminUser.id,
    notes: notes || null,
    status: 'active',
    started_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)

  // Notify the therapist (reuse admin client from above)
  const { data: clientProfile } = await (admin as any)
    .from('profiles').select('full_name').eq('id', clientId).single()
  const clientName = clientProfile?.full_name ?? 'A new client'

  createNotification({
    userId: therapistId,
    type: 'client_matched',
    title: 'New client matched',
    body: `${clientName} has been assigned to you. Check their profile and reach out.`,
    metadata: { clientId, clientName },
  }).catch(() => {}) // fire-and-forget

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
      createNotification({
        userId: tProfile.user_id,
        type: 'profile_verified',
        title: 'Profile verified',
        body: 'Your ZenSpace profile has been verified. You are now eligible to receive client matches.',
        metadata: {},
      }).catch(() => {})
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

  // Generate invite code
  const code = makeInviteCode()
  const { error: inviteErr } = await (admin as any).from('therapist_invites').insert({
    code,
    created_by: adminUser.id,
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

  // Send invite email (fire-and-forget)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenspace.in'
  const inviteUrl = `${siteUrl}/therapist/onboard?code=${code}`
  sendApplicationInviteEmail({
    to: application.email,
    name: application.full_name,
    inviteUrl,
    adminNotes: adminNotes || '',
  }).catch(() => {})

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

    createNotification({
      userId: match.therapist_id,
      type: 'client_unmatched',
      title: 'Match ended',
      body: `Your match with ${clientName} has been ended by the admin.`,
      metadata: { clientId: match.client_id, clientName },
    }).catch(() => {})
  }

  revalidatePath('/admin')
}
