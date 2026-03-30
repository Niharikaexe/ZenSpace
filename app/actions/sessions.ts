'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createNotification, shouldNotifyMessage } from '@/lib/notifications'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { user, supabase }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function sendMessage(matchId: string, content: string): Promise<{ error?: string }> {
  const { user, supabase } = await getAuthUser()
  const trimmed = content.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }

  const { error } = await (supabase as any).from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    content: trimmed,
    message_type: 'text',
  })

  if (error) return { error: error.message }

  // Notify the OTHER party (debounced — once per 5 min per match)
  try {
    const admin = createAdminClient()
    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id')
      .eq('id', matchId)
      .single()

    if (match) {
      const recipientId = user.id === match.client_id ? match.therapist_id : match.client_id
      const shouldNotify = await shouldNotifyMessage(recipientId, matchId)

      if (shouldNotify) {
        const { data: senderProfile } = await (admin as any)
          .from('profiles').select('full_name').eq('id', user.id).single()
        const senderName = senderProfile?.full_name ?? 'Someone'

        createNotification({
          userId: recipientId,
          type: 'client_message',
          title: 'New message',
          body: `${senderName} sent you a message.`,
          metadata: { matchId, senderId: user.id, clientName: senderName },
        }).catch(() => {})
      }
    }
  } catch { /* notification failure must not break message send */ }

  return {}
}

export async function markMessagesRead(matchId: string): Promise<void> {
  const { user, supabase } = await getAuthUser()
  await (supabase as any)
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
  await getAuthUser()

  const parsed = scheduleSchema.safeParse({ matchId, scheduledAt, sessionType })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()

  let dailyRoomUrl: string | null = null
  let dailyRoomName: string | null = null

  if (sessionType === 'video' && process.env.DAILY_API_KEY) {
    try {
      const roomName = `zenspace-${matchId.slice(0, 8)}-${Date.now()}`
      const exp = Math.floor(new Date(scheduledAt).getTime() / 1000) + 7200

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
      }
    } catch {
      // Daily.co failure is non-fatal — session still gets created without a room URL
    }
  }

  const { error } = await (admin as any).from('sessions').insert({
    match_id: matchId,
    session_type: sessionType,
    scheduled_at: scheduledAt,
    status: 'scheduled',
    daily_room_url: dailyRoomUrl,
    daily_room_name: dailyRoomName,
  })

  if (error) return { error: error.message }

  // Notify the client about the scheduled session
  try {
    const admin = createAdminClient()
    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id')
      .eq('id', matchId)
      .single()

    if (match?.client_id) {
      const dateStr = new Date(scheduledAt).toLocaleString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
      createNotification({
        userId: match.client_id,
        type: 'session_scheduled',
        title: 'Session scheduled',
        body: `A ${sessionType} session has been scheduled for ${dateStr}.`,
        metadata: { matchId, scheduledAt, sessionType, dateStr },
      }).catch(() => {})
    }
  } catch { /* non-fatal */ }

  revalidatePath('/therapist/dashboard/video')
  revalidatePath('/dashboard/sessions')
  return {}
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function saveSessionNotes(
  sessionId: string,
  notes: string
): Promise<{ error?: string }> {
  await getAuthUser()
  const admin = createAdminClient()

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
  await getAuthUser()
  const admin = createAdminClient()

  const updates: Record<string, string> = { status }
  if (status === 'ongoing') updates.started_at = new Date().toISOString()
  if (status === 'completed' || status === 'cancelled') updates.ended_at = new Date().toISOString()

  const { error } = await (admin as any).from('sessions').update(updates).eq('id', sessionId)
  if (error) return { error: error.message }

  revalidatePath('/therapist/dashboard/video')
  revalidatePath('/dashboard/sessions')
  return {}
}
