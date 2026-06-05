import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientNotesView from '@/components/client/ClientNotesView'
import LiveRefresh from '@/components/shared/LiveRefresh'
import type { TherapistPanelData } from '@/components/client/TherapistSidePanel'

export const dynamic = 'force-dynamic'

type RawSession = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  therapist_notes: string | null
}

export default async function ClientNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()

  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, therapist_id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const [tProfileResult, tUserResult, sessionsResult] = await Promise.all([
    (admin as any)
      .from('therapist_profiles')
      .select('specializations, bio, approach, years_experience, languages, is_verified, tagline, education, license_country, session_expectations, pronouns, previous_experience')
      .eq('user_id', match.therapist_id)
      .maybeSingle(),
    (admin as any)
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', match.therapist_id)
      .single(),
    (supabase as any)
      .from('sessions')
      .select('id, session_type, status, scheduled_at, therapist_notes')
      .eq('match_id', match.id)
      .not('therapist_notes', 'is', null)
      .order('scheduled_at', { ascending: false }),
  ])

  const tProfile = tProfileResult.data
  const tUser = tUserResult.data

  const therapist: TherapistPanelData = {
    fullName: tUser?.full_name ?? 'Your Therapist',
    avatarUrl: tUser?.avatar_url ?? null,
    tagline: tProfile?.tagline ?? null,
    specializations: tProfile?.specializations ?? [],
    bio: tProfile?.bio ?? null,
    approach: tProfile?.approach ?? null,
    education: tProfile?.education ?? null,
    licenseCountry: tProfile?.license_country ?? null,
    sessionExpectations: tProfile?.session_expectations ?? null,
    pronouns: tProfile?.pronouns ?? null,
    previousExperience: tProfile?.previous_experience ?? null,
    yearsExperience: tProfile?.years_experience ?? 0,
    languages: tProfile?.languages ?? ['English'],
    isVerified: tProfile?.is_verified ?? false,
  }

  const sessions = ((sessionsResult.data ?? []) as RawSession[])
    .filter(s => s.therapist_notes)
    .map(s => ({ ...s, therapist_notes: s.therapist_notes as string }))

  return (
    <>
      <LiveRefresh table="sessions" filter={`match_id=eq.${match.id}`} channel={`client-notes-${match.id}`} />
      <ClientNotesView
        clientName={profile?.full_name ?? ''}
        therapist={therapist}
        sessions={sessions}
      />
    </>
  )
}
