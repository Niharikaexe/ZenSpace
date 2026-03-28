// Server-side utility — call from server actions only.
// Creates a DB notification row AND sends an email.

import { createAdminClient } from '@/lib/supabase/server'
import { sendNotificationEmail, type EmailNotificationType } from '@/lib/email'
import { logger } from '@/lib/logger'

export type NotificationType = EmailNotificationType

export interface CreateNotificationParams {
  userId: string                          // recipient
  type: NotificationType
  title: string
  body: string
  metadata?: Record<string, unknown>
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata = {},
}: CreateNotificationParams): Promise<void> {
  const admin = createAdminClient()

  // 1. Write to DB (fire-and-forget style — don't block on error)
  const { error: dbErr } = await (admin as any).from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    metadata,
    is_read: false,
  })

  if (dbErr) {
    logger.error('notifications/create', 'Failed to insert notification', dbErr, { userId, type })
    return
  }

  // 2. Fetch recipient email + name for the email
  try {
    const [{ data: profile }, { data: authUser }] = await Promise.all([
      (admin as any).from('profiles').select('full_name').eq('id', userId).single(),
      admin.auth.admin.getUserById(userId),
    ])

    const email = authUser?.user?.email
    const name = (profile?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

    if (email) {
      // Fire email without awaiting — never block the calling action
      sendNotificationEmail({
        to: email,
        name,
        type,
        meta: Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [k, String(v)])
        ),
      }).catch(err => {
        logger.error('notifications/email', 'Email send failed', err, { userId, type })
      })
    }
  } catch (err) {
    logger.error('notifications/email-lookup', 'Failed to look up recipient for email', err, { userId })
  }
}

// ── Debounce helper for message notifications ─────────────────────────────────
// Returns true if we should create a new notification (no unread message
// notification exists for this match in the last 5 minutes).
export async function shouldNotifyMessage(
  userId: string,
  matchId: string,
): Promise<boolean> {
  const admin = createAdminClient()
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data } = await (admin as any)
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'client_message')
    .eq('is_read', false)
    .filter('metadata->matchId', 'eq', `"${matchId}"`)
    .gte('created_at', fiveMinutesAgo)
    .limit(1)

  return !data || data.length === 0
}
