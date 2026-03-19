'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (profile?.role !== 'admin') redirect('/dashboard')
  return user
}

export async function createMatch(clientId: string, therapistId: string, notes: string) {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any).from('matches').insert({
    client_id: clientId,
    therapist_id: therapistId,
    matched_by: adminUser.id,
    notes: notes || null,
    status: 'active',
    started_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function toggleTherapistVerification(therapistProfileId: string, currentValue: boolean) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_profiles')
    .update({ is_verified: !currentValue })
    .eq('id', therapistProfileId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

function makeInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = 'ZS'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function generateInviteCode() {
  const adminUser = await assertAdmin()
  const admin = createAdminClient()

  const code = makeInviteCode()

  const { error } = await (admin as any).from('therapist_invites').insert({
    code,
    created_by: adminUser.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function revokeInviteCode(inviteId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('therapist_invites')
    .delete()
    .eq('id', inviteId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function endMatch(matchId: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await (admin as any)
    .from('matches')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
