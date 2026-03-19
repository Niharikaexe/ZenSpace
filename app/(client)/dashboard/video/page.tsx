import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import JoinButton from '@/components/shared/JoinButton'

export const dynamic = 'force-dynamic'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  started_at: string | null
  ended_at: string | null
  daily_room_url: string | null
  therapist_notes: string | null
}

function formatDateTime(iso: string, timezone?: string | null) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone ?? undefined,
  })
}

export default async function ClientVideoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, timezone')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string; timezone: string | null } | null; error: unknown }

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
    .select('id, session_type, status, scheduled_at, started_at, ended_at, daily_room_url, therapist_notes')
    .eq('match_id', match.id)
    .order('scheduled_at', { ascending: false })

  const now = new Date()
  const upcoming = (sessions ?? []).filter(
    (s: Session) => new Date(s.scheduled_at) > new Date(now.getTime() - 3600000) && s.status !== 'cancelled'
  )
  const past = (sessions ?? []).filter(
    (s: Session) => new Date(s.scheduled_at) <= new Date(now.getTime() - 3600000) || s.status === 'completed' || s.status === 'cancelled'
  )

  const therapistName = therapistUser?.full_name ?? 'Your Therapist'

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
          <p className="text-sm font-semibold text-slate-900">Video Sessions</p>
          <p className="text-xs text-slate-400">with {therapistName}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Sign out</button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Upcoming */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Upcoming Sessions
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium text-slate-700">No upcoming sessions</p>
              <p className="text-sm text-slate-400 mt-1">
                Your therapist will schedule your next session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((s: Session) => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {s.session_type === 'video' ? '📹' : '💬'}{' '}
                        {s.session_type === 'video' ? 'Video session' : 'Chat session'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                        s.status === 'ongoing' ? 'bg-teal-50 text-teal-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatDateTime(s.scheduled_at, profile?.timezone)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {s.session_type === 'video' ? (
                      <JoinButton
                        scheduledAt={s.scheduled_at}
                        roomUrl={s.daily_room_url}
                        sessionType={s.session_type}
                      />
                    ) : (
                      <Link
                        href="/dashboard/chat"
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Open chat →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Past Sessions
            </h2>
            <div className="space-y-2">
              {past.map((s: Session) => (
                <div key={s.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between gap-4 opacity-75">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDateTime(s.scheduled_at, profile?.timezone)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    s.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
