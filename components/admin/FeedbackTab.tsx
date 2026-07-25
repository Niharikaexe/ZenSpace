'use client'

import { useMemo, useState } from 'react'

// What clients said about their sessions. Ordered so the things that need doing
// something about (low ratings, switch requests) are impossible to miss.

export type FeedbackRow = {
  id: string
  sessionId: string
  clientName: string
  therapistName: string
  rating: number | null
  feltHeard: 'yes' | 'somewhat' | 'no' | null
  bookAgain: 'yes' | 'unsure' | 'switch' | null
  note: string | null
  sessionAt: string | null
  submitted: boolean
  createdAt: string
}

const HEARD_LABEL: Record<string, string> = { yes: 'Felt heard', somewhat: 'Somewhat heard', no: 'Did not feel heard' }
const AGAIN_LABEL: Record<string, string> = { yes: 'Would rebook', unsure: 'Unsure about rebooking', switch: 'Wants to switch' }

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-xs text-slate-400">No rating</span>
  return (
    <span className="whitespace-nowrap" aria-label={`${rating} out of 5`}>
      <span className="text-amber-500">{'★'.repeat(rating)}</span>
      <span className="text-slate-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

type Filter = 'attention' | 'all' | 'withNote'

export function FeedbackTab({ feedback }: { feedback: FeedbackRow[] }) {
  const [filter, setFilter] = useState<Filter>('attention')
  const [search, setSearch] = useState('')

  const needsAttention = (f: FeedbackRow) =>
    (f.rating != null && f.rating <= 3) || f.bookAgain === 'switch' || f.feltHeard === 'no'

  const stats = useMemo(() => {
    const rated = feedback.filter(f => f.rating != null)
    const avg = rated.length
      ? (rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length)
      : null
    return {
      total: feedback.length,
      rated: rated.length,
      avg,
      attention: feedback.filter(needsAttention).length,
      withNote: feedback.filter(f => f.note && f.note.trim()).length,
    }
  }, [feedback])

  // Average rating per therapist, so a struggling match shows up as a pattern
  // rather than one bad day.
  const byTherapist = useMemo(() => {
    const map = new Map<string, { total: number; sum: number; count: number; switches: number }>()
    for (const f of feedback) {
      const cur = map.get(f.therapistName) ?? { total: 0, sum: 0, count: 0, switches: 0 }
      cur.total += 1
      if (f.rating != null) { cur.sum += f.rating; cur.count += 1 }
      if (f.bookAgain === 'switch') cur.switches += 1
      map.set(f.therapistName, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name, total: v.total, switches: v.switches,
        avg: v.count ? v.sum / v.count : null,
      }))
      .sort((a, b) => (a.avg ?? 99) - (b.avg ?? 99))
  }, [feedback])

  const q = search.trim().toLowerCase()
  const rows = feedback
    .filter(f => {
      if (filter === 'attention' && !needsAttention(f)) return false
      if (filter === 'withNote' && !(f.note && f.note.trim())) return false
      if (q) {
        const hay = [f.clientName, f.therapistName, f.note].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    // Worst first inside the current filter, then newest.
    .sort((a, b) => {
      const ar = a.rating ?? 99, br = b.rating ?? 99
      if (ar !== br) return ar - br
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: 'attention', label: 'Needs attention', count: stats.attention },
    { key: 'withNote', label: 'Wrote something', count: stats.withNote },
    { key: 'all', label: 'Everything', count: stats.total },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Feedback</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          What clients said after their sessions. Therapists never see any of this.
        </p>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Average</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stats.avg != null ? stats.avg.toFixed(1) : '—'}
            {stats.avg != null && <span className="text-sm text-slate-400 font-medium"> / 5</span>}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.rated} rated</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Responses</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{stats.total}</p>
        </div>
        <div className={`border rounded-xl p-4 ${stats.attention > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${stats.attention > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            Needs attention
          </p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${stats.attention > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {stats.attention}
          </p>
          <p className={`text-[11px] mt-0.5 ${stats.attention > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            3 stars or less, or wants to switch
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Wrote a note</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{stats.withNote}</p>
        </div>
      </div>

      {/* per-therapist */}
      {byTherapist.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
            By therapist, lowest first
          </p>
          <div className="flex flex-wrap gap-2">
            {byTherapist.map(t => (
              <div
                key={t.name}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  t.avg != null && t.avg < 3.5 ? 'border-red-200 bg-red-50' : 'border-slate-200'
                }`}
              >
                <span className="text-sm font-semibold text-slate-800">{t.name}</span>
                <span className="text-sm tabular-nums text-slate-600">
                  {t.avg != null ? t.avg.toFixed(1) : '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.total} {t.total === 1 ? 'response' : 'responses'}
                  {t.switches > 0 && <span className="text-red-600 font-semibold"> · {t.switches} switch</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {chips.map(c => {
          const on = filter === c.key
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                on
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {c.label}
              <span className={`ml-1.5 ${on ? 'text-white/70' : 'text-slate-400'}`}>{c.count}</span>
            </button>
          )
        })}
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search client, therapist, note…"
          className="ml-auto w-60 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* rows */}
      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-sm text-slate-400">
          {stats.total === 0
            ? 'No feedback yet. It starts arriving the morning after clients attend sessions.'
            : 'Nothing matches this filter.'}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {rows.map(f => {
            const attention = needsAttention(f)
            return (
              <div key={f.id} className={`px-4 py-3.5 ${attention ? 'bg-red-50/40' : ''}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={f.rating} />
                  <span className="text-sm font-semibold text-slate-900">{f.clientName}</span>
                  <span className="text-xs text-slate-400">with</span>
                  <span className="text-sm text-slate-700">{f.therapistName}</span>
                  {f.bookAgain === 'switch' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      WANTS TO SWITCH
                    </span>
                  )}
                  {!f.submitted && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      tapped in email only
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-slate-500">
                  {f.feltHeard && <span>{HEARD_LABEL[f.feltHeard]}</span>}
                  {f.bookAgain && f.bookAgain !== 'switch' && <span>{AGAIN_LABEL[f.bookAgain]}</span>}
                  {f.sessionAt && (
                    <span>
                      Session {new Date(f.sessionAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  <span>
                    Answered {new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {f.note && f.note.trim() && (
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed border-l-2 border-[#7EC0B7] pl-3 whitespace-pre-wrap">
                    {f.note}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
