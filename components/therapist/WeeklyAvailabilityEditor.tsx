'use client'

import { useState, useRef, useEffect } from 'react'
import { updateWeeklyAvailability, type WeeklyAvailability } from '@/app/actions/therapist-availability'
import { timezoneLabel } from '@/lib/timezones'

// ── Grid constants ────────────────────────────────────────────────────────────
// The grid is drawn in 30-min cells (0 = 00:00 … 47 = 23:30) so a slot can start
// on the hour OR the half-hour. Each booked slot is ONE HOUR long and spans two
// cells. We store the SLOT STARTS (a Set of starting cell indices), not a blob of
// occupied cells — so a slot is an atomic unit you add/remove as a whole.
const TOTAL_CELLS = 48   // 30-min cells across 24 h
const CELL_MIN    = 30   // minutes per cell
const SLOT_SPAN   = 2    // cells per 1-hour slot
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = [
  { key: '1', label: 'Monday'    },
  { key: '2', label: 'Tuesday'   },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday'  },
  { key: '5', label: 'Friday'    },
  { key: '6', label: 'Saturday'  },
  { key: '0', label: 'Sunday'    },
]

// Hour labels placed at every 3-hour boundary
const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({
  ci: (h * 60) / CELL_MIN,
  label: h === 0 ? '12 am' : h === 12 ? '12 pm' : h < 12 ? `${h} am` : `${h - 12} pm`,
}))

type Slot = { hour: number; minute: number }

// ── Slot helpers ──────────────────────────────────────────────────────────────

/** Slot-start cell indices → {hour, minute} slots (1 hour each). */
function startsToSlots(starts: Set<number>): Slot[] {
  return Array.from(starts)
    .sort((a, b) => a - b)
    .map(c => ({ hour: Math.floor((c * CELL_MIN) / 60), minute: (c * CELL_MIN) % 60 }))
}

/** Stored slots → set of slot-start cell indices. */
function slotsToStarts(slots: Slot[]): Set<number> {
  const starts = new Set<number>()
  for (const { hour, minute } of slots) {
    const ci = (hour * 60 + minute) / CELL_MIN
    if (Number.isInteger(ci) && ci >= 0 && ci < TOTAL_CELLS) starts.add(ci)
  }
  return starts
}

/** Is this cell painted — i.e. covered by a 1-hour slot (its start, or its second half)? */
function isCovered(starts: Set<number>, ci: number): boolean {
  return starts.has(ci) || starts.has(ci - 1)
}

