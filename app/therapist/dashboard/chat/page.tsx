import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from '@/components/shared/ChatInterface'
import { TherapistNav } from '@/components/therapist/TherapistNav'

export const dynamic = 'force-dynamic'

export default async function TherapistChatPage() {
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

  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, client_id')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!match) redirect('/therapist/dashboard')

  const { data: clientUser } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', match.client_id)
    .single()

  const { data: messages } = await (admin as any)
    .from('messages')
    .select('id, sender_id, content, created_at, message_type')
    .eq('match_id', match.id)
    .order('created_at', { ascending: true })
    .limit(100)

  const clientName = clientUser?.full_name ?? 'Your Client'

  return (
    <div className="h-screen flex flex-col bg-white">
      <TherapistNav therapistName={profile!.full_name} unreadCount={0} isMatched={true} />

      {/* Chat fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          matchId={match.id}
          currentUserId={user.id}
          currentUserName={profile!.full_name}
          otherPartyName={clientName}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  )
}
