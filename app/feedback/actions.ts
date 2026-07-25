'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Saving post-session feedback.
//
// Identity comes from the session's own UUID, carried in the email link. It is
// unguessable and scoped to exactly one session, so the client does not have to
// be logged in — which matters because mail apps open links in their own browser
// with no session cookie.
//
// Writes go through the service-role client on purpose: the row is validated and
// stamped here rather than trusting a client-side insert.

const RATING = z.coerce.number().int().min(1).max(5)
const HEARD = z.enum(['yes', 'somewhat', 'no'])
const AGAIN = z.enum(['yes', 'unsure', 'switch'])

export interface FeedbackState {
  rating: number | null
  feltHeard: 'yes' | 'somewhat' | 'no' | null
  bookAgain: 'yes' | 'unsure' | 'switch' | null
  note: string | null
  submitted: boolean
}

export interface FeedbackContext {
  ok: boolean
  therapistFirstName: string
  sessionDate: string | null
  existing: FeedbackState | null
  error?: string
}

/** Resolve the session behind a feedback link, plus any answers already given. */
export async function loadFeedbackContext(sessionId: string): Promise<FeedbackContext> {
  const parsed = z.string().uuid().safeParse(sessionId)
  if (!parsed.success) {
    return { ok: false, therapistFirstName: '', sessionDate: null, existing: null, error: 'invalid' }
  }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session } = await (admin as any)
    .from('sessions')
    .select('id, match_id, scheduled_at')
    .eq('id', sessionId)
    .maybeSingle() as { data: { id: string; match_id: string; scheduled_at: string } | null; error: unknown }

  if (!session) {
    return { ok: false, therapistFirstName: '', sessionDate: null, existing: null, error: 'not_found' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', session.match_id)
    .maybeSingle() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  let therapistFirstName = 'your therapist'
  if (match?.therapist_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: p } = await (admin as any)
      .from('profiles').select('full_name').eq('id', match.therapist_id).maybeSingle() as
      { data: { full_name: string | null } | null; error: unknown }
    therapistFirstName = p?.full_name?.split(' ')[0] ?? therapistFirstName
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: fb } = await (admin as any)
    .from('session_feedback')
    .select('rating, felt_heard, book_again, note, submitted_at')
    .eq('session_id', sessionId)
    .maybeSingle() as {
      data: { rating: number | null; felt_heard: string | null; book_again: string | null; note: string | null; submitted_at: string | null } | null
      error: unknown
    }

  return {
    ok: true,
    therapistFirstName,
    sessionDate: session.scheduled_at,
    existing: fb
      ? {
          rating: fb.rating,
          feltHeard: (fb.felt_heard as FeedbackState['feltHeard']) ?? null,
          bookAgain: (fb.book_again as FeedbackState['bookAgain']) ?? null,
          note: fb.note,
          submitted: !!fb.submitted_at,
        }
      : null,
  }
}

/**
 * Upsert the answers from the feedback page.
 *
 * Only fields actually supplied are written, so re-submitting with one question
 * left blank never wipes an answer already given. The columns are all nullable
 * for the same reason: a rating with no note is a perfectly useful response.
 */
export async function saveFeedback(input: {
  sessionId: string
  rating?: unknown
  feltHeard?: unknown
  bookAgain?: unknown
  note?: unknown
  final?: boolean
}): Promise<{ ok: boolean; error?: string }> {
  const sid = z.string().uuid().safeParse(input.sessionId)
  if (!sid.success) return { ok: false, error: 'That feedback link is not valid.' }

  const rating = RATING.safeParse(input.rating)
  const heard = HEARD.safeParse(input.feltHeard)
  const again = AGAIN.safeParse(input.bookAgain)
  const noteRaw = typeof input.note === 'string' ? input.note.trim().slice(0, 4000) : ''

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session } = await (admin as any)
    .from('sessions')
    .select('id, match_id')
    .eq('id', sid.data)
    .maybeSingle() as { data: { id: string; match_id: string } | null; error: unknown }

  if (!session) return { ok: false, error: 'We could not find that session.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', session.match_id)
    .maybeSingle() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  const now = new Date().toISOString()

  // Only include fields we actually received, so a later partial save never
  // nulls an earlier answer.
  const patch: Record<string, unknown> = {
    session_id: sid.data,
    match_id: session.match_id,
    client_id: match?.client_id ?? null,
    therapist_id: match?.therapist_id ?? null,
    first_answered_at: now,
  }
  if (rating.success) patch.rating = rating.data
  if (heard.success) patch.felt_heard = heard.data
  if (again.success) patch.book_again = again.data
  if (noteRaw) patch.note = noteRaw
  if (input.final) patch.submitted_at = now

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('session_feedback')
    .upsert(patch, { onConflict: 'session_id' })

  if (error) {
    logger.error('feedback/save', 'Failed to save feedback', error, { sessionId: sid.data })
    return { ok: false, error: 'We could not save that. Please try again.' }
  }

  logger.info('feedback/save', 'Feedback saved', {
    sessionId: sid.data,
    hasRating: rating.success,
    final: !!input.final,
  })
  return { ok: true }
}

/** Form submit from the page. */
export async function submitFeedback(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  return saveFeedback({
    sessionId: String(formData.get('sessionId') ?? ''),
    rating: formData.get('rating') ?? undefined,
    feltHeard: formData.get('feltHeard') ?? undefined,
    bookAgain: formData.get('bookAgain') ?? undefined,
    note: formData.get('note') ?? undefined,
    final: true,
  })
}
