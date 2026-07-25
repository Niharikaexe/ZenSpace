'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { sendTestEmail } from '@/app/admin/actions'
import { ComposeTab } from './ComposeTab'
import type { EmailLog } from './AdminDashboard'
import {
  EMAIL_CATALOGUE,
  AUDIENCE_ORDER,
  AUDIENCE_LABEL,
  type EmailAudience,
} from '@/lib/email-catalogue'

// One place to run everything to do with email: what exists, when it fires,
// when it last went out, sending a test copy of any of it, and the raw send log.

export type TemplateStat = { lastSentAt: string | null; total: number }

/** Who a given template actually went to, newest first. */
export type TemplateRecipient = {
  email: string
  name: string | null
  at: string
  failed: boolean
  lastStatus: string | null
}

/** Someone a test email can be sent to, picked from real users. */
export type MailRecipient = { email: string; name: string; role: string }

interface Props {
  emailLogs: EmailLog[]
  /** Keyed by catalogue key (matches email_logs.template). */
  templateStats: Record<string, TemplateStat>
  /** Recent recipients per template, keyed the same way. */
  templateRecipients: Record<string, TemplateRecipient[]>
  recipients: MailRecipient[]
}

const DELIVERY_META: Record<string, { label: string; cls: string; dot: string }> = {
  delivered:        { label: 'Delivered', cls: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  opened:           { label: 'Opened',    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',   dot: 'bg-indigo-500' },
  clicked:          { label: 'Clicked',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500' },
  bounced:          { label: 'Bounced',   cls: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-500' },
  complained:       { label: 'Spam',      cls: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500' },
  delivery_delayed: { label: 'Delayed',   cls: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
}

const AUDIENCE_CHIP: Record<EmailAudience, string> = {
  client: 'bg-blue-50 text-blue-700 border-blue-200',
  therapist: 'bg-violet-50 text-violet-700 border-violet-200',
  applicant: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-slate-100 text-slate-600 border-slate-200',
}

function relative(iso: string | null): string {
  if (!iso) return 'Never'
  const then = new Date(iso).getTime()
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

type SubTab = 'templates' | 'log' | 'compose'

export function EmailStudio({ emailLogs, templateStats, templateRecipients, recipients }: Props) {
  // Which template's recipient list is open.
  const [expanded, setExpanded] = useState<string | null>(null)
  const [subTab, setSubTab] = useState<SubTab>('templates')

  // ── Templates tab state ────────────────────────────────────────────────────
  const [audienceFilter, setAudienceFilter] = useState<EmailAudience | 'all'>('all')
  // One field for both jobs: search the people we know, or type any address.
  const [toQuery, setToQuery] = useState('')
  const [picked, setPicked] = useState<MailRecipient | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const [sendingKey, setSendingKey] = useState<string | null>(null)
  const [result, setResult] = useState<{ key: string; ok: boolean; error?: string } | null>(null)

  // ── Log tab state ─────────────────────────────────────────────────────────
  const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'failed'>('all')
  const [logSearch, setLogSearch] = useState('')

  const typedTo = toQuery.trim()
  const typedIsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedTo)
  const resolvedTo = picked ? picked.email : (typedIsEmail ? typedTo : '')

  const toMatches = useMemo(() => {
    const q = typedTo.toLowerCase()
    const pool = q
      ? recipients.filter(r =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
      : recipients
    return pool.slice(0, 30)
  }, [recipients, typedTo])

  // Close the picker on an outside click, so it behaves like a real dropdown.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const visibleTemplates = useMemo(
    () => (audienceFilter === 'all'
      ? EMAIL_CATALOGUE
      : EMAIL_CATALOGUE.filter(e => e.audience === audienceFilter)),
    [audienceFilter],
  )

  const grouped = useMemo(() => {
    const byAudience = new Map<EmailAudience, typeof EMAIL_CATALOGUE>()
    for (const a of AUDIENCE_ORDER) {
      const rows = visibleTemplates.filter(e => e.audience === a)
      if (rows.length) byAudience.set(a, rows)
    }
    return byAudience
  }, [visibleTemplates])

  const logQuery = logSearch.trim().toLowerCase()
  const filteredLogs = emailLogs.filter(e => {
    if (logFilter === 'sent' && e.send_status !== 'sent') return false
    if (logFilter === 'failed' && e.send_status === 'sent') return false
    if (logQuery) {
      const hay = [e.recipient_name, e.recipient, e.subject, e.template]
        .filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(logQuery)) return false
    }
    return true
  })

  function runTest(key: string) {
    if (!resolvedTo) {
      setResult({ key, ok: false, error: 'Pick who to send it to first.' })
      return
    }
    setResult(null)
    setSendingKey(key)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('key', key)
      fd.set('to', resolvedTo)
      const res = await sendTestEmail(fd)
      setResult({ key, ...res })
      setSendingKey(null)
    })
  }

  const liveCount = EMAIL_CATALOGUE.filter(e => e.wired).length
  const scheduledCount = EMAIL_CATALOGUE.filter(e => e.schedule).length

  const tabs: { key: SubTab; label: string; count?: number }[] = [
    { key: 'templates', label: 'Templates', count: EMAIL_CATALOGUE.length },
    { key: 'log', label: 'Send log', count: emailLogs.length },
    { key: 'compose', label: 'Compose' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Emails</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {EMAIL_CATALOGUE.length} emails the platform can send, {liveCount} of them live and{' '}
          {scheduledCount} on a schedule. Send a test of any of them, or write a one-off.
        </p>
      </div>

      {/* sub-tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-5">
        {tabs.map(t => {
          const on = subTab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSubTab(t.key)}
              className={`px-3.5 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                on
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`ml-1.5 text-xs ${on ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── TEMPLATES ────────────────────────────────────────────────────── */}
      {subTab === 'templates' && (
        <div className="space-y-5">

          {/* who tests go to */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Send test emails to</p>
            <div className="flex flex-wrap items-start gap-3">
              <div ref={pickerRef} className="relative w-full max-w-sm">
                <input
                  type="text"
                  value={toQuery}
                  onChange={e => { setToQuery(e.target.value); setPicked(null); setPickerOpen(true) }}
                  onFocus={() => setPickerOpen(true)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setPickerOpen(false)
                    if (e.key === 'Enter' && pickerOpen && toMatches.length > 0) {
                      e.preventDefault()
                      const first = toMatches[0]
                      setPicked(first); setToQuery(first.email); setPickerOpen(false)
                    }
                  }}
                  placeholder="Search a name, or type any address"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={pickerOpen}
                  aria-controls="test-recipient-list"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {toQuery && (
                  <button
                    type="button"
                    onClick={() => { setToQuery(''); setPicked(null); setPickerOpen(false) }}
                    aria-label="Clear recipient"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 leading-none"
                  >
                    ×
                  </button>
                )}

                {pickerOpen && (
                  <div
                    id="test-recipient-list"
                    role="listbox"
                    className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
                  >
                    {toMatches.length === 0 ? (
                      <p className="px-3 py-2.5 text-xs text-slate-400">
                        {typedIsEmail
                          ? 'Not one of your users. It will still be sent to this address.'
                          : 'Nobody matches that. Type a full email address to use it anyway.'}
                      </p>
                    ) : (
                      toMatches.map(r => (
                        <button
                          key={r.email}
                          type="button"
                          role="option"
                          aria-selected={picked?.email === r.email}
                          onClick={() => { setPicked(r); setToQuery(r.email); setPickerOpen(false) }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        >
                          <span className="text-sm font-medium text-slate-800">{r.name}</span>
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                            r.role === 'admin'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : r.role === 'therapist'
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {r.role}
                          </span>
                          <span className="block text-xs text-slate-500 break-all">{r.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 pt-2">
                {resolvedTo
                  ? <>Tests go to <b className="text-slate-700 break-all">{resolvedTo}</b></>
                  : <span className="text-slate-400">Pick who tests should go to.</span>}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Tests use sample names and are subject-prefixed [TEST]. They are logged separately,
              so they never skew the counts below.
            </p>
          </div>

          {/* audience filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Show</span>
            {([['all', 'Everything'], ...AUDIENCE_ORDER.map(a => [a, AUDIENCE_LABEL[a]])] as [EmailAudience | 'all', string][])
              .map(([key, label]) => {
                const count = key === 'all'
                  ? EMAIL_CATALOGUE.length
                  : EMAIL_CATALOGUE.filter(e => e.audience === key).length
                const on = audienceFilter === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAudienceFilter(key)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      on
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {label}
                    <span className={`ml-1.5 ${on ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
                  </button>
                )
              })}
          </div>

          {/* catalogue */}
          {Array.from(grouped.entries()).map(([audience, rows]) => (
            <section key={audience}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {AUDIENCE_LABEL[audience]}
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {rows.map(entry => {
                  const stat = templateStats[entry.key] ?? { lastSentAt: null, total: 0 }
                  const busy = isPending && sendingKey === entry.key
                  const res = result?.key === entry.key ? result : null
                  const sentTo = templateRecipients[entry.key] ?? []
                  const isOpen = expanded === entry.key
                  return (
                    <div key={entry.key} className="px-4 py-3.5">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-[16rem]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">{entry.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${AUDIENCE_CHIP[entry.audience]}`}>
                            {entry.audience}
                          </span>
                          {!entry.wired && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                              not wired up
                            </span>
                          )}
                          {entry.schedule && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 font-semibold">
                              {entry.schedule.human}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{entry.trigger}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">{entry.key}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : entry.key)}
                        disabled={sentTo.length === 0}
                        className="text-right min-w-[7rem] rounded-lg px-2 py-1 -mr-2 enabled:hover:bg-slate-50 disabled:cursor-default transition-colors"
                        title={sentTo.length ? 'Show who this went to' : undefined}
                      >
                        <p className="text-xs font-semibold text-slate-700">{relative(stat.lastSentAt)}</p>
                        <p className="text-[11px] text-slate-400">
                          {stat.total === 0
                            ? 'no sends yet'
                            : <>{stat.total} sent <span className="text-slate-300">{isOpen ? '▴' : '▾'}</span></>}
                        </p>
                      </button>

                      <div className="flex flex-col items-end gap-1 min-w-[6.5rem]">
                        <button
                          type="button"
                          onClick={() => runTest(entry.key)}
                          disabled={busy}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {busy ? 'Sending…' : 'Send test'}
                        </button>
                        {res?.ok && <span className="text-[11px] font-semibold text-emerald-700">Sent ✓</span>}
                        {res && !res.ok && (
                          <span className="text-[11px] font-medium text-red-600 text-right max-w-[12rem]">{res.error}</span>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-200 flex items-baseline gap-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            Sent to
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {stat.total > sentTo.length
                              ? `most recent ${sentTo.length} of ${stat.total}`
                              : `${sentTo.length} ${sentTo.length === 1 ? 'person' : 'people'}`}
                          </span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/70">
                          {sentTo.map((r, i) => {
                            const d = r.lastStatus ? DELIVERY_META[r.lastStatus] : null
                            return (
                              <div key={`${r.email}-${r.at}-${i}`} className="px-3 py-2 flex flex-wrap items-center gap-2">
                                {r.name && (
                                  <span className="text-xs font-semibold text-slate-800">{r.name}</span>
                                )}
                                <span className="text-xs text-slate-500 break-all">{r.email}</span>
                                {r.failed && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                    failed
                                  </span>
                                )}
                                {d && (
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${d.cls}`}>
                                    {d.label}
                                  </span>
                                )}
                                <span className="ml-auto text-[11px] text-slate-400 whitespace-nowrap">
                                  {new Date(r.at).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── SEND LOG ─────────────────────────────────────────────────────── */}
      {subTab === 'log' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-slate-50/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter</span>
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'sent' as const, label: 'Accepted by Resend' },
              { key: 'failed' as const, label: 'Failed' },
            ]).map(f => {
              const count = f.key === 'all'
                ? emailLogs.length
                : f.key === 'sent'
                  ? emailLogs.filter(e => e.send_status === 'sent').length
                  : emailLogs.filter(e => e.send_status !== 'sent').length
              const on = logFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setLogFilter(f.key)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    on
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 ${on ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
                </button>
              )
            })}
            <div className="ml-auto flex items-center gap-2">
              <input
                type="search"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Search name, email, subject…"
                className="w-56 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Last 200 sends</span>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No emails match this filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const isFailed = log.send_status !== 'sent'
                const statusLabel = {
                  sent: 'Accepted',
                  failed_no_api_key: 'No API key',
                  failed_resend_rejected: 'Resend rejected',
                  failed_threw: 'Network error',
                }[log.send_status]
                const delivery = log.last_status ? (DELIVERY_META[log.last_status] ?? null) : null
                return (
                  <div key={log.id} className="px-5 py-3 flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col gap-1 items-start w-28">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        isFailed
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {statusLabel}
                      </span>
                      {delivery && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${delivery.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${delivery.dot}`} />
                          {delivery.label}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.recipient_name && (
                          <span className="text-sm font-semibold text-slate-900">{log.recipient_name}</span>
                        )}
                        <span className="text-xs text-slate-500 break-all">{log.recipient}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">{log.template}</span>
                      </div>
                      {log.subject && <p className="text-xs text-slate-500 mt-0.5 truncate">{log.subject}</p>}
                      {log.send_error && (
                        <p className="text-xs text-red-600 mt-1 font-mono break-words whitespace-pre-wrap">{log.send_error}</p>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>{new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        {log.resend_id && <span className="font-mono">Resend: {log.resend_id.slice(0, 8)}…</span>}
                        {log.resend_status_code != null && <span>HTTP {log.resend_status_code}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── COMPOSE ──────────────────────────────────────────────────────── */}
      {subTab === 'compose' && <ComposeTab />}
    </div>
  )
}
