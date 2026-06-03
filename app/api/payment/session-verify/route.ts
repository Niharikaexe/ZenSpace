import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import crypto from 'crypto'
import { z } from 'zod'

// Confirms a pay-as-you-go session after Razorpay checkout. Verifies the order
// signature, marks the session 'paid', creates the Daily.co room, and notifies
// the therapist. Idempotent — a re-posted verify for an already-paid session is
// a no-op success.

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  sessionId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('api/payment/session-verify', 'Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error('api/payment/session-verify', 'Failed to parse request body', err, { userId: user.id })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, sessionId } = parsed.data

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    logger.error('api/payment/session-verify', 'RAZORPAY_KEY_SECRET env var missing')
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  // Razorpay order signature: HMAC(order_id + "|" + payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))
  if (!signaturesMatch) {
    logger.warn('api/payment/session-verify', 'Invalid payment signature', {
      userId: user.id, sessionId, orderId: razorpay_order_id,
    })
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Load the pending session and verify ownership + order match.
  const { data: session } = await (admin as any)
    .from('sessions')
    .select('id, match_id, scheduled_at, payment_status, razorpay_order_id, client_amount_paise, therapist_payout_paise')
    .eq('id', sessionId)
    .maybeSingle() as {
      data: { id: string; match_id: string; scheduled_at: string; payment_status: string; razorpay_order_id: string | null; client_amount_paise: number | null; therapist_payout_paise: number | null } | null
      error: unknown
    }

  if (!session || session.razorpay_order_id !== razorpay_order_id) {
    logger.error('api/payment/session-verify', 'Session not found or order mismatch', { userId: user.id, sessionId })
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const { data: match } = await (admin as any)
    .from('matches')
    .select('client_id, therapist_id')
    .eq('id', session.match_id)
    .single() as { data: { client_id: string; therapist_id: string } | null; error: unknown }

  if (!match || match.client_id !== user.id) {
    logger.warn('api/payment/session-verify', 'Caller does not own this session', { userId: user.id, sessionId })
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Idempotency — already paid, nothing to do.
  if (session.payment_status === 'paid') {
    return NextResponse.json({ success: true })
  }

  // Create the Daily.co room now that payment is confirmed.
  let dailyRoomUrl: string | null = null
  let dailyRoomName: string | null = null
  if (process.env.DAILY_API_KEY) {
    try {
      const roomName = `mindcanopy-${session.match_id.slice(0, 8)}-${Date.now()}`
      const sessionStart = new Date(session.scheduled_at).getTime()
      const exp = Math.floor(Math.max(sessionStart, Date.now()) / 1000) + 7200

      const res = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'private',
          properties: { exp, max_participants: 2 },
        }),
      })

      if (res.ok) {
        const room = await res.json()
        dailyRoomUrl = room.url
        dailyRoomName = room.name
      } else {
        const text = await res.text().catch(() => '<no body>')
        logger.warn('api/payment/session-verify', 'Daily.co room creation rejected', { sessionId, status: res.status, body: text })
      }
    } catch (err) {
      // Non-fatal — the session is still confirmed; the therapist will see "no link".
      logger.warn('api/payment/session-verify', 'Daily.co room creation threw', { sessionId, err: err instanceof Error ? err.message : String(err) })
    }
  }

  const { error: dbErr } = await (admin as any)
    .from('sessions')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      razorpay_payment_id,
      daily_room_url: dailyRoomUrl,
      daily_room_name: dailyRoomName,
    })
    .eq('id', sessionId)
    .eq('payment_status', 'pending')

  if (dbErr) {
    logger.error('api/payment/session-verify', 'Failed to confirm session', dbErr, { userId: user.id, sessionId })
    return NextResponse.json({ error: 'Failed to confirm session' }, { status: 500 })
  }

  logger.info('api/payment/session-verify', 'Session confirmed', {
    userId: user.id, sessionId, paymentId: razorpay_payment_id,
  })

  // Record the charge in the unified payment ledger. Deduped on
  // razorpay_payment_id (unique) so a re-posted verify can't double-insert.
  const { error: payErr } = await (admin as any)
    .from('payments')
    .upsert({
      client_id: match.client_id,
      therapist_id: match.therapist_id,
      match_id: session.match_id,
      kind: 'session',
      session_id: sessionId,
      amount_paise: session.client_amount_paise ?? 0,
      therapist_payout_paise: session.therapist_payout_paise ?? null,
      razorpay_order_id,
      razorpay_payment_id,
      status: 'paid',
    }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
  if (payErr) {
    logger.error('api/payment/session-verify', 'Failed to write payment ledger row', payErr, { sessionId, paymentId: razorpay_payment_id })
  }

  // Notify the therapist about the newly booked session (fire-and-forget).
  try {
    const dateStr = new Date(session.scheduled_at).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name')
      .in('id', [match.therapist_id, match.client_id])
    const therapistFirstName = ((profiles ?? []).find((p: any) => p.id === match.therapist_id)?.full_name as string | undefined)?.split(' ')[0] ?? 'your therapist'
    const clientFirstName = ((profiles ?? []).find((p: any) => p.id === match.client_id)?.full_name as string | undefined)?.split(' ')[0] ?? 'your client'

    createNotification({
      userId: match.therapist_id,
      type: 'session_scheduled_therapist',
      title: 'Session booked',
      body: `A video session has been booked for ${dateStr}.`,
      metadata: {
        matchId: session.match_id, scheduledAt: session.scheduled_at, sessionType: 'video', dateStr,
        therapistFirstName, clientFirstName,
      },
    }).catch((err) => logger.error('api/payment/session-verify', 'Failed to send booking notification', err))
  } catch (err) {
    logger.warn('api/payment/session-verify', 'Booking notification dispatch failed', { sessionId, err: err instanceof Error ? err.message : String(err) })
  }

  return NextResponse.json({ success: true })
}
