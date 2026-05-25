'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveSessionNotes, updateSessionStatus } from '@/app/actions/sessions'

interface Props {
  sessionId: string
  clientName: string
}

export default function CompleteSessionButton({ sessionId, clientName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleComplete(skipNotes = false) {
    startTransition(async () => {
      if (!skipNotes && notes.trim()) {
        await saveSessionNotes(sessionId, notes.trim())
      }
      await updateSessionStatus(sessionId, 'completed')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border border-[#7EC0B7]/50 text-[#3D8A80] hover:bg-[#7EC0B7]/10 transition-colors font-medium"
      >
        Mark completed
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Session notes
              </h2>
              <p className="text-sm text-[#233551]/50 mt-0.5">
                Add notes for your session with {clientName}. You can edit these later.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Key observations, homework assigned, next focus areas..."
              rows={6}
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] placeholder:text-[#233551]/30 focus:outline-none focus:border-[#7EC0B7] focus:ring-2 focus:ring-[#7EC0B7]/20 resize-none"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleComplete(false)}
                disabled={isPending || !notes.trim()}
                className="flex-1 py-2.5 text-sm font-bold bg-[#233551] text-white rounded-full hover:bg-[#1e2d47] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Saving...' : 'Save & complete'}
              </button>
              <button
                onClick={() => handleComplete(true)}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-medium text-[#233551]/50 border border-slate-200 rounded-full hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-medium text-[#233551]/50 border border-slate-200 rounded-full hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
