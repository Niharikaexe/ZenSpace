import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getCashfreeOrder, getSuccessfulPaymentId } from '@/lib/cashfree'
import { fulfillSessionOrder } from '@/lib/payments-fulfill'
import { z } from 'zod'

// Synchronous BACKSTOP to the Cashfree webhook. When the client returns from
// checkout we re-check the order status server-side (order_status === 'PAID' is
// the source of truth — no client signature) and fulfil the order if the
// webhook hasn't already. fulfillSessionOrder is idempotent, so the webhook and
// this verify can both fire for the same order without double-applying.
//
// The session is created HERE/in the webhook on confirmed payment — never at
// order-open time. An order id alone is not payment.

const schema = z.object({
  order_id: z.string(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/session-verify', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/session-verify', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { order_id } = parsed.data
  const admin = createAdminClient()

  // Ownership: the order must belong to the caller (IDOR guard).
  const { data: order } = await (admin as any)
    .from('session_orders')
    .select('client_id, status, session_id')
    .eq('order_id', order_id)
    .maybeSingle() as { data: { client_id: string; status: string; session_id: string | null } | null; error: unknown }

  if (!order || order.client_id !== user.id) {
    logger.warn('api/payment/session-verify', 'Order not found or not owned by caller', { userId: user.id, order_id })
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Already fulfilled (webhook beat us) — success.
  if (order.status === 'paid' && order.session_id) {
    return NextResponse.json({ success: true })
  }

  // Cashfree order status is the source of truth.
  const cfOrder = await getCashfreeOrder(order_id)
  if (!cfOrder.ok) {
    logger.error('api/payment/session-verify', 'Cashfree order lookup failed', { userId: user.id, order_id, status: cfOrder.status, error: cfOrder.error })
    return NextResponse.json({ error: 'Could not verify payment. Please try again.' }, { status: 502 })
  }
  if (cfOrder.status !== 'PAID') {
    logger.warn('api/payment/session-verify', 'Cashfree order not paid', { userId: user.id, order_id, orderStatus: cfOrder.status })
    return NextResponse.json({ error: 'Payment not completed.' }, { status: 400 })
  }

  const paymentId = (await getSuccessfulPaymentId(order_id)) ?? order_id
  const result = await fulfillSessionOrder(order_id, paymentId, cfOrder.amount)

  if (!result.ok) {
    logger.error('api/payment/session-verify', 'Fulfilment failed', null, { userId: user.id, order_id, reason: result.reason })
    const msg = result.reason === 'amount_mismatch'
      ? 'Payment amount mismatch. Please contact support.'
      : `Payment went through but we couldn’t confirm the session. Contact support with order ID: ${order_id}`
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
