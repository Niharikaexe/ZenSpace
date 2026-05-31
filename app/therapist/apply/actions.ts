'use server'

import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendNewApplicationAdminEmail, sendApplicationReceivedEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mindcanopy.in'

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
  const state = (formData.get('state') as string | null)?.trim() ?? ''
  const country = (formData.get('country') as string | null)?.trim() ?? ''
  const dateOfBirth = (formData.get('dateOfBirth') as string | null)?.trim() ?? ''
  const gender = (formData.get('gender') as string | null)?.trim() ?? ''
  const ethnicity = (formData.get('ethnicity') as string | null)?.trim() ?? ''
  const linkedinUrl = (formData.get('linkedinUrl') as string | null)?.trim() ?? ''
  const yearsExperience = parseInt(formData.get('yearsExperience') as string, 10) || 0
  const education = (formData.get('education') as string | null)?.trim() ?? ''
  const expectedSalaryRaw = (formData.get('expectedSalary') as string | null)?.trim() ?? ''
  const expectedSalary = expectedSalaryRaw === '' ? null : Number(expectedSalaryRaw)
  const expectedSalaryCurrencyRaw = (formData.get('expectedSalaryCurrency') as string | null)?.trim() ?? 'INR'
  const expectedSalaryCurrency = expectedSalaryCurrencyRaw === 'USD' ? 'USD' : 'INR'
  const specializationsRaw = formData.get('specializations') as string | null
  const specializationOther = (formData.get('specializationOther') as string | null)?.trim() ?? ''
  const languagesRaw = formData.get('languages') as string | null
  const whyMindcanopy = (formData.get('whyMindcanopy') as string | null)?.trim() ?? ''
  const cvUrl = (formData.get('cvUrl') as string | null)?.trim() ?? ''
  const certificateUrlsRaw = formData.get('certificateUrls') as string | null

  if (!fullName || !email || !phone || !city || !state || !country || !dateOfBirth || !gender || !ethnicity) {
    return { error: 'Please fill in all required fields.' }
  }
  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }
  if (expectedSalary === null || !Number.isFinite(expectedSalary) || expectedSalary <= 0) {
    return { error: 'Please enter your expected monthly salary.' }
  }

  let specializations: string[] = []
  let languages: string[] = []
  let certificateUrls: string[] = []
  try {
    specializations = specializationsRaw ? JSON.parse(specializationsRaw) : []
    languages = languagesRaw ? JSON.parse(languagesRaw) : []
    certificateUrls = certificateUrlsRaw ? JSON.parse(certificateUrlsRaw) : []
  } catch (err) {
    logger.warn('therapist/apply', 'Invalid JSON in application form fields', {
      err: err instanceof Error ? err.message : String(err),
    })
    return { error: 'Invalid form data. Please try again.' }
  }

  if (specializations.length === 0 && !specializationOther) {
    return { error: 'Please select at least one area of specialisation.' }
  }

  const admin = createAdminClient()

  // One-time token used to verify the email address provided in this application.
  const emailVerificationToken = randomBytes(32).toString('hex')

  const { error } = await (admin as any)
    .from('therapist_applications')
    .insert({
      full_name: fullName,
      email,
      phone,
      city,
      state,
      country,
      date_of_birth: dateOfBirth,
      gender,
      ethnicity,
      linkedin_url: linkedinUrl || null,
      years_experience: yearsExperience,
      education: education || null,
      expected_salary: expectedSalary,
      expected_salary_currency: expectedSalaryCurrency,
      specializations,
      specialization_other: specializationOther || null,
      languages,
      why_mindcanopy: whyMindcanopy || null,
      cv_url: cvUrl || null,
      certificate_urls: certificateUrls,
      status: 'pending',
      email_verification_token: emailVerificationToken,
    })

  if (error) {
    logger.error('therapist/apply', 'Failed to save application', error, { email })
    // eslint-disable-next-line no-console
    console.error('[therapist/apply] insert failed', {
      code: (error as any).code,
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      payloadKeys: {
        fullName: !!fullName,
        email: !!email,
        phone: !!phone,
        city: !!city,
        state: !!state,
        country: !!country,
        date_of_birth: dateOfBirth,
        gender,
        ethnicity,
        specializations,
        languages,
        certificateUrls,
        cvUrl,
      },
    })
    if ((error as any).code === '23505') {
      return { error: 'An application with this email already exists. We\'ll be in touch soon.' }
    }
    const msg = (error as any).message || 'unknown error'
    return { error: `Submission failed: ${msg}. Please try again or email us at admin@mindcanopy.in.` }
  }

  logger.info('therapist/apply', 'Therapist application submitted', { email })

  // Send the applicant a confirmation email with the verify-email link.
  // Best-effort — log failure but don't block the success response.
  const verifyUrl = `${SITE_URL}/therapist/verify-email?token=${emailVerificationToken}`
  await sendApplicationReceivedEmail({ to: email, name: fullName, verifyUrl })

  // Notify admin — non-blocking, best-effort
  await sendNewApplicationAdminEmail(fullName)

  return { success: true }
}
