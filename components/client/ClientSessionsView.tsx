'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ClientNav from '@/components/client/ClientNav'
import LiveRefresh from '@/components/shared/LiveRefresh'
import TherapistSidePanel, { type TherapistPanelData } from '@/components/client/TherapistSidePanel'
import JoinButton from '@/components/shared/JoinButton'
import { formatInr } from '@/lib/plans'
import { toIanaTimeZone } from '@/lib/timezones'

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
  therapistUserId: string
  clientName: string
  userEmail: string
  therapist: TherapistPanelData
  timezone: string | null
  therapistTimezone: string
  perSessionInr: number
  paymentsEnabled: boolean
  upcoming: Session[]
  past: Session[]
  weeklyAvailability: Record<string, { hour: number; minute: number }[]>
}

type TimeSlot = { time: string; label12: string; date: string; iso: string }
type DayEntry = { date: Date; dateStr: string; dayName: string; dayNum: string; slots: TimeSlot[] }

// RAZORPAY loader (disabled — kept for rollback):
// function loadRazorpayScript(): Promise<boolean> {
//   return new Promise(resolve => {
//     if (typeof window !== 'undefined' && (window as any).Razorpay) return resolve(true)
//     const script = document.createElement('script')
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js'
//     script.onload = () => resolve(true); script.onerror = () => resolve(false)
//     document.body.appendChild(script)
//   })
// }

// Cashfree v3 JS SDK loader.
function loadCashfreeScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && (window as any).Cashfree) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Converts a wall-clock time (hour, minute) in the therapist's timezone on a given
 * calendar date to a UTC Date. Uses the Intl trick: interpret the naive UTC guess in
 * the target timezone to derive the actual offset, then apply the correction.
 */
function localTimeToUTC(year: number, month: number, day: number, hour: number, minute: number, tz: string): Date {
  const naive = new Date(Date.UTC(year, month, day, hour, minute, 0))
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).formatToParts(naive)
  const g = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, parseInt(p.value)]))
  const tzUTC = Date.UTC(g.year, g.month - 1, g.day, g.hour === 24 ? 0 : g.hour, g.minute, 0)
  return new Date(naive.getTime() * 2 - tzUTC)
}

const DOW_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

function buildWeek(
  weeklyAvailability: Record<string, { hour: number; minute: number }[]>,
  therapistTimezone: string,
): DayEntry[] {
  // Normalize the stored timezone (may be a legacy label like "IST (India)")
  // into a valid IANA zone before it reaches Intl. Falls back to UTC.
  const tz = toIanaTimeZone(therapistTimezone) ?? 'UTC'
  const now = new Date()
  const cutoff = now.getTime() + 2 * 3_600_000 // slots must be 2h+ away

  // The availability is a weekly schedule keyed by day-of-week in the THERAPIST's
  // timezone. A slot's real instant therefore depends on the therapist's calendar
  // date — and an overnight block (e.g. Thu 10pm–Fri 6:30am Dubai) spills across
  // two *client* days once converted. So: generate every future slot instant by
  // walking the therapist's local dates, then bucket each by the CLIENT's local
  // date. (The old code keyed slots by the client's day-of-week, which mis-placed
  // and dropped overnight cross-timezone slots.)
  const dowFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' })
  const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })

  const byClientDate = new Map<string, TimeSlot[]>()

  // Walk a window of therapist-local dates wide enough to cover the next 7 client
  // days plus overnight spill at both ends.
  for (let i = -1; i <= 8; i++) {
    const base = new Date(now.getTime() + i * 86_400_000)
    const dow = DOW_INDEX[dowFmt.format(base)]
    const [ty, tm, td] = ymdFmt.format(base).split('-').map(Number) // therapist-local Y-M-D
    for (const { hour, minute } of weeklyAvailability[String(dow)] ?? []) {
      const slotDate = localTimeToUTC(ty, tm - 1, td, hour, minute, tz)
      if (slotDate.getTime() <= cutoff) continue
      const clientDateStr = slotDate.toLocaleDateString('en-CA') // client-local day
      const arr = byClientDate.get(clientDateStr) ?? []
      arr.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        label12: slotDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: clientDateStr,
        iso: slotDate.toISOString(),
      })
      byClientDate.set(clientDateStr, arr) // ← was missing: fresh arrays were never stored
    }
  }

  const days: DayEntry[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    d.setHours(0, 0, 0, 0)
    const dateStr = d.toLocaleDateString('en-CA')
    const slots = (byClientDate.get(dateStr) ?? []).sort((a, b) => a.iso.localeCompare(b.iso))
    days.push({
      date: d,
      dateStr,
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNum: String(d.getDate()),
      slots,
    })
  }

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[buildWeek]', {
      therapistTimezone, resolvedTz: tz,
      inputKeys: Object.keys(weeklyAvailability ?? {}),
      inputSlotCounts: Object.fromEntries(Object.entries(weeklyAvailability ?? {}).map(([k, v]) => [k, (v as unknown[]).length])),
      outputSlotsPerDay: days.map(d => `${d.dateStr}:${d.slots.length}`),
    })
  }

  return days
}

