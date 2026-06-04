import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import ClientNav from '@/components/client/ClientNav'
import { PendingDashboard } from '@/components/dashboard/PendingDashboard'
import { TherapistMatchSelection, type ProposalView } from '@/components/client/TherapistMatchSelection'
import LiveRefresh from '@/components/shared/LiveRefresh'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('dashboard/client', 'No authenticated user — redirecting to login')
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profileError) {
    logger.error('dashboard/client', 'Failed to fetch profile', profileError, { userId: user.id })
  }

  if (!profile) {
    logger.warn('dashboard/client', 'Profile row missing — creating via admin client', { userId: user.id })
    const admin = createAdminClient()
    const { error: upsertErr } = await (admin as any).from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? 'User',
      role: (user.user_metadata?.role as string) ?? 'client',
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

  // Fetch active match — use admin client to bypass any RLS issues on matches table
  const matchAdmin = createAdminClient()
  const { data: match, error: matchError } = await (matchAdmin as any)
    .from('matches')
    .select('id, status, therapist_id, created_at')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as {
      data: { id: string; status: string; therapist_id: string; created_at: string } | null
      error: unknown
    }

  if (matchError) {
    logger.error('dashboard/client', 'Failed to fetch match', matchError, { userId: user.id })
  }

  // Fetch active subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, plan, status, current_period_end')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as {
      data: { id: string; plan: string; status: string; current_period_end: string | null } | null
      error: unknown
    }

  if (subError) {
    logger.error('dashboard/client', 'Failed to fetch subscription', subError, { userId: user.id })
  }

  // Fetch questionnaire_responses
  // Use limit(1) + single() to safely handle any duplicate rows
  const { data: questionnaireRows } = await supabase
    .from('questionnaire_responses')
    .select('responses')
    .eq('client_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1) as { data: { responses: unknown }[] | null; error: unknown }

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
    (user.user_metadata?.therapy_category as string) ??
    'individual'
  ) as 'individual' | 'couples' | 'teen'

  const isMatched = !!match
  const hasActiveSubscription = !!subscription
  const hasQuestionnaire = !!questionnaireRow

  logger.info('dashboard/client', 'Dashboard rendered', {
    userId: user.id,
    isMatched,
    hasActiveSubscription,
    hasQuestionnaire,
  })

  // Matched clients go straight to the chat interface
  if (isMatched) {
    redirect('/dashboard/chat')
  }

  // Pending proposals: admin has hand-picked a Standard + a Professional therapist.
  // Show the two-tab selection UI so the client can read both and start a free chat.
  const { data: proposalRows } = await (matchAdmin as any)
    .from('matches')
    .select('id, therapist_id, tier, admin_summary, created_at')
    .eq('client_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true }) as {
      data: { id: string; therapist_id: string; tier: string | null; admin_summary: string | null; created_at: string }[] | null
      error: unknown
    }

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
