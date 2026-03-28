import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinButton from '@/components/shared/JoinButton'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import ScheduleSessionForm from '@/components/shared/ScheduleSessionForm'
import { updateSessionStatus } from '@/app/actions/sessions'

export const dynamic = 'force-dynamic'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  daily_room_url: string | null
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default async function TherapistVideoPage() {
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
    .select('id, session_type, status, scheduled_at, daily_room_url')
    .eq('match_id', match.id)
    .order('scheduled_at', { ascending: false })

  const now = new Date()
  const upcoming = (sessions ?? []).filter(
    (s: Session) => s.status !== 'completed' && s.status !== 'cancelled' &&
      new Date(s.scheduled_at) > new Date(now.getTime() - 3600000)
  )
  const past = (sessions ?? []).filter(
    (s: Session) => s.status === 'completed' || s.status === 'cancelled' ||
      new Date(s.scheduled_at) <= new Date(now.getTime() - 3600000)
  )

  const clientName = clientUser?.full_name ?? 'Your Client'

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={true} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Sessions</h1>
          <p className="text-sm text-[#233551]/45 mt-0.5">with {clientName}</p>
        </div>

        {/* Schedule new session */}
        <ScheduleSessionForm matchId={match.id} />

        {/* Upcoming */}
        <section>
          <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-[#233551]/45">No upcoming sessions. Schedule one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((s: Session) => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#233551]">
                          {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} session
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
                        <Link href="/therapist/dashboard/chat" className="text-sm text-[#3D8A80] font-medium hover:text-[#233551] transition-colors">
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

        {/* Past sessions */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Past</h2>
            <div className="space-y-2">
              {past.map((s: Session) => (
                <div key={s.id} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center justify-between gap-4 opacity-70">
                  <p className="text-sm text-[#233551]/70">
                    {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDateTime(s.scheduled_at)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    s.status === 'completed' ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' :
                    s.status === 'cancelled' ? 'bg-red-50 text-red-500' :
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
