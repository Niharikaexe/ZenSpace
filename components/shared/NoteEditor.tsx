'use client'

import { useState, useTransition } from 'react'
import { saveSessionNotes } from '@/app/actions/sessions'

interface Props {
  sessionId: string
  initialNotes: string | null
}

export default function NoteEditor({ sessionId, initialNotes }: Props) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saved, setSaved] = useState(initialNotes ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isDirty = notes !== saved

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await saveSessionNotes(sessionId, notes)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(notes)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        setEditing(false)
      }
    })
  }

  function handleCancel() {
    setNotes(saved)
    setEditing(false)
    setError(null)
  }

  if (!editing) {
    return (
      <div>
        {saved ? (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{saved}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No notes written yet.</p>
        )}
        <button
          onClick={() => setEditing(true)}
          className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          {saved ? 'Edit notes' : '+ Add notes'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Write session notes here... (visible to client)"
        rows={5}
        autoFocus
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {saveSuccess && <p className="text-xs text-teal-600 font-medium">Saved!</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}
