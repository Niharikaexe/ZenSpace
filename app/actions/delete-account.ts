'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Sign out first so the session cookie is cleared on redirect
  await supabase.auth.signOut()

  // Deleting auth.users cascades to profiles and all child tables via FK constraints
  const { error } = await (admin as any).auth.admin.deleteUser(user.id)

  if (error) {
    logger.error('account/delete', 'Failed to delete user', error, { userId: user.id })
    return { error: 'Failed to delete account. Please contact support.' }
  }

  logger.info('account/delete', 'Account deleted', { userId: user.id })
  redirect('/?deleted=1')
}
