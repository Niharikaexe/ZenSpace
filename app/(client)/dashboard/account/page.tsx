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

  const [{ data: match }, { data: subscription }, { data: clientProfile }] = await Promise.all([
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
    (admin as any)
      .from('client_profiles')
      .select('billing_name, billing_phone, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_pincode, billing_gstin')
      .eq('user_id', user.id)
      .maybeSingle() as Promise<{
        data: {
          billing_name: string | null
          billing_phone: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_state: string | null
          billing_pincode: string | null
          billing_gstin: string | null
        } | null
        error: unknown
      }>,
  ])

  const billing = {
    billingName: clientProfile?.billing_name ?? '',
    billingPhone: clientProfile?.billing_phone ?? '',
    billingAddressLine1: clientProfile?.billing_address_line1 ?? '',
    billingAddressLine2: clientProfile?.billing_address_line2 ?? '',
    billingCity: clientProfile?.billing_city ?? '',
    billingState: clientProfile?.billing_state ?? '',
    billingPincode: clientProfile?.billing_pincode ?? '',
    billingGstin: clientProfile?.billing_gstin ?? '',
  }

  return (
    <AccountForm
      userName={profile.full_name}
      userEmail={user.email ?? ''}
      isMatched={!!match}
      subscription={subscription}
      billing={billing}
    />
  )
}