function formatDT(iso: string, timezone?: string | null) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: toIanaTimeZone(timezone),
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

// ── Pay-to-book modal ─────────────────────────────────────────────────────────

function PaySessionModal({
  slot,
  dayLabel,
  therapistName,
  matchId,
  perSessionInr,
  paymentsEnabled,
  onClose,
  onBooked,
}: {
  slot: TimeSlot
  dayLabel: string
  therapistName: string
  matchId: string
  perSessionInr: number
  paymentsEnabled: boolean
  onClose: () => void
  onBooked: (label: string) => void
}) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'confirming'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const busy = phase !== 'idle'

  // Trigger the enter transition on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  async function handlePay() {
    setError(null)
    if (!paymentsEnabled) {
      setError('Payments aren’t configured yet. Please contact support.')
      return
    }
    setPhase('opening')

    try {
      const orderRes = await fetch('/api/payment/session-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, scheduledAt: slot.iso }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setError(orderData.error ?? 'Couldn’t start the payment. Please try again.')
        setPhase('idle')
        return
      }

      // Booked against a monthly-bundle credit — no payment needed.
      if (orderData.booked) {
        onBooked(`${dayLabel} · ${slot.label12}`)
        return
      }

      const loaded = await loadCashfreeScript()
      if (!loaded) {
        setError('Could not load the payment gateway. Check your connection and try again.')
        setPhase('idle')
        return
      }

      const { order_id, payment_session_id, mode, sessionId } = orderData

      // Open Cashfree checkout in a modal. The promise resolves when the modal
      // closes (success, failure, or dismissal); order status is then confirmed
      // server-side, which is the source of truth.
      const cashfree = (window as any).Cashfree({ mode: mode === 'sandbox' ? 'sandbox' : 'production' })
      const result = await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_modal' })

      if (result?.error) {
        setError(result.error.message ?? 'Payment was cancelled or didn’t complete.')
        setPhase('idle')
        return
      }

      setPhase('confirming')
      const verifyRes = await fetch('/api/payment/session-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, sessionId }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError(verifyData.error ?? `Payment went through but we couldn’t confirm the session. Contact support with order ID: ${order_id}`)
        setPhase('idle')
        return
      }
      onBooked(`${dayLabel} · ${slot.label12}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setPhase('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}
    >
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'
        }`}
      >
        {/* Header */}
        <div className="bg-[#233551] px-6 pt-6 pb-5">
          <button
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Confirm & pay</p>
          <h2 className="text-white text-xl font-black leading-snug">Book your session</h2>
          <p className="text-white/60 text-sm mt-1.5">with {therapistName}</p>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#233551]">{dayLabel}</p>
              <p className="text-xs text-[#233551]/50">{slot.label12} · 50 min video session</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] border border-slate-100 px-4 py-3">
            <span className="text-sm text-[#233551]/55">Session price</span>
            <span className="text-lg font-black text-[#233551]">{formatInr(perSessionInr)}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handlePay}
            disabled={busy}
            className="w-full py-3.5 bg-[#233551] text-white font-black text-sm rounded-2xl hover:bg-[#1e2d47] transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {phase === 'opening' ? 'Opening checkout…' : phase === 'confirming' ? 'Confirming…' : `Pay ${formatInr(perSessionInr)} & book`}
          </button>
          <p className="text-center text-xs text-[#233551]/35 mt-3">
            Secure payment via Razorpay · Pay as you go · Non-refundable
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────

