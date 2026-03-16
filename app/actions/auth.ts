'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
    return { error: error.message }
  }

  // Save questionnaire data if present (client sign-ups only)
  const questionnaireRaw = formData.get('questionnaireData')
  if (role === 'client' && questionnaireRaw && signUpData?.user) {
    try {
      const qParsed = questionnaireSchema.safeParse(JSON.parse(String(questionnaireRaw)))
      if (qParsed.success) {
        const qData = qParsed.data
        const admin = createAdminClient()

        const questionnairePayload: QuestionnaireInsert = {
          client_id: signUpData.user.id,
          responses: qData as Json,
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

        // Save full questionnaire JSON (cast to any to avoid client type inference issues)
        await (admin as any)
          .from('questionnaire_responses')
          .insert(questionnairePayload)

        // Save structured fields to client_profiles
        await (admin as any)
          .from('client_profiles')
          .insert(clientProfilePayload)
      }
    } catch {
      // Non-fatal: questionnaire save failed, account still created
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
    return { error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Get role for redirect
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null, error: unknown }

    const userRole = profile?.role ?? 'client'
    redirect(userRole === 'admin' ? '/admin' : userRole === 'therapist' ? '/therapist/dashboard' : '/dashboard')
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
