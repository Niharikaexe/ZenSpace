import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscribeCheckout from './SubscribeCheckout'

export const dynamic = 'force-dynamic'

export default async function SubscribePage() {
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

  const [
    { data: subscription },
    { data: questionnaire },
    { data: authUser },
  ] = await Promise.all([
    (admin as any)
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as Promise<{ data: { plan: string; status: string; current_period_end: string | null } | null; error: unknown }>,
    (admin as any)
      .from('questionnaire_responses')
      .select('responses')
      .eq('client_id', user.id)
      .maybeSingle() as Promise<{ data: { responses: Record<string, unknown> } | null; error: unknown }>,
    admin.auth.admin.getUserById(user.id),
  ])

  // 'individual' | 'couples' | 'teen' | null (null = legacy path, treat as individual)
  const therapyType = (questionnaire?.responses?.type as string) ?? null
  const email = authUser?.user?.email ?? ''

  return (
    <SubscribeCheckout
      userName={profile?.full_name ?? ''}
      userEmail={email}
      activeSubscription={subscription}
      therapyType={therapyType}
    />
  )
}
