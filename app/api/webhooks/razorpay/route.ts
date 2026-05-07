// Razorpay webhook handler — /api/webhooks/razorpay
// Configure this URL in Razorpay dashboard → Webhooks.
// Enable events: subscription.activated, subscription.charged,
//                payment.failed, subscription.cancelled
//
// Env var required: RAZORPAY_WEBHOOK_SECRET

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

export async function POST(request: Request) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch (err) {
    logger.error('api/webhooks/razorpay', 'Failed to read request body', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const signature = request.headers.get('x-razorpay-signature')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('api/webhooks/razorpay', 'RAZORPAY_WEBHOOK_SECRET env var missing')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!signature) {
    logger.warn('api/webhooks/razorpay', 'Missing x-razorpay-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  if (expectedSignature !== signature) {
    logger.warn('api/webhooks/razorpay', 'Invalid webhook signature — possible spoofing attempt')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch (err) {
    logger.error('api/webhooks/razorpay', 'Failed to parse webhook JSON', err)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  logger.info('api/webhooks/razorpay', 'Webhook received', { eventType: event.event })

  const admin = createAdminClient()

  // ── subscription.activated ────────────────────────────────────────────────
  // Fires when the first payment is captured for a new subscription.
  if (event.event === 'subscription.activated') {
    const sub = (event.payload as any).subscription?.entity
    if (!sub) {
      logger.warn('api/webhooks/razorpay', 'subscription.activated missing subscription entity')
      return NextResponse.json({ received: true })
    }

    const subscriptionId: string = sub.id
    const currentStart = sub.current_start ? new Date(sub.current_start * 1000) : new Date()
    const currentEnd = sub.current_end
      ? new Date(sub.current_end * 1000)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d })()

    const { data: existing } = await (admin as any)
      .from('subscriptions')
      .select('status')
      .eq('razorpay_subscription_id', subscriptionId)
      .maybeSingle()

    // Skip if already activated by the verify endpoint
    if (existing?.status === 'active') {
      logger.info('api/webhooks/razorpay', 'subscription.activated — already active, skipping', { subscriptionId })
      return NextResponse.json({ received: true })
    }

    const { error } = await (admin as any)
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: currentStart.toISOString(),
        current_period_end: currentEnd.toISOString(),
      })
      .eq('razorpay_subscription_id', subscriptionId)

    if (error) {
      logger.error('api/webhooks/razorpay', 'Failed to activate subscription', error, { subscriptionId })
    } else {
      logger.info('api/webhooks/razorpay', 'Subscription activated via webhook', { subscriptionId })
    }
  }

  // ── subscription.charged ──────────────────────────────────────────────────
  // Fires on every successful recurring billing cycle.
  // Update the period end date to reflect the new billing cycle.
  if (event.event === 'subscription.charged') {
    const sub = (event.payload as any).subscription?.entity
    if (!sub) {
      logger.warn('api/webhooks/razorpay', 'subscription.charged missing subscription entity')
      return NextResponse.json({ received: true })
    }

    const subscriptionId: string = sub.id
    const currentStart = sub.current_start ? new Date(sub.current_start * 1000) : new Date()
    const currentEnd = sub.current_end
      ? new Date(sub.current_end * 1000)
      : (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d })()

    const { error } = await (admin as any)
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: currentStart.toISOString(),
        current_period_end: currentEnd.toISOString(),
      })
      .eq('razorpay_subscription_id', subscriptionId)

    if (error) {
      logger.error('api/webhooks/razorpay', 'Failed to update period on subscription.charged', error, { subscriptionId })
    } else {
      logger.info('api/webhooks/razorpay', 'Subscription period renewed', {
        subscriptionId,
        periodEnd: currentEnd.toISOString(),
      })
    }
  }

  // ── payment.failed ────────────────────────────────────────────────────────
  // Fires when a payment attempt fails (including recurring billing failure).
  if (event.event === 'payment.failed') {
    const payment = (event.payload as any).payment?.entity
    if (!payment) {
      logger.warn('api/webhooks/razorpay', 'payment.failed missing payment entity')
      return NextResponse.json({ received: true })
    }

    // For subscription payments, razorpay sends subscription_id on the payment entity
    const subscriptionId: string | undefined = payment.subscription_id
    const errorDesc: string = payment.error_description ?? 'Payment failed'

    if (subscriptionId) {
      const { error } = await (admin as any)
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('razorpay_subscription_id', subscriptionId)
        .in('status', ['pending', 'active'])

      if (error) {
        logger.error('api/webhooks/razorpay', 'Failed to cancel subscription on payment.failed', error, { subscriptionId })
      } else {
        logger.info('api/webhooks/razorpay', 'Subscription cancelled due to payment failure', {
          subscriptionId,
          reason: errorDesc,
        })
      }
    }
  }

  // ── subscription.cancelled ────────────────────────────────────────────────
  // Fires when a subscription is explicitly cancelled (via Razorpay dashboard or API).
  if (event.event === 'subscription.cancelled') {
    const sub = (event.payload as any).subscription?.entity
    if (!sub) {
      logger.warn('api/webhooks/razorpay', 'subscription.cancelled missing subscription entity')
      return NextResponse.json({ received: true })
    }

    const subscriptionId: string = sub.id

    const { error } = await (admin as any)
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('razorpay_subscription_id', subscriptionId)

    if (error) {
      logger.error('api/webhooks/razorpay', 'Failed to cancel subscription', error, { subscriptionId })
    } else {
      logger.info('api/webhooks/razorpay', 'Subscription cancelled', { subscriptionId })
    }
  }

  return NextResponse.json({ received: true })
}
