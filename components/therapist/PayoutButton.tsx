'use client'

import { useState, useTransition } from 'react'
import { requestPayout } from '@/app/actions/therapist-profile'

export default function PayoutButton() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (sent || isPending) return
    startTransition(async () => {
      const result = await requestPayout()
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex items-center gap-2 px-6 py-3 bg-[#7EC0B7]/20 text-[#3D8A80] text-sm font-bold rounded-xl">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Sent
        </div>
        <p className="text-xs text-white/35 text-center sm:text-right max-w-[220px]">
          We'll process your payout within 5 business days.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-6 py-3 bg-[#7EC0B7] text-[#233551] text-sm font-bold rounded-xl hover:bg-[#6db5ac] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Sending...' : 'Request payout →'}
      </button>
      {error && <p className="text-xs text-red-400 text-center sm:text-right">{error}</p>}
      <p className="text-xs text-white/35 text-center sm:text-right max-w-[220px]">
        We'll process within 5 business days.
      </p>
    </div>
  )
}
