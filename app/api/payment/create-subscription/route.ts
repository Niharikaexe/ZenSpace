import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { PLANS, PLAN_KEYS, getRazorpayPlanId, type PlanKey } from '@/lib/plans'

const schema = z.object({
  plan: z.enum(PLAN_KEYS as [PlanKey, ...PlanKey[]]),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { plan } = parsed.data
  const planData = PLANS[plan]

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  const razorpayPlanId = getRazorpayPlanId(plan)

  if (!keyId || !keySecret) {
    logger.error('api/payment/create-subscription', 'Razorpay credentials not configured')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  if (!razorpayPlanId) {
    logger.error('api/payment/create-subscription', `Razorpay plan ID not configured for ${plan}`, {
      envVar: planData.planIdEnvVar,
    })
    return NextResponse.json(
      { error: `Plan "${plan}" is not yet configured. Contact support.` },
      { status: 500 }
    )
  }

  const admin = createAdminClient()

  // Block if there's already an active subscription
  const { data: existing } = await (admin as any)
    .from('subscriptions')
    .select('id, status, plan')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'You already have an active subscription.' },
      { status: 409 }
    )
  }

  // Cancel any stale pending records before creating new one
  await (admin as any)
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('client_id', user.id)
    .eq('status', 'pending')

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  // Create Razorpay subscription
  let razorpaySubscription: { id: string; plan_id: string }
  try {
    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: 12, // 12 billing cycles; Razorpay auto-renews until cancelled
        quantity: 1,
        customer_notify: 1,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      logger.error('api/payment/create-subscription', 'Razorpay subscription creation failed', err, {
        userId: user.id,
        plan,
        status: res.status,
      })
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    razorpaySubscription = await res.json()
  } catch (err) {
    logger.error('api/payment/create-subscription', 'Network error calling Razorpay', err, { userId: user.id })
    return NextResponse.json({ error: 'Failed to reach payment gateway' }, { status: 502 })
  }

  // Persist pending subscription record
  const { error: dbErr } = await (admin as any).from('subscriptions').insert({
    client_id: user.id,
    plan,
    status: 'pending',
    amount: planData.amountPaise,
    currency: 'INR',
    razorpay_subscription_id: razorpaySubscription.id,
    razorpay_plan_id: razorpayPlanId,
  })

  if (dbErr) {
    logger.error('api/payment/create-subscription', 'Failed to insert pending subscription', dbErr, {
      userId: user.id,
      subscriptionId: razorpaySubscription.id,
    })
    // Non-fatal — webhook will activate on payment
  } else {
    logger.info('api/payment/create-subscription', 'Pending subscription created', {
      userId: user.id,
      plan,
      subscriptionId: razorpaySubscription.id,
    })
  }

  return NextResponse.json({
    subscription_id: razorpaySubscription.id,
    key: keyId,
    plan: planData,
  })
}
