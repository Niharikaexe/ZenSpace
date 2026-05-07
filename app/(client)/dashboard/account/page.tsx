import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountForm } from '@/components/dashboard/AccountForm'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string; role: string } | null; error: unknown }

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: match }, { data: subscription }] = await Promise.all([
    (admin as any)
      .from('matches')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as Promise<{ data: { id: string } | null; error: unknown }>,
    (admin as any)
      .from('subscriptions')
      .select('id, plan, status, current_period_end, cancelled_at, amount')
      .eq('client_id', user.id)
      .not('status', 'eq', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as Promise<{
        data: {
          id: string
          plan: string
          status: string
          current_period_end: string | null
          cancelled_at: string | null
          amount: number
        } | null
        error: unknown
      }>,
  ])

  return (
    <AccountForm
      userName={profile.full_name}
      userEmail={user.email ?? ''}
      isMatched={!!match}
      subscription={subscription}
    />
  )
}
