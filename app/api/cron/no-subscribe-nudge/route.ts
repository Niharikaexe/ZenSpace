import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { logger } from '@/lib/logger'

// Vercel Cron, runs daily.
//
// Nudges clients who started chatting with their therapist but never paid for a
// session, in case the match is not right and they would rather switch.
//
// Deliberately conservative, because the message suggests changing therapist and
// nobody who is happy should ever receive it:
//
//  - Anyone who has EVER paid is excluded permanently. Previously this looked for
//    a row in `subscriptions`, but nothing writes that table any more since the
//    move to pay-as-you-go, so the check never matched and paying clients were
//    being told to consider switching. Paid state now comes from `payments`
//    (the ledger of every charge) and from an active session bundle.
//  - Counted per CLIENT, not per match. It used to be per match, so a client who
//    was re-matched started again from zero and could be nudged indefinitely.
//  - Three nudges, a fortnight apart, then silence for good.

const NUDGE_FIRST_AFTER_DAYS = 7
const NUDGE_INTERVAL_DAYS = 14
const NUDGE_MAX_COUNT = 3

export async function GET(request: NextRequest) {
  const ctx = 'cron/no-subscribe-nudge'

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const cutoff = new Date(Date.now() - NUDGE_FIRST_AFTER_DAYS * 86_400_000).toISOString()
  let sent = 0
  let skipped = 0

  const { data: matches, error } = await admin
    .from('matches')
    .select('id, client_id, therapist_id, created_at')
    .eq('status', 'active')
    .lte('created_at', cutoff)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!matches?.length) return NextResponse.json({ ok: true, sent: 0, skipped: 0 })

  // One nudge per client, even if they somehow hold more than one active match.
  const byClient = new Map<string, { id: string; client_id: string; therapist_id: string }>()
  for (const m of matches as Array<{ id: string; client_id: string; therapist_id: string }>) {
    if (!byClient.has(m.client_id)) byClient.set(m.client_id, m)
  }

  for (const m of byClient.values()) {
    // ── Has this client ever paid us anything? ──────────────────────────────
    const { count: paidCount } = await admin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', m.client_id)
      .eq('status', 'paid')

    if ((paidCount ?? 0) > 0) { skipped++; continue }

    // A prepaid bundle counts even if no session has been drawn from it yet.
    const { count: bundleCount } = await admin
      .from('session_bundles')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', m.client_id)
      .eq('status', 'active')

    if ((bundleCount ?? 0) > 0) { skipped++; continue }

    // ── Have they actually engaged? No point asking someone who never wrote ──
    const { count: msgCount } = await admin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', m.id)
      .eq('sender_id', m.client_id)

    if ((msgCount ?? 0) === 0) { skipped++; continue }

    // ── Cap and spacing, per client across every match they have had ────────
    const { count: nudgeCount } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', m.client_id)
      .eq('type', 'client_not_subscribed')

    if ((nudgeCount ?? 0) >= NUDGE_MAX_COUNT) { skipped++; continue }

    const { data: lastNudge } = await admin
      .from('notifications')
      .select('created_at')
      .eq('user_id', m.client_id)
      .eq('type', 'client_not_subscribed')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastNudge?.[0]) {
      const ageMs = Date.now() - new Date(lastNudge[0].created_at).getTime()
      if (ageMs < NUDGE_INTERVAL_DAYS * 86_400_000) { skipped++; continue }
    }

    const { data: profiles } = await admin
      .from('profiles').select('id, full_name').in('id', [m.client_id, m.therapist_id])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nameOf = (id: string) => ((profiles ?? []).find((p: any) => p.id === id)?.full_name as string | undefined)
    const clientFirstName = nameOf(m.client_id)?.split(' ')[0] ?? 'there'
    const therapistFirstName = nameOf(m.therapist_id)?.split(' ')[0] ?? 'your therapist'

    await createNotification({
      userId: m.client_id,
      type: 'client_not_subscribed',
      title: 'Want to try a different therapist?',
      body: `Not every match clicks the first time. We can find someone else for you.`,
      metadata: { matchId: m.id, therapistFirstName, clientFirstName },
    })
    sent++
  }

  logger.info(ctx, 'Cron finished', { sent, skipped, clients: byClient.size })
  return NextResponse.json({ ok: true, sent, skipped })
}
