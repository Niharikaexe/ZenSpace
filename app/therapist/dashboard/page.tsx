import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

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
  const init = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold text-base flex items-center justify-center flex-shrink-0">
      {init}
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

  // Get active match for this therapist
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, created_at, status')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  let clientData: {
    fullName: string
    primaryConcern: string | null
    therapyGoals: string | null
    gender: string | null
    previousTherapy: boolean
    preferredSessionType: string
    subscriptionStatus: string | null
    subscriptionPlan: string | null
  } | null = null

  let nextSession: { scheduled_at: string; session_type: string; daily_room_url: string | null } | null = null
  let unreadCount = 0

  if (match) {
    // Fetch client profile + subscription + next session in parallel
    const [cpResult, subResult, sessResult, msgResult] = await Promise.all([
      (admin as any)
        .from('client_profiles')
        .select('primary_concern, therapy_goals, gender, previous_therapy, preferred_session_type')
        .eq('user_id', match.client_id)
        .maybeSingle(),
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
    ])

    const { data: clientProfile } = cpResult
    const { data: subscription } = subResult
    const { data: upcomingSession } = sessResult
    unreadCount = msgResult.count ?? 0

    const { data: clientUser } = await (admin as any)
      .from('profiles')
      .select('full_name')
      .eq('id', match.client_id)
      .single()

    if (clientUser) {
      clientData = {
        fullName: clientUser.full_name,
        primaryConcern: clientProfile?.primary_concern ?? null,
        therapyGoals: clientProfile?.therapy_goals ?? null,
        gender: clientProfile?.gender ?? null,
        previousTherapy: clientProfile?.previous_therapy ?? false,
        preferredSessionType: clientProfile?.preferred_session_type ?? 'chat',
        subscriptionStatus: subscription?.status ?? null,
        subscriptionPlan: subscription?.plan ?? null,
      }
    }

    nextSession = upcomingSession ?? null
  }

  const navLinks = [
    { href: '/therapist/dashboard/chat', icon: '💬', label: 'Chat', badge: unreadCount > 0 ? unreadCount : null },
    { href: '/therapist/dashboard/video', icon: '📹', label: 'Sessions', badge: null },
    { href: '/therapist/dashboard/notes', icon: '📋', label: 'Notes', badge: null },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-3.5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">ZenSpace</p>
              <p className="text-xs text-slate-400">Welcome, {profile.full_name.split(' ')[0]}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit" className="text-xs text-slate-600">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {match && clientData ? (
          <>
            {/* Next session banner */}
            {nextSession && (
              <div className="bg-teal-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-teal-200 uppercase tracking-wide">Next session</p>
                  <p className="font-semibold mt-0.5">
                    {nextSession.session_type === 'video' ? '📹' : '💬'}{' '}
                    {formatDateTime(nextSession.scheduled_at)}
                  </p>
                </div>
                {nextSession.daily_room_url ? (
                  <a
                    href={nextSession.daily_room_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 bg-white text-teal-700 text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors"
                  >
                    Join
                  </a>
                ) : (
                  <Link href="/therapist/dashboard/video" className="flex-shrink-0 px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 transition-colors">
                    View →
                  </Link>
                )}
              </div>
            )}

            {/* Client profile card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Client</p>
                {clientData.subscriptionStatus && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    clientData.subscriptionStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {clientData.subscriptionPlan} · {clientData.subscriptionStatus}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <Initials name={clientData.fullName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{clientData.fullName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Matched since {formatDate(match.created_at)}
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                      {clientData.primaryConcern && (
                        <div>
                          <p className="text-xs text-slate-400">Primary concern</p>
                          <p className="text-sm text-slate-700 font-medium capitalize mt-0.5">
                            {clientData.primaryConcern.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                      {clientData.gender && (
                        <div>
                          <p className="text-xs text-slate-400">Gender</p>
                          <p className="text-sm text-slate-700 font-medium capitalize mt-0.5">{clientData.gender}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-400">Previous therapy</p>
                        <p className="text-sm text-slate-700 font-medium mt-0.5">{clientData.previousTherapy ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Prefers</p>
                        <p className="text-sm text-slate-700 font-medium capitalize mt-0.5">{clientData.preferredSessionType} sessions</p>
                      </div>
                    </div>
                    {clientData.therapyGoals && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-400">Therapy goals</p>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{clientData.therapyGoals}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</p>
              <div className="grid grid-cols-3 gap-3">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-sm transition-all text-center"
                  >
                    {link.badge && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {link.badge > 9 ? '9+' : link.badge}
                      </span>
                    )}
                    <div className="text-2xl mb-2">{link.icon}</div>
                    <p className="text-sm font-semibold text-slate-800">{link.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* No match state */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 text-lg">No matched clients yet</p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              You&apos;ll be notified when the ZenSpace admin assigns a client to you.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
