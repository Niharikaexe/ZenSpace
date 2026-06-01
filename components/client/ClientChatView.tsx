'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/shared/ChatInterface'
import ClientNav from '@/components/client/ClientNav'
import TherapistSidePanel, { type TherapistPanelData } from '@/components/client/TherapistSidePanel'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  message_type: string
}

interface Props {
  matchId: string
  currentUserId: string
  clientName: string
  therapist: TherapistPanelData
  initialMessages: Message[]
  hasPaidSession: boolean
  freeMessagesLeft: number | null  // null = unlocked; 0 = intro exhausted; >0 = remaining
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ClientChatView({
  matchId,
  currentUserId,
  clientName,
  therapist,
  initialMessages,
  hasPaidSession,
  freeMessagesLeft,
}: Props) {
  const router = useRouter()

  // canSend: has a paid session OR still has free intro messages remaining
  const canSend = hasPaidSession || (freeMessagesLeft !== null && freeMessagesLeft > 0)
  // Booking prompt shows once the 25-message intro is used up and no session booked
  const showBookPrompt = !hasPaidSession && freeMessagesLeft === 0

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] overflow-hidden">
      <ClientNav userName={clientName} />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left panel: Therapist profile ──────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white">
          <TherapistSidePanel therapist={therapist} />
        </aside>

        {/* ── Right panel: Chat ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile-only therapist name bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-bold text-xs flex items-center justify-center flex-shrink-0">
              {initials(therapist.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#233551] text-sm truncate">{therapist.fullName}</p>
              <p className="text-xs text-[#233551]/40">Your therapist</p>
            </div>
          </div>

          {showBookPrompt && (
            <div className="flex-shrink-0 px-4 py-2.5 bg-[#7EC0B7]/10 border-b border-[#7EC0B7]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-[#233551]/80 font-medium truncate">
                  Book your session to keep chatting with your therapist.
                </p>
              </div>
              <Link
                href="/dashboard/sessions"
                className="flex-shrink-0 text-xs font-bold text-white bg-[#233551] hover:bg-[#1e2d47] px-3 py-1 rounded-full transition-colors"
              >
                Book a session →
              </Link>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <ChatInterface
              matchId={matchId}
              currentUserId={currentUserId}
              currentUserName={clientName}
              otherPartyName={therapist.fullName}
              initialMessages={initialMessages}
              sendDisabled={!canSend}
              onSendDisabled={() => router.push('/dashboard/sessions')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
