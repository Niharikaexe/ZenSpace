import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import TherapistNotesView from './TherapistNotesView'

export const dynamic = 'force-dynamic'

export default async function TherapistNotesPage() {
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

  // Get all active matches for this therapist
  const { data: matches } = await (admin as any)
    .from('matches')
    .select('id, client_id, created_at')
    .eq('therapist_id', user.id)
    .eq('status', 'active') as { data: { id: string; client_id: string; created_at: string }[] | null; error: unknown }

  const isMatched = (matches ?? []).length > 0

  if (!isMatched) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={false} />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-[#233551]/40 text-sm">No clients yet. Notes will appear here after your first session.</p>
        </main>
      </div>
    )
  }

  // Fetch sessions + client names for all matches
  const sessionGroups = await Promise.all(
    (matches ?? []).map(async m => {
      const [clientResult, sessionsResult] = await Promise.all([
        (admin as any).from('profiles').select('full_name').eq('id', m.client_id).single(),
        (admin as any)
          .from('sessions')
          .select('id, session_type, status, scheduled_at, therapist_notes')
          .eq('match_id', m.id)
          .in('status', ['completed', 'scheduled', 'ongoing'])
          .order('scheduled_at', { ascending: false })
          .limit(30),
      ])

      return {
        matchId: m.id,
        clientName: clientResult.data?.full_name ?? 'Client',
        sessions: (sessionsResult.data ?? []) as {
          id: string
          session_type: string
          status: string
          scheduled_at: string
          therapist_notes: string | null
        }[],
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={true} />
      <TherapistNotesView sessionGroups={sessionGroups} />
    </div>
  )
}
