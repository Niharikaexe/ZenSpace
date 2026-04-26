'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type ApplyState = {
  success?: boolean
  error?: string
}

export async function submitTherapistApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const fullName = (formData.get('fullName') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const phone = (formData.get('phone') as string | null)?.trim() ?? ''
  const city = (formData.get('city') as string | null)?.trim() ?? ''
  const licenseNumber = (formData.get('licenseNumber') as string | null)?.trim() ?? ''
  const licenseBody = (formData.get('licenseBody') as string | null)?.trim() ?? ''
  const yearsExperience = parseInt(formData.get('yearsExperience') as string, 10) || 0
  const education = (formData.get('education') as string | null)?.trim() ?? ''
  const specializationsRaw = formData.get('specializations') as string | null
  const languagesRaw = formData.get('languages') as string | null
  const bio = (formData.get('bio') as string | null)?.trim() ?? ''
  const whyZenspace = (formData.get('whyZenspace') as string | null)?.trim() ?? ''

  if (!fullName || !email || !licenseNumber || !bio) {
    return { error: 'Please fill in all required fields.' }
  }
  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  let specializations: string[] = []
  let languages: string[] = []
  try {
    specializations = specializationsRaw ? JSON.parse(specializationsRaw) : []
    languages = languagesRaw ? JSON.parse(languagesRaw) : []
  } catch {
    return { error: 'Invalid form data. Please try again.' }
  }

  if (specializations.length === 0) {
    return { error: 'Please select at least one area of specialisation.' }
  }

  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_applications')
    .insert({
      full_name: fullName,
      email,
      phone: phone || null,
      city: city || null,
      license_number: licenseNumber,
      license_body: licenseBody || null,
      years_experience: yearsExperience,
      education: education || null,
      specializations,
      languages,
      bio,
      why_zenspace: whyZenspace || null,
      status: 'pending',
    })

  if (error) {
    logger.error('therapist/apply', 'Failed to save application', error, { email })
    // Duplicate application
    if (error.code === '23505') {
      return { error: 'An application with this email already exists. We\'ll be in touch soon.' }
    }
    return { error: 'Something went wrong. Please try again or email us directly.' }
  }

  logger.info('therapist/apply', 'Therapist application submitted', { email })
  return { success: true }
}
