import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { TherapistNav } from '@/components/therapist/TherapistNav'

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

export default async function TherapistClientDetailPage({
  params,
}: {
  params: { matchId: string }
}) {
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

  // Verify match belongs to this therapist
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id, created_at, status')
    .eq('id', params.matchId)
    .eq('therapist_id', user.id)
    .single() as { data: { id: string; client_id: string; created_at: string; status: string } | null; error: unknown }

  if (!match) notFound()

  const [clientResult, qResult, subResult, sessionsResult, unreadResult] = await Promise.all([
    (admin as any).from('profiles').select('full_name, email, avatar_url').eq('id', match.client_id).single(),
    (admin as any)
      .from('questionnaire_responses')
      .select('responses, submitted_at')
      .eq('client_id', match.client_id)
      .order('submitted_at', { ascending: false })
      .limit(1),
    (admin as any)
      .from('subscriptions')
      .select('status, plan, current_period_end')
      .eq('client_id', match.client_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    (admin as any)
      .from('sessions')
      .select('id, session_type, status, scheduled_at, therapist_notes')
      .eq('match_id', match.id)
      .order('scheduled_at', { ascending: false })
      .limit(20),
    (admin as any)
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('match_id', match.id)
      .neq('sender_id', user.id)
      .eq('is_read', false),
  ])

  const client = clientResult.data
  const sub = subResult.data
  const sessions = sessionsResult.data ?? []
  const unread = unreadResult.count ?? 0

  // Parse questionnaire
  let qType = ''
  let concerns: string[] = []
  let goals = ''
  let previousTherapy = ''
  let therapistGenderPref = ''
  const qRow = (qResult.data ?? [])[0] ?? null
  if (qRow?.responses) {
    try {
      const r = qRow.responses as Record<string, unknown>
      qType = r.type as string ?? ''
      if (qType === 'individual') {
        const a = r.answers as Record<string, unknown> ?? {}
        concerns = (a.q1 as string[]) ?? []
        goals = (a.q2 as string) ?? ''
        previousTherapy = (a.q3 as string) ?? ''
        therapistGenderPref = (a.q5 as string) ?? ''
      } else if (qType === 'couples') {
        const s = r.shared as Record<string, unknown> ?? {}
        concerns = (s.q3 as string[]) ?? []
      } else if (qType === 'teen') {
        const a = r.answers as Record<string, unknown> ?? {}
        concerns = (a.q1 as string[]) ?? []
        goals = (a.q2 as string) ?? ''
      }
    } catch { /* ignore */ }
  }

  const isNewClient = new Date(match.created_at) > new Date(Date.now() - 7 * 24 * 3600000)

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={true} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Back */}
        <Link
          href="/therapist/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#233551]/50 hover:text-[#233551] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* Client header */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-xl flex items-center justify-center flex-shrink-0"
              style={{ fontFamily: 'var(--font-lato)' }}>
              {initials(client?.full_name ?? 'C')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                  {client?.full_name ?? 'Client'}
                </h1>
                {isNewClient && (
                  <span className="text-[10px] font-black text-[#7EC0B7] bg-[#7EC0B7]/15 px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
                )}
                {sub?.status === 'active' && (
                  <span className="text-[10px] font-bold text-[#3D8A80] bg-[#7EC0B7]/10 px-2 py-0.5 rounded-full capitalize">{sub.plan}</span>
                )}
              </div>
              <p className="text-sm text-[#233551]/45 mt-0.5">{client?.email}</p>
              <p className="text-xs text-[#233551]/35 mt-1">Matched since {formatDate(match.created_at)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href="/therapist/dashboard/chat"
              className="relative flex items-center gap-1.5 px-4 py-2 bg-[#7EC0B7]/10 text-[#3D8A80] text-xs font-semibold rounded-xl hover:bg-[#7EC0B7]/20 transition-colors"
            >
              💬 Chat
              {unread > 0 && (
                <span className="ml-1 text-[#E8926A] font-bold">{unread} unread</span>
              )}
            </Link>
            <Link
              href="/therapist/dashboard/video"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#233551]/5 text-[#233551] text-xs font-semibold rounded-xl hover:bg-[#233551]/10 transition-colors"
            >
              📹 Sessions
            </Link>
          </div>
        </div>

        {/* Questionnaire */}
        {qRow && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">
              Intake questionnaire · {qType || 'Individual'}
            </p>

            {concerns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#233551]/55 mb-2">Main concerns</p>
                <div className="flex flex-wrap gap-2">
                  {concerns.map((c, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-[#233551]/65">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {goals && (
              <div>
                <p className="text-xs font-semibold text-[#233551]/55 mb-1">Goals</p>
                <p className="text-sm text-[#233551]/70 leading-relaxed">{goals}</p>
              </div>
            )}

            {previousTherapy && (
              <div>
                <p className="text-xs font-semibold text-[#233551]/55 mb-1">Previous therapy</p>
                <p className="text-sm text-[#233551]/70">{previousTherapy}</p>
              </div>
            )}

            {therapistGenderPref && (
              <div>
                <p className="text-xs font-semibold text-[#233551]/55 mb-1">Therapist gender preference</p>
                <p className="text-sm text-[#233551]/70">{therapistGenderPref}</p>
              </div>
            )}
          </div>
        )}

        {/* Subscription */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Subscription</p>
          {sub ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#233551] capitalize">{sub.plan} plan</p>
                {sub.current_period_end && (
                  <p className="text-xs text-[#233551]/40 mt-0.5">
                    {sub.status === 'active' ? 'Renews' : 'Expired'} {formatDate(sub.current_period_end)}
                  </p>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                sub.status === 'active' ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' : 'bg-amber-50 text-amber-600'
              }`}>
                {sub.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-[#233551]/40">No active subscription.</p>
          )}
        </div>

        {/* Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50">
              <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Sessions ({sessions.length})</p>
            </div>
            <div className="divide-y divide-slate-50">
              {sessions.map((s: { id: string; session_type: string; status: string; scheduled_at: string; therapist_notes: string | null }) => (
                <div key={s.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#233551]">
                      {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDateTime(s.scheduled_at)}
                    </p>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                      s.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      s.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                      s.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  {s.therapist_notes && (
                    <p className="text-xs text-[#233551]/50 mt-1.5 leading-relaxed line-clamp-2">{s.therapist_notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
