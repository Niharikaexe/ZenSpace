import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNotificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

// Vercel Cron, runs daily.
// Asks clients how their session went, the morning after it happened.
//
// Only for sessions the client actually attended: a no-show should never be
// asked to rate a session they were not in. Attendance is client_joined_at
// (set by the Daily webhook); sessions marked 'completed' also qualify, so
// manually-closed sessions are not missed.
//
// Sends once per session, guarded by sessions.feedback_email_sent_at, which is
// stamped before the send so a retry or overlapping run cannot double-email.
//
// Sends the email directly rather than via createNotification: this is a
// one-off request for input, not something worth an in-app notification badge.

const LOOKBACK_HOURS = 36
const MIN_AGE_HOURS = 8   // let the session settle before asking

export async function GET(request: NextRequest) {
  const ctx = 'cron/session-feedback'

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    logger.error(ctx, 'CRON_SECRET not configured')
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = Date.now()
  const windowStart = new Date(now - LOOKBACK_HOURS * 3_600_000).toISOString()
  const windowEnd = new Date(now - MIN_AGE_HOURS * 3_600_000).toISOString()
  let sent = 0
  let skipped = 0

  // Paid sessions that happened in the window and have not been asked about yet.
  const { data: sessions, error } = await (admin as any)
    .from('sessions')
    .select('id, match_id, scheduled_at, status, client_joined_at, feedback_email_sent_at')
    .eq('payment_status', 'paid')
    .is('feedback_email_sent_at', null)
    .gte('scheduled_at', windowStart)
    .lte('scheduled_at', windowEnd)
    .order('scheduled_at', { ascending: true })
    .limit(200) as {
      data: Array<{
        id: string; match_id: string; scheduled_at: string; status: string
        client_joined_at: string | null; feedback_email_sent_at: string | null
      }> | null
      error: { message: string } | null
    }

  if (error) {
    logger.error(ctx, 'Failed to query sessions', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  if (!sessions?.length) return NextResponse.json({ ok: true, sent: 0, skipped: 0 })

  for (const s of sessions) {
    // Did the client actually turn up?
    const attended = !!s.client_joined_at || s.status === 'completed'
    if (!attended || s.status === 'cancelled') { skipped++; continue }

    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id')
      .eq('id', s.match_id)
      .maybeSingle() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

    if (!match) { skipped++; continue }

    const [{ data: profiles }, clientAuth] = await Promise.all([
      (admin as any).from('profiles').select('id, full_name').in('id', [match.client_id, match.therapist_id]),
      admin.auth.admin.getUserById(match.client_id),
    ])

    const clientEmail = clientAuth?.data?.user?.email
    if (!clientEmail) {
      logger.warn(ctx, 'No email for client, skipping', { sessionId: s.id, clientId: match.client_id })
      skipped++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nameOf = (id: string) => ((profiles ?? []).find((p: any) => p.id === id)?.full_name as string | undefined)
    const clientFirstName = nameOf(match.client_id)?.split(' ')[0] ?? 'there'
    const therapistFirstName = nameOf(match.therapist_id)?.split(' ')[0] ?? 'your therapist'

    // Stamp BEFORE sending: a duplicate email is worse than a missed one, and a
    // send that fails is visible in the Emails log either way.
    const { error: stampErr } = await (admin as any)
      .from('sessions')
      .update({ feedback_email_sent_at: new Date().toISOString() })
      .eq('id', s.id)
      .is('feedback_email_sent_at', null)   // compare-and-set: loses race, sends nothing

    if (stampErr) {
      logger.error(ctx, 'Failed to stamp session, not sending', stampErr, { sessionId: s.id })
      skipped++
      continue
    }

    const dateStr = new Date(s.scheduled_at).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
    })

    await sendNotificationEmail({
      to: clientEmail,
      name: clientFirstName,
      type: 'client_session_feedback',
      meta: { therapistFirstName, dateStr, sessionId: s.id },
    })

    logger.info(ctx, 'Feedback email sent', { sessionId: s.id, clientId: match.client_id })
    sent++
  }

  logger.info(ctx, 'Cron finished', { sent, skipped })
  return NextResponse.json({ ok: true, sent, skipped })
}
