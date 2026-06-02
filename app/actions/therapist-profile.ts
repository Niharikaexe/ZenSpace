'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendPayoutRequestEmail } from '@/lib/email'

export type TherapistProfileState = { error?: string; success?: boolean }
export type AvatarState = { error?: string; avatarUrl?: string | null }

// ── Avatar: record an already-uploaded photo ─────────────────────────────────
//
// The file itself uploads directly from the browser to Supabase Storage (see
// TherapistAccountForm) so it never passes through this Server Action — that
// avoids Next.js's 1 MB Server Action body limit. Here we only receive the
// resulting storage path (a few bytes), verify it belongs to the caller, save
// its public URL on the profile, and clean up the previous photo.

export async function saveTherapistAvatar(path: string): Promise<AvatarState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // The path must live under this user's own folder — never trust the client
  // to hand us someone else's object path.
  const expectedPrefix = `therapists/${user.id}/`
  if (typeof path !== 'string' || !path.startsWith(expectedPrefix)) {
    return { error: 'Invalid upload. Please try again.' }
  }

  const admin = createAdminClient()
  const { data: publicUrlData } = admin.storage.from('avatars').getPublicUrl(path)
  const url = publicUrlData.publicUrl

  // Best-effort: clean up the previous photo so we don't accumulate orphans.
  const { data: existing } = await (admin as any)
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const previousUrl: string | null = existing?.avatar_url ?? null

  const { error: updateErr } = await (admin as any)
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id)

  if (updateErr) {
    logger.error('therapist/avatar', 'Failed to save avatar URL', updateErr, { userId: user.id })
    return { error: 'Photo uploaded but failed to save. Please try again.' }
  }

  if (previousUrl) {
    const prevPath = extractAvatarPath(previousUrl)
    if (prevPath && prevPath !== path) {
      await admin.storage.from('avatars').remove([prevPath])
    }
  }

  return { avatarUrl: url }
}

export async function deleteTherapistAvatar(): Promise<AvatarState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: existing } = await (admin as any)
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const currentUrl: string | null = existing?.avatar_url ?? null

  const { error: updateErr } = await (admin as any)
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (updateErr) {
    logger.error('therapist/avatar', 'Failed to clear avatar URL', updateErr, { userId: user.id })
    return { error: 'Failed to remove photo. Please try again.' }
  }

  if (currentUrl) {
    const path = extractAvatarPath(currentUrl)
    if (path) {
      await admin.storage.from('avatars').remove([path])
    }
  }

  return { avatarUrl: null }
}

// Extract the storage object path from a public URL.
//   https://<project>.supabase.co/storage/v1/object/public/avatars/therapists/<uid>/avatar-xxx.jpg
//   ──────────────────────────────────────────────────────^^^^^^^^─────────────────────────────
// We strip everything up to and including "/avatars/" to get the path Supabase Storage expects.
function extractAvatarPath(url: string): string | null {
  const marker = '/avatars/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function updateTherapistProfile(
  _prev: TherapistProfileState,
  formData: FormData,
): Promise<TherapistProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const fullName = (formData.get('fullName') as string | null)?.trim() ?? ''
  const bio = (formData.get('bio') as string | null)?.trim() ?? ''
  const approach = (formData.get('approach') as string | null)?.trim() ?? ''
  const yearsExperience = parseInt(formData.get('yearsExperience') as string, 10) || 0
  const weeklyCapacity = parseInt(formData.get('weeklyCapacity') as string, 10) || 10
  const specializationsRaw = formData.get('specializations') as string | null
  const specializationOther = (formData.get('specializationOther') as string | null)?.trim() ?? ''
  const languagesRaw = formData.get('languages') as string | null
  const languageOther = (formData.get('languageOther') as string | null)?.trim() ?? ''
  const acceptsNewClients = formData.get('acceptsNewClients') === 'true'
  const paypalEmail = (formData.get('paypalEmail') as string | null)?.trim() ?? ''
  const bankAccountName = (formData.get('bankAccountName') as string | null)?.trim() ?? ''
  const bankAccountNumber = (formData.get('bankAccountNumber') as string | null)?.trim() ?? ''
  const bankIfsc = (formData.get('bankIfsc') as string | null)?.trim().toUpperCase() ?? ''

  // Lightweight payment-field validation — empty values are allowed
  if (paypalEmail && !/^\S+@\S+\.\S+$/.test(paypalEmail)) {
    return { error: 'Please enter a valid PayPal email.' }
  }
  if (bankIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc)) {
    return { error: 'IFSC code must be 11 characters (e.g. HDFC0001234).' }
  }

  if (!fullName || fullName.length < 2) return { error: 'Name is required.' }
  if (!bio || bio.length < 10) return { error: 'Bio must be at least 10 characters.' }

  let specializations: string[] = []
  let languages: string[] = []
  try {
    specializations = specializationsRaw ? JSON.parse(specializationsRaw) : []
    languages = languagesRaw ? JSON.parse(languagesRaw) : []
  } catch (err) {
    logger.warn('therapist/account', 'Invalid JSON in specializations/languages', {
      userId: user.id,
      err: err instanceof Error ? err.message : String(err),
    })
    return { error: 'Invalid form data. Please try again.' }
  }

  if (specializationOther) specializations = [...specializations, specializationOther]
  if (languageOther) languages = [...languages, languageOther]

  if (specializations.length === 0) return { error: 'Select at least one specialisation or fill in Other.' }
  if (languages.length === 0) return { error: 'Select at least one language or fill in Other.' }

  const admin = createAdminClient()

  // Update auth display name
  await supabase.auth.updateUser({ data: { full_name: fullName } })

  // Update profiles table
  const { error: profileErr } = await (admin as any)
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (profileErr) {
    logger.error('therapist/account', 'Failed to update profile name', profileErr, { userId: user.id })
    return { error: 'Failed to update name. Please try again.' }
  }

  // Update therapist_profiles
  const { error: tProfileErr } = await (admin as any)
    .from('therapist_profiles')
    .update({
      bio,
      approach: approach || null,
      years_experience: yearsExperience,
      weekly_capacity: weeklyCapacity,
      specializations,
      languages,
      accepts_new_clients: acceptsNewClients,
      paypal_email: paypalEmail || null,
      bank_account_name: bankAccountName || null,
      bank_account_number: bankAccountNumber || null,
      bank_ifsc: bankIfsc || null,
    })
    .eq('user_id', user.id)

  if (tProfileErr) {
    logger.error('therapist/account', 'Failed to update therapist profile', tProfileErr, { userId: user.id })
    return { error: 'Failed to save profile. Please try again.' }
  }

  logger.info('therapist/account', 'Therapist profile updated', { userId: user.id })
  return { success: true }
}

