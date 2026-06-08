import { createClient, createAdminClient, getAuthClaims } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountForm } from '@/components/dashboard/AccountForm'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const user = await getAuthClaims(supabase)
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string; role: string } | null; error: unknown }

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()

  const { data: match } = await (admin as any)
    .from('matches')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  return (
    <AccountForm
      userName={profile.full_name}
      userEmail={user.email ?? ''}
      isMatched={!!match}
    />
  )
}
