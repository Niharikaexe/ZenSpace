'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export type SubscriptionActionState = {
  error?: string
  success?: boolean
}

export async function cancelSubscription(): Promise<SubscriptionActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()

  const { data: sub, error: fetchErr } = await (admin as any)
    .from('subscriptions')
    .select('id, razorpay_subscription_id, current_period_end')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as {
      data: { id: string; razorpay_subscription_id: string | null; current_period_end: string | null } | null
      error: unknown
    }

  if (fetchErr) {
    logger.error('subscription/cancel', 'Failed to fetch subscription', fetchErr, { userId: user.id })
    return { error: 'Something went wrong. Please try again.' }
  }

  if (!sub) {
    return { error: 'No active subscription found.' }
  }

  // Cancel in Razorpay at end of current billing cycle — client keeps access until period_end
  if (sub.razorpay_subscription_id) {
    try {
      const basic = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64')

      const rzpRes = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${sub.razorpay_subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancel_at_cycle_end: 1 }),
        }
      )

      if (!rzpRes.ok) {
        const body = await rzpRes.text()
        logger.error('subscription/cancel', 'Razorpay cancel API failed — proceeding with DB update', { body, userId: user.id })
      } else {
        logger.info('subscription/cancel', 'Razorpay cancel requested at cycle end', { userId: user.id })
      }
    } catch (err) {
      logger.error('subscription/cancel', 'Razorpay cancel API threw — proceeding with DB update', err, { userId: user.id })
    }
  }

  const { error: updateErr } = await (admin as any)
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  if (updateErr) {
    logger.error('subscription/cancel', 'Failed to update subscription in DB', updateErr, { userId: user.id })
    return { error: 'Failed to cancel subscription. Please contact support.' }
  }

  logger.info('subscription/cancel', 'Subscription cancelled', {
    userId: user.id,
    subId: sub.id,
    accessUntil: sub.current_period_end,
  })

  revalidatePath('/dashboard/subscription')
  revalidatePath('/dashboard/account')
  revalidatePath('/dashboard/chat')

  return { success: true }
}
