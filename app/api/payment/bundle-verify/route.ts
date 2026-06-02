import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import crypto from 'crypto'
import { z } from 'zod'

// Activates a monthly bundle after Razorpay checkout. Verifies the order
// signature, flips the bundle to 'active' (granting its credits), and is
// idempotent — a re-posted verify for an already-active bundle is a no-op.

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  bundleId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/bundle-verify', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/bundle-verify', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bundleId } = parsed.data

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    logger.error('api/payment/bundle-verify', 'RAZORPAY_KEY_SECRET env var missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))
  if (!signaturesMatch) {
    logger.warn('api/payment/bundle-verify', 'Invalid payment signature', {
      userId: user.id, bundleId, orderId: razorpay_order_id,
    })
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: bundle } = await (admin as any)
    .from('session_bundles')
    .select('id, client_id, status, razorpay_order_id')
    .eq('id', bundleId)
    .maybeSingle() as {
      data: { id: string; client_id: string; status: string; razorpay_order_id: string | null } | null
      error: unknown
    }

  if (!bundle || bundle.razorpay_order_id !== razorpay_order_id) {
    logger.error('api/payment/bundle-verify', 'Bundle not found or order mismatch', { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
  }

  if (bundle.client_id !== user.id) {
    logger.warn('api/payment/bundle-verify', 'Caller does not own this bundle', { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Idempotency — already active, nothing to do.
  if (bundle.status === 'active') {
    return NextResponse.json({ success: true })
  }

  const { error: dbErr } = await (admin as any)
    .from('session_bundles')
    .update({
      status: 'active',
      paid_at: new Date().toISOString(),
      razorpay_payment_id,
    })
    .eq('id', bundleId)
    .eq('status', 'pending')

  if (dbErr) {
    logger.error('api/payment/bundle-verify', 'Failed to activate bundle', dbErr, { userId: user.id, bundleId })
    return NextResponse.json({ error: 'Failed to activate bundle' }, { status: 500 })
  }

  logger.info('api/payment/bundle-verify', 'Bundle activated', {
    userId: user.id, bundleId, paymentId: razorpay_payment_id,
  })

  return NextResponse.json({ success: true })
}
