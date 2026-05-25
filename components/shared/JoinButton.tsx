'use client'

import { useState, useEffect } from 'react'
import { getSessionJoinUrl } from '@/app/actions/sessions'

interface Props {
  sessionId: string
  scheduledAt: string
  roomUrl: string | null
  sessionType: string
}

export default function JoinButton({ sessionId, scheduledAt, roomUrl, sessionType }: Props) {
  const [label, setLabel] = useState<string | null>(null)
  const [canJoin, setCanJoin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    function compute() {
      const scheduled = new Date(scheduledAt).getTime()
      const now = Date.now()
      const diffMs = scheduled - now
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMs < -3600000) {
        setLabel('Session ended')
        setCanJoin(false)
      } else if (diffMs <= 0) {
        setLabel('Join Now')
        setCanJoin(true)
      } else if (diffMins <= 15) {
        setLabel(`Starts in ${diffMins}m`)
        setCanJoin(true)
      } else if (diffMins < 60) {
        setLabel(`In ${diffMins} min`)
        setCanJoin(false)
      } else {
        const hrs = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        setLabel(mins > 0 ? `In ${hrs}h ${mins}m` : `In ${hrs}h`)
        setCanJoin(false)
      }
    }

    compute()
    const interval = setInterval(compute, 30000)
    return () => clearInterval(interval)
  }, [scheduledAt])

  if (label === null) return null

  if (!roomUrl && sessionType === 'video') {
    return (
      <span className="text-xs text-slate-400 italic">
        {canJoin ? 'Link not set up yet' : label}
      </span>
    )
  }

  if (canJoin && roomUrl) {
    if (joinError) {
      return <span className="text-xs text-red-500 italic">{joinError}</span>
    }

    return (
      <button
        onClick={async () => {
          setLoading(true)
          setJoinError(null)
          const result = await getSessionJoinUrl(sessionId)
          setLoading(false)
          if (result.error) {
            setJoinError(result.error)
            return
          }
          if (result.url) {
            window.open(result.url, '_blank', 'noopener,noreferrer')
          }
        }}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            Joining...
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Join Now
          </>
        )}
      </button>
    )
  }

  return (
    <span className={`text-sm font-medium ${canJoin ? 'text-teal-600' : 'text-slate-500'}`}>
      {label}
    </span>
  )
}
