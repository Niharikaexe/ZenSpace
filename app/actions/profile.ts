'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

export type ProfileActionState = {
  error?: string
  success?: string
}

export async function updateProfile(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get('fullName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Update auth metadata
  const { error: metaErr } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  })

  if (metaErr) {
    logger.error('profile/update', 'Failed to update auth metadata', metaErr, { userId: user.id })
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Update profiles table
  const { error: dbErr } = await (supabase as any)
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', user.id)

  if (dbErr) {
    logger.error('profile/update', 'Failed to update profiles table', dbErr, { userId: user.id })
    return { error: 'Failed to update profile. Please try again.' }
  }

  logger.info('profile/update', 'Profile updated', { userId: user.id })
  return { success: 'Profile updated.' }
}

export async function sendPasswordReset(): Promise<ProfileActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) redirect('/login')

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/account`,
  })

  if (error) {
    logger.error('profile/passwordReset', 'Failed to send reset email', error, { userId: user.id })
    return { error: 'Could not send reset email. Please try again.' }
  }

  logger.info('profile/passwordReset', 'Reset email sent', { userId: user.id })
  return { success: 'Password reset email sent. Check your inbox.' }
}
