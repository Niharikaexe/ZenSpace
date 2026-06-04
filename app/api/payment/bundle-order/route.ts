import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { createCashfreeOrder, cashfreeConfigured, cashfreeMode } from '@/lib/cashfree'
import { randomUUID } from 'crypto'
import {
  sessionPriceInr,
  monthlyBundleInr,
  MONTHLY_BUNDLE_SESSIONS,
  type SessionCategory,
  type ProposalTier,
} from '@/lib/plans'

// Monthly bundle purchase: the client prepays for MONTHLY_BUNDLE_SESSIONS
// sessions at a discount. Price is computed SERVER-SIDE from the client's
// category and their active match's therapist tier (never trusting the client),
// a Razorpay order is created, and a PENDING bundle row is stored. The bundle is
// activated (credits granted) once /api/payment/bundle-verify confirms payment.

function normalizeCategory(raw: unknown): SessionCategory {
  return raw === 'couples' || raw === 'teen' ? raw : 'individual'
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/bundle-order', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // The client must have an ACTIVE match to buy a bundle (bundle is priced off
  // the matched therapist's tier).
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, therapist_id, tier, status')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as {
      data: { id: string; client_id: string; therapist_id: string; tier: string | null; status: string } | null
      error: unknown
    }

  if (!match) {
    return NextResponse.json({ error: 'You need an active therapist match before buying a bundle.' }, { status: 403 })
  }

  // Block a second active bundle — finish the current one first.
  const { data: existing } = await (admin as any)
    .from('session_bundles')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  if (existing) {
    return NextResponse.json({ error: 'You already have an active bundle.' }, { status: 409 })
  }

  const tier: ProposalTier = match.tier === 'professional' ? 'professional' : 'standard'

  const { data: questionnaire } = await (admin as any)
    .from('questionnaire_responses')
    .select('responses')
    .eq('client_id', user.id)
    .maybeSingle() as { data: { responses: Record<string, unknown> } | null; error: unknown }
  const category = normalizeCategory(questionnaire?.responses?.type)

  const perSessionInr = sessionPriceInr(category, tier)
  const bundleInr = monthlyBundleInr(perSessionInr)
  const bundlePaise = bundleInr * 100
  const perSessionPaise = Math.round(bundlePaise / MONTHLY_BUNDLE_SESSIONS)

  /* ──────────────────────────────────────────────────────────────────────────
   * RAZORPAY (disabled — kept for rollback). Switched to Cashfree below.
   * ----------------------------------------------------------------------------
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    logger.error('api/payment/bundle-order', 'Razorpay env vars missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  let order: { id: string }
  try {
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount: bundlePaise, currency: 'INR', receipt: `bndl_${user.id.slice(0, 8)}_${Date.now()}` }),
    })
    if (!orderRes.ok) { return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 }) }
    order = await orderRes.json()
  } catch { return NextResponse.json({ error: 'Failed to reach payment gateway' }, { status: 502 }) }
  // ... (Razorpay pending-bundle insert + response with key)
  * ────────────────────────────────────────────────────────────────────────── */

  // ── CASHFREE (active) ───────────────────────────────────────────────────────
  if (!cashfreeConfigured()) {
    logger.error('api/payment/bundle-order', 'Cashfree env vars missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const { data: cProfile } = await (admin as any)
    .from('client_profiles')
    .select('billing_phone')
    .eq('user_id', user.id)
    .maybeSingle() as { data: { billing_phone: string | null } | null; error: unknown }
  const customerPhone = (cProfile?.billing_phone || '').replace(/\D/g, '').slice(-10) || '9999999999'

  const cfOrderId = `bndl_${randomUUID().replace(/-/g, '')}`.slice(0, 50)

  const order = await createCashfreeOrder({
    orderId: cfOrderId,
    amountInr: bundlePaise / 100,
    customerId: user.id,
    customerEmail: user.email ?? `${user.id}@no-email.mindcanopy.in`,
    customerPhone,
  })

  if (!order.ok) {
    logger.error('api/payment/bundle-order', 'Cashfree order creation failed', { status: order.status, error: order.error, userId: user.id, matchId: match.id })
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 502 })
  }

  const { data: inserted, error: dbErr } = await (admin as any)
    .from('session_bundles')
    .insert({
      client_id: user.id,
      match_id: match.id,
      category,
      tier,
      credits_total: MONTHLY_BUNDLE_SESSIONS,
      credits_remaining: MONTHLY_BUNDLE_SESSIONS,
      amount_paise: bundlePaise,
      per_session_paise: perSessionPaise,
      status: 'pending',
      razorpay_order_id: order.orderId, // reused column → Cashfree order_id
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (dbErr || !inserted) {
    logger.error('api/payment/bundle-order', 'Failed to insert pending bundle', dbErr, {
      userId: user.id, matchId: match.id, orderId: order.orderId,
    })
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 })
  }

  logger.info('api/payment/bundle-order', 'Pending bundle created (Cashfree)', {
    userId: user.id, matchId: match.id, bundleId: inserted.id, orderId: order.orderId, category, tier, bundlePaise,
  })

  return NextResponse.json({
    order_id: order.orderId,
    payment_session_id: order.paymentSessionId,
    mode: cashfreeMode(),
    bundleId: inserted.id,
  })
}
