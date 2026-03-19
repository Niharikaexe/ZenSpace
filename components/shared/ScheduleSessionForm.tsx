'use client'

import { useState, useTransition } from 'react'
import { scheduleSession } from '@/app/actions/sessions'
import { Button } from '@/components/ui/button'

interface Props {
  matchId: string
}

export default function ScheduleSessionForm({ matchId }: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const todayStr = new Date().toISOString().split('T')[0]

  function handleSubmit() {
    if (!date || !time) {
      setError('Please select both a date and time.')
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
        }, 1200)
      }
    })
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white"
        size="sm"
      >
        + Schedule Session
      </Button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Schedule a Session</h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      <div className="space-y-4">
        {/* Session type */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Session Type</label>
          <div className="flex gap-2">
            {(['video', 'chat'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSessionType(type)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all capitalize ${
                  sessionType === type
                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {type === 'video' ? '📹 Video' : '💬 Chat'}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Time */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-teal-600 font-medium">Session scheduled!</p>}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !date || !time}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isPending ? 'Scheduling...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
