import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

// Vercel Cron, runs daily.
// Finds verified therapists who haven't set weekly_availability or weekly_capacity
// and nudges them every 3 days, up to 5 times.

const NUDGE_INTERVAL_DAYS = 3
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
  let sent = 0

  // Verified therapists with missing availability or capacity
  const { data: therapists, error } = await (admin as any)
    .from('therapist_profiles')
    .select('user_id, weekly_availability, weekly_capacity, updated_at')
    .eq('is_verified', true)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!therapists?.length) return NextResponse.json({ ok: true, sent: 0 })

  for (const t of therapists as Array<{ user_id: string; weekly_availability: unknown; weekly_capacity: number | null }>) {
    const availabilityEmpty = !t.weekly_availability || Object.keys(t.weekly_availability as object).length === 0
    const capacityMissing = !t.weekly_capacity
    if (!availabilityEmpty && !capacityMissing) continue

    // Count prior nudges
    const { count } = await (admin as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', t.user_id)
      .eq('type', 'therapist_availability_nudge')

    if ((count ?? 0) >= NUDGE_MAX_COUNT) continue

    // Was the last nudge within NUDGE_INTERVAL_DAYS? Skip if yes.
    const { data: lastNudge } = await (admin as any)
      .from('notifications')
      .select('created_at')
      .eq('user_id', t.user_id)
      .eq('type', 'therapist_availability_nudge')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastNudge?.[0]) {
      const ageMs = Date.now() - new Date(lastNudge[0].created_at).getTime()
      if (ageMs < NUDGE_INTERVAL_DAYS * 86_400_000) continue
    }

    // Look up name for the email body
    const { data: profile } = await (admin as any)
      .from('profiles').select('full_name').eq('id', t.user_id).single()
    const firstName = (profile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

    await createNotification({
      userId: t.user_id,
      type: 'therapist_availability_nudge',
      title: 'Your availability is not set yet',
      body: 'We cannot match you with a client until you set your weekly availability and capacity.',
      metadata: {},
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
