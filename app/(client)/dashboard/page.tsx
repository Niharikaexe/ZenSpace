import { createClient, createAdminClient, getAuthClaims } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import ClientNav from '@/components/client/ClientNav'
import { PendingDashboard } from '@/components/dashboard/PendingDashboard'
import { TherapistMatchSelection, type ProposalView } from '@/components/client/TherapistMatchSelection'
import LiveRefresh from '@/components/shared/LiveRefresh'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const user = await getAuthClaims(supabase)

  if (!user) {
    logger.warn('dashboard/client', 'No authenticated user — redirecting to login')
    redirect('/login')
  }

  // Profile (role/name) and the active-match check are independent — run them in
  // parallel. The match query uses the admin client to bypass any RLS quirks on
  // `matches`. This is the ONLY work a matched client does before redirecting.
  const matchAdmin = createAdminClient()
  const [profileRes, matchRes] = await Promise.all([
    supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle(),
    (matchAdmin as any)
      .from('matches')
      .select('id, status, therapist_id, created_at')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  const profile = profileRes.data as { role: string; full_name: string } | null
  const match = (matchRes as { data: { id: string; status: string; therapist_id: string; created_at: string } | null }).data

  if (profileRes.error) {
    logger.error('dashboard/client', 'Failed to fetch profile', profileRes.error, { userId: user.id })
  }

  if (!profile) {
    logger.warn('dashboard/client', 'Profile row missing — creating via admin client', { userId: user.id })
    const { error: upsertErr } = await (matchAdmin as any).from('profiles').upsert({
      id: user.id,
      full_name: user.fullName ?? user.email ?? 'User',
      role: user.role ?? 'client',
    })
    if (upsertErr) {
      logger.error('dashboard/client', 'Failed to upsert missing profile', upsertErr, { userId: user.id })
      redirect('/login')
    }
    redirect('/dashboard')
  }

  if (profile.role !== 'client') {
    redirect(profile.role === 'admin' ? '/admin' : '/therapist/dashboard')
  }

  if ((matchRes as { error: unknown }).error) {
    logger.error('dashboard/client', 'Failed to fetch match', (matchRes as { error: unknown }).error, { userId: user.id })
  }

  // Matched clients live in the chat. Redirect BEFORE running any pending-state
  // queries (proposals + questionnaire), so the matched path stays minimal — no
  // wasted work before the redirect.
  if (match) {
    redirect('/dashboard/chat')
  }

  // ── Not matched: pending or proposal-selection state ──────────────────────
  // Pending proposals + the questionnaire are independent — fetch in parallel.
  const [proposalRes, questionnaireRes] = await Promise.all([
    (matchAdmin as any)
      .from('matches')
      .select('id, therapist_id, tier, admin_summary, created_at')
      .eq('client_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('questionnaire_responses')
      .select('responses')
      .eq('client_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1),
  ])

  const proposalRows = (proposalRes as {
    data: { id: string; therapist_id: string; tier: string | null; admin_summary: string | null; created_at: string }[] | null
  }).data
  const questionnaireRows = (questionnaireRes.data ?? null) as { responses: unknown }[] | null
  const questionnaireRow = questionnaireRows?.[0] ?? null

  // Extract preferences from questionnaire JSON
  let questionnairePrefs: {
    type: 'individual' | 'couples' | 'teen'
    concerns: string[]
    therapistGender: string | null
  } | null = null

  if (questionnaireRow?.responses) {
    try {
      const data = questionnaireRow.responses as Record<string, unknown>
      const type = data.type as string
      const toArray = (v: unknown): string[] =>
        Array.isArray(v) ? (v as string[]) : typeof v === 'string' && v ? [v] : []
      if (type === 'individual') {
        const answers = data.answers as Record<string, unknown>
        questionnairePrefs = {
          type: 'individual',
          concerns: toArray(answers?.q2),
          therapistGender: (answers?.q13 as string | undefined) ?? null,
        }
      } else if (type === 'couples') {
        const common = data.common as Record<string, unknown> | undefined
        questionnairePrefs = {
          type: 'couples',
          concerns: toArray(common?.c6),
          therapistGender: (common?.c11 as string | undefined) ?? null,
        }
      } else if (type === 'teen') {
        const answers = data.answers as Record<string, unknown>
        questionnairePrefs = {
          type: 'teen',
          concerns: toArray(answers?.q15),
          therapistGender: null,
        }
      }
    } catch (err) {
      // Malformed questionnaire JSON — treat as no questionnaire.
      logger.warn('dashboard/client', 'Failed to parse questionnaire JSON', {
        clientId: user.id,
        err: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // Therapy category: prefer questionnaire type (post-intake), fall back to signup selection
  const therapyCategory = (
    (questionnairePrefs?.type) ??
    user.therapyCategory ??
    'individual'
  ) as 'individual' | 'couples' | 'teen'

  const hasQuestionnaire = !!questionnaireRow

  logger.info('dashboard/client', 'Pending dashboard rendered', {
    userId: user.id,
    hasQuestionnaire,
    hasProposals: !!(proposalRows && proposalRows.length > 0),
  })

  // Pending proposals: admin has hand-picked a Standard + a Professional therapist.
  // Show the two-tab selection UI so the client can read both and start a free chat.
  if (proposalRows && proposalRows.length > 0) {
    const therapistIds = proposalRows.map((p) => p.therapist_id)
    const [{ data: tProfiles }, { data: tUsers }] = await Promise.all([
      (matchAdmin as any)
        .from('therapist_profiles')
        .select('user_id, tagline, bio, specializations, approach, education, years_experience, languages, license_number, license_country, session_expectations, previous_experience, pronouns, is_verified')
        .in('user_id', therapistIds),
      (matchAdmin as any)
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', therapistIds),
    ])

    const proposals: ProposalView[] = proposalRows.map((p) => {
      const tp = (tProfiles ?? []).find((t: any) => t.user_id === p.therapist_id)
      const tu = (tUsers ?? []).find((u: any) => u.id === p.therapist_id)
      return {
        matchId: p.id,
        tier: (p.tier === 'professional' ? 'professional' : 'standard'),
        adminSummary: p.admin_summary ?? null,
        therapist: {
          fullName: tu?.full_name ?? 'Your therapist',
          avatarUrl: tu?.avatar_url ?? null,
          tagline: tp?.tagline ?? null,
          bio: tp?.bio ?? null,
          specializations: tp?.specializations ?? [],
          approach: tp?.approach ?? null,
          education: tp?.education ?? null,
          yearsExperience: tp?.years_experience ?? 0,
          languages: tp?.languages ?? ['English'],
          licenseNumber: tp?.license_number ?? null,
          licenseCountry: tp?.license_country ?? null,
          sessionExpectations: tp?.session_expectations ?? null,
          previousExperience: tp?.previous_experience ?? null,
          pronouns: tp?.pronouns ?? null,
          isVerified: tp?.is_verified ?? false,
        },
      }
    })

    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <LiveRefresh table="matches" filter={`client_id=eq.${user.id}`} channel={`client-matches-${user.id}`} />
        <ClientNav userName={profile.full_name} isMatched={false} />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <TherapistMatchSelection
            clientName={profile.full_name}
            category={therapyCategory}
            proposals={proposals}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LiveRefresh table="matches" filter={`client_id=eq.${user.id}`} channel={`client-matches-${user.id}`} />
      <ClientNav userName={profile.full_name} isMatched={false} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <PendingDashboard
          userName={profile.full_name}
          hasQuestionnaire={hasQuestionnaire}
          questionnairePrefs={questionnairePrefs}
          therapyCategory={therapyCategory}
        />
      </main>
    </div>
  )
}
