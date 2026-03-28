'use client'

import { useState } from 'react'
import ChatInterface from '@/components/shared/ChatInterface'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  message_type: string
}

export type ClientMatch = {
  matchId: string
  clientName: string
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  messages: Message[]
}

interface Props {
  matches: ClientMatch[]
  currentUserId: string
  therapistName: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function MessengerLayout({ matches, currentUserId, therapistName }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.matchId ?? '')
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const selected = matches.find(m => m.matchId === selectedMatchId)

  function selectClient(matchId: string) {
    setSelectedMatchId(matchId)
    setMobileShowChat(true)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`${mobileShowChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-72 lg:w-80 border-r border-slate-100 bg-white flex-shrink-0`}>
        <div className="px-4 py-3.5 border-b border-slate-100">
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Clients</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {matches.map(m => {
            const isSelected = m.matchId === selectedMatchId
            return (
              <button
                key={m.matchId}
                onClick={() => selectClient(m.matchId)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                  isSelected ? 'bg-[#7EC0B7]/8 border-l-[3px] border-[#3D8A80]' : 'border-l-[3px] border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-bold text-sm flex items-center justify-center">
                    {initials(m.clientName)}
                  </div>
                  {m.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E8926A] text-white text-[9px] font-bold flex items-center justify-center">
                      {m.unreadCount > 9 ? '9+' : m.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm truncate ${m.unreadCount > 0 ? 'font-bold text-[#233551]' : 'font-semibold text-[#233551]/80'}`}>
                      {m.clientName}
                    </p>
                    {m.lastMessageAt && (
                      <span className="text-[11px] text-[#233551]/35 flex-shrink-0">{timeAgo(m.lastMessageAt)}</span>
                    )}
                  </div>
                  {m.lastMessage ? (
                    <p className={`text-xs truncate mt-0.5 ${m.unreadCount > 0 ? 'text-[#233551]/65 font-medium' : 'text-[#233551]/40'}`}>
                      {m.lastMessage}
                    </p>
                  ) : (
                    <p className="text-xs text-[#233551]/30 mt-0.5 italic">No messages yet</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`${mobileShowChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-slate-50`}>
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4 text-[#233551]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials(selected.clientName)}
              </div>
              <div>
                <p className="font-semibold text-[#233551] text-sm leading-tight">{selected.clientName}</p>
                <p className="text-xs text-[#233551]/40">Client</p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                key={selected.matchId}
                matchId={selected.matchId}
                currentUserId={currentUserId}
                currentUserName={therapistName}
                otherPartyName={selected.clientName}
                initialMessages={selected.messages}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-sm font-semibold text-[#233551]">Select a client to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
