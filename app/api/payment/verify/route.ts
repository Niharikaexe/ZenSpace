import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { z } from 'zod'

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
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
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = parsed.data

  // Verify signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  // Activate the subscription record matching this order
  const admin = createAdminClient()
  const { error } = await (admin as any)
    .from('subscriptions')
    .update({
      status: 'active',
      razorpay_subscription_id: razorpay_payment_id,
      current_period_start: new Date().toISOString(),
      current_period_end: getperiodEnd(plan),
    })
    .eq('client_id', user.id)
    .eq('razorpay_plan_id', razorpay_order_id)

  if (error) {
    console.error('Failed to activate subscription:', error)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

function getperiodEnd(plan: 'weekly' | 'monthly'): string {
  const now = new Date()
  if (plan === 'weekly') now.setDate(now.getDate() + 7)
  else now.setMonth(now.getMonth() + 1)
  return now.toISOString()
}
