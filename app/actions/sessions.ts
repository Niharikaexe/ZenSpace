'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { z } from 'zod'
import { createNotification, shouldNotifyMessage } from '@/lib/notifications'
import { scanText } from '@/lib/message-flags'
import { logger } from '@/lib/logger'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { user, supabase }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

const INTRO_MESSAGE_LIMIT = 25 // free intro chat: client + therapist messages combined

export async function sendMessage(matchId: string, content: string): Promise<{ error?: string }> {
  const { user, supabase } = await getAuthUser()
  const trimmed = content.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }

  // Identify the sender's role from the MATCH itself (authoritative — the
  // matches table, not spoofable user_metadata/JWT claims). This replaces a
  // separate profiles.role lookup and is reused for the notification below.
  // The free-intro limit applies only to the client of this match; therapists
  // are never gated.
  const admin = createAdminClient()
  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', matchId)
    .single() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  if (match && user.id === match.client_id) {
    // Free intro chat: 25 messages total (client + therapist combined), no
    // time window. Once the conversation reaches 25 messages, the client must
    // have booked (and paid for) at least one session to keep chatting —
    // pay-as-you-go, no subscription.
    const { count } = await (admin as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId) as { count: number | null; error: unknown }

    if ((count ?? 0) >= INTRO_MESSAGE_LIMIT) {
      const { count: paidSessions } = await (admin as any)
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', matchId)
        .eq('payment_status', 'paid') as { count: number | null; error: unknown }

      if ((paidSessions ?? 0) === 0) return { error: 'session_required' }
    }
  }

  const { data: inserted, error } = await (supabase as any).from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    content: trimmed,
    message_type: 'text',
  }).select('id').single()

  if (error) return { error: error.message }

  // Policy/safety scan runs AFTER the response (never on the send path), so it
  // adds zero latency to sending. Only flagged messages incur a follow-up write;
  // clean messages (the common case) cost nothing. Admin sees categories, not text.
  if (inserted?.id) {
    // async callback → after() awaits it, so the flag write always completes
    // before the function shuts down (never fire-and-forget).
    after(async () => {
      const scan = scanText(trimmed)
      if (!scan.flagged) return
      try {
        await (createAdminClient() as any)
          .from('messages')
          .update({ flagged: true, flag_reason: scan.reason })
          .eq('id', inserted.id)
      } catch (err) {
        logger.warn('sessions/sendMessage', 'Flag update failed', { err: err instanceof Error ? err.message : String(err) })
      }
    })
  }

  // Notify the OTHER party (debounced — once per 5 min per match).
  // Reuses the `match` fetched above — no extra query.
  try {
    if (match) {
      const recipientId = user.id === match.client_id ? match.therapist_id : match.client_id
      const shouldNotify = await shouldNotifyMessage(recipientId, matchId)

      if (shouldNotify) {
        const { data: senderProfile } = await (admin as any)
          .from('profiles').select('full_name').eq('id', user.id).single()
        const senderName = senderProfile?.full_name ?? 'Someone'

        // after(): run post-response so it isn't killed when the action returns,
        // without blocking the message send.
        after(() => createNotification({
          userId: recipientId,
          type: 'client_message',
          title: 'New message',
          body: `${senderName} sent you a message.`,
          metadata: {
            matchId,
            senderId: user.id,
            clientName: senderName,
            messageBody: trimmed,
          },
          // Skip the immediate email. The 3-hour-unread cron at
          // /api/cron/message-overdue-3h fires the email only when the
          // recipient hasn't read the message by then.
          skipEmail: true,
        }).catch((err) => logger.error('sessions/sendMessage', 'Failed to send message notification', err)))
      }
    }
  } catch (err) {
    // Notification failure must not break message send — but log so we can see
    // if notifications stop firing in prod.
    logger.warn('sessions/sendMessage', 'Notification dispatch failed', { matchId, err: err instanceof Error ? err.message : String(err) })
  }

  return {}
}

