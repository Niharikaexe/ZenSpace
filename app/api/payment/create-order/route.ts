import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { plan } = parsed.data
  const planData = PLANS[plan]

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: planData.amount,
      currency: 'INR',
      receipt: `zs_${user.id.slice(0, 8)}_${Date.now()}`,
    }),
  })

  if (!orderRes.ok) {
    const err = await orderRes.json()
    console.error('Razorpay order creation failed:', err)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }

  const order = await orderRes.json()

  // Persist a pending subscription record so we can track the attempt
  const admin = createAdminClient()
  await (admin as any).from('subscriptions').insert({
    client_id: user.id,
    plan,
    status: 'pending',
    amount: planData.amount,
    currency: 'INR',
    razorpay_plan_id: order.id, // store order_id here until payment completes
  })

  return NextResponse.json({
    order_id: order.id,
    amount: planData.amount,
    currency: 'INR',
    key: keyId,
  })
}
