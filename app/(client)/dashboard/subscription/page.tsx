import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager'
import type { SubscriptionData } from '@/components/dashboard/SubscriptionManager'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: subscription }, { data: match }] = await Promise.all([
    (admin as any)
      .from('subscriptions')
      .select('id, plan, status, current_period_start, current_period_end, cancelled_at, amount, currency')
      .eq('client_id', user.id)
      .not('status', 'eq', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as Promise<{ data: SubscriptionData | null; error: unknown }>,
    (admin as any)
      .from('matches')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as Promise<{ data: { id: string } | null; error: unknown }>,
  ])

  return (
    <SubscriptionManager
      userName={profile?.full_name ?? ''}
      isMatched={!!match}
      subscription={subscription}
    />
  )
}
