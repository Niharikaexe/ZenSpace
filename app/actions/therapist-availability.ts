'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

type Slot = { hour: number; minute: number }
export type WeeklyAvailability = Record<string, Slot[]>

export async function updateWeeklyAvailability(
  schedule: WeeklyAvailability,
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
  const { error } = await (admin as any)
    .from('therapist_profiles')
    .update({ weekly_availability: schedule })
    .eq('user_id', user.id)

  if (error) {
    logger.error('therapist/availability', 'Failed to save weekly availability', error, { userId: user.id })
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}
