import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { PendingDashboard } from '@/components/dashboard/PendingDashboard'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/login')

  // Fetch active match
  const { data: match } = await supabase
    .from('matches')
    .select('id, status, therapist_id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; status: string; therapist_id: string } | null; error: unknown }

  // Fetch active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, plan, status, current_period_end')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: { id: string; plan: string; status: string; current_period_end: string | null } | null; error: unknown }

  const isMatched = !!match
  const hasActiveSubscription = !!subscription

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-teal-700">ZenSpace</span>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back, {profile.full_name}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit" size="sm">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isMatched ? (
          <PendingDashboard
            userName={profile.full_name}
            userEmail={user.email ?? ''}
            hasActiveSubscription={hasActiveSubscription}
          />
        ) : (
          // Matched state — Phase 7
          <div className="text-center py-16 text-slate-500">
            Matched dashboard coming in Phase 7.
          </div>
        )}
      </main>
    </div>
  )
}
