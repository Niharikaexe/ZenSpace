import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function TherapistDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'therapist') redirect('/login')

  return (
    <div className="min-h-screen bg-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-cyan-800">
            Therapist Dashboard — {profile.full_name}
          </h1>
          <form action={signOut}>
            <Button variant="outline" type="submit" size="sm">Sign out</Button>
          </form>
        </div>
        <p className="text-muted-foreground">
          Therapist dashboard — Phase 6 coming next.
        </p>
      </div>
    </div>
  )
}
