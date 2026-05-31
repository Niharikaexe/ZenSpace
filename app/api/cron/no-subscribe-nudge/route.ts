import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

// Vercel Cron, runs daily.
// Finds active matches where the client HAS sent at least one message
// but does NOT have an active subscription. Nudges weekly, up to 5 times.

const NUDGE_FIRST_AFTER_DAYS = 7
const NUDGE_INTERVAL_DAYS = 7
const NUDGE_MAX_COUNT = 5

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - NUDGE_FIRST_AFTER_DAYS * 86_400_000).toISOString()
  let sent = 0

  const { data: matches, error } = await (admin as any)
    .from('matches')
    .select('id, client_id, therapist_id, created_at')
    .eq('status', 'active')
    .lte('created_at', cutoff)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!matches?.length) return NextResponse.json({ ok: true, sent: 0 })

  for (const m of matches as Array<{ id: string; client_id: string; therapist_id: string; created_at: string }>) {
    // Active subscription? Skip if yes.
    const { data: sub } = await (admin as any)
      .from('subscriptions')
      .select('id')
      .eq('client_id', m.client_id)
      .in('status', ['active', 'cancelled'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle()

    if (sub) continue

    // Client has sent at least one message?
    const { count: msgCount } = await (admin as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', m.id)
      .eq('sender_id', m.client_id)

    if ((msgCount ?? 0) === 0) continue

    // Count prior nudges
    const { count: nudgeCount } = await (admin as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', m.client_id)
      .eq('type', 'client_not_subscribed')
      .eq('metadata->>matchId', m.id)

    if ((nudgeCount ?? 0) >= NUDGE_MAX_COUNT) continue

    // Skip if last nudge was recent
    const { data: lastNudge } = await (admin as any)
      .from('notifications')
      .select('created_at')
      .eq('user_id', m.client_id)
      .eq('type', 'client_not_subscribed')
      .eq('metadata->>matchId', m.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastNudge?.[0]) {
      const ageMs = Date.now() - new Date(lastNudge[0].created_at).getTime()
      if (ageMs < NUDGE_INTERVAL_DAYS * 86_400_000) continue
    }

    // Look up names for the email body
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name').in('id', [m.client_id, m.therapist_id])
    const clientProfile = (profiles ?? []).find((p: any) => p.id === m.client_id)
    const therapistProfile = (profiles ?? []).find((p: any) => p.id === m.therapist_id)
    const clientFirstName = (clientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'
    const therapistFirstName = (therapistProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'your therapist'

    await createNotification({
      userId: m.client_id,
      type: 'client_not_subscribed',
      title: 'Want to try a different therapist?',
      body: `Not every match clicks the first time. We can find someone else for you.`,
      metadata: { matchId: m.id, therapistFirstName, clientFirstName },
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
