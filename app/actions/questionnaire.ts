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

// Maps a session-format answer label to the stored code ('chat'|'video'|'either').
function sessionFormat(v: unknown): string | null {
  if (typeof v !== 'string' || !v) return null
  if (/video/i.test(v)) return 'video'
  if (/either|both|no preference/i.test(v)) return 'either'
  if (/chat|text|message/i.test(v)) return 'chat'
  return null
}

// Legacy preferred_session_type is the chat|video enum (cannot express 'either').
// Mirror the captured format into it when it's chat/video, otherwise null — so the
// column reflects real input instead of its misleading 'chat' default.
function sessionTypeEnum(format: string | null): 'chat' | 'video' | null {
  return format === 'chat' || format === 'video' ? format : null
}

function deriveClientProfileFields(data: QuestionnaireData): Record<string, unknown> {
  const { type, answers } = data

  if (type === 'individual') {
    // q1: what's bringing you here (single)
    // q2: main themes (multi) → primary_concern
    // q3: support type (single) → therapy_goals
    // q12: past therapy Y/N → previous_therapy
    // q13: gender preference
    const therapyGoals = typeof answers.q3 === 'string' && answers.q3
      ? answers.q3
      : (typeof answers.q1 === 'string' ? answers.q1 : null)

    const fmt = sessionFormat(answers.q16)
    return {
      primary_concern: joinArray(answers.q2),
      therapy_goals: therapyGoals || null,
      previous_therapy: answers.q12 === 'Yes',
      preferred_therapist_gender: typeof answers.q13 === 'string' ? answers.q13 : null,
      preferred_session_format: fmt,
      preferred_session_type: sessionTypeEnum(fmt),
    }
  }

  if (type === 'couples') {
    // Couples data shape: { type, attendingAlone, common, partner1, partner2? }
    // common.c6: areas of conflict (multi) → primary_concern
    // common.c9: goals (multi) → therapy_goals
    // common.c10: past couples counseling → previous_therapy (anything other than "No")
    // common.c11: gender preference
    const common = (data as unknown as { common?: Record<string, unknown> }).common ?? {}
    const fmt = sessionFormat(common.c14)
    return {
      primary_concern: joinArray(common.c6),
      therapy_goals: joinArray(common.c9),
      previous_therapy: typeof common.c10 === 'string' && common.c10 !== 'No' && common.c10 !== '',
      preferred_therapist_gender: typeof common.c11 === 'string' ? common.c11 : null,
      preferred_session_format: fmt,
      preferred_session_type: sessionTypeEnum(fmt),
    }
  }

  if (type === 'teen') {
    // q15: main themes (multi) → primary_concern
    // q17: past therapy Y/N → previous_therapy
    // q18: anything else (text) → therapy_goals
    const fmt = sessionFormat(answers.q20)
    return {
      primary_concern: joinArray(answers.q15),
      therapy_goals: typeof answers.q18 === 'string' && answers.q18 ? answers.q18 : null,
      previous_therapy: answers.q17 === 'Yes',
      preferred_session_format: fmt,
      preferred_session_type: sessionTypeEnum(fmt),
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
