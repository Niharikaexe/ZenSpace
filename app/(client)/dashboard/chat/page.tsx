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
    .select('id, therapist_id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string } | null; error: unknown }

  if (!match) redirect('/dashboard')

  const [{ data: subscription }, { data: questionnaire }] = await Promise.all([
    (admin as any)
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle() as Promise<{ data: { status: string; current_period_end: string } | null; error: unknown }>,
    (admin as any)
      .from('questionnaire_responses')
      .select('responses')
      .eq('client_id', user.id)
      .maybeSingle() as Promise<{ data: { responses: Record<string, unknown> } | null; error: unknown }>,
  ])

  const isSubscribed = !!subscription
  const therapyType = (questionnaire?.responses?.type as string) ?? null
  const [tProfileResult, tUserResult, messagesResult] = await Promise.all([
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
    availabilityText: tProfile?.availability_text ?? null,
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
      therapyType={therapyType}
    />
  )
}