export async function markMessagesRead(matchId: string): Promise<void> {
  const { user } = await getAuthUser()
  const admin = createAdminClient()

  // IDOR guard: only a participant of this match may mark its messages read.
  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', matchId)
    .maybeSingle() as { data: { client_id: string; therapist_id: string } | null; error: unknown }
  if (!match || (match.client_id !== user.id && match.therapist_id !== user.id)) return

  // Use the admin client: `messages` has no RLS UPDATE policy, so the regular
  // (RLS-enforced) client silently updated zero rows — which is why read
  // receipts never cleared. Only flips is_read on messages the caller RECEIVED.
  await (admin as any)
    .from('messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .eq('is_read', false)
}

// ─── Sessions / Scheduling ────────────────────────────────────────────────────

const scheduleSchema = z.object({
  matchId: z.string().uuid(),
  scheduledAt: z.string().min(1, 'Please select a date and time'),
  sessionType: z.enum(['video', 'chat']),
})

export async function scheduleSession(
  matchId: string,
  scheduledAt: string,
  sessionType: 'video' | 'chat'
): Promise<{ error?: string }> {
  const { user } = await getAuthUser()

  const parsed = scheduleSchema.safeParse({ matchId, scheduledAt, sessionType })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()

  // B-04: verify caller is the therapist or client of this match
  // Sessions are typically scheduled by therapists, but client-initiated
  // requests are also allowed for the same match.
  const { data: matchOwnership } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', matchId)
    .single() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  if (
    !matchOwnership ||
    (matchOwnership.client_id !== user.id && matchOwnership.therapist_id !== user.id)
  ) {
    return { error: 'Not authorized to schedule this session' }
  }

  let dailyRoomUrl: string | null = null
  let dailyRoomName: string | null = null

  if (sessionType === 'video' && process.env.DAILY_API_KEY) {
    try {
      const roomName = `mindcanopy-${matchId.slice(0, 8)}-${Date.now()}`
      const sessionStart = new Date(scheduledAt).getTime()
      const exp = Math.floor(Math.max(sessionStart, Date.now()) / 1000) + 7200

      const res = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'private',
          properties: { exp, max_participants: 2 },
        }),
      })

      if (res.ok) {
        const room = await res.json()
        dailyRoomUrl = room.url
        dailyRoomName = room.name
      } else {
        const body = await res.text().catch(() => '<no body>')
        logger.warn('sessions/scheduleSession', 'Daily.co room creation rejected', { matchId, status: res.status, body })
      }
    } catch (err) {
      // Daily.co failure is non-fatal — session is still created, just without
      // a room URL. The therapist will see "No video link" in the UI.
      logger.warn('sessions/scheduleSession', 'Daily.co room creation threw', { matchId, err: err instanceof Error ? err.message : String(err) })
    }
  }

  // Therapist-arranged sessions are confirmed immediately (no client checkout) —
  // mark them paid so they show on BOTH the therapist and client session lists.
  // (The client sessions view + therapist views only show payment_status='paid'
  // to hide abandoned pay-as-you-go checkouts that leave a 'pending' row.)
  const { error } = await (admin as any).from('sessions').insert({
    match_id: matchId,
    session_type: sessionType,
    scheduled_at: scheduledAt,
    status: 'scheduled',
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
    daily_room_url: dailyRoomUrl,
    daily_room_name: dailyRoomName,
  })

  if (error) return { error: error.message }

  // Notify the OTHER party about the scheduled session.
  // The notification type branches by recipient role so each side gets the
  // right copy (and a CTA URL that points to their dashboard).
  try {
    const recipientIsTherapist = user.id !== matchOwnership.therapist_id
    const recipientId = recipientIsTherapist
      ? matchOwnership.therapist_id
      : matchOwnership.client_id

    const dateStr = new Date(scheduledAt).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })

    // Look up the OTHER party's first name for the email body
    const { data: otherProfiles } = await (admin as any)
      .from('profiles').select('id, full_name')
      .in('id', [matchOwnership.therapist_id, matchOwnership.client_id])
    const therapistProfile = (otherProfiles ?? []).find((p: any) => p.id === matchOwnership.therapist_id)
    const clientProfile = (otherProfiles ?? []).find((p: any) => p.id === matchOwnership.client_id)
    const therapistFirstName = (therapistProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your therapist'
    const clientFirstName = (clientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'

    after(() => createNotification({
      userId: recipientId,
      type: recipientIsTherapist ? 'session_scheduled_therapist' : 'session_scheduled_client',
      title: 'Session scheduled',
      body: `A ${sessionType} session has been scheduled for ${dateStr}.`,
      metadata: {
        matchId, scheduledAt, sessionType, dateStr,
        therapistFirstName, clientFirstName,
      },
    }).catch((err) => logger.error('sessions/scheduleSession', 'Failed to send session notification', err)))
  } catch (err) {
    logger.warn('sessions/scheduleSession', 'Session-scheduled notification dispatch failed', { matchId, err: err instanceof Error ? err.message : String(err) })
  }

  revalidatePath('/therapist/dashboard/video')
  revalidatePath('/dashboard/sessions')
  return {}
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function saveSessionNotes(
  sessionId: string,
  notes: string
): Promise<{ error?: string }> {
  const { user } = await getAuthUser()
  const admin = createAdminClient()

  // B-02: verify caller is the therapist who owns this session
  const { data: sessionRow } = await (admin as any)
    .from('sessions')
    .select('match_id')
    .eq('id', sessionId)
    .single() as { data: { match_id: string } | null; error: unknown }

  if (!sessionRow) return { error: 'Session not found' }

  const { data: matchRow } = await (admin as any)
    .from('matches')
    .select('therapist_id')
    .eq('id', sessionRow.match_id)
    .single() as { data: { therapist_id: string } | null; error: unknown }

  if (!matchRow || matchRow.therapist_id !== user.id) {
    return { error: 'Not authorized to edit these notes' }
  }

  const { error } = await (admin as any)
    .from('sessions')
    .update({ therapist_notes: notes || null })
    .eq('id', sessionId)

  if (error) return { error: error.message }

  revalidatePath('/therapist/dashboard/notes')
  revalidatePath('/dashboard/notes')
  return {}
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'ongoing' | 'completed' | 'cancelled'
): Promise<{ error?: string }> {
  const { user } = await getAuthUser()
  const admin = createAdminClient()

  // B-03: verify caller is the therapist or client of this session's match
  const { data: sessionRow } = await (admin as any)
    .from('sessions')
    .select('match_id')
    .eq('id', sessionId)
    .single() as { data: { match_id: string } | null; error: unknown }

  if (!sessionRow) return { error: 'Session not found' }

  const { data: matchRow } = await (admin as any)
    .from('matches')
    .select('therapist_id, client_id')
    .eq('id', sessionRow.match_id)
    .single() as { data: { therapist_id: string; client_id: string } | null; error: unknown }

  if (!matchRow || (matchRow.therapist_id !== user.id && matchRow.client_id !== user.id)) {
    return { error: 'Not authorized to update this session' }
  }

  const updates: Record<string, string> = { status }
  if (status === 'ongoing') updates.started_at = new Date().toISOString()
  if (status === 'completed' || status === 'cancelled') updates.ended_at = new Date().toISOString()

  const { error } = await (admin as any).from('sessions').update(updates).eq('id', sessionId)
  if (error) return { error: error.message }

  // On cancellation, delete the Daily.co room so it can't be joined
  if (status === 'cancelled') {
    try {
      const { data: s } = await (admin as any)
        .from('sessions')
        .select('daily_room_name')
        .eq('id', sessionId)
        .single() as { data: { daily_room_name: string | null } | null; error: unknown }

      if (s?.daily_room_name && process.env.DAILY_API_KEY) {
        const res = await fetch(`https://api.daily.co/v1/rooms/${s.daily_room_name}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
        })
        if (!res.ok) {
          logger.warn('sessions/updateSessionStatus', 'Daily.co room deletion rejected', { sessionId, roomName: s.daily_room_name, status: res.status })
        }
      }
    } catch (err) {
      // Non-fatal but log — a cancelled room left up means the join URL still
      // works until Daily.co's expiry timestamp kicks in.
      logger.warn('sessions/updateSessionStatus', 'Daily.co room deletion threw', { sessionId, err: err instanceof Error ? err.message : String(err) })
    }

    // Pattern detection: if the THERAPIST cancelled, check whether they've
    // cancelled too many sessions in the last 30 days. If so, dispatch the
    // cancellation-pattern email. Dedupes by checking that no
    // cancellation-pattern notification has been sent in the last 30 days.
    if (user.id === matchRow.therapist_id) {
      try {
        const windowStart = new Date(Date.now() - 30 * 86_400_000).toISOString()
        const PATTERN_THRESHOLD = 3

        // Count cancelled sessions for this therapist in the window.
        // We need to join through matches.therapist_id since sessions don't
        // carry the therapist directly. Cheaper: fetch matches first.
        const { data: therapistMatches } = await (admin as any)
          .from('matches')
          .select('id')
          .eq('therapist_id', user.id)

        const matchIds = (therapistMatches ?? []).map((m: { id: string }) => m.id)

        let cancelCount = 0
        if (matchIds.length) {
          const { count } = await (admin as any)
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .in('match_id', matchIds)
            .gte('ended_at', windowStart)
          cancelCount = count ?? 0
        }

        if (cancelCount >= PATTERN_THRESHOLD) {
          // Have we already sent the pattern email recently?
          const { count: alreadySent } = await (admin as any)
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('type', 'therapist_cancellation_pattern')
            .gte('created_at', windowStart)

          if ((alreadySent ?? 0) === 0) {
            await createNotification({
              userId: user.id,
              type: 'therapist_cancellation_pattern',
              title: 'Pattern of cancellations',
              body: `You've cancelled ${cancelCount} sessions in the last 30 days.`,
              metadata: {
                cancelCount: String(cancelCount),
                timeWindow: '30 days',
              },
            })
          }
        }
      } catch (err) {
        logger.warn('sessions/updateSessionStatus', 'Cancellation-pattern check failed', { err: err instanceof Error ? err.message : String(err) })
      }
    }
  }

  revalidatePath('/therapist/dashboard/video')
  revalidatePath('/dashboard/sessions')
  return {}
}

