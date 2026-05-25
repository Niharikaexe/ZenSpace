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

const billingSchema = z.object({
  billingName: z.string().max(100).optional().or(z.literal('')),
  billingPhone: z.string().max(20).optional().or(z.literal('')),
  billingAddressLine1: z.string().max(200).optional().or(z.literal('')),
  billingAddressLine2: z.string().max(200).optional().or(z.literal('')),
  billingCity: z.string().max(80).optional().or(z.literal('')),
  billingState: z.string().max(80).optional().or(z.literal('')),
  billingPincode: z.string().max(10).optional().or(z.literal('')),
  billingGstin: z.string().max(20).optional().or(z.literal('')),
})

export async function updateBillingDetails(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = billingSchema.safeParse({
    billingName: formData.get('billingName') ?? '',
    billingPhone: formData.get('billingPhone') ?? '',
    billingAddressLine1: formData.get('billingAddressLine1') ?? '',
    billingAddressLine2: formData.get('billingAddressLine2') ?? '',
    billingCity: formData.get('billingCity') ?? '',
    billingState: formData.get('billingState') ?? '',
    billingPincode: formData.get('billingPincode') ?? '',
    billingGstin: formData.get('billingGstin') ?? '',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const d = parsed.data

  // Light shape validation
  if (d.billingPincode && !/^\d{6}$/.test(d.billingPincode)) {
    return { error: 'Pincode must be 6 digits.' }
  }
  if (d.billingPhone && !/^[+\d\s-]{7,20}$/.test(d.billingPhone)) {
    return { error: 'Please enter a valid phone number.' }
  }
  if (d.billingGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(d.billingGstin)) {
    return { error: 'GSTIN format is invalid.' }
  }

  const payload = {
    user_id: user.id,
    billing_name: d.billingName || null,
    billing_phone: d.billingPhone || null,
    billing_address_line1: d.billingAddressLine1 || null,
    billing_address_line2: d.billingAddressLine2 || null,
    billing_city: d.billingCity || null,
    billing_state: d.billingState || null,
    billing_pincode: d.billingPincode || null,
    billing_gstin: d.billingGstin || null,
  }

  const { error } = await (supabase as any)
    .from('client_profiles')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    logger.error('profile/updateBilling', 'Failed to update billing', error, { userId: user.id })
    return { error: 'Failed to save billing details. Please try again.' }
  }

  return { success: 'Billing details saved.' }
}

export async function sendPasswordReset(): Promise<ProfileActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) redirect('/login')

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard/account`,
  })

  if (error) {
    logger.error('profile/passwordReset', 'Failed to send reset email', error, { userId: user.id })
    return { error: 'Could not send reset email. Please try again.' }
  }

  logger.info('profile/passwordReset', 'Reset email sent', { userId: user.id })
  return { success: 'Password reset email sent. Check your inbox.' }
}
