import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import { getNotifications } from '@/app/actions/notifications'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function Initials({ name }: { name: string }) {
  const init = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="w-12 h-12 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-base flex items-center justify-center flex-shrink-0"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {init}
    </div>
  )
}

type ClientCard = {
  matchId: string
  clientName: string
  email: string
  concerns: string[]
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  unreadCount: number
  sessionCount: number
  matchedSince: string
}

type UpcomingSession = {
  sessionId: string
  matchId: string
  clientName: string
  scheduledAt: string
  sessionType: string
  roomUrl: string | null
}

export default async function TherapistDashboard() {
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

  const [{ data: allMatches }, { data: tProfile }] = await Promise.all([
    (admin as any)
      .from('matches')
      .select('id, client_id, created_at')
      .eq('therapist_id', user.id)
      .eq('status', 'active'),
    (admin as any)
      .from('therapist_profiles')
      .select('specializations, bio, years_experience, weekly_capacity')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const isMatched = (allMatches ?? []).length > 0

  let clientCards: ClientCard[] = []
  let upcomingSessions: UpcomingSession[] = []
  let totalUnread = 0

  if (isMatched) {
    const cardResults = await Promise.all(
      (allMatches as { id: string; client_id: string; created_at: string }[]).map(async m => {
        const twoWeeksOut = new Date(Date.now() + 14 * 24 * 3600000).toISOString()

        const [clientResult, subResult, unreadResult, sessCountResult, qResult, upSessResult] = await Promise.all([
          (admin as any).from('profiles').select('full_name, email').eq('id', m.client_id).single(),
          (admin as any)
            .from('subscriptions')
            .select('status, plan')
            .eq('client_id', m.client_id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          (admin as any)
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('match_id', m.id)
            .neq('sender_id', user.id)
            .eq('is_read', false),
          (admin as any)
            .from('sessions')
            .select('id', { count: 'exact', head: true })
            .eq('match_id', m.id)
            .eq('status', 'completed'),
          (admin as any)
            .from('questionnaire_responses')
            .select('responses')
            .eq('client_id', m.client_id)
            .order('submitted_at', { ascending: false })
            .limit(1),
          (admin as any)
            .from('sessions')
            .select('id, scheduled_at, session_type, daily_room_url')
            .eq('match_id', m.id)
            .in('status', ['scheduled', 'ongoing'])
            .gte('scheduled_at', new Date().toISOString())
            .lte('scheduled_at', twoWeeksOut)
            .order('scheduled_at', { ascending: true }),
        ])

        // Parse questionnaire concerns
        let concerns: string[] = []
        const qRow = (qResult.data ?? [])[0] ?? null
        if (qRow?.responses) {
          try {
            const r = qRow.responses as Record<string, unknown>
            const qType = r.type as string
            if (qType === 'individual') {
              const a = r.answers as Record<string, unknown>
              concerns = (a?.q1 as string[] | undefined) ?? []
            } else if (qType === 'couples') {
              const s = r.shared as Record<string, unknown> | undefined
              concerns = (s?.q3 as string[] | undefined) ?? []
            } else if (qType === 'teen') {
              const a = r.answers as Record<string, unknown>
              concerns = (a?.q1 as string[] | undefined) ?? []
            }
          } catch { /* ignore */ }
        }

        const clientName = clientResult.data?.full_name ?? 'Client'

        const upcoming: UpcomingSession[] = (upSessResult.data ?? []).map(
          (s: { id: string; scheduled_at: string; session_type: string; daily_room_url: string | null }) => ({
            sessionId: s.id,
            matchId: m.id,
            clientName,
            scheduledAt: s.scheduled_at,
            sessionType: s.session_type,
            roomUrl: s.daily_room_url,
          })
        )

        return {
          card: {
            matchId: m.id,
            clientName,
            email: clientResult.data?.email ?? '',
            concerns,
            subscriptionPlan: subResult.data?.plan ?? null,
            subscriptionStatus: subResult.data?.status ?? null,
            unreadCount: unreadResult.count ?? 0,
            sessionCount: sessCountResult.count ?? 0,
            matchedSince: m.created_at,
          } as ClientCard,
          upcoming,
        }
      })
    )

    clientCards = cardResults.map(r => r.card)
    upcomingSessions = cardResults
      .flatMap(r => r.upcoming)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    totalUnread = clientCards.reduce((sum, c) => sum + c.unreadCount, 0)
  }

  const initialNotifications = await getNotifications()
  const dayOfWeek = new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav
        therapistName={profile!.full_name}
        userId={user.id}
        initialNotifications={initialNotifications}
        unreadCount={totalUnread}
        isMatched={isMatched}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">{dayOfWeek}</p>
            <h1
              className="text-2xl font-black text-[#233551] mt-0.5"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {profile!.full_name.split(' ')[0]}.
            </h1>
            <p className="text-sm text-[#233551]/45 mt-0.5">{dateStr}</p>
          </div>
        </div>

        {isMatched ? (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Active clients</p>
                <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
                  {clientCards.length}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Unread messages</p>
                <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
                  {totalUnread}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Upcoming sessions</p>
                <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
                  {upcomingSessions.length}
                </p>
              </div>
            </div>

            {/* Upcoming sessions — next 14 days */}
            {upcomingSessions.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">
                    Upcoming — Next 14 Days
                  </p>
                  <Link
                    href="/therapist/dashboard/video"
                    className="text-xs font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
                  >
                    Manage all →
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {upcomingSessions.slice(0, 6).map(s => (
                    <div key={s.sessionId} className="flex items-center justify-between px-5 py-3.5 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#233551]/5 flex items-center justify-center text-base flex-shrink-0">
                          {s.sessionType === 'video' ? '📹' : '💬'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#233551] truncate">{s.clientName}</p>
                          <p className="text-xs text-[#233551]/45">{formatDateTime(s.scheduledAt)}</p>
                        </div>
                      </div>
                      {s.roomUrl ? (
                        <a
                          href={s.roomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-[#7EC0B7] text-[#233551] rounded-lg hover:bg-[#6db5ac] transition-colors"
                        >
                          Join
                        </a>
                      ) : (
                        <Link
                          href="/therapist/dashboard/video"
                          className="flex-shrink-0 text-xs font-medium text-[#3D8A80] hover:text-[#233551] transition-colors"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client cards */}
            <div>
              <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Your Clients</p>
              <div className={`grid gap-4 ${clientCards.length === 1 ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 md:grid-cols-2'}`}>
                {clientCards.map(c => {
                  const isNewClient = new Date(c.matchedSince) > new Date(Date.now() - 7 * 24 * 3600000)
                  return (
                  <div key={c.matchId} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#7EC0B7]/40 transition-colors">

                    {/* Card header — clickable */}
                    <Link href={`/therapist/dashboard/client/${c.matchId}`} className="block px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Initials name={c.clientName} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-[#233551] truncate" style={{ fontFamily: 'var(--font-lato)' }}>
                              {c.clientName}
                            </p>
                            {isNewClient && (
                              <span className="text-[10px] font-black text-[#7EC0B7] bg-[#7EC0B7]/15 px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">New</span>
                            )}
                          </div>
                          <p className="text-xs text-[#233551]/40 truncate">{c.email}</p>
                        </div>
                      </div>
                      {c.subscriptionPlan && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 capitalize ${
                          c.subscriptionStatus === 'active'
                            ? 'bg-[#7EC0B7]/15 text-[#3D8A80]'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {c.subscriptionPlan}
                        </span>
                      )}
                    </div>
                    </Link>

                    {/* Concerns */}
                    {c.concerns.length > 0 && (
                      <div className="px-5 pb-3.5 flex flex-wrap gap-1.5">
                        {c.concerns.slice(0, 4).map((con, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-[#233551]/60">
                            {con}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-4 text-xs text-[#233551]/40">
                      <span>{c.sessionCount} sessions</span>
                      {c.unreadCount > 0 && (
                        <span className="text-[#E8926A] font-semibold">{c.unreadCount} unread</span>
                      )}
                      <span>Since {formatDate(c.matchedSince)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="px-5 pb-4 pt-2 flex items-center gap-2">
                      <Link
                        href="/therapist/dashboard/chat"
                        className="relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7EC0B7]/10 text-[#3D8A80] text-xs font-semibold hover:bg-[#7EC0B7]/20 transition-colors"
                      >
                        💬 Chat
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8926A] text-white text-[9px] font-bold flex items-center justify-center">
                            {c.unreadCount > 9 ? '9+' : c.unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/therapist/dashboard/video"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#233551]/5 text-[#233551] text-xs font-semibold hover:bg-[#233551]/10 transition-colors"
                      >
                        📹 Sessions
                      </Link>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </>
        ) : (
          /* ── No clients ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-black text-[#233551] text-lg" style={{ fontFamily: 'var(--font-lato)' }}>
                No clients yet
              </h2>
              <p className="text-sm text-[#233551]/45 mt-2 max-w-sm mx-auto leading-relaxed">
                The ZenSpace admin matches clients to you based on fit.
                You&apos;ll be notified as soon as someone is assigned.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-[#3D8A80] bg-[#7EC0B7]/10 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#7EC0B7] animate-pulse" />
                Waiting for match
              </div>
            </div>

            {tProfile && (
              <>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Your profile</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Bio', done: !!tProfile.bio },
                      { label: 'Specialisations', done: (tProfile.specializations as string[])?.length > 0 },
                      { label: 'Years of experience', done: tProfile.years_experience > 0 },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#7EC0B7]' : 'bg-slate-100'}`}>
                          {done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${done ? 'text-[#233551]/60' : 'text-[#233551]/40'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/therapist/dashboard/account"
                    className="inline-block mt-1 text-xs font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
                  >
                    Edit profile →
                  </Link>
                </div>

                <div className="bg-[#233551] rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">While you wait</p>
                  {[
                    'Make sure your bio is warm and human — clients read it before accepting',
                    'List all languages you work in — it increases match chances',
                    'Your capacity setting tells admin how many clients to send',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#7EC0B7]/20 text-[#7EC0B7] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-white/65 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
