'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardSchema = z.object({
  inviteCode: z.string().min(1),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseState: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).max(60),
  education: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  approach: z.string().optional(),
  specializations: z.string(), // JSON array string
  languages: z.string(),       // JSON array string
  weeklyCapacity: z.coerce.number().min(1).max(50).default(10),
})

export type OnboardState = { error?: string; success?: boolean }

export async function submitTherapistOnboarding(
  _: OnboardState,
  formData: FormData
): Promise<OnboardState> {
  const parsed = onboardSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const {
    inviteCode, fullName, email, password,
    licenseNumber, licenseState, yearsExperience, education,
    bio, approach, specializations, languages, weeklyCapacity,
  } = parsed.data

  const admin = createAdminClient()

  // Validate invite code against DB (single-use, must be unused)
  const { data: invite, error: inviteError } = await (admin as any)
    .from('therapist_invites')
    .select('id, used_by')
    .eq('code', inviteCode.trim().toUpperCase())
    .is('used_by', null)
    .maybeSingle()

  if (inviteError || !invite) {
    return { error: 'Invalid or already used invite code. Please contact the ZenSpace admin.' }
  }

  // Create auth user via admin (auto-confirms email, sets role metadata)
  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'therapist' },
  })

  if (createError) {
    return { error: createError.message }
  }

  const userId = authData.user.id

  // Parse JSON arrays from form
  let specializationsArr: string[] = []
  let languagesArr: string[] = []
  try {
    specializationsArr = JSON.parse(specializations)
    languagesArr = JSON.parse(languages)
  } catch {
    // silently fall back to empty arrays
  }

  // Create therapist profile
  const { error: profileError } = await (admin as any).from('therapist_profiles').insert({
    user_id: userId,
    license_number: licenseNumber,
    license_state: licenseState || null,
    years_experience: yearsExperience,
    education: education || null,
    bio,
    approach: approach || null,
    specializations: specializationsArr,
    languages: languagesArr.length > 0 ? languagesArr : ['English'],
    weekly_capacity: weeklyCapacity,
    accepts_new_clients: true,
    is_verified: false,
  })

  if (profileError) {
    // Roll back auth user so they can retry
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Failed to save profile. Please try again.' }
  }

  // Mark invite code as used
  await (admin as any)
    .from('therapist_invites')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('id', invite.id)

  // Sign in the new therapist
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return { error: 'Account created but sign-in failed. Please go to /login.' }
  }

  redirect('/therapist/dashboard')
}
