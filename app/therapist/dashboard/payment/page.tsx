import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'

export const dynamic = 'force-dynamic'

// Plan rates (INR per session, therapist share ~60%)
const THERAPIST_SHARE: Record<string, number> = {
  essentials: 1800,    // ₹2,999 → ~₹1,800 therapist share
  premium: 2700,       // ₹4,499 → ~₹2,700 therapist share
  couples: 3600,       // ₹5,999 → ~₹3,600 therapist share
  monthly: 6000,       // ₹9,999/mo → ~₹6,000/mo therapist share
}

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

  // Get all matches for this therapist (including active check)
  const { data: matches } = await (admin as any)
    .from('matches')
    .select('id, client_id, created_at, status')
    .eq('therapist_id', user.id)

  const isMatched = (matches ?? []).some((m: { status: string }) => m.status === 'active')

  const matchIds = (matches ?? []).map((m: { id: string }) => m.id)

  // Sessions this month + total sessions
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let sessionsThisMonth = 0
  let sessionsTotal = 0
  let recentSessions: { scheduled_at: string; session_type: string; client_name: string; plan: string }[] = []

  if (matchIds.length > 0) {
    const [monthResult, totalResult, recentResult] = await Promise.all([
      (admin as any)
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .eq('status', 'completed')
        .gte('scheduled_at', monthStart),
      (admin as any)
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .eq('status', 'completed'),
      (admin as any)
        .from('sessions')
        .select('scheduled_at, session_type, match_id')
        .in('match_id', matchIds)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(8),
    ])

    sessionsThisMonth = monthResult.count ?? 0
    sessionsTotal = totalResult.count ?? 0

    // Enrich recent sessions with client name + plan
    const recent = recentResult.data ?? []
    recentSessions = await Promise.all(
      recent.map(async (s: { scheduled_at: string; session_type: string; match_id: string }) => {
        const matchRow = (matches ?? []).find((m: { id: string }) => m.id === s.match_id)
        let clientName = 'Client'
        let plan = 'essentials'
        if (matchRow) {
          const [uResult, subResult] = await Promise.all([
            (admin as any).from('profiles').select('full_name').eq('id', matchRow.client_id).single(),
            (admin as any)
              .from('subscriptions')
              .select('plan')
              .eq('client_id', matchRow.client_id)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
          ])
          clientName = uResult.data?.full_name ?? 'Client'
          plan = subResult.data?.plan ?? 'essentials'
        }
        return { ...s, client_name: clientName, plan }
      })
    )
  }

  // Estimate earnings
  const estThisMonth = sessionsThisMonth * (THERAPIST_SHARE['essentials']) // conservative estimate
  const estTotal = sessionsTotal * (THERAPIST_SHARE['essentials'])

  // Pending payout (all earnings — illustrative only, payouts are off-app)
  const pendingPayout = estThisMonth

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} userId={user.id} isMatched={isMatched} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Payment Dashboard
          </h1>
          <p className="text-sm text-[#233551]/45 mt-1">
            Your earnings summary. Payouts are processed off-platform.
          </p>
        </div>

        {/* Earnings cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Sessions this month', value: String(sessionsThisMonth), sub: 'completed' },
            { label: 'Earnings this month', value: formatINR(estThisMonth), sub: 'estimate' },
            { label: 'Total sessions', value: String(sessionsTotal), sub: 'all time' },
            { label: 'Total earnings', value: formatINR(estTotal), sub: 'all time' },
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
            <p className="text-xs text-white/45 mt-1">Based on sessions this month · estimate</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <a
              href="mailto:hello@zenspace.in?subject=Payout request&body=Hi, I'd like to request my payout for this month."
              className="px-6 py-3 bg-[#7EC0B7] text-[#233551] text-sm font-bold rounded-xl hover:bg-[#6db5ac] transition-colors inline-block"
            >
              Request payout →
            </a>
            <p className="text-xs text-white/35 text-center sm:text-right max-w-[220px]">
              Email hello@zenspace.in — we'll process within 5 business days.
            </p>
          </div>
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
                      {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDate(s.scheduled_at)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#3D8A80]">
                    {formatINR(THERAPIST_SHARE[s.plan] ?? THERAPIST_SHARE['essentials'])}
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
