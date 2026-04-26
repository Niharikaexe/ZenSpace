import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinButton from '@/components/shared/JoinButton'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import MultiScheduleForm from '@/components/therapist/MultiScheduleForm'
import NoteEditor from '@/components/shared/NoteEditor'
import { updateSessionStatus } from '@/app/actions/sessions'
import { getNotifications } from '@/app/actions/notifications'

export const dynamic = 'force-dynamic'

type SessionRow = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  daily_room_url: string | null
  therapist_notes: string | null
}

type MatchWithSessions = {
  matchId: string
  clientName: string
  sessions: SessionRow[]
}

type UpcomingEntry = SessionRow & { clientName: string; matchId: string }

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default async function TherapistSessionsPage() {
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

  const { data: matches } = await (admin as any)
    .from('matches')
    .select('id, client_id')
    .eq('therapist_id', user.id)
    .eq('status', 'active')

  if (!matches || matches.length === 0) redirect('/therapist/dashboard')

  const matchData: MatchWithSessions[] = await Promise.all(
    (matches as { id: string; client_id: string }[]).map(async m => {
      const [clientResult, sessResult] = await Promise.all([
        (admin as any).from('profiles').select('full_name').eq('id', m.client_id).single(),
        (admin as any)
          .from('sessions')
          .select('id, session_type, status, scheduled_at, daily_room_url, therapist_notes')
          .eq('match_id', m.id)
          .order('scheduled_at', { ascending: false }),
      ])

      return {
        matchId: m.id,
        clientName: clientResult.data?.full_name ?? 'Client',
        sessions: sessResult.data ?? [],
      }
    })
  )

  const clientOptions = matchData.map(m => ({ matchId: m.matchId, clientName: m.clientName }))

  const now = new Date()
  const cutoff = new Date(now.getTime() - 3600000) // 1 hr grace window

  const upcoming: UpcomingEntry[] = matchData
    .flatMap(m =>
      m.sessions
        .filter(s => s.status !== 'completed' && s.status !== 'cancelled' && new Date(s.scheduled_at) > cutoff)
        .map(s => ({ ...s, clientName: m.clientName, matchId: m.matchId }))
    )
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const pastByClient: MatchWithSessions[] = matchData
    .map(m => ({
      ...m,
      sessions: m.sessions.filter(
        s => s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduled_at) <= cutoff
      ),
    }))
    .filter(m => m.sessions.length > 0)

  const initialNotifications = await getNotifications()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav
        therapistName={profile!.full_name}
        userId={user.id}
        initialNotifications={initialNotifications}
        isMatched={true}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header + schedule button */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
              Sessions
            </h1>
            <p className="text-sm text-[#233551]/45 mt-0.5">
              Schedule, manage, and add notes to your sessions.
            </p>
          </div>
          <MultiScheduleForm clients={clientOptions} />
        </div>

        {/* Upcoming sessions */}
        <section>
          <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-[#233551]/45">No upcoming sessions. Schedule one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-[#233551]">
                          {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} with {s.clientName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === 'scheduled' ? 'bg-[#233551]/8 text-[#233551]' :
                          s.status === 'ongoing' ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#233551]/55">{formatDateTime(s.scheduled_at)}</p>
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
                          href="/therapist/dashboard/chat"
                          className="text-sm text-[#3D8A80] font-medium hover:text-[#233551] transition-colors"
                        >
                          Open chat →
                        </Link>
                      )}
                    </div>
                  </div>

                  {s.status === 'scheduled' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                      <form action={async () => {
                        'use server'
                        await updateSessionStatus(s.id, 'completed')
                      }}>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#7EC0B7]/50 text-[#3D8A80] hover:bg-[#7EC0B7]/10 transition-colors font-medium"
                        >
                          Mark completed
                        </button>
                      </form>
                      <form action={async () => {
                        'use server'
                        await updateSessionStatus(s.id, 'cancelled')
                      }}>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past sessions per client, with notes */}
        {pastByClient.length > 0 ? (
          pastByClient.map(m => (
            <section key={m.matchId}>
              <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">
                Past Sessions — {m.clientName}
              </h2>
              <div className="space-y-3">
                {m.sessions.map(s => (
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
            </section>
          ))
        ) : (
          <section>
            <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Past Sessions</h2>
            <div className="bg-white rounded-2xl border border-slate-100 px-5 py-8 text-center">
              <p className="text-sm text-[#233551]/40">No past sessions yet.</p>
              <p className="text-xs text-[#233551]/30 mt-1">
                Notes will appear here after your first completed session.
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