export async function requestPayout(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  try {
    // Pull therapist's name + bank details + every match they've ever had, in
    // parallel. Past matches still count toward sessions completed under
    // earlier matches.
    const [profileResult, tProfileResult, matchesResult] = await Promise.all([
      (admin as any).from('profiles').select('full_name').eq('id', user.id).single(),
      (admin as any)
        .from('therapist_profiles')
        .select('paypal_email, bank_account_name, bank_account_number, bank_ifsc')
        .eq('user_id', user.id)
        .single(),
      (admin as any).from('matches').select('id, client_id').eq('therapist_id', user.id),
    ])

    if (profileResult.error) {
      logger.error('therapist/payout', 'Failed to load profile', profileResult.error, { userId: user.id })
      return { error: 'Could not load your account. Please try again.' }
    }
    if (tProfileResult.error) {
      logger.error('therapist/payout', 'Failed to load therapist profile', tProfileResult.error, { userId: user.id })
      return { error: 'Could not load your payment details. Please try again.' }
    }
    if (matchesResult.error) {
      logger.error('therapist/payout', 'Failed to load matches', matchesResult.error, { userId: user.id })
      return { error: 'Could not load your client history. Please try again.' }
    }

    const therapistName: string = profileResult.data?.full_name ?? 'Therapist'
    const tProfile = tProfileResult.data
    const matchList = (matchesResult.data ?? []) as { id: string; client_id: string }[]
    const matchIds = matchList.map(m => m.id)

    // Sum the frozen per-session payout for completed + paid sessions in the
    // last 7 days, matching the dashboard's "Pending payout" headline.
    const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

    let sessionsThisWeek = 0
    let pendingPayoutRupees = 0

    if (matchIds.length > 0) {
      const { data: sessions, error: sessionsErr } = await (admin as any)
        .from('sessions')
        .select('therapist_payout_paise')
        .in('match_id', matchIds)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .gte('scheduled_at', weekStart) as { data: { therapist_payout_paise: number | null }[] | null; error: unknown }

      if (sessionsErr) {
        logger.error('therapist/payout', 'Failed to load sessions', sessionsErr, { userId: user.id })
        return { error: 'Could not calculate your pending payout. Please try again.' }
      }

      for (const s of sessions ?? []) {
        pendingPayoutRupees += Math.round((s.therapist_payout_paise ?? 0) / 100)
        sessionsThisWeek++
      }
    }

    const pendingPayoutLabel = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(pendingPayoutRupees)

    await sendPayoutRequestEmail({
      therapistName,
      sessionsCompleted: sessionsThisWeek,
      pendingPayout: pendingPayoutLabel,
      paypalEmail: tProfile?.paypal_email ?? null,
      bankAccountName: tProfile?.bank_account_name ?? null,
      bankAccountNumber: tProfile?.bank_account_number ?? null,
      bankIfsc: tProfile?.bank_ifsc ?? null,
    })

    logger.info('therapist/payout', 'Payout request sent', {
      userId: user.id,
      sessionsThisWeek,
      pendingPayoutRupees,
    })
    return { success: true }
  } catch (err) {
    logger.error('therapist/payout', 'Payout request threw unexpectedly', err, { userId: user.id })
    return { error: 'Could not send payout request. Please try again or email admin@mindcanopy.in.' }
  }
}

export async function sendTherapistPasswordReset(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Not authenticated' }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}
