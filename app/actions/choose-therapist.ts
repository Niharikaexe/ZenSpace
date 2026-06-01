'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'
import { logger } from '@/lib/logger'

const schema = z.string().uuid()

/**
 * Client picks one of their proposed (pending) therapists via "Start a free chat".
 *
 * Flips the chosen match to `active`, ends every other pending proposal for this
 * client, notifies the chosen therapist, and redirects to the chat. Returns an
 * `{ error }` object on validation/ownership failure (success path redirects).
 */
export async function chooseTherapist(matchId: string): Promise<{ error: string } | void> {
  const parsed = schema.safeParse(matchId)
  if (!parsed.success) return { error: 'Invalid request.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Load the proposed match and verify ownership + state (IDOR guard).
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, therapist_id, status')
    .eq('id', parsed.data)
    .maybeSingle() as {
      data: { id: string; client_id: string; therapist_id: string; status: string } | null
      error: unknown
    }

  if (!match || match.client_id !== user.id) {
    logger.warn('choose-therapist', 'Match not found or not owned by caller', {
      userId: user.id,
      matchId: parsed.data,
    })
    return { error: 'We couldn’t find that therapist. Refresh and try again.' }
  }

  // If the client already started a chat (active match exists), just send them in.
  if (match.status === 'active') {
    redirect('/dashboard/chat')
  }

  if (match.status !== 'pending') {
    return { error: 'This match is no longer available. Refresh to see your current matches.' }
  }

  // End every other pending proposal for this client first, so only the chosen
  // one becomes active (the partial unique index allows a single active match).
  const { error: endErr } = await (admin as any)
    .from('matches')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('client_id', user.id)
    .eq('status', 'pending')
    .neq('id', match.id)

  if (endErr) {
    logger.error('choose-therapist', 'Failed to end sibling proposals', endErr, { userId: user.id })
    return { error: 'Something went wrong. Please try again.' }
  }

  // Activate the chosen match.
  const { error: activateErr } = await (admin as any)
    .from('matches')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', match.id)

  if (activateErr) {
    logger.error('choose-therapist', 'Failed to activate chosen match', activateErr, {
      userId: user.id,
      matchId: match.id,
    })
    return { error: 'Something went wrong. Please try again.' }
  }

  // Notify the chosen therapist (fire-and-forget).
  const { data: clientProfile } = await (admin as any)
    .from('profiles').select('full_name').eq('id', user.id).single() as {
      data: { full_name: string } | null; error: unknown
    }
  const clientName = clientProfile?.full_name ?? 'A new client'

  createNotification({
    userId: match.therapist_id,
    type: 'client_matched',
    title: 'New client matched',
    body: `${clientName} chose you and started a free chat. Say hello when you can.`,
    metadata: { clientId: user.id, clientName },
  }).catch((err) => logger.error('choose-therapist', 'Failed to notify therapist', err))

  logger.info('choose-therapist', 'Client chose therapist', {
    userId: user.id,
    matchId: match.id,
    therapistId: match.therapist_id,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard/chat')
}
