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
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - OVERDUE_HOURS * 3_600_000).toISOString()
  let sent = 0

  // Find messages older than the cutoff that are still unread
  const { data: messages, error } = await (admin as any)
    .from('messages')
    .select('id, match_id, sender_id, content, created_at, is_read')
    .lte('created_at', cutoff)
    .eq('is_read', false)
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!messages?.length) return NextResponse.json({ ok: true, sent: 0 })

  // Group by match so we send at most one email per match per cron run
  const matchesSeen = new Set<string>()

  for (const m of messages as Array<{ id: string; match_id: string; sender_id: string; content: string }>) {
    if (matchesSeen.has(m.match_id)) continue

    const { data: match } = await (admin as any)
      .from('matches')
      .select('client_id, therapist_id, status')
      .eq('id', m.match_id)
      .single()

    if (!match || match.status !== 'active') continue

    const recipientId = m.sender_id === match.client_id ? match.therapist_id : match.client_id

    // Has this recipient already been emailed about this specific message?
    // We track sends via metadata.messageId on the notifications row that
    // gets a follow-up email send. Use a separate marker type to avoid
    // confusing in-app message notifications with email-send tracking.
    const { count } = await (admin as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', recipientId)
      .in('type', ['client_message_email_sent'])
      .eq('metadata->>messageId', m.id)

    if ((count ?? 0) > 0) {
      matchesSeen.add(m.match_id)
      continue
    }

    // Look up names + email
    const [{ data: senderProfile }, { data: recipientProfile }, { data: recipientAuth }] = await Promise.all([
      (admin as any).from('profiles').select('full_name').eq('id', m.sender_id).single(),
      (admin as any).from('profiles').select('full_name').eq('id', recipientId).single(),
      admin.auth.admin.getUserById(recipientId),
    ])

    const senderName = (senderProfile?.full_name as string | undefined) ?? 'Your client'
    const recipientFirstName = (recipientProfile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'
    const recipientEmail = recipientAuth?.user?.email

    if (!recipientEmail) {
      logger.warn('cron/message-overdue-3h', 'No email for recipient, skipping', { userId: recipientId })
      continue
    }

    // Fire the email
    await sendNotificationEmail({
      to: recipientEmail,
      name: recipientFirstName,
      type: 'client_message',
      meta: {
        matchId: m.match_id,
        clientName: senderName,
        messageBody: m.content,
      },
    })

    // Record that we sent the email so we don't send again
    await (admin as any).from('notifications').insert({
      user_id: recipientId,
      type: 'client_message_email_sent',
      title: 'New message email sent',
      body: 'Internal marker; user does not see this',
      metadata: { messageId: m.id, matchId: m.match_id },
      is_read: true,
    })

    matchesSeen.add(m.match_id)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
