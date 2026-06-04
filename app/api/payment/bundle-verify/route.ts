import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getCashfreeOrder, getSuccessfulPaymentId } from '@/lib/cashfree'
import { z } from 'zod'

// Activates a monthly bundle after Cashfree checkout. Confirms order_status ===
// 'PAID' server-side, flips the bundle to 'active' (granting its credits), and is
// idempotent — a re-posted verify for an already-active bundle is a no-op.

const schema = z.object({
  order_id: z.string(),
  bundleId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/bundle-verify', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/bundle-verify', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { order_id, bundleId } = parsed.data

  const admin = createAdminClient()

  const { data: bundle } = await (admin as any)
    .from('session_bundles')
    .select('id, client_id, match_id, amount_paise, status, razorpay_order_id')
    .eq('id', bundleId)
    .maybeSingle() as {
      data: { id: string; client_id: string; match_id: string | null; amount_paise: number; status: string; razorpay_order_id: string | null } | null
      error: unknown
    }

  if (!bundle || bundle.razorpay_order_id !== order_id) {
    logger.error('api/payment/bundle-verify', 'Bundle not found or order mismatch', { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
  }

  if (bundle.client_id !== user.id) {
    logger.warn('api/payment/bundle-verify', 'Caller does not own this bundle', { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Idempotency — already active, nothing to do.
  if (bundle.status === 'active') {
    return NextResponse.json({ success: true })
  }

  /* ── RAZORPAY signature verification (disabled — kept for rollback) ──────────
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  // const expectedSignature = crypto.createHmac('sha256', keySecret!)
  //   .update(`${order_id}|${razorpay_payment_id}`).digest('hex')
  // ...timingSafeEqual against razorpay_signature...
  * ──────────────────────────────────────────────────────────────────────────── */

  // ── CASHFREE: order status is the source of truth ───────────────────────────
  const cfOrder = await getCashfreeOrder(order_id)
  if (!cfOrder.ok) {
    logger.error('api/payment/bundle-verify', 'Cashfree order lookup failed', { userId: user.id, bundleId, order_id, status: cfOrder.status, error: cfOrder.error })
    return NextResponse.json({ error: 'Could not verify payment. Please try again.' }, { status: 502 })
  }
  if (cfOrder.status !== 'PAID') {
    logger.warn('api/payment/bundle-verify', 'Cashfree order not paid', { userId: user.id, bundleId, order_id, orderStatus: cfOrder.status })
    return NextResponse.json({ error: 'Payment not completed.' }, { status: 400 })
  }

  const razorpay_payment_id = (await getSuccessfulPaymentId(order_id)) ?? order_id

  const { error: dbErr } = await (admin as any)
    .from('session_bundles')
    .update({
      status: 'active',
      paid_at: new Date().toISOString(),
      razorpay_payment_id,
    })
    .eq('id', bundleId)
    .eq('status', 'pending')

  if (dbErr) {
    logger.error('api/payment/bundle-verify', 'Failed to activate bundle', dbErr, { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Failed to activate bundle' }, { status: 500 })
  }

  logger.info('api/payment/bundle-verify', 'Bundle activated', {
    userId: user.id, bundleId, paymentId: razorpay_payment_id,
  })

  // Record the bundle charge in the unified payment ledger. Therapist payout for
  // a bundle accrues per-session as credits are consumed, so payout is null here.
  // Deduped on razorpay_payment_id.
  let therapistId: string | null = null
  if (bundle.match_id) {
    const { data: m } = await (admin as any)
      .from('matches').select('therapist_id').eq('id', bundle.match_id).maybeSingle() as { data: { therapist_id: string } | null; error: unknown }
    therapistId = m?.therapist_id ?? null
  }
  const { error: payErr } = await (admin as any)
    .from('payments')
    .upsert({
      client_id: bundle.client_id,
      therapist_id: therapistId,
      match_id: bundle.match_id,
      kind: 'bundle',
      bundle_id: bundleId,
      amount_paise: bundle.amount_paise,
      therapist_payout_paise: null,
      razorpay_order_id: order_id, // reused column → Cashfree order_id
      razorpay_payment_id,
      status: 'paid',
    }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
  if (payErr) {
    logger.error('api/payment/bundle-verify', 'Failed to write payment ledger row', payErr, { bundleId, paymentId: razorpay_payment_id })
  }

  return NextResponse.json({ success: true })
}