export default function ClientSessionsView({
  matchId,
  therapistUserId,
  clientName,
  therapist,
  timezone,
  therapistTimezone,
  perSessionInr,
  paymentsEnabled,
  upcoming,
  past,
  weeklyAvailability,
}: Props) {
  const router = useRouter()

  // Live availability: when the therapist edits their weekly slots, their
  // therapist_profiles row updates — re-fetch so the booking grid reflects it
  // without the client reloading. (RLS: clients can read their matched
  // therapist's profile; therapist_profiles is in the realtime publication.)
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`therapist-availability:${therapistUserId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'therapist_profiles',
          filter: `user_id=eq.${therapistUserId}`,
        },
        () => router.refresh(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [therapistUserId, router])
  const [selectedDay, setSelectedDay]     = useState<string | null>(null)
  const [openSlot, setOpenSlot]           = useState<TimeSlot | null>(null)
  const [bookedLabel, setBookedLabel]     = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)

  const week = buildWeek(weeklyAvailability, therapistTimezone)
  const selectedDayEntry = week.find(d => d.dateStr === selectedDay) ?? null
  // Did the therapist publish ANY weekly slots at all? (Distinguishes "no
  // availability set" from "nothing free in the next 7 days".)
  const hasAnyAvailability = Object.values(weeklyAvailability ?? {}).some(arr => Array.isArray(arr) && arr.length > 0)
  const hasBookableSlots = week.some(d => d.slots.length > 0)

  function selectDay(entry: DayEntry) {
    setSelectedDay(selectedDay === entry.dateStr ? null : entry.dateStr)
  }

  function handleBooked(label: string) {
    setBookedLabel(label)
    setOpenSlot(null)
    setSelectedDay(null)
    router.refresh()
    setTimeout(() => setBookedLabel(null), 5000)
  }

  return (
    <div className="h-dvh flex flex-col bg-[#FAFAFA] overflow-hidden">
      {/* Live: therapist schedules/cancels/completes a session for this match */}
      <LiveRefresh table="sessions" filter={`match_id=eq.${matchId}`} channel={`client-sessions-${matchId}`} />
      <ClientNav userName={clientName} />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Therapist profile ─────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white">
          <TherapistSidePanel therapist={therapist} />
        </aside>

        {/* ── Right: Sessions content ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 py-7 space-y-10">

            {/* ── Book a session ────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-[#233551]/35 uppercase tracking-widest">Book a Session</h2>
                <span className="text-xs font-semibold text-[#233551]/45">{formatInr(perSessionInr)} / session</span>
              </div>

              {bookedLabel && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#7EC0B7]/15 border border-[#7EC0B7]/30 rounded-xl">
                  <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-[#3D8A80]">Session booked — {bookedLabel}</p>
                </div>
              )}

              {/* No availability published by the therapist at all */}
              {!hasAnyAvailability && (
                <div className="rounded-xl bg-[#FFF5F2] border border-[#E8926A]/25 px-4 py-4 text-center">
                  <p className="text-sm font-semibold text-[#233551]">Your therapist hasn&apos;t set their availability yet.</p>
                  <p className="text-xs text-[#233551]/55 mt-1">Message them in chat to nudge — booking opens as soon as they publish times.</p>
                </div>
              )}

              {/* Availability exists, but nothing free in the next 7 days */}
              {hasAnyAvailability && !hasBookableSlots && (
                <div className="rounded-xl bg-[#FFF5F2] border border-[#E8926A]/25 px-4 py-4 text-center">
                  <p className="text-sm font-semibold text-[#233551]">No open slots in the next 7 days.</p>
                  <p className="text-xs text-[#233551]/55 mt-1">Check back soon — new times open up as the week rolls forward.</p>
                </div>
              )}

              {/* ── Day row ──────────────────────────────────────────────── */}
              {hasBookableSlots && (
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
              )}

              {/* ── Time slots for selected day ──────────────────────────── */}
              {selectedDayEntry && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#233551]/40 font-semibold">
                      {selectedDayEntry.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[11px] text-[#233551]/40 font-semibold">Each session 50 min</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDayEntry.slots.map(slot => (
                      <button
                        key={slot.iso}
                        onClick={() => setOpenSlot(slot)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-[#233551] hover:border-[#7EC0B7] transition-all"
                      >
                        <svg className="w-3.5 h-3.5 text-[#7EC0B7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slot.label12}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasBookableSlots && !selectedDay && (
                <p className="mt-3 text-xs text-[#233551]/35">
                  Select a day above to see available times. You pay per session when you book.
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
                            {s.session_type === 'video' ? 'Video session' : 'Chat session'}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-sm text-[#233551]/60">{formatDT(s.scheduled_at, timezone)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {s.session_type === 'video' ? (
                          <JoinButton sessionId={s.id} scheduledAt={s.scheduled_at} roomUrl={s.daily_room_url} sessionType={s.session_type} />
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
                          {s.session_type === 'video' ? 'Video' : 'Chat'} · {formatDT(s.scheduled_at, timezone)}
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
      </div>

      {openSlot && selectedDayEntry && (
        <PaySessionModal
          slot={openSlot}
          dayLabel={selectedDayEntry.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          therapistName={therapist.fullName}
          matchId={matchId}
          perSessionInr={perSessionInr}
          paymentsEnabled={paymentsEnabled}
          onClose={() => setOpenSlot(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  )
}
