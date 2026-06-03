'use client'

import { useMemo, useState } from 'react'
import type { Lead } from './AdminDashboard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function dayKey(iso: string): string {
  // YYYY-MM-DD in local time
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function distinct(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort()
}

function mergeParams(extra: Record<string, string> | null): string {
  if (!extra || Object.keys(extra).length === 0) return ''
  return Object.entries(extra).map(([k, v]) => `${k}=${v}`).join('  ·  ')
}

type LeadTypeFilter = 'all' | 'client' | 'therapist'
type SubTab = 'data' | 'analytics' | 'journey'

interface Filters {
  type: LeadTypeFilter
  source: string
  medium: string
  campaign: string
  search: string
  dateFrom: string
  dateTo: string
}

const EMPTY_FILTERS: Filters = {
  type: 'all', source: '', medium: '', campaign: '', search: '', dateFrom: '', dateTo: '',
}

export function LeadsTab({ leads }: { leads: Lead[] }) {
  const [subtab, setSubtab] = useState<SubTab>('data')
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)

  const sources = useMemo(() => distinct(leads.map((l) => l.first_utm_source)), [leads])
  const mediums = useMemo(() => distinct(leads.map((l) => l.first_utm_medium)), [leads])
  const campaigns = useMemo(() => distinct(leads.map((l) => l.first_utm_campaign)), [leads])

  const filtered = useMemo(() => {
    const q = f.search.trim().toLowerCase()
    const fromTs = f.dateFrom ? new Date(f.dateFrom + 'T00:00:00').getTime() : null
    const toTs = f.dateTo ? new Date(f.dateTo + 'T23:59:59').getTime() : null
    return leads.filter((l) => {
      if (f.type !== 'all' && l.lead_type !== f.type) return false
      if (f.source && l.first_utm_source !== f.source) return false
      if (f.medium && l.first_utm_medium !== f.medium) return false
      if (f.campaign && l.first_utm_campaign !== f.campaign) return false
      if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false
      const ts = new Date(l.created_at).getTime()
      if (fromTs !== null && ts < fromTs) return false
      if (toTs !== null && ts > toTs) return false
      return true
    })
  }, [leads, f])

  const hasFilters = JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS)
  const tagged = filtered.filter((l) => l.first_utm_source || l.referrer).length
  const organic = filtered.length - tagged

  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }))

  const exportCsv = () => {
    const headers = [
      'Lead ID', 'Type', 'Created', 'Name', 'Email', 'Status',
      'First UTM Source', 'First UTM Medium', 'First UTM Campaign', 'First UTM Term', 'First UTM Content',
      'Last UTM Source', 'Last UTM Medium', 'Last UTM Campaign', 'Last UTM Term', 'Last UTM Content',
      'Referrer', 'Landing Page', 'First Seen', 'Other params',
      'Device', 'Browser', 'OS', 'Journey',
    ]
    const esc = (v: string | null | undefined): string => {
      if (v == null) return ''
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = filtered.map((l) => [
      l.id, l.lead_type, l.created_at, l.name, l.email, l.status,
      l.first_utm_source, l.first_utm_medium, l.first_utm_campaign, l.first_utm_term, l.first_utm_content,
      l.last_utm_source, l.last_utm_medium, l.last_utm_campaign, l.last_utm_term, l.last_utm_content,
      l.referrer, l.landing_page, l.first_seen_at, mergeParams(l.extra_params),
      l.device_type, l.device_browser, l.device_os,
      (l.journey ?? []).map((s) => s.p).join(' > '),
    ].map(esc).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindcanopy-leads-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leads</h2>
          <p className="text-sm text-slate-500 mt-1">
            Every client signup and therapist application, with the campaign that brought them.
          </p>
        </div>
        {subtab === 'data' && (
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {(['data', 'analytics', 'journey'] as SubTab[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubtab(s)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px capitalize transition-colors ${
              subtab === s
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Showing</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{filtered.length}</p>
          <p className="text-xs text-slate-400 mt-1">of {leads.length} total leads</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Tagged</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{tagged}</p>
          <p className="text-xs text-slate-400 mt-1">has UTM or referrer</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Organic / Direct</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{organic}</p>
          <p className="text-xs text-slate-400 mt-1">no UTM, no referrer</p>
        </div>
      </div>

      {/* Filters — shared across both subtabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Type</label>
            <select value={f.type} onChange={(e) => set({ type: e.target.value as LeadTypeFilter })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400">
              <option value="all">All leads</option>
              <option value="client">Clients</option>
              <option value="therapist">Therapists</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM source</label>
            <select value={f.source} onChange={(e) => set({ source: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400">
              <option value="">All</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM medium</label>
            <select value={f.medium} onChange={(e) => set({ medium: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400">
              <option value="">All</option>
              {mediums.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM campaign</label>
            <select value={f.campaign} onChange={(e) => set({ campaign: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400">
              <option value="">All</option>
              {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">From</label>
            <input type="date" value={f.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">To</label>
            <input type="date" value={f.dateTo} onChange={(e) => set({ dateTo: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={f.search} onChange={(e) => set({ search: e.target.value })} placeholder="Search name or email" className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400" />
          {hasFilters && (
            <button type="button" onClick={() => setF(EMPTY_FILTERS)} className="text-xs text-slate-500 hover:text-slate-700 underline whitespace-nowrap">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Subtab content */}
      {subtab === 'data' && <LeadsTable leads={filtered} />}
      {subtab === 'analytics' && <LeadsChart leads={filtered} from={f.dateFrom} to={f.dateTo} />}
      {subtab === 'journey' && <LeadsJourney leads={filtered} />}
    </div>
  )
}

/* ───────────────────────── Data table ───────────────────────── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 whitespace-nowrap bg-slate-50">
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top whitespace-nowrap ${className}`}>{children}</td>
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Scrollable both ways. max-h caps vertical; overflow-auto gives horizontal. */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-max text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <Th>Lead ID</Th>
              <Th>Type</Th>
              <Th>Created</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>First src</Th>
              <Th>First medium</Th>
              <Th>First campaign</Th>
              <Th>First term</Th>
              <Th>First content</Th>
              <Th>Last src</Th>
              <Th>Last medium</Th>
              <Th>Last campaign</Th>
              <Th>Last term</Th>
              <Th>Last content</Th>
              <Th>Referrer</Th>
              <Th>Landing page</Th>
              <Th>Other params</Th>
              <Th>Device</Th>
              <Th>Browser</Th>
              <Th>OS</Th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={22} className="px-4 py-12 text-center text-sm text-slate-400">
                  No leads match the current filters.
                </td>
              </tr>
            ) : leads.map((l) => {
              const dash = <span className="text-slate-300">—</span>
              return (
                <tr key={l.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                  <Td className="text-slate-400 font-mono text-xs">{l.id}</Td>
                  <Td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      l.lead_type === 'client'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {l.lead_type === 'client' ? 'Client' : 'Therapist'}
                    </span>
                  </Td>
                  <Td className="text-slate-500">{formatDate(l.created_at)}</Td>
                  <Td className="text-slate-800 font-medium">{l.name}</Td>
                  <Td className="text-slate-600">{l.email || dash}</Td>
                  <Td className="text-slate-500 capitalize">{l.status.replace(/_/g, ' ')}</Td>
                  <Td className="text-slate-700">{l.first_utm_source || dash}</Td>
                  <Td className="text-slate-600">{l.first_utm_medium || dash}</Td>
                  <Td className="text-slate-600">{l.first_utm_campaign || dash}</Td>
                  <Td className="text-slate-600">{l.first_utm_term || dash}</Td>
                  <Td className="text-slate-600">{l.first_utm_content || dash}</Td>
                  <Td className="text-slate-700">{l.last_utm_source || dash}</Td>
                  <Td className="text-slate-600">{l.last_utm_medium || dash}</Td>
                  <Td className="text-slate-600">{l.last_utm_campaign || dash}</Td>
                  <Td className="text-slate-600">{l.last_utm_term || dash}</Td>
                  <Td className="text-slate-600">{l.last_utm_content || dash}</Td>
                  <Td className="text-slate-500 max-w-[200px] truncate" >{l.referrer || dash}</Td>
                  <Td className="text-slate-500 max-w-[240px] truncate">{l.landing_page || dash}</Td>
                  <Td className="text-slate-500 max-w-[260px] truncate">{mergeParams(l.extra_params) || dash}</Td>
                  <Td className="text-slate-600 capitalize">{l.device_type || dash}</Td>
                  <Td className="text-slate-600">{l.device_browser || dash}</Td>
                  <Td className="text-slate-600">{l.device_os || dash}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ───────────────────────── Analytics chart ───────────────────────── */

function LeadsChart({ leads, from, to }: { leads: Lead[]; from: string; to: string }) {
  // Build a continuous daily series. Range = the filter dates if set,
  // otherwise the span of the data itself.
  const series = useMemo(() => {
    if (leads.length === 0 && !from && !to) return []

    const times = leads.map((l) => new Date(l.created_at).getTime())
    const start = from
      ? new Date(from + 'T00:00:00').getTime()
      : times.length > 0 ? Math.min(...times) : Date.now()
    const end = to
      ? new Date(to + 'T00:00:00').getTime()
      : times.length > 0 ? Math.max(...times) : Date.now()

    // Bucket counts per day key.
    const counts = new Map<string, number>()
    for (const l of leads) {
      const k = dayKey(l.created_at)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }

    // Walk every day from start to end so gaps render as zero.
    const out: { day: string; label: string; count: number }[] = []
    const cursor = new Date(start)
    cursor.setHours(0, 0, 0, 0)
    const last = new Date(end)
    last.setHours(0, 0, 0, 0)
    let guard = 0
    while (cursor.getTime() <= last.getTime() && guard < 400) {
      const k = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      out.push({
        day: k,
        label: cursor.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: counts.get(k) ?? 0,
      })
      cursor.setDate(cursor.getDate() + 1)
      guard++
    }
    return out
  }, [leads, from, to])

  const max = Math.max(1, ...series.map((s) => s.count))
  const total = series.reduce((sum, s) => sum + s.count, 0)
  // Label density: show ~12 labels max so the axis doesn't crowd.
  const labelEvery = Math.max(1, Math.ceil(series.length / 12))

  if (series.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-400">
        No leads in range. Set a date range or clear filters to see the trend.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-700">Leads over time</h3>
        <p className="text-xs text-slate-400">{total} leads across {series.length} day{series.length === 1 ? '' : 's'}</p>
      </div>

      {/* Bar chart — flex row of bars, height proportional to count. */}
      <div className="flex items-end gap-1 h-56 border-b border-slate-200">
        {series.map((s, i) => (
          <div key={s.day} className="flex-1 min-w-[4px] flex flex-col items-center justify-end h-full group relative">
            {/* Tooltip */}
            <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
              {s.label}: {s.count}
            </div>
            <div
              className="w-full bg-emerald-400 hover:bg-emerald-500 rounded-t transition-colors"
              style={{ height: `${(s.count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>

      {/* X-axis labels (thinned) */}
      <div className="flex gap-1 mt-2">
        {series.map((s, i) => (
          <div key={s.day} className="flex-1 min-w-[4px] text-center">
            {i % labelEvery === 0 && (
              <span className="text-[9px] text-slate-400 inline-block -rotate-45 origin-top-left whitespace-nowrap">{s.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Journey ───────────────────────── */

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

function prettyPath(p: string): string {
  if (p === '/') return 'Home'
  return p
}

function LeadsJourney({ leads }: { leads: Lead[] }) {
  const withJourney = leads.filter((l) => l.journey && l.journey.length > 0)

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-400">
        No leads match the current filters.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        {withJourney.length} of {leads.length} leads have a recorded journey. Leads without one arrived
        before journey tracking was live, or converted in a different browser.
      </p>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {leads.map((l) => {
          const steps = l.journey ?? []
          return (
            <div key={l.id} className="bg-white rounded-lg border border-slate-200 p-4">
              {/* Lead header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                    l.lead_type === 'client'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {l.lead_type === 'client' ? 'Client' : 'Therapist'}
                  </span>
                  <span className="font-medium text-slate-800 truncate">{l.name}</span>
                  <span className="text-slate-400 text-sm truncate">{l.email}</span>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-2">
                  {l.first_utm_source && <span className="text-[#3D8A80] font-medium">{l.first_utm_source}</span>}
                  <span>{formatDate(l.created_at)}</span>
                </div>
              </div>

              {/* Journey trail */}
              {steps.length === 0 ? (
                <p className="text-xs text-slate-300 italic">No on-site journey recorded.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-y-2">
                  {l.referrer && (
                    <>
                      <span className="inline-flex items-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                        via {l.referrer}
                      </span>
                      <span className="text-slate-300 mx-1.5">→</span>
                    </>
                  )}
                  {steps.map((s, i) => (
                    <span key={i} className="inline-flex items-center">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-[#7EC0B7]/10 text-[#233551] border border-[#7EC0B7]/30 rounded-md px-2 py-1">
                        <span className="font-medium">{prettyPath(s.p)}</span>
                        <span className="text-slate-400">{timeOfDay(s.t)}</span>
                      </span>
                      {i < steps.length - 1 && <span className="text-slate-300 mx-1.5">→</span>}
                    </span>
                  ))}
                  <span className="text-slate-300 mx-1.5">→</span>
                  <span className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-1 font-medium">
                    {l.lead_type === 'client' ? 'Signed up' : 'Applied'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
