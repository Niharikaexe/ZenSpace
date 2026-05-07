'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import type { Database, Json } from '@/types/database'

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
  const parsed = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') ?? 'client',
  })

  if (!parsed.success) {
    logger.warn('auth/signUp', 'Validation failed', { reason: parsed.error.issues[0].message })
    return { error: parsed.error.issues[0].message }
  }

  const { fullName, email, password, role } = parsed.data
  const supabase = await createClient()

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    logger.error('auth/signUp', 'Supabase signUp failed', error, { email, role })
    // Surface a clearer message for the most common config issue
    const message = error.message.toLowerCase().includes('confirmation email')
      ? 'Account creation is temporarily unavailable. Please try again later.'
      : error.message
    return { error: message }
  }

  logger.info('auth/signUp', 'Account created', { userId: signUpData?.user?.id, email, role })

  // Detect whether Supabase immediately created a session (email confirmation disabled)
  // vs sent a confirmation email (confirmation enabled).
  // When a session is returned immediately, signUpData.session is non-null.
  const sessionCreatedImmediately = !!signUpData?.session

  // Save questionnaire data if present (client sign-ups only)
  // Stored in questionnaire_responses table only — not duplicated in client_profiles
  const questionnaireRaw = formData.get('questionnaireData')
  if (role === 'client' && questionnaireRaw && signUpData?.user) {
    try {
      const parsed = JSON.parse(String(questionnaireRaw))
      const admin = createAdminClient()

      const questionnairePayload: QuestionnaireInsert = {
        client_id: signUpData.user.id,
        responses: parsed as Json,
      }

      const { error: qErr } = await (admin as any)
        .from('questionnaire_responses')
        .insert(questionnairePayload)

      if (qErr) {
        logger.error('auth/signUp', 'Failed to save questionnaire_responses', qErr, {
          userId: signUpData.user.id,
        })
      } else {
        logger.info('auth/signUp', 'Questionnaire saved', { userId: signUpData.user.id })
      }
    } catch (err) {
      logger.error('auth/signUp', 'Questionnaire save threw unexpected error', err, {
        userId: signUpData.user.id,
      })
    }
  }

  // If Supabase gave us a session immediately (email confirmation off),
  // redirect straight to the dashboard — no "check your email" needed.
  if (sessionCreatedImmediately) {
    const userRole = signUpData?.user?.user_metadata?.role ?? role
    logger.info('auth/signUp', 'Immediate session — redirecting to dashboard', {
      userId: signUpData?.user?.id,
      role: userRole,
    })
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
    logger.warn('auth/signIn', 'Sign in failed', { email, reason: error.message })
    return { error: error.message }
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
  const admin = createAdminClient()

  // Verify the email is actually registered before sending a reset link.
  // listUsers with service role — acceptable for MVP scale.
  const { data: listData, error: listError } = await (admin as any).auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    logger.error('auth/resetPassword', 'listUsers failed', listError)
    return { error: 'Something went wrong. Please try again.' }
  }

  const registered = (listData?.users as Array<{ email?: string }> ?? [])
    .some(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!registered) {
    return { error: "We don't have an account with that email." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    logger.error('auth/resetPassword', 'Reset email failed', error, { email })
    return { error: error.message }
  }

  logger.info('auth/resetPassword', 'Reset email sent', { email })
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
