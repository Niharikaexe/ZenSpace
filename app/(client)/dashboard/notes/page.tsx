import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

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

export default async function ClientNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/dashboard')

  const { data: match } = await supabase
    .from('matches')
    .select('id, therapist_id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const admin = createAdminClient()
  const { data: therapistUser } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', match.therapist_id)
    .single()

  const { data: sessions } = await (supabase as any)
    .from('sessions')
    .select('id, session_type, status, scheduled_at, therapist_notes')
    .eq('match_id', match.id)
    .order('scheduled_at', { ascending: false })

  const sessionsWithNotes = (sessions ?? []).filter((s: Session) => s.therapist_notes)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Session Notes</p>
          <p className="text-xs text-slate-400">from {therapistUser?.full_name ?? 'Your Therapist'}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Sign out</button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {sessionsWithNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold text-slate-700">No session notes yet</p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              Your therapist&apos;s notes will appear here after your sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessionsWithNotes.map((s: Session) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {s.session_type === 'video' ? '📹 Video Session' : '💬 Chat Session'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(s.scheduled_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    s.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {s.therapist_notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
