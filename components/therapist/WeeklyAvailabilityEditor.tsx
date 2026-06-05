'use client'

import { useState, useRef, useEffect } from 'react'
import { updateWeeklyAvailability, type WeeklyAvailability } from '@/app/actions/therapist-availability'
import { timezoneLabel } from '@/lib/timezones'

// ── Grid constants ────────────────────────────────────────────────────────────
const TOTAL_CELLS = 48   // 30-min slots across 24 h  (0 = 00:00, 47 = 23:30)
const CELL_MIN    = 30   // minutes per cell
const SESSION_MIN = 50   // session length in minutes
const SLOT_GAP    = 60   // new slot every 60 min inside a range
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

// ── Slot helpers ──────────────────────────────────────────────────────────────

/** Find consecutive ranges in a set of cell indices and produce 50-min slots */
function computeSlots(cells: Set<number>): { hour: number; minute: number }[] {
  if (!cells.size) return []
  const sorted = Array.from(cells).sort((a, b) => a - b)
  const ranges: { s: number; e: number }[] = []
  let rs = sorted[0], re = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === re + 1) { re = sorted[i] }
    else { ranges.push({ s: rs, e: re }); rs = re = sorted[i] }
  }
  ranges.push({ s: rs, e: re })

  const slots: { hour: number; minute: number }[] = []
  for (const { s, e } of ranges) {
    const startMin = s * CELL_MIN
    const endMin   = (e + 1) * CELL_MIN
    let t = startMin
    while (t + SESSION_MIN <= endMin) {
      slots.push({ hour: Math.floor(t / 60), minute: t % 60 })
      t += SLOT_GAP
    }
  }
  return slots
}

/** Reverse: reconstruct selected cells from stored slots (approx, for initial display) */
function slotsToSelectedCells(slots: { hour: number; minute: number }[]): Set<number> {
  const cells = new Set<number>()
  for (const { hour, minute } of slots) {
    const startMin = hour * 60 + minute
    for (let m = 0; m < SESSION_MIN; m += CELL_MIN) {
      const ci = Math.floor((startMin + m) / CELL_MIN)
      if (ci < TOTAL_CELLS) cells.add(ci)
    }
  }
  return cells
}

function fmt12(hour: number, minute: number) {
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`
}

function cellToTimeLabel(ci: number) {
  const startMin = ci * CELL_MIN
  const endMin   = startMin + CELL_MIN
  const sh = Math.floor(startMin / 60), sm = startMin % 60
  const eh = Math.floor(endMin   / 60), em = endMin   % 60
  return `${fmt12(sh, sm)} – ${fmt12(eh, em)}`
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { initialData: WeeklyAvailability; therapistTimezone?: string | null }

export function WeeklyAvailabilityEditor({ initialData, therapistTimezone }: Props) {
  // sel[dayKey] = Set of selected cell indices
  const [sel, setSel] = useState<Record<string, Set<number>>>(() => {
    const r: Record<string, Set<number>> = {}
    for (const d of DAYS) r[d.key] = slotsToSelectedCells(initialData[d.key] ?? [])
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
    const keys   = dayKey === null ? DAYS.map(d => d.key) : [dayKey]
    const anyOn  = keys.some(k => sel[k]?.has(ci))
    const mode   = anyOn ? 'remove' : 'add'

    // Snapshot all days' state before drag begins
    const pre: Record<string, Set<number>> = {}
    for (const d of DAYS) pre[d.key] = new Set(sel[d.key] ?? [])

    drag.current = { dayKey, startCell: ci, mode, pre }
    applyDrag(ci)
  }

  function applyDrag(currentCell: number) {
    if (!drag.current) return
    const { dayKey, startCell, mode, pre } = drag.current
    let [from, to] = startCell <= currentCell
      ? [startCell, currentCell]
      : [currentCell, startCell]
    // A 50-min session needs a full 1-hour (2-cell) block. Expand any shorter ADD
    // selection (e.g. a single click) up to one hour so it always yields a slot —
    // never a silent empty save that leaves clients with no bookable times.
    if (mode === 'add' && to - from < 1) {
      if (from + 1 <= TOTAL_CELLS - 1) to = from + 1
      else from = to - 1
    }
    const keys = dayKey === null ? DAYS.map(d => d.key) : [dayKey]

    setSel(prev => {
      const next = { ...prev }
      for (const k of keys) {
        const cells = new Set(pre[k])
        for (let i = from; i <= to; i++) mode === 'add' ? cells.add(i) : cells.delete(i)
        next[k] = cells
      }
      return next
    })
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true); setSaveErr(null)
    const schedule: WeeklyAvailability = {}
    for (const d of DAYS) schedule[d.key] = computeSlots(sel[d.key] ?? new Set())
    // eslint-disable-next-line no-console
    console.log('[availability:grid] saving', { tz: browserTz, schedule })
    const result = await updateWeeklyAvailability(schedule, browserTz ?? undefined)
    // eslint-disable-next-line no-console
    console.log('[availability:grid] save result', result)
    setSaving(false)
    if (result.error) { setSaveErr(result.error) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  function clearDay(k: string) { setSel(prev => ({ ...prev, [k]: new Set() })) }

  // Live feedback: how many bookable 50-min slots the current selection yields.
  // Surfacing this stops a therapist from silently saving an empty schedule (which
  // is exactly what leaves clients with no slots to book).
  const totalSlots = DAYS.reduce((n, d) => n + computeSlots(sel[d.key] ?? new Set()).length, 0)
  const markedButNoSlots = totalSlots === 0 && DAYS.some(d => (sel[d.key]?.size ?? 0) > 0)

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
            Tap or drag to mark available ranges — each generates 50-min slots for clients
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
                      const on    = daySel.has(ci)
                      const mark3 = ci % 6 === 0  // every 3-hour boundary
                      return (
                        <div
                          key={ci}
                          data-ci={ci}
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
                  const allOn  = DAYS.every(d => sel[d.key]?.has(ci))
                  const someOn = DAYS.some(d => sel[d.key]?.has(ci))
                  const mark3  = ci % 6 === 0
                  return (
                    <div
                      key={ci}
                      data-ci={ci}
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
              <span className="ml-auto text-[10px] font-semibold text-[#3D8A80] tabular-nums">
                {cellToTimeLabel(hoverCell.ci)}
              </span>
            )}
          </div>
        </div>
      </div>

      {markedButNoSlots && (
        <p className="text-xs text-amber-600 mt-3">
          Mark at least a 1-hour block — a 50-minute session needs a full hour.
        </p>
      )}
      {saveErr && <p className="text-xs text-red-500 mt-3">{saveErr}</p>}
    </div>
  )
}
