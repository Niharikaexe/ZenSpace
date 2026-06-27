import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getSuccessfulPaymentId } from '@/lib/cashfree'
import { fulfillSessionOrder } from '@/lib/payments-fulfill'

// Cashfree Payment Gateway webhook.
//
// Configure in the Cashfree dashboard (Developers → Webhooks) as:
//   https://mindcanopy.in/api/webhooks/cashfree
// Subscribe to PAYMENT_SUCCESS_WEBHOOK (and optionally failed/dropped).
//
// This is the RELIABILITY BACKSTOP for the synchronous return-verify flow
// (session-verify / bundle-verify): if the user pays but never returns to the
// app (closed tab, dropped connection), this still flips the session/bundle to
// paid. Every write is idempotent (guarded on payment_status='pending' and a
// unique razorpay_payment_id in the ledger), so a webhook + a return-verify for
// the same order never double-apply.
//
// The `/api/webhooks/` prefix is treated as public in middleware, so Cashfree's
// unauthenticated server-to-server POST is not redirected to /login.

// Cashfree signs webhooks as base64( HMAC-SHA256( timestamp + rawBody, secret ) ).
function verifySignature(rawBody: string, timestamp: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody)
    .digest('base64')
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

type Admin = ReturnType<typeof createAdminClient>

// ── Confirm a paid BUNDLE (mirrors bundle-verify) ───────────────────────────
async function confirmBundle(admin: Admin, orderId: string, paymentId: string): Promise<void> {
  const { data: bundle } = await (admin as any)
    .from('session_bundles')
    .select('id, client_id, match_id, amount_paise, status, razorpay_order_id')
    .eq('razorpay_order_id', orderId)
    .maybeSingle() as {
      data: { id: string; client_id: string; match_id: string | null; amount_paise: number; status: string; razorpay_order_id: string | null } | null
      error: unknown
    }

  if (!bundle) {
    logger.warn('webhook/cashfree', 'No bundle for order — ignoring', { orderId })
    return
  }
  if (bundle.status === 'active') return // idempotent

  const { error: dbErr } = await (admin as any)
    .from('session_bundles')
    .update({ status: 'active', paid_at: new Date().toISOString(), razorpay_payment_id: paymentId })
    .eq('id', bundle.id)
    .eq('status', 'pending') // CAS

  if (dbErr) {
    logger.error('webhook/cashfree', 'Failed to activate bundle', dbErr, { orderId, bundleId: bundle.id })
    return
  }
  logger.info('webhook/cashfree', 'Bundle activated via webhook', { orderId, bundleId: bundle.id, paymentId })

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
      bundle_id: bundle.id,
      amount_paise: bundle.amount_paise,
      therapist_payout_paise: null,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      status: 'paid',
    }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
  if (payErr) logger.error('webhook/cashfree', 'Failed to write bundle ledger row', payErr, { orderId })
}

export async function POST(request: Request) {
  const secret = process.env.CASHFREE_SECRET_KEY
  if (!secret) {
    logger.error('webhook/cashfree', 'CASHFREE_SECRET_KEY not set')
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') ?? ''
  const timestamp = request.headers.get('x-webhook-timestamp') ?? ''

  if (!signature || !timestamp || !verifySignature(rawBody, timestamp, signature, secret)) {
    logger.warn('webhook/cashfree', 'Invalid or missing webhook signature')
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const type: string = event?.type ?? ''
  const orderId: string | undefined = event?.data?.order?.order_id
  const paymentStatus: string | undefined = event?.data?.payment?.payment_status
  const cfPaymentId = event?.data?.payment?.cf_payment_id
  const orderAmount: number | undefined = event?.data?.order?.order_amount

  // Log EVERY signed event we receive (success, failed, dropped, user-dropped)
  // so the full payment lifecycle is visible in Vercel logs.
  logger.info('webhook/cashfree', 'Webhook received', { type, orderId, paymentStatus, cfPaymentId, orderAmount })

  const admin = createAdminClient()

  // Mark failed/dropped orders so they surface in admin monitoring (best-effort,
  // sessions only — bundles track their own status).
  const isSuccess = type === 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus === 'SUCCESS'
  if (!isSuccess) {
    if (orderId && !orderId.startsWith('bndl_') && (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED' || type.includes('FAILED'))) {
      await (admin as any)
        .from('session_orders')
        .update({ status: 'failed', cf_payment_id: cfPaymentId != null ? String(cfPaymentId) : null, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .eq('status', 'created')
      logger.info('webhook/cashfree', 'Order marked failed', { orderId, paymentStatus, type })
    } else {
      logger.info('webhook/cashfree', 'Non-actionable event acked', { type, orderId, paymentStatus })
    }
    return NextResponse.json({ received: true })
  }

  if (!orderId) {
    logger.warn('webhook/cashfree', 'Success event without order_id', { type })
    return NextResponse.json({ received: true })
  }

  const paymentId = cfPaymentId != null ? String(cfPaymentId) : ((await getSuccessfulPaymentId(orderId)) ?? orderId)

  try {
    if (orderId.startsWith('bndl_')) {
      await confirmBundle(admin, orderId, paymentId)
    } else {
      // sess_* orders: create the session + send emails (idempotent).
      const result = await fulfillSessionOrder(orderId, paymentId, orderAmount ?? null)
      logger.info('webhook/cashfree', 'Session order fulfilment result', { orderId, ok: result.ok, ...(result.ok ? { sessionId: result.sessionId, alreadyDone: result.alreadyDone } : { reason: result.reason }) })
    }
  } catch (err) {
    logger.error('webhook/cashfree', 'Handler threw', err, { orderId, type })
    // Still 200: the signature was valid and we've logged it; returning 5xx
    // would make Cashfree retry a request that may have partially applied.
  }

  return NextResponse.json({ received: true })
}
