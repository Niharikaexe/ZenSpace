import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import crypto from 'crypto'
import { z } from 'zod'
import { PLANS, type PlanKey } from '@/lib/plans'
import { sendAdminNewSubscriptionEmail } from '@/lib/email'

// B-10: plan is NOT accepted from the client — fetched from DB to prevent
// a user paying weekly then claiming a monthly period end.
const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
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

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = parsed.data

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

  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))
  if (!signaturesMatch) {
    logger.warn('api/payment/verify', 'Invalid payment signature', {
      userId: user.id,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
    })
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // B-10: fetch plan from DB — do not trust client-supplied value
  const { data: subRecord } = await (admin as any)
    .from('subscriptions')
    .select('plan')
    .eq('client_id', user.id)
    .eq('razorpay_subscription_id', razorpay_subscription_id)
    .maybeSingle() as { data: { plan: string } | null; error: unknown }

  if (!subRecord) {
    logger.error('api/payment/verify', 'Subscription not found in DB', {
      userId: user.id,
      subscriptionId: razorpay_subscription_id,
    })
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const planKey = subRecord.plan as PlanKey
  const planData = PLANS[planKey]

  if (!planData) {
    logger.error('api/payment/verify', 'Unknown plan on subscription record', {
      plan: subRecord.plan,
      userId: user.id,
    })
    return NextResponse.json({ error: 'Unknown plan' }, { status: 500 })
  }

  const now = new Date()
  const periodEnd = new Date(now)
  if (planData.cadence === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1)
  else periodEnd.setDate(periodEnd.getDate() + 7)

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
    plan: planKey,
    subscriptionId: razorpay_subscription_id,
    paymentId: razorpay_payment_id,
    periodEnd: periodEnd.toISOString(),
  })

  // Notify admin — awaited so the Resend POST completes before Vercel freezes
  // the function. sendAdminNewSubscriptionEmail catches its own errors.
  const { data: profile } = await (admin as any).from('profiles').select('full_name').eq('id', user.id).single()
  const planLabel = `${planData.name} (${planData.cadence})`
  await sendAdminNewSubscriptionEmail(profile?.full_name ?? user.email ?? 'A client', planLabel)

  return NextResponse.json({ success: true })
}
