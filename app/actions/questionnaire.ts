'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { Json } from '@/types/database'

type QuestionnaireData = { type: string; answers: Record<string, unknown> }

type QuestionnaireInsert = {
  client_id: string
  responses: Json
}

// ── client_profiles backfill ──────────────────────────────────────────────────
// Maps the relevant questionnaire answers to client_profiles columns so the
// admin match modal has structured data to work with.

function joinArray(v: unknown): string | null {
  if (Array.isArray(v)) return (v as string[]).join(', ') || null
  if (typeof v === 'string') return v || null
  return null
}

function deriveClientProfileFields(data: QuestionnaireData): Record<string, unknown> {
  const { type, answers } = data

  if (type === 'individual') {
    // q1: what's been going on (multi-select) → primary_concern
    // q4: spoken to anyone before → previous_therapy
    // q7: anything for therapist to know → therapy_goals (free text)
    // q8: therapist gender preference
    // q10: successful therapy looks like → therapy_goals (structured)
    // q11: video call comfort → preferred_session_type
    const therapyGoals = typeof answers.q10 === 'string' && answers.q10
      ? answers.q10
      : (typeof answers.q7 === 'string' ? answers.q7 : null)

    return {
      primary_concern: joinArray(answers.q1),
      therapy_goals: therapyGoals || null,
      previous_therapy: typeof answers.q4 === 'string' && answers.q4.startsWith('Yes — a therapist'),
      preferred_therapist_gender: typeof answers.q8 === 'string' ? answers.q8 : null,
      preferred_session_type: answers.q11 === 'Completely comfortable' ? 'video' : 'chat',
    }
  }

  if (type === 'couples') {
    // q3: what brought you here (multi-select) → primary_concern
    // q9: therapist gender preference
    // q10: prior therapy
    // q11: success definition → therapy_goals
    return {
      primary_concern: joinArray(answers.q3),
      therapy_goals: typeof answers.q11 === 'string' ? answers.q11 : null,
      previous_therapy: typeof answers.q10 === 'string' && answers.q10.toLowerCase().includes('yes'),
      preferred_therapist_gender: typeof answers.q9 === 'string' ? answers.q9 : null,
    }
  }

  if (type === 'teen') {
    // q1: what made you decide to try this (multi-select) → primary_concern
    // q6: talked to anyone before → previous_therapy
    // q7: what to know before meeting (multi-select) → therapy_goals
    return {
      primary_concern: joinArray(answers.q1),
      therapy_goals: joinArray(answers.q7),
      previous_therapy: typeof answers.q6 === 'string' && answers.q6.includes('been to therapy'),
    }
  }

  return {}
}

export async function backfillClientProfile(userId: string, data: QuestionnaireData): Promise<void> {
  const fields = deriveClientProfileFields(data)
  if (Object.keys(fields).length === 0) return

  const admin = createAdminClient()
  const { error } = await (admin as any)
    .from('client_profiles')
    .upsert({ user_id: userId, ...fields }, { onConflict: 'user_id' })

  if (error) {
    logger.error('questionnaire/backfill', 'Failed to upsert client_profiles', error, { userId })
  } else {
    logger.info('questionnaire/backfill', 'client_profiles backfilled', { userId, type: data.type })
  }
}

// ── saveQuestionnaire ─────────────────────────────────────────────────────────

export async function saveQuestionnaire(data: unknown): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Delete any existing row first (no UNIQUE constraint on client_id in schema),
  // then insert fresh — ensures at most one row per client.
  await (admin as any)
    .from('questionnaire_responses')
    .delete()
    .eq('client_id', user.id)

  const payload: QuestionnaireInsert = {
    client_id: user.id,
    responses: data as Json,
  }

  const { error } = await (admin as any)
    .from('questionnaire_responses')
    .insert(payload)

  if (error) {
    logger.error('questionnaire/save', 'Failed to save questionnaire', error, { userId: user.id })
    return { error: 'Failed to save. Please try again.' }
  }

  // B-12/B-13: backfill client_profiles so admin match modal has structured data
  await backfillClientProfile(user.id, data as QuestionnaireData)

  logger.info('questionnaire/save', 'Questionnaire saved for authenticated user', { userId: user.id })
  return {}
}
