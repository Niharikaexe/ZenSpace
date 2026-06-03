import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientChatView from '@/components/client/ClientChatView'

export const dynamic = 'force-dynamic'

export default async function ClientChatPage() {
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
    .select('id, therapist_id, created_at')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string; created_at: string } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const [{ count: paidSessionCount }, { count: totalMessageCount }] = await Promise.all([
    (admin as any)
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', match.id)
      .eq('payment_status', 'paid') as Promise<{ count: number | null; error: unknown }>,
    (admin as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', match.id) as Promise<{ count: number | null; error: unknown }>,
  ])

  // Pay-as-you-go: a client who has booked (paid for) at least one session keeps
  // unlimited chat. Otherwise the free intro is 25 messages total (client +
  // therapist combined); after that they must book a session to keep chatting.
  const hasPaidSession = (paidSessionCount ?? 0) > 0
  const INTRO_LIMIT = 25
  // null = unlocked (no gate); 0 = intro exhausted; >0 = messages remaining
  const freeMessagesLeft: number | null = hasPaidSession
    ? null
    : Math.max(0, INTRO_LIMIT - (totalMessageCount ?? 0))

  const [tProfileResult, tUserResult, messagesResult] = await Promise.all([
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
      .from('messages')
      .select('id, sender_id, content, created_at, message_type')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true })
      .limit(100),
  ])

  const tProfile = tProfileResult.data
  const tUser = tUserResult.data
  const messages = messagesResult.data ?? []

  const therapist = {
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

  return (
    <ClientChatView
      matchId={match.id}
      currentUserId={user.id}
      clientName={profile?.full_name ?? ''}
      therapist={therapist}
      initialMessages={messages}
      hasPaidSession={hasPaidSession}
      freeMessagesLeft={freeMessagesLeft}
    />
  )
}
