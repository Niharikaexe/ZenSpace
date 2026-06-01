import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  sessionPriceInr,
  therapistSessionPayoutInr,
  type SessionCategory,
  type ProposalTier,
} from '@/lib/plans'

// Pay-as-you-go: the client pays for a single session at the moment they pick a
// slot. This route computes the price + therapist payout SERVER-SIDE from the
// client's category and the chosen therapist's tier (never trusting the client),
// creates a Razorpay order, and stores a PENDING session row. The session is
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

  // The slot must be a valid future date.
  const scheduledDate = new Date(scheduledAt)
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Please pick an upcoming time slot.' }, { status: 400 })
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

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    logger.error('api/payment/session-order', 'Razorpay env vars missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  let order: { id: string }
  try {
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: clientPaise,
        currency: 'INR',
        receipt: `sess_${user.id.slice(0, 8)}_${Date.now()}`,
      }),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}))
      logger.error('api/payment/session-order', 'Razorpay order creation failed', err, {
        userId: user.id, matchId, status: orderRes.status,
      })
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }

    order = await orderRes.json()
  } catch (err) {
    logger.error('api/payment/session-order', 'Network error calling Razorpay', err, { userId: user.id })
    return NextResponse.json({ error: 'Failed to reach payment gateway' }, { status: 502 })
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
      client_amount_paise: clientPaise,
      therapist_payout_paise: payoutPaise,
      category,
      tier,
      razorpay_order_id: order.id,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (dbErr || !inserted) {
    logger.error('api/payment/session-order', 'Failed to insert pending session', dbErr, {
      userId: user.id, matchId, orderId: order.id,
    })
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  logger.info('api/payment/session-order', 'Pending session created', {
    userId: user.id, matchId, sessionId: inserted.id, orderId: order.id, category, tier, clientPaise,
  })

  return NextResponse.json({
    order_id: order.id,
    amount: clientPaise,
    currency: 'INR',
    key: keyId,
    sessionId: inserted.id,
  })
}
