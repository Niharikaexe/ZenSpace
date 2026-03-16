'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import type { Database, Json } from '@/types/database'

type QuestionnaireInsert =
  Database['public']['Tables']['questionnaire_responses']['Insert']

type ClientProfileInsert =
  Database['public']['Tables']['client_profiles']['Insert']

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

const questionnaireSchema = z.object({
  primary_concern: z.string().min(1),
  therapy_goals: z.string().min(1),
  gender: z.string().min(1),
  previous_therapy: z.boolean(),
  preferred_therapist_gender: z.string().min(1),
  preferred_session_type: z.enum(['chat', 'video']),
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
    return { error: error.message }
  }

  logger.info('auth/signUp', 'Account created', { userId: signUpData?.user?.id, email, role })

  // Save questionnaire data if present (client sign-ups only)
  const questionnaireRaw = formData.get('questionnaireData')
  if (role === 'client' && questionnaireRaw && signUpData?.user) {
    try {
      const qParsed = questionnaireSchema.safeParse(JSON.parse(String(questionnaireRaw)))

      if (!qParsed.success) {
        logger.warn('auth/signUp', 'Questionnaire validation failed — skipping save', {
          userId: signUpData.user.id,
          reason: qParsed.error.issues[0].message,
        })
      } else {
        const qData = qParsed.data
        const admin = createAdminClient()

        const questionnairePayload: QuestionnaireInsert = {
          client_id: signUpData.user.id,
          responses: qData as unknown as Json,
        }

        const clientProfilePayload: ClientProfileInsert = {
          user_id: signUpData.user.id,
          gender: qData.gender,
          primary_concern: qData.primary_concern,
          therapy_goals: qData.therapy_goals,
          previous_therapy: qData.previous_therapy,
          preferred_therapist_gender: qData.preferred_therapist_gender,
          preferred_session_type: qData.preferred_session_type,
        }

        const { error: qErr } = await (admin as any)
          .from('questionnaire_responses')
          .insert(questionnairePayload)

        if (qErr) {
          logger.error('auth/signUp', 'Failed to save questionnaire_responses', qErr, {
            userId: signUpData.user.id,
          })
        }

        const { error: cpErr } = await (admin as any)
          .from('client_profiles')
          .insert(clientProfilePayload)

        if (cpErr) {
          logger.error('auth/signUp', 'Failed to save client_profiles', cpErr, {
            userId: signUpData.user.id,
          })
        }

        if (!qErr && !cpErr) {
          logger.info('auth/signUp', 'Questionnaire saved', { userId: signUpData.user.id })
        }
      }
    } catch (err) {
      logger.error('auth/signUp', 'Questionnaire save threw unexpected error', err, {
        userId: signUpData.user.id,
      })
    }
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
      .single() as { data: { role: string } | null; error: unknown }

    if (profileErr) {
      logger.error('auth/signIn', 'Failed to fetch profile after sign in', profileErr, { userId: user.id })
    }

    const userRole = profile?.role ?? 'client'
    logger.info('auth/signIn', 'Sign in successful', { userId: user.id, role: userRole })
    redirect(userRole === 'admin' ? '/admin' : userRole === 'therapist' ? '/therapist/dashboard' : '/dashboard')
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.auth.signOut()
  logger.info('auth/signOut', 'User signed out', { userId: user?.id })
  redirect('/login')
}
