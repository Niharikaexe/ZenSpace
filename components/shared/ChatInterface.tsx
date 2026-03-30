'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesRead } from '@/app/actions/sessions'

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
  currentUserName: string
  otherPartyName: string
  initialMessages: Message[]
  sendDisabled?: boolean
  onSendDisabled?: () => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ChatInterface({
  matchId,
  currentUserId,
  otherPartyName,
  initialMessages,
  sendDisabled = false,
  onSendDisabled,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, startSend] = useTransition()
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mark messages as read on mount
  useEffect(() => {
    markMessagesRead(matchId)
  }, [matchId])

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`match-chat-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          markMessagesRead(matchId)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  function handleSend() {
    if (!input.trim() || isSending) return
    if (sendDisabled) { onSendDisabled?.(); return }
    const content = input.trim()
    setInput('')
    setSendError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Optimistic update
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      message_type: 'text',
    }
    setMessages(prev => [...prev, optimistic])

    startSend(async () => {
      const result = await sendMessage(matchId, content)
      if (result?.error) {
        setSendError(result.error)
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groups: { date: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at)
    const last = groups[groups.length - 1]
    if (last?.date === label) last.messages.push(msg)
    else groups.push({ date: label, messages: [msg] })
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">No messages yet</p>
            <p className="text-sm text-slate-400 mt-1">Start the conversation with {otherPartyName}</p>
          </div>
        )}

        {groups.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium px-2">{date}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-1.5">
              {dayMsgs.map((msg, i) => {
                const isOwn = msg.sender_id === currentUserId
                const prev = i > 0 ? dayMsgs[i - 1] : null
                const next = i < dayMsgs.length - 1 ? dayMsgs[i + 1] : null
                const isGroupStart = !prev || prev.sender_id !== msg.sender_id
                const isGroupEnd = !next || next.sender_id !== msg.sender_id
                const isOptimistic = msg.id.startsWith('opt-')

                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isGroupStart ? 'mt-3' : ''}`}>
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[72%]`}>
                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? `bg-teal-600 text-white ${isGroupStart ? 'rounded-t-2xl' : 'rounded-t-lg'} ${isGroupEnd ? 'rounded-bl-2xl rounded-br-sm' : 'rounded-b-lg'} ${isOptimistic ? 'opacity-60' : ''}`
                          : `bg-white border border-slate-200 text-slate-800 shadow-sm ${isGroupStart ? 'rounded-t-2xl' : 'rounded-t-lg'} ${isGroupEnd ? 'rounded-br-2xl rounded-bl-sm' : 'rounded-b-lg'}`
                      }`}>
                        {msg.content}
                      </div>
                      {isGroupEnd && (
                        <span className="text-xs text-slate-400 mt-1 mx-1">{formatTime(msg.created_at)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {sendError && (
        <div className="px-4 pb-1">
          <p className="text-xs text-red-500 text-center">{sendError}</p>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-none border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherPartyName}...`}
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden bg-slate-50"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !sendDisabled}
            className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-px"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        {sendDisabled ? (
          <p className="text-xs text-[#3D8A80] text-center mt-1.5 font-medium">
            Subscribe to send messages · <button onClick={() => onSendDisabled?.()} className="underline">View plans</button>
          </p>
        ) : (
          <p className="text-xs text-slate-400 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
        )}
      </div>
    </div>
  )
}
