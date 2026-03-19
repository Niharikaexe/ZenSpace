import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import ChatInterface from '@/components/shared/ChatInterface'

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
      {/* Header */}
      <header className="flex-none border-b border-slate-100 bg-white px-4 py-3 flex items-center gap-3">
        <Link
          href="/therapist/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{clientName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <p className="text-xs text-teal-600">Your client</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">
            Sign out
          </button>
        </form>
      </header>

      {/* Chat fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          matchId={match.id}
          currentUserId={user.id}
          currentUserName={profile.full_name}
          otherPartyName={clientName}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  )
}
