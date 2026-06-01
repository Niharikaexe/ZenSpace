'use client'

import { useMemo, useState } from 'react'
import type { Lead } from './AdminDashboard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function distinct(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort()
}

type LeadTypeFilter = 'all' | 'client' | 'therapist'

export function LeadsTab({ leads }: { leads: Lead[] }) {
  const [typeFilter, setTypeFilter] = useState<LeadTypeFilter>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [mediumFilter, setMediumFilter] = useState<string>('')
  const [campaignFilter, setCampaignFilter] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  const sources = useMemo(() => distinct(leads.map((l) => l.first_utm_source)), [leads])
  const mediums = useMemo(() => distinct(leads.map((l) => l.first_utm_medium)), [leads])
  const campaigns = useMemo(() => distinct(leads.map((l) => l.first_utm_campaign)), [leads])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (typeFilter !== 'all' && l.lead_type !== typeFilter) return false
      if (sourceFilter && l.first_utm_source !== sourceFilter) return false
      if (mediumFilter && l.first_utm_medium !== mediumFilter) return false
      if (campaignFilter && l.first_utm_campaign !== campaignFilter) return false
      if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false
      return true
    })
  }, [leads, typeFilter, sourceFilter, mediumFilter, campaignFilter, search])

  const clearFilters = () => {
    setTypeFilter('all')
    setSourceFilter('')
    setMediumFilter('')
    setCampaignFilter('')
    setSearch('')
  }

  const tagged = filtered.filter((l) => l.first_utm_source || l.referrer).length
  const organic = filtered.length - tagged

  const exportCsv = () => {
    const headers = [
      'Type', 'Name', 'Email', 'Created', 'Status',
      'First UTM Source', 'First UTM Medium', 'First UTM Campaign', 'First UTM Term', 'First UTM Content',
      'Last UTM Source', 'Last UTM Medium', 'Last UTM Campaign', 'Last UTM Term', 'Last UTM Content',
      'Referrer', 'Landing Page', 'First Seen',
    ]
    const escape = (v: string | null | undefined): string => {
      if (v == null) return ''
      const s = String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const rows = filtered.map((l) => [
      l.lead_type, l.name, l.email, l.created_at, l.status,
      l.first_utm_source, l.first_utm_medium, l.first_utm_campaign, l.first_utm_term, l.first_utm_content,
      l.last_utm_source, l.last_utm_medium, l.last_utm_campaign, l.last_utm_term, l.last_utm_content,
      l.referrer, l.landing_page, l.first_seen_at,
    ].map(escape).join(','))
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
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LeadTypeFilter)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
            >
              <option value="all">All leads</option>
              <option value="client">Clients</option>
              <option value="therapist">Therapist applications</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
            >
              <option value="">All</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM medium</label>
            <select
              value={mediumFilter}
              onChange={(e) => setMediumFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
            >
              <option value="">All</option>
              {mediums.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">UTM campaign</label>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
            >
              <option value="">All</option>
              {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400"
            />
          </div>
        </div>
        {(typeFilter !== 'all' || sourceFilter || mediumFilter || campaignFilter || search) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Created</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">First UTM</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Last UTM</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Referrer / Landing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    No leads match the current filters.
                  </td>
                </tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      l.lead_type === 'client'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {l.lead_type === 'client' ? 'Client' : 'Therapist'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-slate-600">{l.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{l.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.first_utm_source ? (
                      <div className="space-y-0.5">
                        <div className="font-medium">{l.first_utm_source}</div>
                        {l.first_utm_campaign && <div className="text-xs text-slate-400">{l.first_utm_campaign}</div>}
                        {l.first_utm_medium && <div className="text-xs text-slate-400">{l.first_utm_medium}</div>}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.last_utm_source && l.last_utm_source !== l.first_utm_source ? (
                      <div className="space-y-0.5">
                        <div className="font-medium">{l.last_utm_source}</div>
                        {l.last_utm_campaign && <div className="text-xs text-slate-400">{l.last_utm_campaign}</div>}
                      </div>
                    ) : <span className="text-slate-300">same</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {l.referrer && <div>via {l.referrer}</div>}
                    {l.landing_page && <div className="text-slate-400">→ {l.landing_page}</div>}
                    {!l.referrer && !l.landing_page && <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
