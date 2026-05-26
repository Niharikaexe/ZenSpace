import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

// Vercel Cron, runs hourly.
// Finds chat messages from clients that are still unread by the therapist
// after 48 hours. Fires one reply-overdue email per match per occurrence.

const OVERDUE_HOURS = 48

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - OVERDUE_HOURS * 3_600_000).toISOString()
  let sent = 0

  // Find messages from clients older than the cutoff that are still unread.
  const { data: messages, error } = await (admin as any)
    .from('messages')
    .select('id, match_id, sender_id, created_at, is_read')
    .lte('created_at', cutoff)
    .eq('is_read', false)
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!messages?.length) return NextResponse.json({ ok: true, sent: 0 })

  // Group by match so we send at most one overdue email per match per cron run
  const matchesSeen = new Set<string>()

  for (const m of messages as Array<{ id: string; match_id: string; sender_id: string; created_at: string }>) {
    if (matchesSeen.has(m.match_id)) continue

    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id, status')
      .eq('id', m.match_id)
      .single()

    if (!match || match.status !== 'active') continue
    // Only fire if the sender is the client (i.e., therapist owes the reply)
    if (m.sender_id !== match.client_id) continue

    // Has the therapist been notified for this specific message already?
    const { count } = await (admin as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', match.therapist_id)
      .eq('type', 'therapist_reply_overdue')
      .eq('metadata->>messageId', m.id)

    if ((count ?? 0) > 0) continue

    // Look up names
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name').in('id', [match.client_id, match.therapist_id])
    const clientProfile = (profiles ?? []).find((p: any) => p.id === match.client_id)
    const therapistProfile = (profiles ?? []).find((p: any) => p.id === match.therapist_id)
    const clientFirstName = (clientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'
    const therapistFirstName = (therapistProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

    await createNotification({
      userId: match.therapist_id,
      type: 'therapist_reply_overdue',
      title: `${clientFirstName} is waiting for your reply`,
      body: `A client message has been unanswered for 48 hours.`,
      metadata: { matchId: m.match_id, messageId: m.id, clientFirstName, therapistFirstName },
    })

    matchesSeen.add(m.match_id)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
