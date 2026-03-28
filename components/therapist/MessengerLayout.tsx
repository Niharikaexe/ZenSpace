'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import ChatInterface from '@/components/shared/ChatInterface'
import { scheduleSession } from '@/app/actions/sessions'

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

// ── Inline schedule form (appears in chat header area) ────────────────────────

function InlineScheduleForm({
  matchId,
  clientName,
  onClose,
}: {
  matchId: string
  clientName: string
  onClose: () => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function handleSubmit() {
    if (!date || !time) {
      setError('Please select a date and time.')
      return
    }
    setError(null)
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

    startTransition(async () => {
      const result = await scheduleSession(matchId, scheduledAt, sessionType)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1200)
      }
    })
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 right-0 z-20 bg-white border-b border-slate-100 shadow-sm px-4 py-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-[#233551]">Schedule a session</p>
          <p className="text-xs text-[#233551]/45">with {clientName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#233551]/30 hover:text-[#233551]/60 transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Session type */}
      <div className="flex gap-2 mb-3">
        {(['video', 'chat'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setSessionType(type)}
            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
              sessionType === type
                ? 'bg-[#7EC0B7]/15 border-[#7EC0B7] text-[#3D8A80] font-bold'
                : 'border-slate-200 text-[#233551]/55 hover:border-slate-300'
            }`}
          >
            {type === 'video' ? '📹 Video' : '💬 Chat'}
          </button>
        ))}
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          type="date"
          value={date}
          min={todayStr}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#7EC0B7] focus:border-transparent text-[#233551]"
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#7EC0B7] focus:border-transparent text-[#233551]"
        />
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      {success && <p className="text-xs text-[#3D8A80] font-bold mb-2">Session scheduled!</p>}

      <div className="flex gap-2">
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 py-2 text-xs border border-slate-200 rounded-xl text-[#233551]/55 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || !date || !time}
          className="flex-1 py-2 text-xs bg-[#233551] text-white font-bold rounded-xl hover:bg-[#1e2d47] transition-colors disabled:opacity-40"
        >
          {isPending ? 'Scheduling...' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MessengerLayout({ matches, currentUserId, therapistName }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.matchId ?? '')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  const selected = matches.find(m => m.matchId === selectedMatchId)

  function selectClient(matchId: string) {
    setSelectedMatchId(matchId)
    setMobileShowChat(true)
    setIsScheduling(false)
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
            {/* Chat header — relative so schedule form can anchor to it */}
            <div className="relative flex-shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
                {/* Mobile back */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-[#233551]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Avatar + name */}
                <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {initials(selected.clientName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#233551] text-sm leading-tight truncate">{selected.clientName}</p>
                  <p className="text-xs text-[#233551]/40">Client</p>
                </div>

                {/* Schedule session button */}
                <button
                  onClick={() => setIsScheduling(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${
                    isScheduling
                      ? 'bg-[#233551] text-white'
                      : 'bg-[#233551]/8 text-[#233551] hover:bg-[#233551]/15'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Schedule</span>
                </button>
              </div>

              {/* Inline schedule form — drops below header */}
              {isScheduling && (
                <InlineScheduleForm
                  matchId={selected.matchId}
                  clientName={selected.clientName}
                  onClose={() => setIsScheduling(false)}
                />
              )}
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
