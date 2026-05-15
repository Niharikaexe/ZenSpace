'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const TEST_CODE = 'ZENSPACE2026'

// ─── Invite lookup (called from client during onboarding) ─────────────────────

export type InviteLookupResult =
  | { valid: true; fullName: string; email: string; yearsExperience: number | null; education: string | null }
  | { valid: false; error: string }

export async function lookupInvite(rawCode: string): Promise<InviteLookupResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { valid: false, error: 'Enter your invite code.' }

  if (code === TEST_CODE) {
    return { valid: true, fullName: '', email: '', yearsExperience: null, education: null }
  }

  const admin = createAdminClient()
  const { data, error } = await (admin as any)
    .from('therapist_invites')
    .select('id, used_by, application_id, therapist_applications:application_id(full_name, email, years_experience, education)')
    .eq('code', code)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, error: 'Invalid invite code. Check with the MindCanopy admin.' }
  }
  if (data.used_by) {
    return { valid: false, error: 'This invite code has already been used.' }
  }

  const app = data.therapist_applications
  return {
    valid: true,
    fullName: app?.full_name ?? '',
    email: app?.email ?? '',
    yearsExperience: app?.years_experience ?? null,
    education: app?.education ?? null,
  }
}

// ─── Onboarding submission ────────────────────────────────────────────────────

const onboardSchema = z.object({
  inviteCode: z.string().min(1),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  licenseState: z.string().optional(),
  licenseCountry: z.string().optional(),
  pronouns: z.string().optional(),
  previousExperience: z.string().optional(),
  timezone: z.string().min(1, 'Time zone is required'),
  idDocumentUrl: z.string().min(1, 'Proof of identification is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  addressCity: z.string().min(1, 'City is required'),
  addressState: z.string().min(1, 'State is required'),
  addressPostalCode: z.string().min(1, 'Postal code is required'),
  addressCountry: z.string().min(1, 'Country is required'),
  paypalEmail: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  tagline: z.string().optional(),
  sessionExpectations: z.string().optional(),
  weeklyCapacity: z.coerce.number().min(1).max(50).default(10),
})

export type OnboardState = { error?: string; success?: boolean }

export async function submitTherapistOnboarding(
  _: OnboardState,
  formData: FormData
): Promise<OnboardState> {
  const profilePhoto = formData.get('profilePhoto')

  if (!(profilePhoto instanceof File) || profilePhoto.size === 0) {
    return { error: 'Profile photo is required.' }
  }
  if (profilePhoto.size > MAX_PHOTO_BYTES) {
    return { error: 'Profile photo must be under 5 MB.' }
  }
  if (!ALLOWED_PHOTO_TYPES.includes(profilePhoto.type)) {
    return { error: 'Profile photo must be a JPG, PNG, or WebP image.' }
  }

  const fields = Object.fromEntries(formData)
  delete (fields as Record<string, unknown>).profilePhoto

  const parsed = onboardSchema.safeParse(fields)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const v = parsed.data

  // At least one payout method must be provided
  const hasBank = !!(v.bankAccountName && v.bankAccountNumber && v.bankIfsc)
  const hasPaypal = !!(v.paypalEmail && v.paypalEmail.includes('@'))
  if (!hasBank && !hasPaypal) {
    return { error: 'Please provide either complete bank details or a PayPal email for payouts.' }
  }

  const admin = createAdminClient()
  const code = v.inviteCode.trim().toUpperCase()
  const isTestCode = code === TEST_CODE

  let invite: { id: string; application_id: string | null } | null = null
  type AppCarry = {
    specializations: string[]
    languages: string[]
    years_experience: number
    education: string | null
    gender: string | null
    ethnicity: string | null
    date_of_birth: string | null
    linkedin_url: string | null
  }
  let application: AppCarry | null = null

  if (!isTestCode) {
    const { data, error: inviteError } = await (admin as any)
      .from('therapist_invites')
      .select('id, used_by, application_id')
      .eq('code', code)
      .is('used_by', null)
      .maybeSingle()

    if (inviteError || !data) {
      return { error: 'Invalid or already used invite code. Please contact the MindCanopy admin.' }
    }
    invite = { id: data.id, application_id: data.application_id }

    if (data.application_id) {
      const { data: appData } = await (admin as any)
        .from('therapist_applications')
        .select('specializations, specialization_other, languages, years_experience, education, gender, ethnicity, date_of_birth, linkedin_url')
        .eq('id', data.application_id)
        .maybeSingle()

      if (appData) {
        const combinedSpec = [...(appData.specializations ?? [])]
        if (appData.specialization_other) combinedSpec.push(appData.specialization_other)
        application = {
          specializations: combinedSpec,
          languages: appData.languages ?? ['English'],
          years_experience: appData.years_experience ?? 0,
          education: appData.education ?? null,
          gender: appData.gender ?? null,
          ethnicity: appData.ethnicity ?? null,
          date_of_birth: appData.date_of_birth ?? null,
          linkedin_url: appData.linkedin_url ?? null,
        }
      }
    }
  }

  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email: v.email,
    password: v.password,
    email_confirm: true,
    user_metadata: { full_name: v.fullName, role: 'therapist' },
  })

  if (createError) {
    return { error: createError.message }
  }

  const userId = authData.user.id

  const { error: profileError } = await (admin as any).from('therapist_profiles').insert({
    user_id: userId,
    license_state: v.licenseState || null,
    license_country: v.licenseCountry || null,
    pronouns: v.pronouns || null,
    timezone: v.timezone,
    // demographics carried over from application
    gender: application?.gender ?? null,
    ethnicity: application?.ethnicity ?? null,
    date_of_birth: application?.date_of_birth ?? null,
    linkedin_url: application?.linkedin_url ?? null,
    years_experience: application?.years_experience ?? 0,
    education: application?.education ?? null,
    bio: v.bio,
    tagline: v.tagline || null,
    session_expectations: v.sessionExpectations || null,
    previous_experience: v.previousExperience || null,
    specializations: application?.specializations ?? [],
    languages: application?.languages ?? ['English'],
    weekly_capacity: v.weeklyCapacity,
    accepts_new_clients: true,
    is_verified: true,
    // verification + address + payout
    id_document_url: v.idDocumentUrl,
    address_line1: v.addressLine1,
    address_line2: v.addressLine2 || null,
    address_city: v.addressCity,
    address_state: v.addressState,
    address_postal_code: v.addressPostalCode,
    address_country: v.addressCountry,
    paypal_email: v.paypalEmail || null,
    bank_account_name: v.bankAccountName || null,
    bank_account_number: v.bankAccountNumber || null,
    bank_ifsc: v.bankIfsc || null,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Failed to save profile. Please try again.' }
  }

  const ext = profilePhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
  const photoPath = `therapists/${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(photoPath, profilePhoto, {
      contentType: profilePhoto.type,
      upsert: true,
    })

  if (uploadError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Failed to upload profile photo. Please try again.' }
  }

  const { data: publicUrlData } = admin.storage.from('avatars').getPublicUrl(photoPath)

  await (admin as any)
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', userId)

  if (!isTestCode && invite) {
    await (admin as any)
      .from('therapist_invites')
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq('id', invite.id)
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password })

  if (signInError) {
    return { error: 'Account created but sign-in failed. Please go to /login.' }
  }

  redirect('/therapist/dashboard')
}
