import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { PendingDashboard } from '@/components/dashboard/PendingDashboard'
import { MatchedDashboard } from '@/components/dashboard/MatchedDashboard'

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

  // Fetch active match
  const { data: match, error: matchError } = await supabase
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
      if (type === 'individual') {
        const answers = data.answers as Record<string, unknown>
        questionnairePrefs = {
          type: 'individual',
          concerns: (answers?.q1 as string[] | undefined) ?? [],
          therapistGender: (answers?.q8 as string | undefined) ?? null,
        }
      } else if (type === 'couples') {
        const shared = data.shared as Record<string, unknown> | undefined
        questionnairePrefs = {
          type: 'couples',
          concerns: (shared?.q3 as string[] | undefined) ?? [],
          therapistGender: (shared?.q9 as string | undefined) ?? null,
        }
      } else if (type === 'teen') {
        const answers = data.answers as Record<string, unknown>
        questionnairePrefs = {
          type: 'teen',
          concerns: (answers?.q1 as string[] | undefined) ?? [],
          therapistGender: null,
        }
      }
    } catch {
      // Malformed questionnaire JSON — treat as no questionnaire
    }
  }

  const isMatched = !!match
  const hasActiveSubscription = !!subscription
  const hasQuestionnaire = !!questionnaireRow

  // Fetch therapist details if matched
  let therapistData: {
    fullName: string
    avatarUrl: string | null
    specializations: string[]
    bio: string | null
    approach: string | null
    yearsExperience: number
    languages: string[]
  } | null = null

  if (match) {
    const admin = createAdminClient()
    const [tProfileResult, tUserResult] = await Promise.all([
      (admin as any)
        .from('therapist_profiles')
        .select('specializations, bio, approach, years_experience, languages')
        .eq('user_id', match.therapist_id)
        .maybeSingle(),
      (admin as any)
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', match.therapist_id)
        .maybeSingle(),
    ])

    const tProfile = tProfileResult.data
    const tUser = tUserResult.data

    if (tProfile && tUser) {
      therapistData = {
        fullName: tUser.full_name,
        avatarUrl: tUser.avatar_url ?? null,
        specializations: tProfile.specializations ?? [],
        bio: tProfile.bio ?? null,
        approach: tProfile.approach ?? null,
        yearsExperience: tProfile.years_experience ?? 0,
        languages: tProfile.languages ?? ['English'],
      }
    }
  }

  logger.info('dashboard/client', 'Dashboard rendered', {
    userId: user.id,
    isMatched,
    hasActiveSubscription,
    hasQuestionnaire,
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav userName={profile.full_name} isMatched={isMatched} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isMatched && therapistData ? (
          <MatchedDashboard
            userName={profile.full_name}
            userEmail={user.email ?? ''}
            therapist={therapistData}
            matchedSince={match!.created_at}
            subscription={
              subscription
                ? { plan: subscription.plan, periodEnd: subscription.current_period_end }
                : null
            }
          />
        ) : (
          <PendingDashboard
            userName={profile.full_name}
            userEmail={user.email ?? ''}
            hasActiveSubscription={hasActiveSubscription}
            hasQuestionnaire={hasQuestionnaire}
            questionnairePrefs={questionnairePrefs}
          />
        )}
      </main>
    </div>
  )
}