// ─── Video Join URL ───────────────────────────────────────────────────────────

export async function getSessionJoinUrl(sessionId: string): Promise<{ url?: string; error?: string }> {
  const { user } = await getAuthUser()
  const admin = createAdminClient()

  const { data: session } = await (admin as any)
    .from('sessions')
    .select('daily_room_url, daily_room_name, match_id, scheduled_at')
    .eq('id', sessionId)
    .single() as { data: { daily_room_url: string | null; daily_room_name: string | null; match_id: string; scheduled_at: string } | null; error: unknown }

  if (!session?.daily_room_name || !session?.daily_room_url) return { error: 'No room configured for this session' }

  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', session.match_id)
    .single() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  const isTherapist = match?.therapist_id === user.id
  const isClient = match?.client_id === user.id
  if (!isTherapist && !isClient) return { error: 'Not authorized to join this session' }

  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) return { error: 'Video calling is not configured' }

  const exp = Math.floor(Math.max(new Date(session.scheduled_at).getTime(), Date.now()) / 1000) + 7200

  try {
    const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: session.daily_room_name,
          is_owner: isTherapist,
          exp,
          user_name: isTherapist ? 'Therapist' : 'Client',
          // user_id lets the Daily webhook attribute participant.joined events to
          // the right person (client vs therapist) for on-time tracking.
          user_id: user.id,
          // Auto-start cloud transcription when the therapist (owner) joins. No
          // effect on the client token. Recording stays off — transcript only.
          ...(isTherapist ? { auto_start_transcription: true } : {}),
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '<no body>')
      logger.error('sessions/getSessionJoinUrl', 'Daily.co meeting-token rejected', null, { sessionId, status: res.status, body })
      return { error: 'Failed to generate join link' }
    }
    const { token } = await res.json()
    return { url: `${session.daily_room_url}?t=${token}` }
  } catch (err) {
    logger.error('sessions/getSessionJoinUrl', 'Failed to reach video service', err, { sessionId })
    return { error: 'Failed to reach video service' }
  }
}
