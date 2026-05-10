'use client'

import { useState } from 'react'
import { updateWeeklyAvailability, type WeeklyAvailability } from '@/app/actions/therapist-availability'

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

function formatTime(slot: Slot) {
  const h = slot.hour % 12 || 12
  const m = String(slot.minute).padStart(2, '0')
  const ampm = slot.hour < 12 ? 'am' : 'pm'
  return `${h}:${m} ${ampm}`
}

export function WeeklyAvailabilityEditor({ initialData }: { initialData: WeeklyAvailability }) {
  const [schedule, setSchedule] = useState<WeeklyAvailability>(() => {
    const base: WeeklyAvailability = {}
    DAYS.forEach(({ key }) => { base[key] = initialData[key] ?? [] })
    return base
  })
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [addingTime, setAddingTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function addSlot(dayKey: string) {
    const [h, m] = addingTime.split(':').map(Number)
    const slot: Slot = { hour: h, minute: m }
    setSchedule(prev => {
      const existing = prev[dayKey] ?? []
      if (existing.some(s => s.hour === slot.hour && s.minute === slot.minute)) return prev
      const sorted = [...existing, slot].sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))
      return { ...prev, [dayKey]: sorted }
    })
    setAddingDay(null)
    setAddingTime('09:00')
  }

  function removeSlot(dayKey: string, slot: Slot) {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] ?? []).filter(s => !(s.hour === slot.hour && s.minute === slot.minute)),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    const result = await updateWeeklyAvailability(schedule)
    setSaving(false)
    if (result.error) setError(result.error)
    else setSuccess(true)
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Weekly Availability</p>
          <p className="text-xs text-[#233551]/40 mt-0.5">Clients see these slots when booking sessions</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-bold px-4 py-1.5 bg-[#233551] text-white rounded-full hover:bg-[#2d4568] transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {DAYS.map(({ key, label }) => {
          const slots = schedule[key] ?? []
          const isAdding = addingDay === key
          return (
            <div key={key} className="px-5 py-3.5 flex items-start gap-4">
              <span className="w-24 flex-shrink-0 text-sm font-semibold text-[#233551]/60 pt-1">{label}</span>
              <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[28px]">
                {slots.map(slot => (
                  <span
                    key={`${slot.hour}:${slot.minute}`}
                    className="flex items-center gap-1 text-xs font-semibold text-[#3D8A80] bg-[#7EC0B7]/15 px-2.5 py-1 rounded-full"
                  >
                    {formatTime(slot)}
                    <button
                      type="button"
                      onClick={() => removeSlot(key, slot)}
                      className="text-[#3D8A80]/50 hover:text-[#233551] ml-0.5 leading-none text-sm"
                      aria-label={`Remove ${formatTime(slot)}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAdding ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={addingTime}
                      onChange={e => setAddingTime(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#7EC0B7] text-[#233551]"
                    />
                    <button
                      type="button"
                      onClick={() => addSlot(key)}
                      className="text-xs font-bold text-white bg-[#7EC0B7] px-2.5 py-1 rounded-lg hover:bg-[#6db5ac] transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingDay(null)}
                      className="text-xs text-[#233551]/40 hover:text-[#233551] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setAddingDay(key); setAddingTime('09:00') }}
                    className="text-xs font-semibold text-[#3D8A80]/50 hover:text-[#3D8A80] transition-colors px-2 py-1 rounded-lg hover:bg-[#7EC0B7]/10"
                  >
                    + Add slot
                  </button>
                )}

                {slots.length === 0 && !isAdding && (
                  <span className="text-xs text-[#233551]/25 pointer-events-none">No slots</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {(error || success) && (
        <div className={`px-5 py-3 border-t border-slate-50 text-sm font-medium ${error ? 'text-red-600' : 'text-[#3D8A80]'}`}>
          {error ?? 'Availability saved.'}
        </div>
      )}
    </div>
  )
}
