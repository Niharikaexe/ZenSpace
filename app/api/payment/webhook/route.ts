import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const admin = createAdminClient()

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const orderId = payment.order_id
    const paymentId = payment.id

    await (admin as any)
      .from('subscriptions')
      .update({
        status: 'active',
        razorpay_subscription_id: paymentId,
        current_period_start: new Date().toISOString(),
      })
      .eq('razorpay_plan_id', orderId)
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    const orderId = payment.order_id

    await (admin as any)
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('razorpay_plan_id', orderId)
      .eq('status', 'pending')
  }

  return NextResponse.json({ received: true })
}
