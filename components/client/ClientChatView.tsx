'use client'

import { useState } from 'react'
import ChatInterface from '@/components/shared/ChatInterface'
import SubscriptionModal from '@/components/client/SubscriptionModal'
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
  isSubscribed: boolean
  freeMessagesLeft: number | null  // null = subscribed; 0 = exhausted; >0 = remaining
  therapyType: string | null
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
  isSubscribed,
  freeMessagesLeft,
  therapyType,
}: Props) {
  const [showSubModal, setShowSubModal] = useState(false)

  // canSend: subscribed OR has free intro messages remaining
  const canSend = isSubscribed || (freeMessagesLeft !== null && freeMessagesLeft > 0)
  // showExpiredBanner: not subscribed AND intro exhausted (freeMessagesLeft === 0)
  const showExpiredBanner = !isSubscribed && freeMessagesLeft === 0

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

          {showExpiredBanner && (
            <div className="flex-shrink-0 px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-800 font-medium truncate">
                  Subscribe to keep messaging and book sessions.
                </p>
              </div>
              <button
                onClick={() => setShowSubModal(true)}
                className="flex-shrink-0 text-xs font-bold text-amber-800 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-full transition-colors"
              >
                Subscribe →
              </button>
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
              freeMessagesLeft={freeMessagesLeft}
              onSendDisabled={() => setShowSubModal(true)}
            />
          </div>
        </div>
      </div>

      {showSubModal && (
        <SubscriptionModal trigger="chat" onClose={() => setShowSubModal(false)} therapyType={therapyType} />
      )}
    </div>
  )
}
