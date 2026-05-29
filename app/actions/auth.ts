'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import type { Database, Json } from '@/types/database'
import { backfillClientProfile } from '@/app/actions/questionnaire'
import { sendAdminNewClientSignupEmail, sendNotificationEmail } from '@/lib/email'

type QuestionnaireInsert =
  Database['public']['Tables']['questionnaire_responses']['Insert']


const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'therapist']).default('client'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})


export type AuthState = {
  error?: string
  success?: boolean
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const validation = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') ?? 'client',
  })

  if (!validation.success) {
    logger.warn('auth/signUp', 'Validation failed', { reason: validation.error.issues[0].message })
    return { error: validation.error.issues[0].message }
  }

  const { fullName, email, password, role } = validation.data
  const therapyCategory = (formData.get('therapyCategory') as string) || 'individual'
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, therapy_category: therapyCategory },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  // userId and sessionCreatedImmediately may be set by either the normal path
  // or the email-delivery-failure bypass below.
  let userId = signUpData?.user?.id
  let sessionCreatedImmediately = !!signUpData?.session

  if (error) {
    const err = error as unknown as Record<string, unknown>
    const raw = error.message || ''
    const lower = raw.toLowerCase()
    const code = err.code as string | undefined
    const status = (err.status ?? err.statusCode) as number | string | undefined

    // Full structured log — keep this verbose so when prod breaks we have
    // enough to diagnose without needing to reproduce.
    logger.error('auth/signUp', 'Supabase signUp failed', error, {
      email, role, message: raw, code, status,
    })
    // eslint-disable-next-line no-console
    console.error('[auth/signUp] raw error fields', { message: raw, code, status })

    // No bypass — if Supabase couldn't create the user or send the email,
    // surface that to the user instead of silently auto-confirming them.
    // Categorize the failure so the surfaced message is actionable.
    const isEmailDeliveryError =
      !raw || raw === '{}' || lower.includes('sending') ||
      lower.includes('confirmation email') || lower.includes('error sending confirmation')
    const isRateLimit = lower.includes('rate limit') || lower.includes('email rate')
    const isAlreadyRegistered =
      lower.includes('already registered') ||
      lower.includes('user already') ||
      lower.includes('already exists')

    if (isEmailDeliveryError) {
      logger.warn('auth/signUp', 'Email delivery failure surfaced to user', { email, code, status })
    } else if (isRateLimit) {
      logger.warn('auth/signUp', 'Rate-limited by Supabase', { email, code, status })
    } else if (isAlreadyRegistered) {
      logger.warn('auth/signUp', 'Duplicate signup attempt', { email })
    } else {
      logger.warn('auth/signUp', 'Uncategorized signUp failure', { email, code, status, message: raw })
    }

    let surfaced = raw
    if (isEmailDeliveryError) {
      surfaced = "We couldn't send your confirmation email right now. Please try again in a few minutes, or contact admin@mindcanopy.in if it keeps happening."
    } else if (isRateLimit) {
      surfaced = 'Too many signup attempts. Please wait a few minutes and try again.'
    } else if (isAlreadyRegistered) {
      surfaced = 'An account with this email already exists. Try signing in instead.'
    } else if (!raw) {
      surfaced = `Sign-up failed (${code ?? status ?? 'unknown'}). Please contact admin@mindcanopy.in.`
    }
    return { error: surfaced }
  }

  // ── Post-signUp verification ────────────────────────────────────────────────
  // supabase.auth.signUp can return { error: null } while either (a) the email
  // is already registered — Supabase obfuscates and returns a user object with
  // an empty `identities` array to prevent enumeration — or (b) the user was
  // never actually persisted. In both cases the old code returned success,
  // showing the success screen to a user who has no DB row and no email. We
  // explicitly verify here and surface a real error if anything is off.

  if (!userId) {
    logger.error('auth/signUp', 'signUp returned no user ID despite no error', null, { email, role })
    return { error: 'Sign-up did not complete. Please try again or contact admin@mindcanopy.in.' }
  }

  // Empty identities array → existing-email obfuscation.
  const identities = signUpData?.user?.identities
  if (Array.isArray(identities) && identities.length === 0) {
    logger.warn('auth/signUp', 'Empty identities array — email already registered (obfuscated)', { email, userId })
    return { error: 'An account with this email already exists. Try signing in instead.' }
  }

  // Confirm the auth.users row actually persisted.
  const { data: verifyAuth, error: verifyAuthErr } = await admin.auth.admin.getUserById(userId)
  if (verifyAuthErr || !verifyAuth?.user) {
    logger.error('auth/signUp', 'auth.users row missing after signUp', verifyAuthErr, { email, userId })
    return { error: 'Sign-up did not complete. Please try again or contact admin@mindcanopy.in.' }
  }

  // Confirm the profiles row exists. handle_new_user trigger runs on auth.users
  // INSERT, so it should already be there. Missing row → trigger failed.
  const { data: profileRow, error: profileLookupErr } = await (admin as any)
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (profileLookupErr) {
    logger.error('auth/signUp', 'Failed to look up profile after signUp', profileLookupErr, { email, userId })
    return { error: 'Sign-up did not complete. Please try again or contact admin@mindcanopy.in.' }
  }
  if (!profileRow) {
    logger.error('auth/signUp', 'profiles row missing after signUp — handle_new_user trigger may have failed', null, { email, userId })
    return { error: 'Sign-up did not complete. Please try again or contact admin@mindcanopy.in.' }
  }

  logger.info('auth/signUp', 'Account created', { userId, email, role })

  if (role === 'client') {
    // Notify admin now. The client welcome email ("Go to your dashboard") is
    // deliberately NOT sent here — during signup it arrives before the user has
    // confirmed their email and reads like a verification email. It's sent once
    // the account is actually active: in the immediate-session branch below
    // (when email confirmation is disabled in Supabase) or in /auth/callback
    // (after the user clicks the verification link).
    await sendAdminNewClientSignupEmail(fullName, email)
  }

  // Save questionnaire data if present (client sign-ups only)
  const questionnaireRaw = formData.get('questionnaireData')
  if (role === 'client' && questionnaireRaw && userId) {
    try {
      const questionnaireJson = JSON.parse(String(questionnaireRaw))

      const questionnairePayload: QuestionnaireInsert = {
        client_id: userId,
        responses: questionnaireJson as Json,
      }

      const { error: qErr } = await (admin as any)
        .from('questionnaire_responses')
        .insert(questionnairePayload)

      if (qErr) {
        logger.error('auth/signUp', 'Failed to save questionnaire_responses', qErr, { userId })
      } else {
        logger.info('auth/signUp', 'Questionnaire saved', { userId })
        await backfillClientProfile(userId, questionnaireJson as { type: string; answers: Record<string, unknown> })
      }
    } catch (err) {
      logger.error('auth/signUp', 'Questionnaire save threw unexpected error', err, { userId })
    }
  }

  if (sessionCreatedImmediately) {
    // Email confirmation is disabled in Supabase, so the account is active
    // immediately and no /auth/callback will fire. Send the welcome email now.
    if (role === 'client') {
      const firstName = fullName.split(' ')[0] || 'there'
      await sendNotificationEmail({ to: email, name: firstName, type: 'client_welcome', meta: {} })
    }
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userRole = currentUser?.user_metadata?.role ?? role
    logger.info('auth/signUp', 'Immediate session — redirecting to dashboard', { userId, role: userRole })
    redirect(
      userRole === 'admin' ? '/admin' :
      userRole === 'therapist' ? '/therapist/dashboard' :
      '/dashboard'
    )
  }

  return { success: true }
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    logger.warn('auth/signIn', 'Validation failed', { reason: parsed.error.issues[0].message })
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const err = error as unknown as Record<string, unknown>
    const diag = {
      message: error.message,
      code: err.code,
      status: err.status ?? err.statusCode,
    }
    logger.warn('auth/signIn', 'Sign in failed', { email, ...diag })
    // eslint-disable-next-line no-console
    console.error('[auth/signIn] raw error fields', diag)

    const lower = (error.message || '').toLowerCase()
    let surfaced = error.message
    if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
      surfaced = "We've sent you a confirmation email — please click the link in it before signing in. Check spam, or contact admin@mindcanopy.in if it never arrived."
    } else if (lower.includes('invalid login')) {
      surfaced = 'Email or password is incorrect.'
    } else if (!error.message) {
      surfaced = `Sign-in failed (${(err.code as string) ?? (err.status as string) ?? 'unknown'}). Please contact admin@mindcanopy.in.`
    }
    return { error: surfaced }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle() as { data: { role: string } | null; error: unknown }

    if (profileErr) {
      logger.error('auth/signIn', 'Failed to fetch profile after sign in', profileErr, { userId: user.id })
    }

    // Safety net: profile missing (user created before schema was applied) — create it now
    if (!profile) {
      logger.warn('auth/signIn', 'Profile row missing — creating via admin client', { userId: user.id })
      const admin = createAdminClient()
      const { error: upsertErr } = await (admin as any).from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email ?? 'User',
        role: (user.user_metadata?.role as string) ?? 'client',
      })
      if (upsertErr) {
        logger.error('auth/signIn', 'Failed to upsert missing profile', upsertErr, { userId: user.id })
      } else {
        logger.info('auth/signIn', 'Missing profile created', { userId: user.id })
      }
    }

    const userRole = profile?.role ?? (user.user_metadata?.role as string) ?? 'client'
    logger.info('auth/signIn', 'Sign in successful', { userId: user.id, role: userRole })
    redirect(userRole === 'admin' ? '/admin' : userRole === 'therapist' ? '/therapist/dashboard' : '/dashboard')
  }

  redirect('/dashboard')
}

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data

  // Always call resetPasswordForEmail regardless of whether the email is registered.
  // Supabase silently no-ops for unknown emails — this prevents user enumeration.
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    logger.error('auth/resetPassword', 'Reset email failed', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  logger.info('auth/resetPassword', 'Reset email requested', { email })
  return { success: true }
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get('password') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    logger.error('auth/updatePassword', 'Password update failed', error)
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .maybeSingle() as { data: { role: string } | null; error: unknown }

  logger.info('auth/updatePassword', 'Password updated', { userId: user?.id })
  const role = profile?.role ?? (user?.user_metadata?.role as string) ?? 'client'
  redirect(role === 'admin' ? '/admin' : role === 'therapist' ? '/therapist/dashboard' : '/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.auth.signOut()
  logger.info('auth/signOut', 'User signed out', { userId: user?.id })
  redirect('/login')
}
