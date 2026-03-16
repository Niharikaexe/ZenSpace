import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const PLANS = {
  weekly: {
    label: 'Weekly',
    amount: 120000, // ₹1,200 in paise
    display: '₹1,200 / week',
    description: 'Flexible weekly access to your therapist',
  },
  monthly: {
    label: 'Monthly',
    amount: 399900, // ₹3,999 in paise
    display: '₹3,999 / month',
    description: 'Best value — save 17% compared to weekly',
  },
} as const

const schema = z.object({
  plan: z.enum(['weekly', 'monthly']),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/create-order', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/create-order', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    logger.warn('api/payment/create-order', 'Invalid plan in request', {
      userId: user.id,
      reason: parsed.error.issues[0].message,
    })
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { plan } = parsed.data
  const planData = PLANS[plan]

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    logger.error('api/payment/create-order', 'Razorpay env vars missing — RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  let order: { id: string }
  try {
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: planData.amount,
        currency: 'INR',
        receipt: `zs_${user.id.slice(0, 8)}_${Date.now()}`,
      }),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}))
      logger.error('api/payment/create-order', 'Razorpay order creation failed', err, {
        userId: user.id,
        plan,
        status: orderRes.status,
      })
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
    }

    order = await orderRes.json()
  } catch (err) {
    logger.error('api/payment/create-order', 'Network error calling Razorpay', err, { userId: user.id })
    return NextResponse.json({ error: 'Failed to reach payment gateway' }, { status: 502 })
  }

  // Persist a pending subscription record
  const admin = createAdminClient()
  const { error: dbErr } = await (admin as any).from('subscriptions').insert({
    client_id: user.id,
    plan,
    status: 'pending',
    amount: planData.amount,
    currency: 'INR',
    razorpay_plan_id: order.id,
  })

  if (dbErr) {
    logger.error('api/payment/create-order', 'Failed to insert pending subscription', dbErr, {
      userId: user.id,
      orderId: order.id,
    })
    // Non-fatal — order was created in Razorpay, proceed
  } else {
    logger.info('api/payment/create-order', 'Pending subscription created', {
      userId: user.id,
      plan,
      orderId: order.id,
      amount: planData.amount,
    })
  }

  return NextResponse.json({
    order_id: order.id,
    amount: planData.amount,
    currency: 'INR',
    key: keyId,
  })
}
