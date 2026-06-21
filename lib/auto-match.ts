// Server-side utility — call from server actions / route handlers only.
// Auto-matches a newly verified client to a therapist and seeds the chat with a
// greeting. Mirrors the conventions in lib/notifications.ts.

import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { normalizeSessionCategory } from '@/lib/plans'
import { logger } from '@/lib/logger'

// Therapists that must never receive an auto-match (e.g. the owner's own test/
// admin account that also has a therapist profile). Compared case-insensitively
// against profiles.email. Hard-coded on purpose.
const EXCLUDED_THERAPIST_EMAILS = new Set<string>([
  'nikki1339999@gmail.com',
])

/**
 * Auto-match a newly verified client to a therapist.
 *
 * Picks the next therapist round-robin (least-loaded) across all verified
 * therapists who accept new clients — for two therapists this alternates
 * A, B, A, B… — creates an `active` match, and seeds the chat with a greeting
 * from the therapist ("Hi I'm <name>, How are you?").
 *
 * Idempotent and best-effort: it never throws and no-ops if the client already
 * has an active/pending match or if no therapist is eligible, so a failure here
 * can never break signup/verification. The admin can still match manually if
 * this no-ops.
 */
export async function autoMatchClient(clientId: string): Promise<void> {
  try {
    const admin = createAdminClient()

    // Idempotency: skip if the client already has an active or pending match
    // (e.g. admin matched them first, or this fired twice).
    const { data: existing } = await (admin as any)
      .from('matches')
      .select('id')
      .eq('client_id', clientId)
      .in('status', ['active', 'pending'])
      .limit(1) as { data: { id: string }[] | null; error: unknown }

    if (existing && existing.length > 0) {
      logger.info('auto-match', 'Client already has an active/pending match — skipping', { clientId })
      return
    }

    // Eligible therapists: verified + accepting new clients. Stable order by
    // user_id so the least-loaded tie-break is deterministic.
    const { data: therapists } = await (admin as any)
      .from('therapist_profiles')
      .select('user_id')
      .eq('is_verified', true)
      .eq('accepts_new_clients', true)
      .order('user_id', { ascending: true }) as { data: { user_id: string }[] | null; error: unknown }

    let candidates = (therapists ?? []).map((t) => t.user_id).filter(Boolean) as string[]

    // Drop hard-excluded therapists (matched by email via their profile row).
    if (candidates.length > 0 && EXCLUDED_THERAPIST_EMAILS.size > 0) {
      const { data: profileEmails } = await (admin as any)
        .from('profiles')
        .select('id, email')
        .in('id', candidates) as { data: { id: string; email: string | null }[] | null; error: unknown }

      const excludedIds = new Set(
        (profileEmails ?? [])
          .filter((p) => p.email && EXCLUDED_THERAPIST_EMAILS.has(p.email.trim().toLowerCase()))
          .map((p) => p.id),
      )
      candidates = candidates.filter((id) => !excludedIds.has(id))
    }

    if (candidates.length === 0) {
      logger.warn('auto-match', 'No eligible therapists after exclusions — leaving client pending for manual match', { clientId })
      return
    }

    // Round-robin via least-loaded: count every match each candidate has ever had
    // and assign the client to the one with the fewest. For two therapists this
    // alternates evenly.
    const { data: allMatches } = await (admin as any)
      .from('matches')
      .select('therapist_id')
      .in('therapist_id', candidates) as { data: { therapist_id: string }[] | null; error: unknown }

    const counts = new Map<string, number>(candidates.map((id) => [id, 0]))
    for (const m of allMatches ?? []) {
      counts.set(m.therapist_id, (counts.get(m.therapist_id) ?? 0) + 1)
    }

    let therapistId = candidates[0]
    let min = counts.get(therapistId) ?? 0
    for (const id of candidates) {
      const c = counts.get(id) ?? 0
      if (c < min) {
        min = c
        therapistId = id
      }
    }

    const now = new Date().toISOString()

    // Create the active match. matched_by is null — this is system-assigned, not
    // an admin match.
    const { data: inserted, error: matchErr } = await (admin as any)
      .from('matches')
      .insert({
        client_id: clientId,
        therapist_id: therapistId,
        status: 'active',
        started_at: now,
        created_at: now,
        notes: 'Auto-matched on signup',
      })
      .select('id')
      .single() as { data: { id: string } | null; error: unknown }

    if (matchErr || !inserted) {
      // The partial unique index (one active match per client) rejects a second
      // active match if a concurrent run beat us — treat that as "already
      // matched", not a hard failure.
      logger.warn('auto-match', 'Failed to create auto-match (possibly raced)', {
        clientId,
        therapistId,
        error: (matchErr as { message?: string } | null)?.message,
      })
      return
    }

    // Names for the greeting + notifications.
    const { data: profiles } = await (admin as any)
      .from('profiles')
      .select('id, full_name')
      .in('id', [clientId, therapistId]) as { data: { id: string; full_name: string }[] | null; error: unknown }

    const therapistFullName = (profiles ?? []).find((p) => p.id === therapistId)?.full_name ?? 'your therapist'
    const clientName = (profiles ?? []).find((p) => p.id === clientId)?.full_name ?? 'A new client'
    const therapistFirstName = therapistFullName.split(' ')[0] || 'there'

    // Client's category drives the first-session offer shown in the matched email.
    const { data: cQ } = await (admin as any)
      .from('questionnaire_responses')
      .select('responses')
      .eq('client_id', clientId)
      .maybeSingle() as { data: { responses: Record<string, unknown> } | null; error: unknown }
    const category = normalizeSessionCategory(cQ?.responses?.type)

    // Seed the chat with a greeting from the therapist.
    const { error: msgErr } = await (admin as any)
      .from('messages')
      .insert({
        match_id: inserted.id,
        sender_id: therapistId,
        content: `Hi I'm ${therapistFirstName}, How are you?`,
        message_type: 'text',
      })

    if (msgErr) {
      logger.error('auto-match', 'Failed to seed greeting message', msgErr, { clientId, matchId: inserted.id })
    }

    logger.info('auto-match', 'Client auto-matched', {
      clientId,
      therapistId,
      matchId: inserted.id,
      candidateCount: candidates.length,
    })

    // Notify both sides (await: on serverless the caller redirects right after,
    // which kills any still-pending promise).
    await Promise.allSettled([
      createNotification({
        userId: clientId,
        type: 'client_welcome_matched',
        title: `Welcome — meet ${therapistFirstName}`,
        body: `You’ve been matched with ${therapistFirstName}. They’ve already said hello — open your free chat whenever you’re ready.`,
        metadata: { therapistId, therapistFirstName, therapistFullName, adminMatchNote: '', category },
      }),
      createNotification({
        userId: therapistId,
        type: 'client_matched',
        title: 'New client matched',
        body: `${clientName} has been matched with you. Say hello when you can.`,
        metadata: { clientId, clientName },
      }),
    ])
  } catch (err) {
    logger.error('auto-match', 'Auto-match threw — client left for manual match', err, { clientId })
  }
}
