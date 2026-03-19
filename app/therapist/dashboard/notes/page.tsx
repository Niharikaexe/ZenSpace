import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import NoteEditor from '@/components/shared/NoteEditor'

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <Link
          href="/therapist/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Session Notes</p>
          <p className="text-xs text-slate-400">for {clientName}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Sign out</button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {(!sessions || sessions.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold text-slate-700">No sessions yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Schedule a session first, then add notes here.
            </p>
            <Link
              href="/therapist/dashboard/video"
              className="inline-block mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Schedule a session →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s: Session) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {s.session_type === 'video' ? '📹 Video Session' : '💬 Chat Session'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(s.scheduled_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    s.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    s.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
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
