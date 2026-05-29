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

  const [{ data: subscription }, { data: questionnaire }, { count: totalMessageCount }] = await Promise.all([
    (admin as any)
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('client_id', user.id)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as Promise<{ data: { status: string; current_period_end: string | null } | null; error: unknown }>,
    (admin as any)
      .from('questionnaire_responses')
      .select('responses')
      .eq('client_id', user.id)
      .maybeSingle() as Promise<{ data: { responses: Record<string, unknown> } | null; error: unknown }>,
    (admin as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', match.id) as Promise<{ count: number | null; error: unknown }>,
  ])

  const isSubscribed = !!(subscription && (
    subscription.status === 'active' ||
    (subscription.status === 'cancelled' && subscription.current_period_end && new Date(subscription.current_period_end) > new Date())
  ))

  // Free intro chat: 25 messages total (client + therapist combined), no time
  // window. Once 25 messages exist, the client must subscribe to send more.
  const INTRO_LIMIT = 25
  // null = subscribed (no gate); 0 = exhausted; >0 = messages remaining
  const freeMessagesLeft: number | null = isSubscribed
    ? null
    : Math.max(0, INTRO_LIMIT - (totalMessageCount ?? 0))
  const therapyType = (questionnaire?.responses?.type as string) ?? null
  const [tProfileResult, tUserResult, messagesResult] = await Promise.all([
    (admin as any)
      .from('therapist_profiles')
      .select('specializations, bio, approach, years_experience, languages, is_verified')
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
    specializations: tProfile?.specializations ?? [],
    bio: tProfile?.bio ?? null,
    approach: tProfile?.approach ?? null,
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
      isSubscribed={isSubscribed}
      freeMessagesLeft={freeMessagesLeft}
      therapyType={therapyType}
    />
  )
}
