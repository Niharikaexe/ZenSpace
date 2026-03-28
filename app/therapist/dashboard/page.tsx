import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import { getNotifications } from '@/app/actions/notifications'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
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
    <div className="w-14 h-14 rounded-2xl bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-lg flex items-center justify-center flex-shrink-0"
      style={{ fontFamily: 'var(--font-lato)' }}>
      {init}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
      <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>{value}</p>
      {sub && <p className="text-xs text-[#233551]/40 mt-0.5">{sub}</p>}
    </div>
  )
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

  // Active match
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, created_at, status')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  // Therapist profile (for specializations display)
  const { data: tProfile } = await (admin as any)
    .from('therapist_profiles')
    .select('specializations, bio, years_experience, weekly_capacity')
    .eq('user_id', user.id)
    .maybeSingle()

  let clientData: {
    fullName: string
    email: string
    concerns: string[]
    therapistGender: string | null
    subscriptionStatus: string | null
    subscriptionPlan: string | null
    questionnaireType: string | null
  } | null = null

  let nextSession: { scheduled_at: string; session_type: string; daily_room_url: string | null } | null = null
  let unreadCount = 0
  let sessionCount = 0

  if (match) {
    const [cpResult, subResult, sessResult, msgResult, sessCountResult, clientUserResult] = await Promise.all([
      (admin as any)
        .from('questionnaire_responses')
        .select('responses')
        .eq('client_id', match.client_id)
        .order('submitted_at', { ascending: false })
        .limit(1),
      (admin as any)
        .from('subscriptions')
        .select('status, plan')
        .eq('client_id', match.client_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      (admin as any)
        .from('sessions')
        .select('scheduled_at, session_type, daily_room_url')
        .eq('match_id', match.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      (admin as any)
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .neq('sender_id', user.id)
        .eq('is_read', false),
      (admin as any)
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .eq('status', 'completed'),
      (admin as any)
        .from('profiles')
        .select('full_name, email')
        .eq('id', match.client_id)
        .single(),
    ])

    unreadCount = msgResult.count ?? 0
    sessionCount = sessCountResult.count ?? 0
    nextSession = sessResult.data ?? null

    const qRows: { responses: unknown }[] | null = cpResult.data
    const qRow = qRows?.[0] ?? null
    const subscription = subResult.data
    const clientUser = clientUserResult.data

    // Parse questionnaire for concerns
    let concerns: string[] = []
    let therapistGender: string | null = null
    let qType: string | null = null
    if (qRow?.responses) {
      try {
        const r = qRow.responses as Record<string, unknown>
        qType = r.type as string
        if (qType === 'individual') {
          const a = r.answers as Record<string, unknown>
          concerns = (a?.q1 as string[] | undefined) ?? []
          therapistGender = (a?.q8 as string | undefined) ?? null
        } else if (qType === 'couples') {
          const s = r.shared as Record<string, unknown> | undefined
          concerns = (s?.q3 as string[] | undefined) ?? []
          therapistGender = (s?.q9 as string | undefined) ?? null
        } else if (qType === 'teen') {
          const a = r.answers as Record<string, unknown>
          concerns = (a?.q1 as string[] | undefined) ?? []
        }
      } catch { /* ignore */ }
    }

    if (clientUser) {
      clientData = {
        fullName: clientUser.full_name,
        email: clientUser.email ?? '',
        concerns,
        therapistGender,
        subscriptionStatus: subscription?.status ?? null,
        subscriptionPlan: subscription?.plan ?? null,
        questionnaireType: qType,
      }
    }
  }

  const [initialNotifications] = await Promise.all([getNotifications()])

  const dayOfWeek = new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav
        therapistName={profile!.full_name}
        userId={user.id}
        initialNotifications={initialNotifications}
        unreadCount={unreadCount}
        isMatched={!!match}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome row */}
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
          {tProfile?.specializations?.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end max-w-xs">
              {(tProfile.specializations as string[]).slice(0, 3).map((s: string) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#7EC0B7]/15 text-[#3D8A80] font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {match && clientData ? (
          <>
            {/* Next session banner */}
            {nextSession && (
              <div className="bg-[#233551] text-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#7EC0B7] uppercase tracking-widest">Next Session</p>
                  <p className="font-semibold mt-1 text-sm">
                    {nextSession.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDateTime(nextSession.scheduled_at)}
                  </p>
                </div>
                {nextSession.daily_room_url ? (
                  <a
                    href={nextSession.daily_room_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-5 py-2.5 bg-[#7EC0B7] text-[#233551] text-sm font-bold rounded-xl hover:bg-[#6db5ac] transition-colors"
                  >
                    Join Now
                  </a>
                ) : (
                  <Link
                    href="/therapist/dashboard/video"
                    className="flex-shrink-0 px-5 py-2.5 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors"
                  >
                    View →
                  </Link>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Sessions completed" value={sessionCount} />
              <StatCard label="Unread messages" value={unreadCount} sub="from client" />
              <StatCard label="Matched since" value={formatDate(match.created_at).split(' ').slice(0, 2).join(' ')} />
            </div>

            {/* Two-column: Client + Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Client card */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Your Client</span>
                  {clientData.subscriptionPlan && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      clientData.subscriptionStatus === 'active'
                        ? 'bg-[#7EC0B7]/15 text-[#3D8A80]'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {clientData.subscriptionPlan} · {clientData.subscriptionStatus}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <Initials name={clientData.fullName} />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#233551] text-base" style={{ fontFamily: 'var(--font-lato)' }}>
                        {clientData.fullName}
                      </p>
                      <p className="text-xs text-[#233551]/40 mt-0.5">{clientData.email}</p>

                      {clientData.questionnaireType && (
                        <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-[#233551]/6 text-[#233551]/60 font-medium capitalize">
                          {clientData.questionnaireType} therapy
                        </span>
                      )}

                      {clientData.concerns.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-1.5">What they're dealing with</p>
                          <div className="flex flex-wrap gap-1.5">
                            {clientData.concerns.slice(0, 5).map((c, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-[#233551]/70">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {clientData.therapistGender && (
                        <p className="text-xs text-[#233551]/45 mt-3">
                          Therapist preference: <span className="font-medium text-[#233551]/65">{clientData.therapistGender}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action cards */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/therapist/dashboard/chat"
                  className="relative flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 hover:border-[#7EC0B7] hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#7EC0B7]/15 text-[#3D8A80] flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-[#7EC0B7]/25 transition-colors">
                    💬
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#233551]">Chat</p>
                    <p className="text-xs text-[#233551]/40">Message your client</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E8926A] text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/therapist/dashboard/video"
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 hover:border-[#7EC0B7] hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#233551]/6 text-[#233551] flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-[#233551]/10 transition-colors">
                    📹
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#233551]">Sessions</p>
                    <p className="text-xs text-[#233551]/40">Schedule & join video</p>
                  </div>
                </Link>

                <Link
                  href="/therapist/dashboard/notes"
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 hover:border-[#7EC0B7] hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#E8926A]/10 text-[#E8926A] flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-[#E8926A]/20 transition-colors">
                    📋
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#233551]">Notes</p>
                    <p className="text-xs text-[#233551]/40">Session notes</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* No match state */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Empty state card */}
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

            {/* Profile completeness nudge */}
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
