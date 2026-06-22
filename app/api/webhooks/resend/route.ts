import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Resend webhook — keeps email_logs.last_status live (delivered / opened /
// clicked / bounced / complained) so the admin Emails tab shows real delivery
// state instead of just "accepted by Resend".
//
// Configure in the Resend dashboard (Webhooks → Add Endpoint) as:
//   https://mindcanopy.in/api/webhooks/resend
// Subscribe to: email.delivered, email.opened, email.clicked, email.bounced,
//   email.complained, email.delivery_delayed.
// Set RESEND_WEBHOOK_SECRET to the signing secret Resend shows (whsec_...).
//
// There is no Next middleware gating /api/* in this app, so Resend's
// unauthenticated POST reaches this handler directly. We verify the Svix
// signature ourselves (Resend signs with Svix; no SDK needed).

// Map a Resend event type → the status we store, plus a rank so out-of-order
// webhooks never downgrade (e.g. a late "delivered" can't overwrite "clicked").
const STATUS_RANK: Record<string, number> = {
  delivery_delayed: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
}
const EVENT_TO_STATUS: Record<string, string> = {
  'email.delivery_delayed': 'delivery_delayed',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
}
// Negative terminal states always win, regardless of what came before.
const TERMINAL_NEGATIVE = new Set(['bounced', 'complained'])

// Verify a Svix-signed webhook. The signed payload is `${id}.${ts}.${body}`,
// HMAC-SHA256 with the base64-decoded secret (after the `whsec_` prefix),
// base64-encoded. The svix-signature header is a space-separated list of
// `v1,<sig>` entries; any match passes.
function verifySvix(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id') ?? ''
  const ts = headers.get('svix-timestamp') ?? ''
  const sigHeader = headers.get('svix-signature') ?? ''
  if (!id || !ts || !sigHeader) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = crypto
    .createHmac('sha256', key)
    .update(`${id}.${ts}.${rawBody}`)
    .digest('base64')
  const expectedBuf = Buffer.from(expected)

  for (const part of sigHeader.split(' ')) {
    const sig = part.split(',')[1] ?? part // entries look like "v1,<sig>"
    try {
      const sigBuf = Buffer.from(sig)
      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return true
      }
    } catch {
      // length mismatch / bad base64 — try the next signature
    }
  }
  return false
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    logger.error('webhook/resend', 'RESEND_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  if (!verifySvix(rawBody, request.headers, secret)) {
    logger.warn('webhook/resend', 'Invalid or missing webhook signature')
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let event: { type?: string; created_at?: string; data?: { email_id?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const type = event.type ?? ''
  const status = EVENT_TO_STATUS[type]
  const emailId = event.data?.email_id
  // Anything we don't track (e.g. email.sent) is acked so Resend won't retry.
  if (!status || !emailId) {
    return NextResponse.json({ received: true })
  }

  const at = event.created_at ?? new Date().toISOString()

  try {
    const admin = createAdminClient()
    const { data: row } = await (admin as any)
      .from('email_logs')
      .select('id, last_status')
      .eq('resend_id', emailId)
      .maybeSingle() as { data: { id: string; last_status: string | null } | null; error: unknown }

    if (!row) {
      // The send may have been logged before resend_id was captured, or it's
      // an email we didn't originate. Nothing to update — ack it.
      logger.info('webhook/resend', 'No matching email_logs row', { emailId, type })
      return NextResponse.json({ received: true })
    }

    const current = row.last_status
    const isTerminalNegative = TERMINAL_NEGATIVE.has(status)
    const beatsCurrent = (STATUS_RANK[status] ?? 0) > (STATUS_RANK[current ?? ''] ?? 0)
    const currentIsTerminalNegative = current ? TERMINAL_NEGATIVE.has(current) : false

    // Update when: this is a bounce/complaint (always record), OR it ranks
    // higher than what we have and we're not overwriting a bounce/complaint.
    if (isTerminalNegative || (beatsCurrent && !currentIsTerminalNegative)) {
      const { error: updErr } = await (admin as any)
        .from('email_logs')
        .update({ last_status: status, last_status_at: at })
        .eq('id', row.id)
      if (updErr) {
        logger.error('webhook/resend', 'Failed to update email_logs', updErr, { emailId, status })
      } else {
        logger.info('webhook/resend', 'Updated email status', { emailId, status })
      }
    }
  } catch (err) {
    logger.error('webhook/resend', 'Handler threw', err, { emailId, type })
    // Still 200: signature was valid; a 5xx would make Resend retry needlessly.
  }

  return NextResponse.json({ received: true })
}
