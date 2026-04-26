'use client'

import { useState, useTransition } from 'react'
import { scheduleSession } from '@/app/actions/sessions'

type ClientOption = { matchId: string; clientName: string }

interface Props {
  clients: ClientOption[]
}

export default function MultiScheduleForm({ clients }: Props) {
  const [open, setOpen] = useState(false)
  const [matchId, setMatchId] = useState(clients[0]?.matchId ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const todayStr = new Date().toISOString().split('T')[0]

  function handleSubmit() {
    if (!matchId || !date || !time) {
      setError('Please fill in all fields.')
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
          setOpen(false)
          setSuccess(false)
          setDate('')
          setTime('')
          setSessionType('video')
          setMatchId(clients[0]?.matchId ?? '')
        }, 1200)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#233551] text-white text-sm font-bold rounded-xl hover:bg-[#1e2d47] transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Schedule Session
      </button>
    )
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#233551]">Schedule a Session</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-[#233551]/30 hover:text-[#233551]/60 transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Client — dropdown if multiple, read-only label if single */}
        <div>
          <label className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest block mb-1.5">Scheduling with</label>
          {clients.length > 1 ? (
            <select
              value={matchId}
              onChange={e => setMatchId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7EC0B7] focus:border-transparent text-[#233551] bg-white"
            >
              {clients.map(c => (
                <option key={c.matchId} value={c.matchId}>{c.clientName}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {clients[0]?.clientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-[#233551]">{clients[0]?.clientName}</p>
            </div>
          )}
        </div>

        {/* Session type */}
        <div>
          <label className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest block mb-2">Session Type</label>
          <div className="flex gap-2">
            {(['video', 'chat'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSessionType(type)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  sessionType === type
                    ? 'bg-[#7EC0B7]/15 border-[#7EC0B7] text-[#3D8A80] font-bold'
                    : 'border-slate-200 text-[#233551]/55 hover:border-slate-300'
                }`}
              >
                {type === 'video' ? '📹 Video' : '💬 Chat'}
              </button>
            ))}
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest block mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7EC0B7] focus:border-transparent text-[#233551]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest block mb-1.5">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7EC0B7] focus:border-transparent text-[#233551]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-[#3D8A80] font-bold">Session scheduled!</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="flex-1 py-2.5 text-sm border border-slate-200 rounded-xl text-[#233551]/60 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !date || !time}
            className="flex-1 py-2.5 text-sm bg-[#233551] text-white font-bold rounded-xl hover:bg-[#1e2d47] transition-colors disabled:opacity-40"
          >
            {isPending ? 'Scheduling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
