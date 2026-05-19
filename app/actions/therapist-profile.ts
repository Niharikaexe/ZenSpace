'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type TherapistProfileState = { error?: string; success?: boolean }

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
  } catch {
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
