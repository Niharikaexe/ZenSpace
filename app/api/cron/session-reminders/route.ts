import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

// Vercel Cron — runs every hour (see vercel.json)
// Finds sessions in two reminder windows and notifies both therapist + client.
// Uses metadata { sessionId, window } to deduplicate so reminders fire exactly once.

export async function GET(request: NextRequest) {
  // Guard with CRON_SECRET (set in Vercel project settings)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  const now = new Date()
  let sent = 0
  const errors: string[] = []

  const windows = [
    {
      key: '24h',
      from: new Date(now.getTime() + 23 * 3_600_000).toISOString(),
      to:   new Date(now.getTime() + 25 * 3_600_000).toISOString(),
      title: 'Session tomorrow',
      body:  (type: string, dateStr: string) =>
        `Reminder: your ${type} session is scheduled for tomorrow — ${dateStr}. Be ready.`,
    },
    {
      key: '1h',
      from: new Date(now.getTime() + 50 * 60_000).toISOString(),
      to:   new Date(now.getTime() + 70 * 60_000).toISOString(),
      title: 'Session in 1 hour',
      body:  (type: string, dateStr: string) =>
        `Your ${type} session starts in about an hour — ${dateStr}. Get ready to join.`,
    },
  ]

  for (const win of windows) {
    const { data: sessions, error: sessErr } = await (admin as any)
      .from('sessions')
      .select('id, scheduled_at, session_type, match_id')
      .eq('status', 'scheduled')
      .gte('scheduled_at', win.from)
      .lte('scheduled_at', win.to)

    if (sessErr) {
      errors.push(`window=${win.key}: ${sessErr.message}`)
      continue
    }
    if (!sessions?.length) continue

    for (const s of sessions as { id: string; scheduled_at: string; session_type: string; match_id: string }[]) {
      // Skip if this reminder was already sent (dedup by sessionId + window)
      const { data: existing } = await (admin as any)
        .from('notifications')
        .select('id')
        .eq('type', 'session_reminder')
        .filter('metadata->sessionId', 'eq', `"${s.id}"`)
        .filter('metadata->window',    'eq', `"${win.key}"`)
        .limit(1)

      if (existing?.length) continue

      const { data: match } = await (admin as any)
        .from('matches')
        .select('client_id, therapist_id')
        .eq('id', s.match_id)
        .single()

      if (!match) continue

      const dateStr = new Date(s.scheduled_at).toLocaleString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })

      const metadata = {
        sessionId:   s.id,
        matchId:     s.match_id,
        scheduledAt: s.scheduled_at,
        sessionType: s.session_type,
        dateStr,
        window:      win.key,
      }

      await Promise.all([
        createNotification({
          userId: match.client_id,
          type: 'session_reminder',
          title: win.title,
          body: win.body(s.session_type, dateStr),
          metadata,
        }),
        createNotification({
          userId: match.therapist_id,
          type: 'session_reminder',
          title: win.title,
          body: win.body(s.session_type, dateStr),
          metadata,
        }),
      ])

      sent += 2
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    ...(errors.length ? { errors } : {}),
  })
}
