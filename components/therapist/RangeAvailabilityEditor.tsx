'use client'

import { useState, useEffect } from 'react'
import { updateWeeklyAvailability, type WeeklyAvailability } from '@/app/actions/therapist-availability'
import { timezoneLabel } from '@/lib/timezones'

// Mobile-friendly availability editor: per day, add start–end time ranges that
// are split into 1-hour session slots (no dragging). Mirrors the storage format
// of the desktop grid editor (per-day arrays of { hour, minute } slot starts),
// so the client booking view reads it identically.

type Slot = { hour: number; minute: number }

const DAYS = [
  { key: '1', label: 'Monday' },
  { key: '2', label: 'Tuesday' },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday' },
  { key: '5', label: 'Friday' },
  { key: '6', label: 'Saturday' },
  { key: '0', label: 'Sunday' },
]

const SESSION_MIN = 60 // 1-hour session slots

function fmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (min >= 1440) return '12:00 am (next day)'
  const ap = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

// Start options: 00:00 → 23:30 (every 30 min). End options: 00:30 → 24:00.
const START_OPTS = Array.from({ length: 48 }, (_, i) => i * 30)
const END_OPTS = Array.from({ length: 48 }, (_, i) => (i + 1) * 30)

const slotMin = (s: Slot) => s.hour * 60 + s.minute

// Split a start–end range into hourly slot starts.
function rangeToSlots(startMin: number, endMin: number): Slot[] {
  const out: Slot[] = []
  for (let t = startMin; t + SESSION_MIN <= endMin; t += 60) {
    out.push({ hour: Math.floor(t / 60), minute: t % 60 })
  }
  return out
}

// Group a day's slots into contiguous display ranges.
function slotsToRanges(slots: Slot[]): { startMin: number; endMin: number }[] {
  const mins = [...new Set(slots.map(slotMin))].sort((a, b) => a - b)
  const ranges: { startMin: number; endMin: number }[] = []
  let i = 0
  while (i < mins.length) {
    const start = mins[i]
    let end = mins[i] + 60
    while (i + 1 < mins.length && mins[i + 1] === end) { end = mins[i + 1] + 60; i++ }
    ranges.push({ startMin: start, endMin: end })
    i++
  }
  return ranges
}

interface Props { initialData: WeeklyAvailability; therapistTimezone?: string | null }

export function RangeAvailabilityEditor({ initialData, therapistTimezone }: Props) {
  const [sel, setSel] = useState<Record<string, Slot[]>>(() => {
    const r: Record<string, Slot[]> = {}
    for (const d of DAYS) r[d.key] = initialData[d.key] ?? []
    return r
  })
  // Per-day draft range inputs.
  const [draft, setDraft] = useState<Record<string, { start: number; end: number }>>(() => {
    const r: Record<string, { start: number; end: number }> = {}
    for (const d of DAYS) r[d.key] = { start: 9 * 60, end: 17 * 60 }
    return r
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const [browserTz, setBrowserTz] = useState<string | null>(null)
  useEffect(() => {
    try { setBrowserTz(Intl.DateTimeFormat().resolvedOptions().timeZone) } catch { /* keep null */ }
  }, [])
  const effectiveTz = browserTz ?? therapistTimezone ?? null

  function addRange(dayKey: string) {
    const { start, end } = draft[dayKey]
    if (end <= start) { setSaveErr('End time must be after start time.'); return }
    setSaveErr(null)
    const newSlots = rangeToSlots(start, end)
    setSel(prev => {
      const merged = new Map<number, Slot>()
      for (const s of prev[dayKey] ?? []) merged.set(slotMin(s), s)
      for (const s of newSlots) merged.set(slotMin(s), s)
      return { ...prev, [dayKey]: [...merged.values()].sort((a, b) => slotMin(a) - slotMin(b)) }
    })
  }

  function removeRange(dayKey: string, startMin: number, endMin: number) {
    setSel(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] ?? []).filter(s => slotMin(s) < startMin || slotMin(s) >= endMin),
    }))
  }

  function clearDay(dayKey: string) {
    setSel(prev => ({ ...prev, [dayKey]: [] }))
  }

  async function save() {
    setSaving(true); setSaveErr(null)
    const schedule: WeeklyAvailability = {}
    for (const d of DAYS) schedule[d.key] = sel[d.key] ?? []
    // Capture the IANA timezone synchronously at save time (see grid editor).
    let tz: string | undefined
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { tz = browserTz ?? undefined }
    // eslint-disable-next-line no-console
    console.log('[availability:range] saving', { tz, schedule })
    const result = await updateWeeklyAvailability(schedule, tz)
    // eslint-disable-next-line no-console
    console.log('[availability:range] save result', result)
    setSaving(false)
    if (result.error) setSaveErr(result.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  const selectCls = 'flex-1 min-w-0 border border-slate-200 rounded-lg px-2 py-2 text-sm text-[#233551] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EC0B7]'

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Weekly Availability</p>
          <p className="text-xs text-[#233551]/40 mt-0.5">Add time ranges — each becomes 1-hour session slots for clients.</p>
          {effectiveTz && (
            <p className="text-[10px] text-[#3D8A80] font-semibold mt-0.5">
              Times are in your timezone: {timezoneLabel(effectiveTz)} — clients see them in theirs
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 ${
            saved ? 'bg-[#7EC0B7] text-white' : 'bg-[#233551] text-white hover:bg-[#2d4568]'
          }`}
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const ranges = slotsToRanges(sel[key] ?? [])
          const d = draft[key]
          return (
            <div key={key} className="border border-slate-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#233551]">{label}</span>
                {ranges.length > 0 && (
                  <button type="button" onClick={() => clearDay(key)} className="text-[11px] text-[#233551]/35 hover:text-red-400 transition-colors">
                    Clear
                  </button>
                )}
              </div>

              {/* Existing ranges */}
              {ranges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {ranges.map(r => (
                    <span key={`${r.startMin}-${r.endMin}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3D8A80] bg-[#7EC0B7]/12 border border-[#7EC0B7]/30 rounded-full pl-2.5 pr-1.5 py-1">
                      {fmt(r.startMin)} – {fmt(r.endMin)}
                      <button
                        type="button"
                        onClick={() => removeRange(key, r.startMin, r.endMin)}
                        className="w-4 h-4 rounded-full hover:bg-[#7EC0B7]/30 flex items-center justify-center text-[#3D8A80]/70"
                        aria-label="Remove range"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#233551]/30 mb-2.5">No availability set.</p>
              )}

              {/* Add a range */}
              <div className="flex items-center gap-1.5">
                <select
                  value={d.start}
                  onChange={e => setDraft(p => ({ ...p, [key]: { ...p[key], start: Number(e.target.value) } }))}
                  className={selectCls}
                  aria-label={`${label} start time`}
                >
                  {START_OPTS.map(m => <option key={m} value={m}>{fmt(m)}</option>)}
                </select>
                <span className="text-xs text-[#233551]/40 flex-shrink-0">to</span>
                <select
                  value={d.end}
                  onChange={e => setDraft(p => ({ ...p, [key]: { ...p[key], end: Number(e.target.value) } }))}
                  className={selectCls}
                  aria-label={`${label} end time`}
                >
                  {END_OPTS.map(m => <option key={m} value={m}>{fmt(m)}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => addRange(key)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-[#233551]/8 text-[#233551] text-xs font-bold hover:bg-[#233551]/15 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {saveErr && <p className="text-xs text-red-500 mt-3">{saveErr}</p>}
    </div>
  )
}
