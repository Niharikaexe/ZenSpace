import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientSessionsView from '@/components/client/ClientSessionsView'
import { sessionPriceInr, type SessionCategory, type ProposalTier } from '@/lib/plans'
import { cashfreeConfigured } from '@/lib/cashfree'

export const dynamic = 'force-dynamic'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  started_at: string | null
  ended_at: string | null
  daily_room_url: string | null
  therapist_notes: string | null
}

function normalizeCategory(raw: unknown): SessionCategory {
  return raw === 'couples' || raw === 'teen' ? raw : 'individual'
}

export default async function ClientSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, timezone')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string; timezone: string | null } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, therapist_id, tier')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string; tier: string | null } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const tier: ProposalTier = match.tier === 'professional' ? 'professional' : 'standard'

  const { data: questionnaire } = await (admin as any)
    .from('questionnaire_responses')
    .select('responses')
    .eq('client_id', user.id)
    .maybeSingle() as { data: { responses: Record<string, unknown> } | null; error: unknown }

  const category = normalizeCategory(questionnaire?.responses?.type)
  const perSessionInr = sessionPriceInr(category, tier)

  const [tProfileResult, tUserResult, sessionsResult, userResult] = await Promise.all([
    (admin as any)
      .from('therapist_profiles')
      .select('specializations, bio, approach, years_experience, languages, weekly_availability, is_verified, timezone, tagline, education, license_country, session_expectations, pronouns, previous_experience')
      .eq('user_id', match.therapist_id)
      .maybeSingle(),
    (admin as any)
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', match.therapist_id)
      .single(),
    (admin as any)
      .from('sessions')
      .select('id, session_type, status, scheduled_at, started_at, ended_at, daily_room_url, therapist_notes, payment_status')
      .eq('match_id', match.id)
      .eq('payment_status', 'paid')
      .order('scheduled_at', { ascending: false }),
    admin.auth.admin.getUserById(user.id),
  ])

  const tp = tProfileResult.data
  const tu = tUserResult.data
  const therapist = {
    fullName: tu?.full_name ?? 'Your Therapist',
    avatarUrl: tu?.avatar_url ?? null,
    tagline: tp?.tagline ?? null,
    specializations: tp?.specializations ?? [],
    bio: tp?.bio ?? null,
    approach: tp?.approach ?? null,
    education: tp?.education ?? null,
    licenseCountry: tp?.license_country ?? null,
    sessionExpectations: tp?.session_expectations ?? null,
    pronouns: tp?.pronouns ?? null,
    previousExperience: tp?.previous_experience ?? null,
    yearsExperience: tp?.years_experience ?? 0,
    languages: tp?.languages ?? ['English'],
    isVerified: tp?.is_verified ?? false,
  }
  const weeklyAvailability = (tp?.weekly_availability ?? {}) as Record<string, { hour: number; minute: number }[]>
  // eslint-disable-next-line no-console
  console.log('[sessions/page] therapist availability read', {
    therapistId: match.therapist_id,
    timezone: tp?.timezone,
    keys: Object.keys(weeklyAvailability),
    slotCounts: Object.fromEntries(Object.entries(weeklyAvailability).map(([k, v]) => [k, (v as unknown[]).length])),
  })
  // Slots are stored in the therapist's own timezone (captured + saved when they
  // edit availability). UTC is only a neutral fallback for legacy rows saved
  // before timezone capture — those therapists just need to re-save once.
  const therapistTimezone = (tp?.timezone as string | null) || 'UTC'
  const allSessions: Session[] = sessionsResult.data ?? []
  const userEmail = userResult.data?.user?.email ?? ''

  const now = new Date()
  const upcoming = allSessions.filter(
    (s: Session) => s.status !== 'completed' && s.status !== 'cancelled' &&
      new Date(s.scheduled_at) > new Date(now.getTime() - 3600000)
  )
  const past = allSessions.filter(
    (s: Session) => s.status === 'completed' || s.status === 'cancelled' ||
      new Date(s.scheduled_at) <= new Date(now.getTime() - 3600000)
  )

  return (
    <ClientSessionsView
      matchId={match.id}
      currentUserId={user.id}
      therapistUserId={match.therapist_id}
      clientName={profile?.full_name ?? ''}
      userEmail={userEmail}
      therapist={therapist}
      timezone={profile?.timezone ?? null}
      therapistTimezone={therapistTimezone}
      perSessionInr={perSessionInr}
      paymentsEnabled={cashfreeConfigured()}
      upcoming={upcoming}
      past={past}
      weeklyAvailability={weeklyAvailability}
    />
  )
}
