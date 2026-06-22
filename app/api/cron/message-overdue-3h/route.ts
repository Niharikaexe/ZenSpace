import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNotificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

// Vercel Cron, runs hourly.
// Finds chat messages older than 3 hours that the recipient hasn't read yet,
// and sends them the new-message email. The immediate send was removed from
// sendMessage in favour of this delayed gate, per the brand-voice direction:
// only email the recipient if they actually haven't seen the message after a
// reasonable wait.
//
// Dedupes via the notifications table: only one email per message id.
// The recipient is whoever didn't send (sender_id matched against
// matches.client_id and matches.therapist_id).

const OVERDUE_HOURS = 3

export async function GET(request: NextRequest) {
  const ctx = 'cron/message-overdue-3h'
  logger.info(ctx, 'Cron triggered')

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    logger.error(ctx, 'CRON_SECRET not configured in this environment')
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    logger.warn(ctx, 'Rejected — missing/incorrect Authorization header', {
      hasAuthHeader: request.headers.has('authorization'),
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  logger.info(ctx, 'Auth OK')

  // Sanity-check the env vars createAdminClient relies on, so a missing one
  // shows up as a clear log line instead of an opaque thrown error.
  logger.info(ctx, 'Env check', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })

  try {
    const admin = createAdminClient()
    const cutoff = new Date(Date.now() - OVERDUE_HOURS * 3_600_000).toISOString()
    let sent = 0

    logger.info(ctx, 'Querying unread messages older than cutoff', { cutoff })

    // Find messages older than the cutoff that are still unread
    const { data: messages, error } = await (admin as any)
      .from('messages')
      .select('id, match_id, sender_id, content, created_at, is_read')
      .lte('created_at', cutoff)
      .eq('is_read', false)
      .order('created_at', { ascending: true })
      .limit(500)

    if (error) {
      logger.error(ctx, 'Failed to query messages', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    logger.info(ctx, 'Messages query OK', { count: messages?.length ?? 0 })

    if (!messages?.length) return NextResponse.json({ ok: true, sent: 0 })

    // Group by match so we send at most one email per match per cron run
    const matchesSeen = new Set<string>()

    for (const m of messages as Array<{ id: string; match_id: string; sender_id: string; content: string }>) {
      if (matchesSeen.has(m.match_id)) continue

      const { data: match, error: matchErr } = await (admin as any)
        .from('matches')
        .select('client_id, therapist_id, status')
        .eq('id', m.match_id)
        .single()

      if (matchErr) {
        logger.error(ctx, 'Failed to fetch match', matchErr, { matchId: m.match_id, messageId: m.id })
        continue
      }

      if (!match || match.status !== 'active') {
        logger.info(ctx, 'Skipping message — match missing or not active', {
          matchId: m.match_id,
          messageId: m.id,
          matchStatus: match?.status,
        })
        continue
      }

      const recipientId = m.sender_id === match.client_id ? match.therapist_id : match.client_id

      // Has this recipient already been emailed about this specific message?
      // We track sends via metadata.messageId on the notifications row that
      // gets a follow-up email send. Use a separate marker type to avoid
      // confusing in-app message notifications with email-send tracking.
      const { count, error: countErr } = await (admin as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', recipientId)
        .in('type', ['client_message_email_sent'])
        .eq('metadata->>messageId', m.id)

      if (countErr) {
        logger.error(ctx, 'Failed to check existing email-sent marker', countErr, {
          messageId: m.id,
          recipientId,
        })
        continue
      }

      if ((count ?? 0) > 0) {
        logger.info(ctx, 'Already emailed for this message, skipping', { messageId: m.id, recipientId })
        matchesSeen.add(m.match_id)
        continue
      }

      // Look up names + email
      const [{ data: senderProfile, error: senderErr }, { data: recipientProfile, error: recipientErr }, recipientAuthRes] = await Promise.all([
        (admin as any).from('profiles').select('full_name').eq('id', m.sender_id).single(),
        (admin as any).from('profiles').select('full_name').eq('id', recipientId).single(),
        admin.auth.admin.getUserById(recipientId),
      ])

      if (senderErr) logger.error(ctx, 'Failed to fetch sender profile', senderErr, { userId: m.sender_id })
      if (recipientErr) logger.error(ctx, 'Failed to fetch recipient profile', recipientErr, { userId: recipientId })
      if (recipientAuthRes?.error) {
        logger.error(ctx, 'Failed to fetch recipient auth user', recipientAuthRes.error, { userId: recipientId })
      }

      const senderName = (senderProfile?.full_name as string | undefined) ?? 'Your client'
      const recipientFirstName = (recipientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'
      const recipientEmail = recipientAuthRes?.data?.user?.email

      if (!recipientEmail) {
        logger.warn(ctx, 'No email for recipient, skipping', { userId: recipientId, messageId: m.id })
        continue
      }

      logger.info(ctx, 'Sending overdue-message email', {
        userId: recipientId,
        messageId: m.id,
        matchId: m.match_id,
      })

      // Fire the email
      await sendNotificationEmail({
        to: recipientEmail,
        name: recipientFirstName,
        type: 'client_message',
        meta: {
          matchId: m.match_id,
          clientName: senderName,
          messageBody: m.content,
          // Picks the right template + chat link in the email: a client
          // recipient gets /dashboard/chat, a therapist gets /therapist/dashboard/chat.
          recipientRole: recipientId === match.client_id ? 'client' : 'therapist',
        },
      })

      // Record that we sent the email so we don't send again
      const { error: markerErr } = await (admin as any).from('notifications').insert({
        user_id: recipientId,
        type: 'client_message_email_sent',
        title: 'New message email sent',
        body: 'Internal marker; user does not see this',
        metadata: { messageId: m.id, matchId: m.match_id },
        is_read: true,
      })

      if (markerErr) {
        logger.error(ctx, 'Failed to write email-sent marker (email was still sent)', markerErr, {
          messageId: m.id,
          recipientId,
        })
      }

      matchesSeen.add(m.match_id)
      sent++
    }

    logger.info(ctx, 'Cron finished', { sent })
    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    logger.error(ctx, 'Unhandled exception in cron', err)
    return NextResponse.json({ ok: false, error: 'Unhandled exception', detail: formatErrForResponse(err) }, { status: 500 })
  }
}

function formatErrForResponse(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`
  return String(err)
}
