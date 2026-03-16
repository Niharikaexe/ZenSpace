import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

export async function POST(request: Request) {
  let body: string
  try {
    body = await request.text()
  } catch (err) {
    logger.error('api/payment/webhook', 'Failed to read request body', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const signature = request.headers.get('x-razorpay-signature')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('api/payment/webhook', 'RAZORPAY_WEBHOOK_SECRET env var missing')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!signature) {
    logger.warn('api/payment/webhook', 'Request missing x-razorpay-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (expectedSignature !== signature) {
    logger.warn('api/payment/webhook', 'Invalid webhook signature — possible spoofing attempt')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(body)
  } catch (err) {
    logger.error('api/payment/webhook', 'Failed to parse webhook JSON body', err)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  logger.info('api/payment/webhook', 'Webhook received', { eventType: event.event })

  const admin = createAdminClient()

  if (event.event === 'payment.captured') {
    const payment = (event.payload as any).payment?.entity
    if (!payment) {
      logger.warn('api/payment/webhook', 'payment.captured event missing payment entity')
      return NextResponse.json({ received: true })
    }

    const { id: paymentId, order_id: orderId } = payment

    const { error: dbErr } = await (admin as any)
      .from('subscriptions')
      .update({
        status: 'active',
        razorpay_subscription_id: paymentId,
        current_period_start: new Date().toISOString(),
      })
      .eq('razorpay_plan_id', orderId)

    if (dbErr) {
      logger.error('api/payment/webhook', 'Failed to activate subscription on payment.captured', dbErr, {
        orderId,
        paymentId,
      })
    } else {
      logger.info('api/payment/webhook', 'Subscription activated via webhook', { orderId, paymentId })
    }
  }

  if (event.event === 'payment.failed') {
    const payment = (event.payload as any).payment?.entity
    if (!payment) {
      logger.warn('api/payment/webhook', 'payment.failed event missing payment entity')
      return NextResponse.json({ received: true })
    }

    const { order_id: orderId, error_description } = payment

    const { error: dbErr } = await (admin as any)
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('razorpay_plan_id', orderId)
      .eq('status', 'pending')

    if (dbErr) {
      logger.error('api/payment/webhook', 'Failed to cancel subscription on payment.failed', dbErr, { orderId })
    } else {
      logger.info('api/payment/webhook', 'Subscription cancelled on payment failure', {
        orderId,
        reason: error_description,
      })
    }
  }

  return NextResponse.json({ received: true })
}
