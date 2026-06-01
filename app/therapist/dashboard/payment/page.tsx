import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import PayoutButton from '@/components/therapist/PayoutButton'

export const dynamic = 'force-dynamic'

// Earnings model (pay-as-you-go): each session carries its own frozen
// `therapist_payout_paise`, computed at booking from the client's category and
// the therapist's tier/experience. The dashboard sums paid + completed sessions
// across three windows:
//   - Pending payout (last 7 days)
//   - This month (calendar month-to-date)
//   - All time
// Updates the moment a session is marked `completed` — no cron, no snapshot table.

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function TherapistPaymentPage() {
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

  // All matches this therapist has ever had (any status) — past clients still
  // count for the sessions they completed.
  const { data: matches } = await (admin as any)
    .from('matches')
    .select('id, client_id, status')
    .eq('therapist_id', user.id) as { data: { id: string; client_id: string; status: string }[] | null; error: unknown }

  const matchList = matches ?? []
  const isMatched = matchList.some(m => m.status === 'active')
  const matchIds = matchList.map(m => m.id)
  const clientByMatch = new Map(matchList.map(m => [m.id, m.client_id]))
  const clientIds = Array.from(new Set(matchList.map(m => m.client_id)))

  const [sessionsResult, profilesResult] = await Promise.all([
    matchIds.length > 0
      ? (admin as any)
          .from('sessions')
          .select('id, match_id, session_type, scheduled_at, therapist_payout_paise')
          .in('match_id', matchIds)
          .eq('status', 'completed')
          .eq('payment_status', 'paid')
          .order('scheduled_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    clientIds.length > 0
      ? (admin as any).from('profiles').select('id, full_name').in('id', clientIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const nameByClient = new Map<string, string>()
  for (const p of (profilesResult.data ?? []) as { id: string; full_name: string | null }[]) {
    nameByClient.set(p.id, p.full_name ?? 'Client')
  }

  // Bucket sessions into windows.
  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let pendingPayout = 0       // last 7 days
  let monthPayout = 0
  let totalPayout = 0
  let monthSessions = 0
  let totalSessions = 0

  type SessionRow = { id: string; match_id: string; session_type: string; scheduled_at: string; therapist_payout_paise: number | null }
  type RecentSession = { scheduled_at: string; session_type: string; client_name: string; payout: number }
  const recentSessions: RecentSession[] = []

  for (const s of (sessionsResult.data ?? []) as SessionRow[]) {
    const clientId = clientByMatch.get(s.match_id)
    const payout = Math.round((s.therapist_payout_paise ?? 0) / 100)
    const sessionDate = new Date(s.scheduled_at)

    totalPayout += payout
    totalSessions++

    if (sessionDate >= monthStart) {
      monthPayout += payout
      monthSessions++
    }
    if (sessionDate >= weekStart) {
      pendingPayout += payout
    }

    if (recentSessions.length < 8) {
      recentSessions.push({
        scheduled_at: s.scheduled_at,
        session_type: s.session_type,
        client_name: clientId ? (nameByClient.get(clientId) ?? 'Client') : 'Client',
        payout,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={isMatched} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Payment Dashboard
          </h1>
          <p className="text-sm text-[#233551]/45 mt-1">
            Earnings update the moment a session is marked completed. Payouts are processed off-platform.
          </p>
        </div>

        {/* Earnings cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Sessions this month', value: String(monthSessions), sub: 'completed' },
            { label: 'Earnings this month', value: formatINR(monthPayout), sub: 'per session' },
            { label: 'Total sessions', value: String(totalSessions), sub: 'all time' },
            { label: 'Total earnings', value: formatINR(totalPayout), sub: 'all time' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white border border-slate-100 rounded-2xl px-4 py-4">
              <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest leading-tight">{label}</p>
              <p className="text-xl font-black text-[#233551] mt-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
                {value}
              </p>
              <p className="text-xs text-[#233551]/35 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Payout section */}
        <div className="bg-[#233551] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold text-[#7EC0B7] uppercase tracking-widest">Pending payout</p>
            <p className="text-3xl font-black text-white mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
              {formatINR(pendingPayout)}
            </p>
            <p className="text-xs text-white/45 mt-1">Sessions completed in the last 7 days</p>
          </div>
          <PayoutButton />
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50">
              <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Recent sessions</p>
            </div>
            <div className="divide-y divide-slate-50">
              {recentSessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[#233551]">{s.client_name}</p>
                    <p className="text-xs text-[#233551]/40 mt-0.5">
                      {s.session_type === 'video' ? 'Video' : 'Chat'} · {formatDate(s.scheduled_at)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#3D8A80]">
                    {formatINR(s.payout)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-8 text-center">
            <p className="text-sm text-[#233551]/40">No completed sessions yet.</p>
            <p className="text-xs text-[#233551]/30 mt-1">Earnings will appear here after your first completed session.</p>
          </div>
        )}


      </main>
    </div>
  )
}
