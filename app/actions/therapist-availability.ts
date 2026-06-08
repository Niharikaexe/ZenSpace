'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

type Slot = { hour: number; minute: number }
export type WeeklyAvailability = Record<string, Slot[]>

// Confirm a string is a real IANA zone Intl can use (rejects junk before storing).
function isValidIanaZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export async function updateWeeklyAvailability(
  schedule: WeeklyAvailability,
  timezone?: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const validKeys = new Set(['0', '1', '2', '3', '4', '5', '6'])
  for (const [key, slots] of Object.entries(schedule)) {
    if (!validKeys.has(key)) return { error: 'Invalid schedule data.' }
    if (!Array.isArray(slots)) return { error: 'Invalid schedule data.' }
    for (const s of slots) {
      if (typeof s.hour !== 'number' || s.hour < 0 || s.hour > 23) return { error: 'Invalid time in schedule.' }
      if (typeof s.minute !== 'number' || s.minute < 0 || s.minute > 59) return { error: 'Invalid time in schedule.' }
    }
  }

  const admin = createAdminClient()

  // The therapist's timezone is set explicitly on their account page (and at
  // onboarding). Availability saves must NOT overwrite that choice with the
  // browser's zone — otherwise a therapist physically in India editing their
  // schedule would have their chosen PST clobbered by Asia/Kolkata every time.
  // So we only BOOTSTRAP the timezone here when the profile has none yet.
  const update: Record<string, unknown> = { weekly_availability: schedule }
  if (timezone && isValidIanaZone(timezone)) {
    const { data: existing } = await (admin as any)
      .from('therapist_profiles')
      .select('timezone')
      .eq('user_id', user.id)
      .maybeSingle() as { data: { timezone: string | null } | null }
    if (!existing?.timezone) {
      update.timezone = timezone
    }
  }
  logger.info('therapist/availability', 'Saving weekly availability', {
    userId: user.id,
    timezone: update.timezone ?? '(unchanged)',
    slotCounts: Object.fromEntries(Object.entries(schedule).map(([k, v]) => [k, v.length])),
  })

  const { data: updated, error } = await (admin as any)
    .from('therapist_profiles')
    .update(update)
    .eq('user_id', user.id)
    .select('user_id, timezone, weekly_availability')

  if (error) {
    logger.error('therapist/availability', 'Failed to save weekly availability', error, { userId: user.id })
    return { error: 'Failed to save. Please try again.' }
  }

  // .update() affecting 0 rows is NOT an error in PostgREST — it just means no
  // therapist_profiles row matched user_id. Surface that explicitly.
  if (!updated || updated.length === 0) {
    logger.error('therapist/availability', 'Save matched 0 rows — no therapist_profiles for user', null, { userId: user.id })
    return { error: 'Could not find your therapist profile to save to. Contact support.' }
  }

  logger.info('therapist/availability', 'Saved weekly availability', {
    userId: user.id,
    storedTimezone: updated[0]?.timezone,
    storedKeys: Object.keys(updated[0]?.weekly_availability ?? {}),
  })

  return { success: true }
}
