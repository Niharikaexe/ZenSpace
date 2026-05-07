'use client'

import { useState, useTransition } from 'react'
import { saveSessionNotes } from '@/app/actions/sessions'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  therapist_notes: string | null
}

type SessionGroup = {
  matchId: string
  clientName: string
  sessions: Session[]
}

function formatDT(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function NoteEditor({ session, onSaved }: { session: Session; onSaved: (id: string, notes: string) => void }) {
  const [text, setText] = useState(session.therapist_notes ?? '')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    startTransition(async () => {
      await saveSessionNotes(session.id, text)
      onSaved(session.id, text)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setOpen(false)
    })
  }

  return (
    <div className="border-t border-slate-50 first:border-t-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base flex-shrink-0">{session.session_type === 'video' ? '📹' : '💬'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#233551] truncate">{formatDT(session.scheduled_at)}</p>
            <p className="text-xs text-[#233551]/40 mt-0.5 capitalize">{session.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {session.therapist_notes ? (
            <span className="text-[10px] font-bold text-[#3D8A80] bg-[#7EC0B7]/15 px-2 py-0.5 rounded-full">Has notes</span>
          ) : (
            <span className="text-[10px] font-medium text-[#233551]/30 bg-slate-100 px-2 py-0.5 rounded-full">No notes</span>
          )}
          <svg
            className={`w-4 h-4 text-[#233551]/30 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            placeholder="Write your session notes here. These are visible to the client in read-only mode."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[#233551]/35">Visible to your client as read-only.</p>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-5 py-2 bg-[#233551] text-white text-xs font-bold rounded-xl hover:bg-[#2d4568] transition-colors disabled:opacity-40"
            >
              {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TherapistNotesView({ sessionGroups }: { sessionGroups: SessionGroup[] }) {
  const [groups, setGroups] = useState(sessionGroups)

  function handleSaved(sessionId: string, notes: string) {
    setGroups(prev => prev.map(g => ({
      ...g,
      sessions: g.sessions.map(s => s.id === sessionId ? { ...s, therapist_notes: notes } : s),
    })))
  }

  const totalSessions = groups.reduce((sum, g) => sum + g.sessions.length, 0)
  const withNotes = groups.reduce((sum, g) => sum + g.sessions.filter(s => s.therapist_notes).length, 0)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Session Notes
          </h1>
          <p className="text-sm text-[#233551]/45 mt-0.5">
            {withNotes} of {totalSessions} sessions have notes. Clients see these in read-only mode.
          </p>
        </div>
      </div>

      {groups.map(group => (
        group.sessions.length > 0 && (
          <div key={group.matchId} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-black flex items-center justify-center flex-shrink-0"
                style={{ fontFamily: 'var(--font-lato)' }}>
                {group.clientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#233551]">{group.clientName}</p>
                <p className="text-xs text-[#233551]/35">{group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div>
              {group.sessions.map(session => (
                <NoteEditor
                  key={session.id}
                  session={session}
                  onSaved={handleSaved}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {totalSessions === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-12 text-center">
          <p className="text-sm text-[#233551]/40">No sessions yet.</p>
          <p className="text-xs text-[#233551]/30 mt-1">Notes will appear here after your first session is scheduled.</p>
        </div>
      )}
    </main>
  )
}
