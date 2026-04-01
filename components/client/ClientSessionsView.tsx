'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import ClientNav from '@/components/client/ClientNav'
import SubscriptionModal from '@/components/client/SubscriptionModal'
import TherapistSidePanel, { type TherapistPanelData } from '@/components/client/TherapistSidePanel'
import JoinButton from '@/components/shared/JoinButton'
import { scheduleSession } from '@/app/actions/sessions'

type Session = {
  id: string
  session_type: string
  status: string
  scheduled_at: string
  started_at: string | null
  ended_at: string | null
  daily_room_url: string | null
  therapist_notes: string | null
}

interface Props {
  matchId: string
  currentUserId: string
  clientName: string
  therapist: TherapistPanelData
  timezone: string | null
  isSubscribed: boolean
  sessionsThisWeek: number
  upcoming: Session[]
  past: Session[]
  therapyType: string | null
}

type TimeSlot = { time: string; label12: string; date: string; iso: string }
type DayEntry = { date: Date; dateStr: string; dayName: string; dayNum: string; slots: TimeSlot[] }

// ── Dummy schedule: day-of-week → available times ─────────────────────────────
const WEEKLY_SCHEDULE: Record<number, { hour: number; minute: number }[]> = {
  1: [{ hour: 10, minute: 0 }, { hour: 15, minute: 0 }],            // Mon
  2: [{ hour: 11, minute: 0 }, { hour: 16, minute: 0 }],            // Tue
  3: [{ hour: 10, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }], // Wed
  4: [{ hour: 11, minute: 0 }, { hour: 16, minute: 0 }],            // Thu
  5: [{ hour: 10, minute: 0 }, { hour: 15, minute: 0 }],            // Fri
  6: [{ hour: 10, minute: 0 }],                                      // Sat
  0: [],                                                             // Sun — no slots
}

function buildWeek(): DayEntry[] {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 2 * 3_600_000) // slots must be 2h+ away
  const days: DayEntry[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    d.setHours(0, 0, 0, 0)

    const slots: TimeSlot[] = (WEEKLY_SCHEDULE[d.getDay()] ?? [])
      .map(({ hour, minute }) => {
        const slotDate = new Date(d)
        slotDate.setHours(hour, minute, 0, 0)
        if (slotDate <= cutoff) return null
        const label12 = slotDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        return {
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          label12,
          date: slotDate.toISOString().split('T')[0],
          iso: slotDate.toISOString(),
        }
      })
      .filter((s): s is TimeSlot => s !== null)

    days.push({
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: String(d.getDate()),
      slots,
    })
  }

  return days
}

