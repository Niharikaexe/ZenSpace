// Single, idempotent fulfilment path for a paid session order.
//
// Called by BOTH the Cashfree webhook (primary trigger) and the synchronous
// return-verify (backstop when the client comes back from checkout). Whichever
// fires first does the work; the second is a no-op. Nothing here runs until
// Cashfree has actually confirmed payment — an order id alone never triggers it.
//
// On a confirmed payment this:
//   1. verifies the paid amount matches the server-computed expected amount,
//   2. creates the Daily.co room,
//   3. inserts the session row as status='scheduled', payment_status='paid',
//   4. flips the session_orders row to 'paid' and links the session,
//   5. writes the unified payments ledger row,
//   6. emails admin (payment), client + therapist (scheduled session details).

import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { createDailyRoom } from '@/lib/daily'
import { sendAdminSessionPaymentEmail } from '@/lib/email'
import { formatIST } from '@/lib/datetime'
import { formatInr } from '@/lib/plans'
import { logger } from '@/lib/logger'

type Admin = ReturnType<typeof createAdminClient>

export type FulfilResult =
  | { ok: true; sessionId: string; alreadyDone?: boolean }
  | { ok: false; reason: 'order_not_found' | 'amount_mismatch' | 'db_error' }

/**
 * Fulfil a paid session order. Idempotent on the order's `status`/`session_id`.
 *
 * @param orderId      Cashfree order id (sess_…), the session_orders PK ref.
 * @param paymentId    cf_payment_id of the successful payment (for the ledger).
 * @param paidAmountInr Amount Cashfree reports as paid, in rupees. When provided
 *   it MUST match the order's expected amount or fulfilment is refused (guards
 *   against a tampered/underpaid order).
 */
