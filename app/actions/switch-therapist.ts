'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'
import { logger } from '@/lib/logger'

const switchSchema = z.object({
  reason: z.string().max(500).optional(),
  details: z.string().max(1000).optional(),
})

export type SwitchActionState = {
  error?: string
  success?: boolean
}

export async function requestTherapistSwitch(
  _: SwitchActionState,
  formData: FormData
): Promise<SwitchActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = switchSchema.safeParse({
    reason: formData.get('reason') || undefined,
    details: formData.get('details') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { reason, details } = parsed.data
  const admin = createAdminClient()

  // Verify client has an active match
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  if (!match) {
    return { error: 'No active match found. Contact support if you need help.' }
  }

  // Check if a pending request already exists to prevent duplicates
  const { data: existing } = await (admin as any)
    .from('therapist_switch_requests')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'pending')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  if (existing) {
    return { error: 'You already have a pending switch request. Our team will get back to you shortly.' }
  }

  // Insert the switch request
  const { error: insertErr } = await (admin as any)
    .from('therapist_switch_requests')
    .insert({
      client_id: user.id,
      match_id: match.id,
      reason: reason ?? null,
      details: details ?? null,
    })

  if (insertErr) {
    logger.error('switch-therapist', 'Failed to insert switch request', insertErr, { userId: user.id })
    return { error: 'Something went wrong. Please try again or contact support.' }
  }

  // Get client name for notification
  const { data: clientProfile } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as { data: { full_name: string } | null; error: unknown }

  const clientName = clientProfile?.full_name ?? 'A client'

  // Notify all admin users
  const { data: adminProfiles } = await (admin as any)
    .from('profiles')
    .select('id')
    .eq('role', 'admin') as { data: { id: string }[] | null; error: unknown }

  if (adminProfiles && adminProfiles.length > 0) {
    for (const adminProfile of adminProfiles) {
      createNotification({
        userId: adminProfile.id,
        type: 'switch_request',
        title: 'Therapist switch requested',
        body: `${clientName} has requested a new therapist match.`,
        metadata: {
          clientId: user.id,
          clientName,
          matchId: match.id,
          reason: reason ?? '',
        },
      }).catch(() => {})
    }
  }

  logger.info('switch-therapist', 'Switch request submitted', {
    userId: user.id,
    matchId: match.id,
    reason: reason ?? 'none',
  })

  return { success: true }
}
