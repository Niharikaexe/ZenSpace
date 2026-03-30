import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientSessionsView from '@/components/client/ClientSessionsView'

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
    .select('id, therapist_id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const { data: subscription } = await (admin as any)
    .from('subscriptions')
    .select('status, plan')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { status: string; plan: string } | null; error: unknown }

  const isSubscribed = !!subscription
  const [tProfileResult, tUserResult, sessionsResult] = await Promise.all([
    (admin as any)
      .from('therapist_profiles')
      .select('specializations, bio, approach, years_experience, languages, availability_text, is_verified')
      .eq('user_id', match.therapist_id)
      .maybeSingle(),
    (admin as any)
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', match.therapist_id)
      .single(),
    (admin as any)
      .from('sessions')
      .select('id, session_type, status, scheduled_at, started_at, ended_at, daily_room_url, therapist_notes')
      .eq('match_id', match.id)
      .order('scheduled_at', { ascending: false }),
  ])

  const tp = tProfileResult.data
  const tu = tUserResult.data
  const therapist = {
    fullName: tu?.full_name ?? 'Your Therapist',
    avatarUrl: tu?.avatar_url ?? null,
    specializations: tp?.specializations ?? [],
    bio: tp?.bio ?? null,
    approach: tp?.approach ?? null,
    yearsExperience: tp?.years_experience ?? 0,
    languages: tp?.languages ?? ['English'],
    availabilityText: tp?.availability_text ?? null,
    isVerified: tp?.is_verified ?? false,
  }
  const allSessions: Session[] = sessionsResult.data ?? []

  // Count sessions in current calendar week (Mon–Sun) for this match
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // Monday
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const sessionsThisWeek = allSessions.filter(s => {
    const d = new Date(s.scheduled_at)
    return d >= weekStart && d < weekEnd && s.status !== 'cancelled'
  }).length

  const now2 = new Date()
  const upcoming = allSessions.filter(
    (s: Session) => s.status !== 'completed' && s.status !== 'cancelled' &&
      new Date(s.scheduled_at) > new Date(now2.getTime() - 3600000)
  )
  const past = allSessions.filter(
    (s: Session) => s.status === 'completed' || s.status === 'cancelled' ||
      new Date(s.scheduled_at) <= new Date(now2.getTime() - 3600000)
  )

  return (
    <ClientSessionsView
      matchId={match.id}
      currentUserId={user.id}
      clientName={profile?.full_name ?? ''}
      therapist={therapist}
      timezone={profile?.timezone ?? null}
      isSubscribed={isSubscribed}
      sessionsThisWeek={sessionsThisWeek}
      upcoming={upcoming}
      past={past}
    />
  )
}