function formatDT(iso: string, timezone?: string | null) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: timezone ?? undefined,
  })
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
    status === 'ongoing'   ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' :
    status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
    status === 'cancelled' ? 'bg-red-50 text-red-600' :
    'bg-slate-100 text-slate-500'
  return <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${cls}`}>{status}</span>
}

// ── Booking dropdown (small, 30%-ish width) ───────────────────────────────────

function BookingDropdown({
  slot,
  dayLabel,
  matchId,
  isSubscribed,
  weeklyLimitReached,
  onSubscribeNeeded,
  onClose,
  onBooked,
}: {
  slot: TimeSlot
  dayLabel: string
  matchId: string
  isSubscribed: boolean
  weeklyLimitReached: boolean
  onSubscribeNeeded: () => void
  onClose: () => void
  onBooked: (label: string) => void
}) {
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function handleSchedule() {
    if (!isSubscribed) { onSubscribeNeeded(); return }
    if (weeklyLimitReached) { setError("You've already used your session this week."); return }
    setError(null)
    startTransition(async () => {
      const result = await scheduleSession(matchId, slot.iso, sessionType)
      if (result?.error) {
        setError(result.error)
      } else {
        onBooked(`${dayLabel} · ${slot.label12}`)
      }
    })
  }

  return (
    <div
      ref={ref}
      className="absolute z-30 top-full mt-2 left-0 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4"
    >
      {/* Slot info */}
      <div className="mb-3">
        <p className="text-xs font-black text-[#233551]/35 uppercase tracking-widest mb-0.5">Booking</p>
        <p className="text-sm font-bold text-[#233551]">{dayLabel}</p>
        <p className="text-xs text-[#233551]/50">{slot.label12} IST</p>
      </div>

      {/* Session type */}
      <div className="flex gap-1.5 mb-3">
        {(['video', 'chat'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSessionType(t)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
              sessionType === t
                ? 'bg-[#233551] text-white border-[#233551]'
                : 'border-slate-200 text-[#233551]/55 hover:border-slate-300'
            }`}
          >
            {t === 'video' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
            {t === 'video' ? 'Video' : 'Chat'}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="flex gap-1.5">
        <button
          onClick={onClose}
          className="flex-1 py-2 text-xs border border-slate-200 rounded-xl text-[#233551]/55 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          disabled={isPending}
          className="flex-1 py-2 text-xs bg-[#233551] text-white font-bold rounded-xl hover:bg-[#1e2d47] transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : 'Schedule'}
        </button>
      </div>
    </div>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────

export default function ClientSessionsView({
  matchId,
  currentUserId,
  clientName,
  therapist,
  timezone,
  isSubscribed,
  sessionsThisWeek,
  upcoming,
  past,
  therapyType,
}: Props) {
  const [showSubModal, setShowSubModal]     = useState(false)
  const [selectedDay, setSelectedDay]       = useState<string | null>(null)
  const [openSlot, setOpenSlot]             = useState<TimeSlot | null>(null)
  const [bookedLabel, setBookedLabel]       = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes]   = useState<string | null>(null)

  const weeklyLimitReached = sessionsThisWeek >= 1
  const week = buildWeek()

  const selectedDayEntry = week.find(d => d.dateStr === selectedDay) ?? null

  function selectDay(entry: DayEntry) {
    if (selectedDay === entry.dateStr) {
      setSelectedDay(null)
      setOpenSlot(null)
    } else {
      setSelectedDay(entry.dateStr)
      setOpenSlot(null)
    }
  }

  function handleBooked(label: string) {
    setBookedLabel(label)
    setOpenSlot(null)
    setSelectedDay(null)
    setTimeout(() => setBookedLabel(null), 4000)
  }

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] overflow-hidden">
      <ClientNav userName={clientName} />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Therapist profile ─────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white">
          <TherapistSidePanel therapist={therapist} />
        </aside>

        {/* ── Right: Sessions content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-7 space-y-10">

            {/* ── Book a session ────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-[#233551]/35 uppercase tracking-widest">Book a Session</h2>
              </div>

              {bookedLabel && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#7EC0B7]/15 border border-[#7EC0B7]/30 rounded-xl">
                  <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-[#3D8A80]">Session requested — {bookedLabel}</p>
                </div>
              )}

              {isSubscribed && weeklyLimitReached && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#E8926A]/8 border border-[#E8926A]/20 rounded-xl">
                  <svg className="w-4 h-4 text-[#E8926A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-[#E8926A] font-semibold">1 session used this week. New slots open next Monday.</p>
                </div>
              )}

              {/* ── Day row ──────────────────────────────────────────────── */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {week.map(entry => {
                  const isSelected  = selectedDay === entry.dateStr
                  const hasSlots    = entry.slots.length > 0
                  const isToday     = entry.date.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={entry.dateStr}
                      onClick={() => hasSlots && selectDay(entry)}
                      disabled={!hasSlots}
                      className={`flex flex-col items-center flex-shrink-0 w-12 py-2.5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-[#233551] border-[#233551] text-white'
                          : hasSlots
                          ? 'bg-white border-slate-200 hover:border-[#7EC0B7] text-[#233551]'
                          : 'bg-slate-50 border-slate-100 text-[#233551]/25 cursor-not-allowed'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${
                        isSelected ? 'text-white/70' : isToday ? 'text-[#3D8A80]' : 'text-[#233551]/40'
                      }`}>
                        {entry.dayName}
                      </span>
                      <span className={`text-lg font-black leading-tight mt-0.5 ${
                        isSelected ? 'text-white' : 'text-[#233551]'
                      }`}>
                        {entry.dayNum}
                      </span>
                      {/* Dot indicator for available slots */}
                      <span className={`w-1 h-1 rounded-full mt-1 ${
                        isSelected ? 'bg-white/50' : hasSlots ? 'bg-[#7EC0B7]' : 'bg-transparent'
                      }`} />
                    </button>
                  )
                })}
              </div>

              {/* ── Time slots for selected day ──────────────────────────── */}
              {selectedDayEntry && (
                <div className="mt-4">
                  <p className="text-xs text-[#233551]/40 font-semibold mb-2">
                    {selectedDayEntry.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDayEntry.slots.map(slot => {
                      const isOpen = openSlot?.time === slot.time && openSlot?.date === slot.date

                      return (
                        <div key={slot.time} className="relative">
                          <button
                            onClick={() => setOpenSlot(isOpen ? null : slot)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                              isOpen
                                ? 'bg-[#233551] border-[#233551] text-white'
                                : 'bg-white border-slate-200 hover:border-[#7EC0B7] text-[#233551]'
                            }`}
                          >
                            <svg className={`w-3.5 h-3.5 ${isOpen ? 'text-white/70' : 'text-[#7EC0B7]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.label12}
                          </button>

                          {isOpen && (
                            <BookingDropdown
                              slot={slot}
                              dayLabel={selectedDayEntry.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                              matchId={matchId}
                              isSubscribed={isSubscribed}
                              weeklyLimitReached={weeklyLimitReached}
                              onSubscribeNeeded={() => { setOpenSlot(null); setShowSubModal(true) }}
                              onClose={() => setOpenSlot(null)}
                              onBooked={handleBooked}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {!selectedDay && (
                <p className="mt-3 text-xs text-[#233551]/35">
                  Select a day above to see available times.
                  {!isSubscribed && ' A subscription is required to book.'}
                </p>
              )}
            </section>

            {/* ── Upcoming sessions ─────────────────────────────────────── */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-[#233551]/35 uppercase tracking-widest mb-3">Upcoming Sessions</h2>
                <div className="space-y-3">
                  {upcoming.map((s: Session) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#233551]">
                            {s.session_type === 'video' ? '📹 Video session' : '💬 Chat session'}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-sm text-[#233551]/60">{formatDT(s.scheduled_at, timezone)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {s.session_type === 'video' ? (
                          <JoinButton scheduledAt={s.scheduled_at} roomUrl={s.daily_room_url} sessionType={s.session_type} />
                        ) : (
                          <Link href="/dashboard/chat" className="text-sm text-[#3D8A80] hover:text-[#233551] font-semibold transition-colors">
                            Open chat →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Past sessions ─────────────────────────────────────────── */}
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-[#233551]/35 uppercase tracking-widest mb-3">Past Sessions</h2>
                <div className="space-y-2">
                  {past.map((s: Session) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="px-5 py-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-[#233551] min-w-0 truncate">
                          {s.session_type === 'video' ? '📹 Video' : '💬 Chat'} · {formatDT(s.scheduled_at, timezone)}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={s.status} />
                          {s.therapist_notes && (
                            <button
                              onClick={() => setExpandedNotes(expandedNotes === s.id ? null : s.id)}
                              className="text-[11px] font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
                            >
                              {expandedNotes === s.id ? 'Hide notes' : 'View notes'}
                            </button>
                          )}
                        </div>
                      </div>
                      {expandedNotes === s.id && s.therapist_notes && (
                        <div className="px-5 pb-4 border-t border-slate-100">
                          <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mt-3 mb-2">Session notes</p>
                          <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{s.therapist_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>

      {showSubModal && (
        <SubscriptionModal trigger="session" onClose={() => setShowSubModal(false)} therapyType={therapyType} />
      )}
    </div>
  )
}
