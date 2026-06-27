import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { formatIST } from '@/lib/datetime'

// Vercel Cron, runs hourly.
// Finds sessions whose scheduled_at + grace window has passed but status is
// still 'scheduled'. Emails the therapist once per session.
//
// We do NOT change the session status (the enum has no 'missed' value yet,
// and 'cancelled' would overload the semantic with therapist-cancellation).
// Dedupe is via the notifications table: we only send once per session_id.
//
// For more accurate detection, integrate with Daily.co's room-events webhook
// and check whether the therapist participant actually joined.

const GRACE_MINUTES = 15

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - GRACE_MINUTES * 60_000).toISOString()
  let flagged = 0

  const { data: sessions, error } = await (admin as any)
    .from('sessions')
    .select('id, match_id, scheduled_at, session_type, status')
    .eq('status', 'scheduled')
    // Only flag CONFIRMED (paid) sessions as missed. An unpaid/abandoned booking
    // was never a real appointment — having a razorpay_order_id does NOT mean
    // paid; only payment_status='paid' does.
    .eq('payment_status', 'paid')
    .lte('scheduled_at', cutoff)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!sessions?.length) return NextResponse.json({ ok: true, flagged: 0 })

  for (const s of sessions as Array<{ id: string; match_id: string; scheduled_at: string; session_type: string }>) {
    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id, status')
      .eq('id', s.match_id)
      .single()

    if (!match) continue

    // Skip if we've already emailed the therapist about this missed session
    const { count: already } = await (admin as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', match.therapist_id)
      .eq('type', 'therapist_missed_session')
      .eq('metadata->>sessionId', s.id)

    if ((already ?? 0) > 0) continue

    // Look up names
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name').in('id', [match.client_id, match.therapist_id])
    const clientProfile = (profiles ?? []).find((p: any) => p.id === match.client_id)
    const therapistProfile = (profiles ?? []).find((p: any) => p.id === match.therapist_id)
    const clientFirstName = (clientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'
    const therapistFirstName = (therapistProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

    const dateStr = `${formatIST(s.scheduled_at)} IST`

    await createNotification({
      userId: match.therapist_id,
      type: 'therapist_missed_session',
      title: `You missed a session with ${clientFirstName}`,
      body: `Your session scheduled for ${dateStr} did not happen.`,
      metadata: { sessionId: s.id, matchId: s.match_id, clientFirstName, therapistFirstName, dateStr },
    })

    flagged++
  }

  return NextResponse.json({ ok: true, flagged })
}
