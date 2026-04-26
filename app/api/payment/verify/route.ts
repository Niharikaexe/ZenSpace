import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import crypto from 'crypto'
import { z } from 'zod'
import { PLANS, PLAN_KEYS, type PlanKey } from '@/lib/plans'

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.enum(PLAN_KEYS as [PlanKey, ...PlanKey[]]),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/verify', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/verify', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    logger.warn('api/payment/verify', 'Invalid payload', {
      userId: user.id,
      reason: parsed.error.issues[0].message,
    })
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = parsed.data

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    logger.error('api/payment/verify', 'RAZORPAY_KEY_SECRET env var missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  // Razorpay subscription signature: HMAC(payment_id + "|" + subscription_id, key_secret)
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    logger.warn('api/payment/verify', 'Invalid payment signature', {
      userId: user.id,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
    })
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const planData = PLANS[plan]
  const now = new Date()
  const periodEnd = new Date(now)
  if (planData.cadence === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1)
  else periodEnd.setDate(periodEnd.getDate() + 7)

  const admin = createAdminClient()
  const { error: dbErr } = await (admin as any)
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .eq('client_id', user.id)
    .eq('razorpay_subscription_id', razorpay_subscription_id)

  if (dbErr) {
    logger.error('api/payment/verify', 'Failed to activate subscription', dbErr, {
      userId: user.id,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
    })
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  logger.info('api/payment/verify', 'Subscription activated', {
    userId: user.id,
    plan,
    subscriptionId: razorpay_subscription_id,
    paymentId: razorpay_payment_id,
    periodEnd: periodEnd.toISOString(),
  })

  return NextResponse.json({ success: true })
}
