import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import MessengerLayout from '@/components/therapist/MessengerLayout'
import { getNotifications } from '@/app/actions/notifications'

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

  const { data: matches } = await (admin as any)
    .from('matches')
    .select('id, client_id')
    .eq('therapist_id', user.id)
    .eq('status', 'active')

  if (!matches || matches.length === 0) redirect('/therapist/dashboard')

  const matchData = await Promise.all(
    (matches as { id: string; client_id: string }[]).map(async m => {
      const [clientResult, messagesResult, unreadResult] = await Promise.all([
        (admin as any).from('profiles').select('full_name').eq('id', m.client_id).single(),
        (admin as any)
          .from('messages')
          .select('id, sender_id, content, created_at, message_type')
          .eq('match_id', m.id)
          .order('created_at', { ascending: true })
          .limit(100),
        (admin as any)
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('match_id', m.id)
          .neq('sender_id', user.id)
          .eq('is_read', false),
      ])

      const messages: { id: string; sender_id: string; content: string; created_at: string; message_type: string }[] = messagesResult.data ?? []
      const last = messages.length > 0 ? messages[messages.length - 1] : null

      return {
        matchId: m.id,
        clientName: clientResult.data?.full_name ?? 'Client',
        lastMessage: last?.content ?? null,
        lastMessageAt: last?.created_at ?? null,
        unreadCount: unreadResult.count ?? 0,
        messages,
      }
    })
  )

  const initialNotifications = await getNotifications()
  const totalUnread = matchData.reduce((sum, m) => sum + m.unreadCount, 0)

  return (
    <div className="h-screen flex flex-col">
      <TherapistNav
        therapistName={profile!.full_name}
        userId={user.id}
        initialNotifications={initialNotifications}
        unreadCount={totalUnread}
        isMatched={true}
      />
      <div className="flex-1 overflow-hidden">
        <MessengerLayout
          matches={matchData}
          currentUserId={user.id}
          therapistName={profile!.full_name}
        />
      </div>
    </div>
  )
}
