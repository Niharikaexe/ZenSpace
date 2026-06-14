'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/shared/ChatInterface'
import ClientNav from '@/components/client/ClientNav'
import LiveRefresh from '@/components/shared/LiveRefresh'
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
  const [showProfile, setShowProfile] = useState(false)

  // canSend: has a paid session OR still has free intro messages remaining
  const canSend = hasPaidSession || (freeMessagesLeft !== null && freeMessagesLeft > 0)

  return (
    <div className="h-dvh flex flex-col bg-[#FAFAFA] overflow-hidden">
      {/* Live: match changes (e.g. re-match / end) */}
      <LiveRefresh table="matches" filter={`client_id=eq.${currentUserId}`} channel={`client-chat-matches-${currentUserId}`} />
      <ClientNav userName={clientName} />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left panel: Therapist profile ──────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white">
          <TherapistSidePanel therapist={therapist} />
        </aside>

        {/* ── Right panel: Chat ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile-only therapist name bar — tap to expand the full profile */}
          <button
            type="button"
            onClick={() => setShowProfile(v => !v)}
            aria-expanded={showProfile}
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 w-full text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-bold text-xs flex items-center justify-center flex-shrink-0">
              {initials(therapist.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#233551] text-sm truncate">{therapist.fullName}</p>
              <p className="text-xs text-[#233551]/40">Your therapist · tap for profile</p>
            </div>
            <svg
              viewBox="0 0 16 16" fill="none"
              className={`w-4 h-4 text-[#233551]/40 transition-transform duration-200 flex-shrink-0 ${showProfile ? 'rotate-180' : ''}`}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Collapsible profile (mobile) — same info as the desktop side panel */}
          {showProfile && (
            <div className="md:hidden flex-shrink-0 max-h-[55vh] overflow-y-auto mc-scroll border-b border-slate-100 bg-white">
              <TherapistSidePanel therapist={therapist} />
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
              quickReplies={['Hi, How are you?', 'Hi, Nice to meet you', 'Hello, please help me understand how this works']}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