export async function fulfillSessionOrder(
  orderId: string,
  paymentId: string,
  paidAmountInr?: number | null,
): Promise<FulfilResult> {
  const admin: Admin = createAdminClient()

  // Load the order intent.
  const { data: order } = await (admin as any)
    .from('session_orders')
    .select('id, order_id, match_id, client_id, therapist_id, scheduled_at, category, tier, client_amount_paise, therapist_payout_paise, status, session_id')
    .eq('order_id', orderId)
    .maybeSingle() as {
      data: {
        id: string; order_id: string; match_id: string; client_id: string; therapist_id: string
        scheduled_at: string; category: string | null; tier: string | null
        client_amount_paise: number; therapist_payout_paise: number | null
        status: string; session_id: string | null
      } | null
      error: unknown
    }

  if (!order) {
    logger.warn('payments/fulfill', 'No session_order for order — ignoring', { orderId })
    return { ok: false, reason: 'order_not_found' }
  }

  // Idempotency: already fulfilled (webhook + verify race, or a retry).
  if (order.status === 'paid' && order.session_id) {
    return { ok: true, sessionId: order.session_id, alreadyDone: true }
  }

  // Amount check — never fulfil an underpaid/tampered order.
  if (paidAmountInr != null) {
    const paidPaise = Math.round(paidAmountInr * 100)
    if (paidPaise !== order.client_amount_paise) {
      logger.error('payments/fulfill', 'Paid amount does not match expected — refusing', null, {
        orderId, expectedPaise: order.client_amount_paise, paidPaise,
      })
      await (admin as any).from('session_orders')
        .update({ status: 'failed', cf_payment_id: paymentId, updated_at: new Date().toISOString() })
        .eq('id', order.id).eq('status', 'created')
      return { ok: false, reason: 'amount_mismatch' }
    }
  }

  // ── Atomic claim ────────────────────────────────────────────────────────────
  // Flip 'created' → 'paid' as a compare-and-swap. Only ONE caller wins; this is
  // what makes the webhook + return-verify race safe — without it both could
  // pass the check above and each insert a session. The loser bails idempotently.
  const { data: claimed } = await (admin as any)
    .from('session_orders')
    .update({ status: 'paid', cf_payment_id: paymentId, paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', order.id)
    .eq('status', 'created')
    .select('id') as { data: { id: string }[] | null; error: unknown }

  if (!claimed || claimed.length === 0) {
    // Someone else claimed it (or it's already paid). Return its session if set.
    const { data: fresh } = await (admin as any)
      .from('session_orders').select('session_id').eq('id', order.id).maybeSingle() as {
        data: { session_id: string | null } | null; error: unknown
      }
    if (fresh?.session_id) return { ok: true, sessionId: fresh.session_id, alreadyDone: true }
    logger.warn('payments/fulfill', 'Order claimed by a concurrent caller — deferring', { orderId })
    return { ok: true, sessionId: '', alreadyDone: true }
  }

  // We own the fulfilment now. Create the Daily.co room (non-fatal).
  const room = await createDailyRoom(order.match_id, order.scheduled_at)

  // Insert the session: paid + scheduled, atomically valid under the DB trigger.
  const { data: inserted, error: sessErr } = await (admin as any)
    .from('sessions')
    .insert({
      match_id: order.match_id,
      session_type: 'video',
      status: 'scheduled',
      scheduled_at: order.scheduled_at,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      client_amount_paise: order.client_amount_paise,
      therapist_payout_paise: order.therapist_payout_paise,
      category: order.category,
      tier: order.tier,
      razorpay_order_id: order.order_id,    // reused column → Cashfree order id
      razorpay_payment_id: paymentId,
      daily_room_id: room.id,               // room UUID — used to match transcript.* webhook events
      daily_room_url: room.url,
      daily_room_name: room.name,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (sessErr || !inserted) {
    // Roll the claim back to 'created' so a webhook retry can re-fulfil instead
    // of the order being stuck 'paid' with no session.
    logger.error('payments/fulfill', 'Failed to insert paid session — reverting claim', sessErr, { orderId })
    await (admin as any).from('session_orders')
      .update({ status: 'created', updated_at: new Date().toISOString() })
      .eq('id', order.id).eq('status', 'paid')
    return { ok: false, reason: 'db_error' }
  }

  // Link the created session to the (already-claimed) order.
  await (admin as any)
    .from('session_orders')
    .update({ session_id: inserted.id, updated_at: new Date().toISOString() })
    .eq('id', order.id)

  // Unified payments ledger (deduped on the unique payment id).
  const { error: payErr } = await (admin as any)
    .from('payments')
    .upsert({
      client_id: order.client_id,
      therapist_id: order.therapist_id,
      match_id: order.match_id,
      kind: 'session',
      session_id: inserted.id,
      amount_paise: order.client_amount_paise,
      therapist_payout_paise: order.therapist_payout_paise,
      razorpay_order_id: order.order_id,
      razorpay_payment_id: paymentId,
      status: 'paid',
    }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
  if (payErr) logger.error('payments/fulfill', 'Failed to write payment ledger row', payErr, { orderId })

  logger.info('payments/fulfill', 'Session order fulfilled', {
    orderId, sessionId: inserted.id, paymentId,
  })

  // ── Emails: admin (payment) + client & therapist (scheduled details) ────────
  // All times rendered in IST.
  const dateStr = formatIST(order.scheduled_at)
  try {
    const { data: profiles } = await (admin as any)
      .from('profiles').select('id, full_name')
      .in('id', [order.client_id, order.therapist_id]) as {
        data: { id: string; full_name: string }[] | null; error: unknown
      }
    const clientFullName = (profiles ?? []).find(p => p.id === order.client_id)?.full_name ?? 'A client'
    const therapistFullName = (profiles ?? []).find(p => p.id === order.therapist_id)?.full_name ?? 'your therapist'
    const clientFirstName = clientFullName.split(' ')[0] || 'there'
    const therapistFirstName = therapistFullName.split(' ')[0] || 'your therapist'

    await Promise.allSettled([
      // Admin — payment received.
      sendAdminSessionPaymentEmail({
        clientName: clientFullName,
        therapistName: therapistFullName,
        amountInr: formatInr(order.client_amount_paise / 100),
        dateStr,
        paymentId,
      }),
      // Client — scheduled session details.
      createNotification({
        userId: order.client_id,
        type: 'session_scheduled_client',
        title: 'Your session is booked',
        body: `Your video session with ${therapistFirstName} is scheduled for ${dateStr} IST.`,
        metadata: { sessionId: inserted.id, matchId: order.match_id, scheduledAt: order.scheduled_at, sessionType: 'video', dateStr, therapistFirstName, clientFirstName },
      }),
      // Therapist — scheduled session details.
      createNotification({
        userId: order.therapist_id,
        type: 'session_scheduled_therapist',
        title: 'Session booked',
        body: `A video session with ${clientFirstName} is booked for ${dateStr} IST.`,
        metadata: { sessionId: inserted.id, matchId: order.match_id, scheduledAt: order.scheduled_at, sessionType: 'video', dateStr, therapistFirstName, clientFirstName },
      }),
    ])
  } catch (err) {
    logger.warn('payments/fulfill', 'Post-fulfil email dispatch failed', { orderId, err: err instanceof Error ? err.message : String(err) })
  }

  return { ok: true, sessionId: inserted.id }
}
