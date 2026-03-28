import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NoteEditor from '@/components/shared/NoteEditor'
import { TherapistNav } from '@/components/therapist/TherapistNav'

export const dynamic = 'force-dynamic'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  therapist_notes: string | null
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

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

  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!match) redirect('/therapist/dashboard')

  const { data: clientUser } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', match.client_id)
    .single()

  const { data: sessions } = await (admin as any)
    .from('sessions')
    .select('id, session_type, status, scheduled_at, therapist_notes')
    .eq('match_id', match.id)
    .order('scheduled_at', { ascending: false })

  const clientName = clientUser?.full_name ?? 'Your Client'

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={true} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Session Notes
          </h1>
          <p className="text-sm text-[#233551]/45 mt-0.5">for {clientName} · private to you</p>
        </div>

        {(!sessions || sessions.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E8926A]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="font-bold text-[#233551]">No sessions yet</p>
            <p className="text-sm text-[#233551]/45 mt-2">
              Schedule a session first, then add notes here.
            </p>
            <Link
              href="/therapist/dashboard/video"
              className="inline-block mt-4 text-sm font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
            >
              Schedule a session →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s: Session) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#233551]">
                      {s.session_type === 'video' ? '📹 Video Session' : '💬 Chat Session'}
                    </p>
                    <p className="text-xs text-[#233551]/40 mt-0.5">{formatDateTime(s.scheduled_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    s.status === 'completed' ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' :
                    s.status === 'scheduled' ? 'bg-[#233551]/8 text-[#233551]' :
                    s.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <NoteEditor sessionId={s.id} initialNotes={s.therapist_notes} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
