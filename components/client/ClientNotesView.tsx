'use client'

import ClientNav from '@/components/client/ClientNav'
import TherapistSidePanel, { type TherapistPanelData } from '@/components/client/TherapistSidePanel'

type NoteSession = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  therapist_notes: string
}

interface Props {
  clientName: string
  therapist: TherapistPanelData
  sessions: NoteSession[]
}

function formatDT(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function ClientNotesView({ clientName, therapist, sessions }: Props) {
  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] overflow-hidden">
      <ClientNav userName={clientName} />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Therapist profile ──────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white">
          <TherapistSidePanel therapist={therapist} />
        </aside>

        {/* ── Right: Notes list ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-7">

            <div className="flex items-center justify-between mb-6">
              <h1
                className="text-xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Session Notes
              </h1>
              <p className="text-xs text-[#233551]/40">
                from {therapist.fullName}
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#7EC0B7]/15 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#233551] mb-1">No notes yet</p>
                <p className="text-xs text-[#233551]/45 max-w-xs leading-relaxed">
                  Your therapist&apos;s notes will appear here after your sessions are completed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
                  >
                    {/* Session header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#233551]">
                          {s.session_type === 'video' ? 'Video Session' : 'Chat Session'}
                        </p>
                        <p className="text-xs text-[#233551]/45 mt-0.5">
                          {formatDT(s.scheduled_at)} · {formatTime(s.scheduled_at)}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          s.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </div>

                    {/* Notes body */}
                    <div className="px-6 py-5">
                      <p className="text-[10px] font-black text-[#233551]/30 uppercase tracking-widest mb-3">
                        Therapist notes
                      </p>
                      <p className="text-sm text-[#233551]/75 leading-relaxed whitespace-pre-wrap">
                        {s.therapist_notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#233551]/25 text-center mt-8">
              These notes are private between you and your therapist.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
