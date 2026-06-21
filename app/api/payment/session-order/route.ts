import { NextResponse, after } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { createDailyRoom } from '@/lib/daily'
import { createCashfreeOrder, cashfreeConfigured, cashfreeMode } from '@/lib/cashfree'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import {
  sessionPriceInr,
  effectiveSessionPriceInr,
  therapistSessionPayoutInr,
  MIN_BOOKING_LEAD_MS,
  type SessionCategory,
  type ProposalTier,
} from '@/lib/plans'

// Pay-as-you-go: the client pays for a single session at the moment they pick a
// slot. This route computes the price + therapist payout SERVER-SIDE from the
// client's category and the chosen therapist's tier (never trusting the client),
// creates a Cashfree order, and stores a PENDING session row. The session is
// confirmed once /api/payment/session-verify flips it to 'paid'.

const schema = z.object({
  matchId: z.string().uuid(),
  scheduledAt: z.string().min(1),
})

function normalizeCategory(raw: unknown): SessionCategory {
  return raw === 'couples' || raw === 'teen' ? raw : 'individual'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/session-order', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/session-order', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { matchId, scheduledAt } = parsed.data

  // The slot must be a valid date at least MIN_BOOKING_LEAD_MS (1h) from now —
  // mirrors the UI, which hides closer slots, and blocks clients who try to
  // bypass it. The booking is rejected if it's within the next hour.
  const scheduledDate = new Date(scheduledAt)
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now() + MIN_BOOKING_LEAD_MS) {
    return NextResponse.json({ error: 'Sessions must be booked at least 1 hour in advance.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // IDOR guard: caller must be the client of an ACTIVE match.
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, therapist_id, tier, status')
    .eq('id', matchId)
    .maybeSingle() as {
      data: { id: string; client_id: string; therapist_id: string; tier: string | null; status: string } | null
      error: unknown
    }

  if (!match || match.client_id !== user.id || match.status !== 'active') {
    logger.warn('api/payment/session-order', 'Match not found / not owned / not active', { userId: user.id, matchId })
    return NextResponse.json({ error: 'Not authorized to book this session' }, { status: 403 })
  }

  const tier: ProposalTier = match.tier === 'professional' ? 'professional' : 'standard'

  // Category from the client's questionnaire (falls back to individual).
  const { data: questionnaire } = await (admin as any)
    .from('questionnaire_responses')
    .select('responses')
    .eq('client_id', user.id)
    .maybeSingle() as { data: { responses: Record<string, unknown> } | null; error: unknown }
  const category = normalizeCategory(questionnaire?.responses?.type)

  // Therapist experience band drives the Standard-tier payout.
  const { data: tProfile } = await (admin as any)
    .from('therapist_profiles')
    .select('years_experience')
    .eq('user_id', match.therapist_id)
    .maybeSingle() as { data: { years_experience: number | null } | null; error: unknown }
  const yearsExperience = tProfile?.years_experience ?? 0

  const clientPaise = sessionPriceInr(category, tier) * 100
  const payoutPaise = therapistSessionPayoutInr(category, tier, yearsExperience) * 100

  // ── Monthly bundle: consume a prepaid credit instead of charging ────────────
  // If the client has an active bundle with credits left, book the session
  // immediately as 'paid' (no fresh charge) and decrement the bundle.
  // The decrement is a compare-and-swap on credits_remaining; if it loses a
  // race, we fall through to the normal pay-per-session flow below.
  const { data: bundle } = await (admin as any)
    .from('session_bundles')
    .select('id, credits_remaining, per_session_paise')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .gt('credits_remaining', 0)
    .maybeSingle() as {
      data: { id: string; credits_remaining: number; per_session_paise: number | null } | null
      error: unknown
    }

  if (bundle) {
    const remaining = bundle.credits_remaining - 1
    const { data: claimed } = await (admin as any)
      .from('session_bundles')
      .update({
        credits_remaining: remaining,
        ...(remaining <= 0 ? { status: 'exhausted' } : {}),
      })
      .eq('id', bundle.id)
      .eq('status', 'active')
      .eq('credits_remaining', bundle.credits_remaining) // CAS guard
      .select('id') as { data: { id: string }[] | null; error: unknown }

    if (claimed && claimed.length > 0) {
      // Credit secured — create the paid session now.
      const room = await createDailyRoom(matchId, scheduledDate.toISOString())
      const { data: inserted, error: dbErr } = await (admin as any)
        .from('sessions')
        .insert({
          match_id: matchId,
          session_type: 'video',
          status: 'scheduled',
          scheduled_at: scheduledDate.toISOString(),
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          client_amount_paise: bundle.per_session_paise ?? clientPaise,
          therapist_payout_paise: payoutPaise,
          category,
          tier,
          daily_room_url: room.url,
          daily_room_name: room.name,
        })
        .select('id')
        .single() as { data: { id: string } | null; error: unknown }

      if (dbErr || !inserted) {
        // Refund the credit we just claimed so it isn't silently lost.
        await (admin as any)
          .from('session_bundles')
          .update({ credits_remaining: bundle.credits_remaining, status: 'active' })
          .eq('id', bundle.id)
        logger.error('api/payment/session-order', 'Failed to insert bundle-booked session', dbErr, {
          userId: user.id, matchId, bundleId: bundle.id,
        })
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }

      logger.info('api/payment/session-order', 'Session booked via bundle credit', {
        userId: user.id, matchId, sessionId: inserted.id, bundleId: bundle.id, creditsLeft: remaining,
      })

      // Notify the therapist (fire-and-forget), mirroring session-verify.
      try {
        const dateStr = scheduledDate.toLocaleString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short',
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
        const { data: profiles } = await (admin as any)
          .from('profiles').select('id, full_name')
          .in('id', [match.therapist_id, match.client_id])
        const therapistFirstName = ((profiles ?? []).find((p: any) => p.id === match.therapist_id)?.full_name as string | undefined)?.split(' ')[0] ?? 'your therapist'
        const clientFirstName = ((profiles ?? []).find((p: any) => p.id === match.client_id)?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'

        after(() => createNotification({
          userId: match.therapist_id,
          type: 'session_scheduled_therapist',
          title: 'Session booked',
          body: `A video session has been booked for ${dateStr}.`,
          metadata: {
            matchId, scheduledAt: scheduledDate.toISOString(), sessionType: 'video', dateStr,
            therapistFirstName, clientFirstName,
          },
        }).catch((err) => logger.error('api/payment/session-order', 'Failed to send booking notification', err)))
      } catch (err) {
        logger.warn('api/payment/session-order', 'Bundle booking notification dispatch failed', { sessionId: inserted.id, err: err instanceof Error ? err.message : String(err) })
      }

      return NextResponse.json({ booked: true, sessionId: inserted.id, creditsRemaining: remaining })
    }
    // CAS lost — fall through to pay-per-session below.
  }


  // ── CASHFREE (active) ───────────────────────────────────────────────────────
  if (!cashfreeConfigured()) {
    logger.error('api/payment/session-order', 'Cashfree env vars missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  // Cashfree requires a customer phone — use the client's billing phone if set,
  // otherwise a neutral placeholder (Cashfree only needs a syntactically valid one).
  const { data: cProfile } = await (admin as any)
    .from('client_profiles')
    .select('billing_phone')
    .eq('user_id', user.id)
    .maybeSingle() as { data: { billing_phone: string | null } | null; error: unknown }
  const customerPhone = (cProfile?.billing_phone || '').replace(/\D/g, '').slice(-10) || '9999999999'

  // First-session intro price: charge the discounted first-session price when the
  // client has never paid for a session before (across ALL their matches) and
  // their category + tier qualifies (see FIRST_SESSION_PRICING). Computed
  // server-side so the client can't pick it; the therapist payout is unaffected.
  const { data: clientMatches } = await (admin as any)
    .from('matches')
    .select('id')
    .eq('client_id', user.id) as { data: { id: string }[] | null; error: unknown }
  const clientMatchIds = (clientMatches ?? []).map((m) => m.id)
  let isFirstSession = true
  if (clientMatchIds.length > 0) {
    const { count } = await (admin as any)
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .in('match_id', clientMatchIds)
      .eq('payment_status', 'paid') as { count: number | null }
    isFirstSession = (count ?? 0) === 0
  }
  const chargePaise = effectiveSessionPriceInr(category, tier, isFirstSession) * 100

  // Cashfree order_id is generated by us (alphanumeric, ≤ 50 chars). Stored in
  // razorpay_order_id (reused column).
  const cfOrderId = `sess_${randomUUID().replace(/-/g, '')}`.slice(0, 50)

  const order = await createCashfreeOrder({
    orderId: cfOrderId,
    amountInr: chargePaise / 100,
    customerId: user.id,
    customerEmail: user.email ?? `${user.id}@no-email.mindcanopy.in`,
    customerPhone,
  })

  if (!order.ok) {
    logger.error('api/payment/session-order', 'Cashfree order creation failed', { status: order.status, error: order.error, userId: user.id, matchId })
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 502 })
  }

  // Persist a PENDING session — confirmed on verify. The Daily.co room is only
  // created after payment succeeds, in /api/payment/session-verify.
  const { data: inserted, error: dbErr } = await (admin as any)
    .from('sessions')
    .insert({
      match_id: matchId,
      session_type: 'video',
      status: 'scheduled',
      scheduled_at: scheduledDate.toISOString(),
      payment_status: 'pending',
      client_amount_paise: chargePaise,
      therapist_payout_paise: payoutPaise,
      category,
      tier,
      razorpay_order_id: order.orderId, // reused column → holds Cashfree order_id
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (dbErr || !inserted) {
    logger.error('api/payment/session-order', 'Failed to insert pending session', dbErr, {
      userId: user.id, matchId, orderId: order.orderId,
    })
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  logger.info('api/payment/session-order', 'Pending session created (Cashfree)', {
    userId: user.id, matchId, sessionId: inserted.id, orderId: order.orderId, category, tier, chargePaise, isFirstSession,
  })

  return NextResponse.json({
    order_id: order.orderId,
    payment_session_id: order.paymentSessionId,
    mode: cashfreeMode(),
    sessionId: inserted.id,
  })
}
