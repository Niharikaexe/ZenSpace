'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import type { Database, Json } from '@/types/database'
import { backfillClientProfile } from '@/app/actions/questionnaire'

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
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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
    logger.error('auth/signUp', 'Supabase signUp failed', error, {
      email, role, message: raw, code: err.code, status: err.status ?? err.statusCode,
    })
    // eslint-disable-next-line no-console
    console.error('[auth/signUp] raw error fields', { message: raw, code: err.code, status: err.status })

    // Supabase returns '{}' (or an empty message) when its internal SMTP times out
    // sending the confirmation email. The user row was already created — we just need
    // to confirm it and sign them in directly.
    const isEmailDeliveryError =
      !raw || raw === '{}' || lower.includes('sending') || lower.includes('email rate')

    if (isEmailDeliveryError) {
      logger.warn('auth/signUp', 'Email delivery failed — attempting bypass', { email })

      // The user was likely inserted before the email send timed out.
      // The handle_new_user trigger would have created a profiles row already.
      const { data: existingProfile } = await (admin as any)
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile?.id) {
        // Confirm their email so sign-in works, then sign them in.
        await admin.auth.admin.updateUserById(existingProfile.id, { email_confirm: true })
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) {
          logger.error('auth/signUp', 'Sign-in after email bypass failed', signInErr, { email })
          return { error: 'Account created. Please sign in at /login.' }
        }
        userId = existingProfile.id
      } else {
        // User was NOT created — create fresh with email pre-confirmed.
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role },
        })
        if (createErr) {
          logger.error('auth/signUp', 'Admin createUser fallback failed', createErr, { email })
          return { error: 'Could not create your account. Please try again or contact admin@mindcanopy.in.' }
        }
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) {
          return { error: 'Account created. Please sign in at /login.' }
        }
        userId = newUser?.user?.id
      }

      sessionCreatedImmediately = true
    } else {
      // Not an email delivery error — surface a human-readable message.
      let surfaced = raw
      if (lower.includes('confirmation email') || lower.includes('error sending confirmation')) {
        surfaced = "We couldn't send a confirmation email right now. Try again in an hour, or contact admin@mindcanopy.in."
      } else if (lower.includes('rate limit')) {
        surfaced = 'Too many signup attempts. Please wait a few minutes and try again.'
      } else if (lower.includes('already registered') || lower.includes('user already') || lower.includes('already exists')) {
        surfaced = 'An account with this email already exists. Try signing in instead.'
      } else if (!raw) {
        surfaced = `Sign-up failed (${(err.code as string) ?? (err.status as string) ?? 'unknown'}). Please contact admin@mindcanopy.in.`
      }
      return { error: surfaced }
    }
  }

  logger.info('auth/signUp', 'Account created', { userId, email, role })

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
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
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
