import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import { getNotifications } from '@/app/actions/notifications'
import { TherapistContactForm } from './TherapistContactForm'

export const dynamic = 'force-dynamic'

export default async function TherapistContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'therapist') redirect('/login')

  const admin = createAdminClient()
  const { data: match } = await (admin as any)
    .from('matches').select('id').eq('therapist_id', user.id).eq('status', 'active').maybeSingle()

  const initialNotifications = await getNotifications()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav
        therapistName={profile!.full_name}
        userId={user.id}
        initialNotifications={initialNotifications}
        isMatched={!!match}
      />
      <TherapistContactForm />
    </div>
  )
}
