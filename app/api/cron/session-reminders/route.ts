import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { formatIST } from '@/lib/datetime'

// Vercel Cron — runs once daily at 5:00 AM UTC (10:30 AM IST).
// Finds all sessions scheduled in the next 25 hours and sends a
// "session today" reminder to both therapist and client.
// Deduplicates via notifications table so each session gets one reminder.

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const windowEnd = new Date(now.getTime() + 25 * 3_600_000).toISOString()

  let sent = 0
  const errors: string[] = []

  const { data: sessions, error: sessErr } = await (admin as any)
    .from('sessions')
    .select('id, scheduled_at, session_type, match_id')
    .eq('status', 'scheduled')
    // Only remind for CONFIRMED (paid) sessions. A pending row exists the moment
    // a client opens checkout — having a razorpay_order_id does NOT mean paid;
    // only payment_status='paid' does. Without this gate, abandoned/unpaid
    // bookings (no session link, no money taken) would trigger reminder emails.
    .eq('payment_status', 'paid')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', windowEnd)

  if (sessErr) {
    return NextResponse.json({ ok: false, error: sessErr.message }, { status: 500 })
  }

  if (!sessions?.length) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  for (const s of sessions as { id: string; scheduled_at: string; session_type: string; match_id: string }[]) {
    // Skip if reminder already sent for this session (either variant)
    const { data: existing } = await (admin as any)
      .from('notifications')
      .select('id')
      .in('type', ['session_reminder_client', 'session_reminder_therapist'])
      .eq('metadata->>sessionId', s.id)
      .limit(1)

    if (existing?.length) continue

    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id')
      .eq('id', s.match_id)
      .single()

    if (!match) continue

    const dateStr = `${formatIST(s.scheduled_at)} IST`

    // Determine if the session is today or tomorrow
    const sessionDate = new Date(s.scheduled_at)
    const isToday = sessionDate.toDateString() === now.toDateString()
    const title = isToday ? 'Session today' : 'Session tomorrow'
    const body = `Your ${s.session_type} session is ${isToday ? 'today' : 'tomorrow'} at ${dateStr}.`

    // Look up first names so each recipient's email body can address them
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name')
      .in('id', [match.client_id, match.therapist_id])
    const therapistProfile = (profiles ?? []).find((p: any) => p.id === match.therapist_id)
    const clientProfile = (profiles ?? []).find((p: any) => p.id === match.client_id)
    const therapistFirstName = (therapistProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your therapist'
    const clientFirstName = (clientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'

    const baseMetadata = {
      sessionId:   s.id,
      matchId:     s.match_id,
      scheduledAt: s.scheduled_at,
      sessionType: s.session_type,
      dateStr,
      therapistFirstName,
      clientFirstName,
      window: 'daily',
    }

    await Promise.all([
      createNotification({ userId: match.client_id,    type: 'session_reminder_client',    title, body, metadata: baseMetadata }),
      createNotification({ userId: match.therapist_id, type: 'session_reminder_therapist', title, body, metadata: baseMetadata }),
    ])

    sent += 2
  }

  return NextResponse.json({
    ok: true,
    sent,
    ...(errors.length ? { errors } : {}),
  })
}