function fmt12(hour: number, minute: number) {
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`
}

// The 1-hour slot that hovering/clicking THIS cell picks: cell-time → +1 hour.
// e.g. cell at 9:00 → "9:00 am – 10:00 am"; cell at 9:30 → "9:30 am – 10:30 am".
function cellSlotLabel(ci: number) {
  const startMin = ci * CELL_MIN
  const endMin   = startMin + 60
  const sh = Math.floor(startMin / 60),      sm = startMin % 60
  const eh = Math.floor((endMin / 60) % 24), em = endMin % 60
  return `${fmt12(sh, sm)} – ${fmt12(eh, em)}`
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { initialData: WeeklyAvailability; therapistTimezone?: string | null }

export function WeeklyAvailabilityEditor({ initialData, therapistTimezone }: Props) {
  // sel[dayKey] = Set of slot-START cell indices
  const [sel, setSel] = useState<Record<string, Set<number>>>(() => {
    const r: Record<string, Set<number>> = {}
    for (const d of DAYS) r[d.key] = slotsToStarts(initialData[d.key] ?? [])
    return r
  })

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [hoverCell, setHoverCell] = useState<{ ci: number; dayKey: string } | null>(null)

  // The therapist's actual timezone, detected from their browser. Set on mount
  // (client-only, avoids SSR hydration mismatch) and saved with the schedule so
  // the slots can be converted to each client's timezone — no region assumption.
  const [browserTz, setBrowserTz] = useState<string | null>(null)
  useEffect(() => {
    try { setBrowserTz(Intl.DateTimeFormat().resolvedOptions().timeZone) } catch { /* keep null */ }
  }, [])
  const effectiveTz = browserTz ?? therapistTimezone ?? null

  // Drag state (ref so it doesn't cause re-renders)
  const drag = useRef<{
    dayKey:    string | null   // null = every-day row
    startCell: number
    mode:      'add' | 'remove'
    pre:       Record<string, Set<number>> // snapshot before drag started
  } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Release drag on global mouseup / touchend (handles releasing outside the grid)
  useEffect(() => {
    const stop = () => { drag.current = null }
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchend', stop)
    window.addEventListener('touchcancel', stop)
    return () => {
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchend', stop)
      window.removeEventListener('touchcancel', stop)
    }
  }, [])

  // Touch drag: phones have no hover, so we track the finger via touchmove +
  // elementFromPoint (each cell carries data-ci) and paint as it passes over
  // cells. Non-passive so we can preventDefault and stop the page from scrolling
  // while a selection drag is in progress.
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    function onTouchMove(e: TouchEvent) {
      if (!drag.current) return
      e.preventDefault()
      const t = e.touches[0]
      if (!t) return
      const target = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null
      const cell = target?.closest('[data-ci]') as HTMLElement | null
      if (!cell) return
      const ci = Number(cell.dataset.ci)
      if (!Number.isNaN(ci)) applyDrag(ci)
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Drag helpers ────────────────────────────────────────────────────────────

  function startDrag(dayKey: string | null, ci: number) {
    const keys  = dayKey === null ? DAYS.map(d => d.key) : [dayKey]
    // If the cell is already part of a slot, this gesture REMOVES; else it ADDS.
    const anyOn = keys.some(k => isCovered(sel[k] ?? new Set(), ci))
    const mode  = anyOn ? 'remove' : 'add'

    // Snapshot all days' state before drag begins
    const pre: Record<string, Set<number>> = {}
    for (const d of DAYS) pre[d.key] = new Set(sel[d.key] ?? [])

    drag.current = { dayKey, startCell: ci, mode, pre }
    applyDrag(ci)
  }

  function applyDrag(currentCell: number) {
    if (!drag.current) return
    const { dayKey, startCell, mode, pre } = drag.current
    const lo = Math.min(startCell, currentCell)
    const hi = Math.max(startCell, currentCell)
    // Tiling is anchored to the gesture's first cell so its :00/:30 offset is
    // preserved — drag from 9:30 lays down 9:30–10:30, 10:30–11:30, … back-to-back.
    const parity = startCell % 2
    const keys = dayKey === null ? DAYS.map(d => d.key) : [dayKey]

    setSel(prev => {
      const next = { ...prev }
      for (const k of keys) {
        const starts = new Set(pre[k])
        if (mode === 'add') {
          // Lay down a 1-hour slot at every cell of the anchor's parity in range.
          for (let s = lo; s <= hi; s++) {
            if (s % 2 === parity && s + SLOT_SPAN - 1 < TOTAL_CELLS) starts.add(s)
          }
        } else {
          // Remove every slot whose 1-hour span intersects the dragged range —
          // so clicking any cell of a slot clears the whole hour it set before.
          for (const s of pre[k]) {
            const spanStart = s, spanEnd = s + SLOT_SPAN - 1
            if (spanStart <= hi && spanEnd >= lo) starts.delete(s)
          }
        }
        next[k] = starts
      }
      return next
    })
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true); setSaveErr(null)
    const schedule: WeeklyAvailability = {}
    for (const d of DAYS) schedule[d.key] = startsToSlots(sel[d.key] ?? new Set())
    // Capture the IANA timezone synchronously at save time — never rely on the
    // effect-set state (which can still be null on first save, leaving the
    // therapist's zone empty and the client converting from UTC).
    let tz: string | undefined
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { tz = browserTz ?? undefined }
    const result = await updateWeeklyAvailability(schedule, tz)
    setSaving(false)
    if (result.error) { setSaveErr(result.error) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  function clearDay(k: string) { setSel(prev => ({ ...prev, [k]: new Set() })) }

  // Each slot start is exactly one bookable 1-hour slot.
  const totalSlots = DAYS.reduce((n, d) => n + (sel[d.key]?.size ?? 0), 0)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
      style={{ userSelect: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Weekly Availability</p>
          <p className="text-xs text-[#233551]/40 mt-0.5">
            Click a slot to add a 1-hour opening (starts on the hour or half-hour); click it again to remove it.
          </p>
          {effectiveTz && (
            <p className="text-[10px] text-[#3D8A80] font-semibold mt-0.5">
              Times are in your timezone: {timezoneLabel(effectiveTz)} — clients see them in theirs
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
              saved
                ? 'bg-[#7EC0B7] text-white'
                : 'bg-[#233551] text-white hover:bg-[#2d4568]'
            }`}
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
          <span className="text-[10px] font-semibold text-[#233551]/40 tabular-nums whitespace-nowrap">
            {totalSlots} bookable slot{totalSlots === 1 ? '' : 's'} / week
          </span>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 640 }} ref={gridRef}>

          {/* Hour-label row */}
          <div className="flex mb-1.5">
            <div className="w-[104px] flex-shrink-0" />
            <div className="flex-1 relative h-4">
              {HOUR_LABELS.map(({ ci, label }) => (
                <span
                  key={ci}
                  className="absolute text-[9px] text-[#233551]/35 font-medium whitespace-nowrap"
                  style={{ left: `${(ci / TOTAL_CELLS) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Day rows */}
          <div className="space-y-0.5">
            {DAYS.map(({ key, label }) => {
              const daySel = sel[key] ?? new Set<number>()
              return (
                <div key={key} className="flex items-center group/row h-8">
                  {/* Day label + clear button */}
                  <div className="w-[104px] flex-shrink-0 flex items-center justify-between pr-2.5">
                    <span className="text-[11px] font-semibold text-[#233551]/55">{label}</span>
                    {daySel.size > 0 && (
                      <button
                        type="button"
                        onClick={() => clearDay(key)}
                        className="opacity-0 group-hover/row:opacity-100 text-[9px] text-[#233551]/25 hover:text-red-400 transition-all"
                        title="Clear"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Cell strip */}
                  <div className="flex-1 flex h-full rounded overflow-hidden border border-slate-200">
                    {Array.from({ length: TOTAL_CELLS }, (_, ci) => {
                      const on    = isCovered(daySel, ci)
                      const mark3 = ci % 6 === 0  // every 3-hour boundary
                      return (
                        <div
                          key={ci}
                          data-ci={ci}
                          title={cellSlotLabel(ci)}
                          style={{ touchAction: 'none' }}
                          className={[
                            'flex-1 h-full cursor-crosshair transition-colors duration-75',
                            on
                              ? 'bg-[#7EC0B7]'
                              : 'bg-white hover:bg-[#7EC0B7]/25',
                            mark3
                              ? on ? 'border-l border-[#62B0A8]' : 'border-l border-slate-200'
                              : '',
                          ].filter(Boolean).join(' ')}
                          onMouseDown={e => { e.preventDefault(); startDrag(key, ci) }}
                          onMouseEnter={() => { applyDrag(ci); setHoverCell({ ci, dayKey: key }) }}
                          onMouseLeave={() => setHoverCell(null)}
                          onTouchStart={() => startDrag(key, ci)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Every Day row */}
            <div className="flex items-center h-7 mt-1 pt-1.5 border-t border-slate-100">
              <div className="w-[104px] flex-shrink-0 pr-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#233551]/30">
                  Every Day
                </span>
              </div>
              <div className="flex-1 flex h-full rounded overflow-hidden border border-dashed border-slate-200">
                {Array.from({ length: TOTAL_CELLS }, (_, ci) => {
                  const allOn  = DAYS.every(d => isCovered(sel[d.key] ?? new Set(), ci))
                  const someOn = DAYS.some(d => isCovered(sel[d.key] ?? new Set(), ci))
                  const mark3  = ci % 6 === 0
                  return (
                    <div
                      key={ci}
                      data-ci={ci}
                      title={cellSlotLabel(ci)}
                      style={{ touchAction: 'none' }}
                      className={[
                        'flex-1 h-full cursor-crosshair transition-colors duration-75',
                        allOn  ? 'bg-[#3D8A80]' :
                        someOn ? 'bg-[#7EC0B7]/35' :
                                 'bg-white hover:bg-[#7EC0B7]/15',
                        mark3 ? 'border-l border-slate-200' : '',
                      ].filter(Boolean).join(' ')}
                      onMouseDown={e => { e.preventDefault(); startDrag(null, ci) }}
                      onMouseEnter={() => { applyDrag(ci); setHoverCell({ ci, dayKey: 'all' }) }}
                      onMouseLeave={() => setHoverCell(null)}
                      onTouchStart={() => startDrag(null, ci)}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Legend + hover tooltip */}
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#7EC0B7]" />
              <span className="text-[10px] text-[#233551]/40">Available hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3D8A80]" />
              <span className="text-[10px] text-[#233551]/40">All days selected</span>
            </div>
            {hoverCell && (
              <span className="ml-auto text-xs font-bold text-[#3D8A80] tabular-nums bg-[#7EC0B7]/12 px-2.5 py-1 rounded-full">
                {cellSlotLabel(hoverCell.ci)}
              </span>
            )}
          </div>
        </div>
      </div>

      {saveErr && <p className="text-xs text-red-500 mt-3">{saveErr}</p>}
    </div>
  )
}
