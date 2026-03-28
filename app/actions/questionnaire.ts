'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { Json } from '@/types/database'

type QuestionnaireInsert = {
  client_id: string
  responses: Json
}

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

  logger.info('questionnaire/save', 'Questionnaire saved for authenticated user', { userId: user.id })
  return {}
}
