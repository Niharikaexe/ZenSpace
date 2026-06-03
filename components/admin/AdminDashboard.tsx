'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'
import { toggleTherapistVerification, endMatch, generateInviteCode, revokeInviteCode, approveApplication, rejectApplication, actionSwitchRequest, markTherapistPayout, sendApplicationVerificationEmail } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { OwlLogo } from '@/components/home/OwlLogo'
import MatchModal from './MatchModal'
import QuestionnaireDetails from './QuestionnaireDetails'
import { LeadsTab } from './LeadsTab'

// ─── Types ───────────────────────────────────────────────────────────────────

type ClientProfile = {
  id: string
  user_id: string
  primary_concern: string | null
  therapy_goals: string | null
  previous_therapy: boolean
  preferred_therapist_gender: string | null
  preferred_session_type: string
  gender: string | null
}

type Subscription = {
  id: string
  client_id: string
  plan: string
  status: string
  current_period_end: string | null
}

export type UnmatchedClient = {
  id: string
  full_name: string
  avatar_url: string | null
  created_at: string
  email_confirmed_at: string | null
  clientProfile: ClientProfile | null
  questionnaire: { id: string; client_id: string; responses: Record<string, unknown>; submitted_at: string } | null
  subscription: Subscription | null
}

export type TherapistWithProfile = {
  id: string
  user_id: string
  license_number: string
  specializations: string[]
  bio: string | null
  years_experience: number
  languages: string[]
  accepts_new_clients: boolean
  is_verified: boolean
  weekly_capacity: number
  profile: { id: string; full_name: string; avatar_url: string | null } | null
  activeMatchCount: number
}

export type InviteCode = {
  id: string
  code: string
  created_at: string
  used_by: string | null
}

export type TherapistApplication = {
  id: string
  full_name: string
  email: string
  email_verified_at: string | null
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  gender: string | null
  ethnicity: string | null
  date_of_birth: string | null
  linkedin_url: string | null
  license_number: string | null
  license_body: string | null
  years_experience: number
  education: string | null
  expected_session_pay: number | null
  expected_session_pay_currency: string | null
  specializations: string[]
  specialization_other: string | null
  languages: string[]
  bio: string | null
  why_mindcanopy: string | null
  cv_signed_url: string | null
  cv_download_url: string | null
  certificate_signed_urls: string[]
  certificate_download_urls: string[]
  status: string
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
}

export type SwitchRequest = {
  id: string
  client_id: string
  match_id: string | null
  reason: string | null
  details: string | null
  status: string
  created_at: string
  clientName: string
  therapistName: string
}

export type EmailLog = {
  id: string
  resend_id: string | null
  recipient: string
  template: string
  subject: string | null
  related_user_id: string | null
  related_application_id: string | null
  related_match_id: string | null
  send_status: 'sent' | 'failed_no_api_key' | 'failed_resend_rejected' | 'failed_threw'
  send_error: string | null
  resend_status_code: number | null
  last_status: string | null
  last_status_at: string | null
  created_at: string
}

export type ActiveMatch = {
  id: string
  client_id: string
  therapist_id: string
  status: string
  tier: string | null
  notes: string | null
  started_at: string | null
  created_at: string
  client: { id: string; full_name: string; avatar_url: string | null } | null
  therapist: { id: string; full_name: string; avatar_url: string | null } | null
  subscription: Subscription | null
}

export type TherapistPayoutSummary = {
  therapistId: string
  therapistName: string
  outstandingPaise: number
  outstandingCount: number
  paidOutPaise: number
}

interface Props {
  adminName: string
  unmatchedClients: UnmatchedClient[]
  therapists: TherapistWithProfile[]
  activeMatches: ActiveMatch[]
  totalClientCount: number
  inviteCodes: InviteCode[]
  applications: TherapistApplication[]
  switchRequests: SwitchRequest[]
  emailLogs: EmailLog[]
  leads: Lead[]
  therapistPayouts: TherapistPayoutSummary[]
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Initials({ name, url, size = 'md' }: { name: string; url: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  if (url) return <img src={url} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${dim} rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-slate-100 text-slate-500 border-slate-200',
    paused: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accent} p-5`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function InfoField({ label, value, preserveCase = false }: { label: string; value: string | boolean | null | undefined; preserveCase?: boolean }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm text-slate-700 font-medium mt-0.5 break-words ${preserveCase ? '' : 'capitalize'}`}>{String(value)}</p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface Lead {
  id: string
  lead_type: 'client' | 'therapist'
  name: string
  email: string
  created_at: string
  status: string
  first_utm_source: string | null
  first_utm_medium: string | null
  first_utm_campaign: string | null
  first_utm_term: string | null
  first_utm_content: string | null
  last_utm_source: string | null
  last_utm_medium: string | null
  last_utm_campaign: string | null
  last_utm_term: string | null
  last_utm_content: string | null
  referrer: string | null
  landing_page: string | null
  first_seen_at: string | null
  extra_params: Record<string, string> | null
  journey: { p: string; t: string }[] | null
  device_type: string | null
  device_browser: string | null
  device_os: string | null
}

type Tab = 'clients' | 'therapists' | 'matches' | 'applications' | 'switches' | 'emails' | 'payouts'
type View = 'dashboard' | 'leads'

type AppFilter = 'all' | '0-3y' | '3-5y' | '5-8y' | '8+y' | 'foreign'

function appMatchesFilter(app: TherapistApplication, filter: AppFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'foreign') {
    const country = (app.country ?? '').trim().toLowerCase()
    return country !== '' && country !== 'india'
  }
  const y = app.years_experience ?? 0
  if (filter === '0-3y') return y < 3
  if (filter === '3-5y') return y >= 3 && y < 5
  if (filter === '5-8y') return y >= 5 && y < 8
  if (filter === '8+y') return y >= 8
  return true
}

function formatPay(amount: number | null, currency: string | null): string | null {
  if (amount == null) return null
  const symbol = currency === 'USD' ? '$' : '₹'
  return `${symbol}${Number(amount).toLocaleString('en-IN')} / session`
}

export default function AdminDashboard({ adminName, unmatchedClients, therapists, activeMatches, totalClientCount, inviteCodes, applications, switchRequests, emailLogs, leads, therapistPayouts }: Props) {
  const [view, setView] = useState<View>('dashboard')
  const [tab, setTab] = useState<Tab>('clients')
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null)
  const [appNotes, setAppNotes] = useState<Record<string, string>>({})
  const [matchingClient, setMatchingClient] = useState<UnmatchedClient | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [appFilter, setAppFilter] = useState<AppFilter>('all')
  const [emailFilter, setEmailFilter] = useState<'all' | 'sent' | 'failed'>('all')
  // Two-step confirm for settling a payout (avoids a native confirm() dialog).
  const [confirmPayoutId, setConfirmPayoutId] = useState<string | null>(null)
  // Track which application just had a verification email sent (for the chip).
  const [verifyEmailSentId, setVerifyEmailSentId] = useState<string | null>(null)

  // ── Live data: Supabase Realtime → router.refresh() ─────────────────────────
  // Any insert/update/delete on a table that feeds this dashboard re-runs the
  // server component (single source of truth — no client-side data merging).
  const router = useRouter()
  const [live, setLive] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(() => new Date())
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    // Debounce bursts (e.g. a signup that writes profile + questionnaire + client_profile)
    refreshTimer.current = setTimeout(() => {
      router.refresh()
      setLastSync(new Date())
    }, 800)
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    const tables = [
      'profiles', 'client_profiles', 'questionnaire_responses', 'subscriptions',
      'matches', 'therapist_profiles', 'therapist_applications',
      'therapist_switch_requests', 'email_logs',
      'sessions', 'payments', 'therapist_payouts',
    ]
    const channel = supabase.channel('admin-dashboard')
    for (const table of tables) {
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        scheduleRefresh,
      )
    }
    channel.subscribe(status => setLive(status === 'SUBSCRIBED'))
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      supabase.removeChannel(channel)
    }
  }, [scheduleRefresh])

  // Safety net: re-sync when the admin returns to the tab, in case an event was
  // missed while the connection was asleep (mobile background, laptop lid, etc.)
  useEffect(() => {
    function resync() {
      if (document.visibilityState === 'visible') {
        router.refresh()
        setLastSync(new Date())
      }
    }
    document.addEventListener('visibilitychange', resync)
    window.addEventListener('focus', resync)
    return () => {
      document.removeEventListener('visibilitychange', resync)
      window.removeEventListener('focus', resync)
    }
  }, [router])

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const verifiedAvailable = therapists.filter(t => t.is_verified && t.accepts_new_clients)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'applications', label: 'Applications', count: applications.length },
    { key: 'switches', label: 'Switch Requests', count: switchRequests.length },
    { key: 'clients', label: 'Pending Clients', count: unmatchedClients.length },
    { key: 'therapists', label: 'Therapists', count: therapists.length },
    { key: 'matches', label: 'Active Matches', count: activeMatches.length },
    { key: 'payouts', label: 'Payouts', count: therapistPayouts.filter(p => p.outstandingPaise > 0).length },
    { key: 'emails', label: 'Emails', count: emailLogs.length },
  ]

  const inr = (paise: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(paise / 100))

  // Application filter buckets — counts shown in the filter chips
  const APP_FILTERS: { key: AppFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: '0-3y', label: '0–3 yrs' },
    { key: '3-5y', label: '3–5 yrs' },
    { key: '5-8y', label: '5–8 yrs' },
    { key: '8+y', label: '8+ yrs' },
    { key: 'foreign', label: 'Foreign' },
  ]

  const filteredApplications = applications.filter(a => appMatchesFilter(a, appFilter))

  const filteredEmailLogs = emailLogs.filter(e => {
    if (emailFilter === 'all') return true
    if (emailFilter === 'sent') return e.send_status === 'sent'
    return e.send_status !== 'sent'
  })

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OwlLogo size={30} />
            <div>
              <p className="text-sm font-semibold text-slate-900">MindCanopy Admin</p>
              <p className="text-xs text-slate-400">Welcome back, {adminName.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { router.refresh(); setLastSync(new Date()) }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              title={`Last updated ${lastSync.toLocaleTimeString()}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="hidden sm:inline">{live ? 'Live' : 'Reconnecting'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="text-xs text-slate-600">Sign out</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Left sidebar ── */}
        <aside className="w-48 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-61px)] py-6 px-3">
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                view === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setView('leads')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                view === 'leads' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Leads
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === 'leads' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {leads.length}
              </span>
            </button>
          </nav>
        </aside>

        {/* ── Content area ── */}
        <div className="flex-1 min-w-0">

      {view === 'leads' ? (
        <div className="px-4 md:px-6 py-8">
          <LeadsTab leads={leads} />
        </div>
      ) : (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Applications" value={applications.length} sub="pending review" accent="border-l-violet-500" />
          <StatCard label="Total Clients" value={totalClientCount} accent="border-l-blue-500" />
          <StatCard label="Awaiting Match" value={unmatchedClients.length} accent="border-l-amber-500" />
          <StatCard
            label="Therapists"
            value={therapists.length}
            sub={`${therapists.filter(t => t.is_verified).length} verified`}
            accent="border-l-emerald-500"
          />
          <StatCard label="Active Matches" value={activeMatches.length} accent="border-l-purple-500" />
        </div>

        {/* ── Tab panel ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          {/* Tab bar */}
          <div className="border-b border-slate-200 px-2 md:px-6 flex overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 whitespace-nowrap px-4 py-3.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors -mb-px ${
                  tab === t.key
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  tab === t.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Applications Tab ── */}
          {tab === 'applications' && (
            applications.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-3">✓</div>
                <p className="font-semibold text-slate-700">No pending applications</p>
                <p className="text-sm text-slate-400 mt-1">New therapist applications will appear here.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-slate-50/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter</span>
                  {APP_FILTERS.map(f => {
                    const count = applications.filter(a => appMatchesFilter(a, f.key)).length
                    const isActive = appFilter === f.key
                    return (
                      <button
                        key={f.key}
                        onClick={() => setAppFilter(f.key)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                          isActive
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {f.label}
                        <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>
                {filteredApplications.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-400">
                    No applications in this bucket.
                  </div>
                ) : (
                <div className="divide-y divide-slate-100">
                {filteredApplications.map(app => (
                  <div key={app.id}>
                    <div className="px-6 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {app.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900 text-sm">{app.full_name}</span>
                          <span className="text-xs text-slate-400">{app.email}</span>
                          {app.email_verified_at ? (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Email verified
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Email unverified
                              </span>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startTransition(async () => {
                                    await sendApplicationVerificationEmail(app.id)
                                    setVerifyEmailSentId(app.id)
                                  })
                                }}
                                className="text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {verifyEmailSentId === app.id ? '✓ Sent' : 'Send verification email'}
                              </button>
                            </>
                          )}
                          {app.city && (
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{app.city}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-500">
                            {app.years_experience}y exp · {app.license_number}
                          </span>
                          {formatPay(app.expected_session_pay, app.expected_session_pay_currency) && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {formatPay(app.expected_session_pay, app.expected_session_pay_currency)}
                            </span>
                          )}
                          {app.country && app.country.trim().toLowerCase() !== 'india' && (
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              {app.country}
                            </span>
                          )}
                          {app.specializations.slice(0, 3).map(s => (
                            <span key={s} className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded-full capitalize">{s}</span>
                          ))}
                          {app.specializations.length > 3 && (
                            <span className="text-xs text-slate-400">+{app.specializations.length - 3} more</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Submitted {formatDate(app.submitted_at)}</p>
                      </div>
                      <button
                        onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex-shrink-0"
                      >
                        {expandedAppId === app.id ? 'Hide' : 'Review'}
                      </button>
                    </div>

                    {/* Expanded review panel */}
                    {expandedAppId === app.id && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100">

                        {/* Contact + Location */}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-3 mb-2">Contact</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                          <InfoField label="Email" value={app.email} preserveCase />
                          <InfoField label="Phone" value={app.phone} preserveCase />
                          <InfoField label="LinkedIn" value={app.linkedin_url} preserveCase />
                          <InfoField label="City" value={app.city} />
                          <InfoField label="State" value={app.state} />
                          <InfoField label="Country" value={app.country} />
                        </div>

                        {/* Demographics */}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Demographics</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                          <InfoField label="Gender" value={app.gender} />
                          <InfoField label="Ethnicity" value={app.ethnicity} />
                          <InfoField
                            label="Date of birth"
                            value={app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null}
                          />
                        </div>

                        {/* Professional */}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Professional</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                          <InfoField label="Years experience" value={String(app.years_experience)} />
                          <InfoField label="Education" value={app.education} />
                          <InfoField label="License number" value={app.license_number} preserveCase />
                          <InfoField label="License body" value={app.license_body} />
                          <InfoField
                            label="Expected session pay"
                            value={
                              app.expected_session_pay != null
                                ? `${app.expected_session_pay_currency === 'USD' ? '$' : '₹'}${Number(app.expected_session_pay).toLocaleString('en-IN')} / session`
                                : null
                            }
                            preserveCase
                          />
                          <InfoField
                            label="Email verified"
                            value={
                              app.email_verified_at
                                ? `Yes · ${new Date(app.email_verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : 'No'
                            }
                            preserveCase
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-xs text-slate-400">Languages</p>
                            <p className="text-sm text-slate-700 font-medium mt-0.5">{app.languages.join(', ') || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Specialisations</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.specializations.map(s => (
                                <span key={s} className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full capitalize">{s}</span>
                              ))}
                              {app.specialization_other && (
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                                  Other: {app.specialization_other}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Documents</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {app.cv_signed_url ? (
                            <>
                              <a
                                href={app.cv_signed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-violet-300 transition-colors"
                              >
                                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View CV
                                <span className="text-xs text-slate-400">↗</span>
                              </a>
                              {app.cv_download_url && (
                                <a
                                  href={app.cv_download_url}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download CV
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No CV uploaded</span>
                          )}
                          {app.certificate_signed_urls.map((url, i) => (
                            <span key={url} className="inline-flex items-center gap-1">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-violet-300 transition-colors"
                              >
                                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Cert {i + 1}
                                <span className="text-xs text-slate-400">↗</span>
                              </a>
                              {app.certificate_download_urls[i] && (
                                <a
                                  href={app.certificate_download_urls[i]}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                                  title={`Download certificate ${i + 1}`}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                              )}
                            </span>
                          ))}
                          {app.certificate_signed_urls.length === 0 && !app.cv_signed_url && null}
                          {app.certificate_signed_urls.length === 0 && app.cv_signed_url && (
                            <span className="text-xs text-slate-400 italic self-center">No certificates uploaded</span>
                          )}
                        </div>

                        {/* Long-form */}
                        {app.bio && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-400">Bio</p>
                            <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed whitespace-pre-wrap">{app.bio}</p>
                          </div>
                        )}
                        {app.why_mindcanopy && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-400">Why MindCanopy</p>
                            <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed whitespace-pre-wrap">{app.why_mindcanopy}</p>
                          </div>
                        )}

                        {/* Notes + action buttons */}
                        <div className="mt-5 pt-4 border-t border-slate-200">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Admin notes <span className="font-normal text-slate-400">(optional — included in approval email)</span>
                          </label>
                          <textarea
                            rows={2}
                            value={appNotes[app.id] ?? ''}
                            onChange={e => setAppNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                            placeholder="e.g. Great fit for anxiety and CBT clients. Welcome!"
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none bg-white"
                          />
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(() => approveApplication(app.id, appNotes[app.id] ?? ''))}
                              className="flex items-center gap-1.5 text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
                            >
                              Approve &amp; send invite
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(() => rejectApplication(app.id, appNotes[app.id] ?? ''))}
                              className="flex items-center gap-1.5 text-xs px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                )}
              </>
            )
          )}

          {/* ── Pending Clients Tab ── */}
          {tab === 'clients' && (
            unmatchedClients.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-3">✓</div>
                <p className="font-semibold text-slate-700">All clients matched</p>
                <p className="text-sm text-slate-400 mt-1">No pending clients right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unmatchedClients.map(client => (
                  <div key={client.id}>
                    <div className="px-6 py-4 flex items-center gap-4">
                      <Initials name={client.full_name} url={client.avatar_url} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900 text-sm">{client.full_name}</span>
                          {client.email_confirmed_at ? (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Email verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Email unverified
                            </span>
                          )}
                          {client.clientProfile?.primary_concern && (
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full capitalize">
                              {client.clientProfile.primary_concern.replace(/_/g, ' ')}
                            </span>
                          )}
                          {client.subscription
                            ? <StatusPill status={client.subscription.status} />
                            : <span className="text-xs text-slate-400 italic">No subscription</span>
                          }
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Joined {formatDate(client.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                          className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          {expandedClientId === client.id ? 'Hide' : 'Details'}
                        </button>
                        <Button
                          size="sm"
                          onClick={() => setMatchingClient(client)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          Match Therapist
                        </Button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedClientId === client.id && (
                      <div className="px-6 pb-5 pt-3 bg-slate-50 border-t border-slate-100 space-y-5">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick summary</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white rounded-lg p-4 border border-slate-200">
                            <InfoField label="Gender" value={client.clientProfile?.gender} />
                            <InfoField label="Previous therapy" value={client.clientProfile?.previous_therapy ? 'Yes' : 'No'} />
                            <InfoField label="Session preference" value={client.clientProfile?.preferred_session_type} />
                            <InfoField
                              label="Therapist preference"
                              value={client.clientProfile?.preferred_therapist_gender || 'No preference'}
                            />
                            {client.clientProfile?.therapy_goals && (
                              <div className="col-span-2 md:col-span-3">
                                <p className="text-xs text-slate-400">Therapy goals (summary)</p>
                                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                  {client.clientProfile.therapy_goals}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <QuestionnaireDetails
                          responses={client.questionnaire?.responses ?? null}
                          submittedAt={client.questionnaire?.submitted_at ?? null}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Therapists Tab ── */}
          {tab === 'therapists' && (
            <div>
              {/* Invite codes section */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Invite Codes</p>
                    <p className="text-xs text-slate-400 mt-0.5">Each code is single-use. Share the link with the therapist.</p>
                  </div>
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => generateInviteCode())}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
                  >
                    <span className="text-base leading-none">+</span> Generate Code
                  </button>
                </div>

                {inviteCodes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No invite codes yet. Generate one above.</p>
                ) : (
                  <div className="space-y-2">
                    {inviteCodes.map(invite => {
                      const onboardUrl = `${appUrl}/therapist/onboard?code=${invite.code}`
                      const isUsed = !!invite.used_by
                      return (
                        <div
                          key={invite.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                            isUsed
                              ? 'bg-slate-100 border-slate-200 opacity-60'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <code className={`text-sm font-mono font-bold tracking-wider flex-shrink-0 ${
                            isUsed ? 'text-slate-400 line-through' : 'text-emerald-700'
                          }`}>
                            {invite.code}
                          </code>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            isUsed
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isUsed ? 'Used' : 'Active'}
                          </span>
                          <span className="text-xs text-slate-400 flex-1 truncate hidden sm:block">
                            {isUsed ? 'Already redeemed' : onboardUrl}
                          </span>
                          {!isUsed && (
                            <>
                              <button
                                onClick={() => copyToClipboard(onboardUrl, `link-${invite.id}`)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                              >
                                {copiedId === `link-${invite.id}` ? '✓ Copied' : 'Copy link'}
                              </button>
                              <button
                                onClick={() => copyToClipboard(invite.code, `code-${invite.id}`)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                              >
                                {copiedId === `code-${invite.id}` ? '✓ Copied' : 'Copy code'}
                              </button>
                            </>
                          )}
                          {!isUsed && (
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(() => revokeInviteCode(invite.id))}
                              className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                            >
                              Revoke
                            </button>
                          )}
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatDate(invite.created_at)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Therapists list */}
              {therapists.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-semibold text-slate-700">No therapists yet</p>
                  <p className="text-sm text-slate-400 mt-1">Share an invite code above to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {therapists.map(therapist => (
                  <div key={therapist.id} className="px-6 py-4 flex items-center gap-4">
                    <Initials name={therapist.profile?.full_name ?? 'T'} url={therapist.profile?.avatar_url ?? null} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 text-sm">{therapist.profile?.full_name}</span>
                        {therapist.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Unverified
                          </span>
                        )}
                        {!therapist.accepts_new_clients && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Not accepting clients
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">
                          {therapist.years_experience}y exp · License: {therapist.license_number}
                        </span>
                        <span className={`text-xs font-medium ${
                          therapist.activeMatchCount >= therapist.weekly_capacity
                            ? 'text-red-500'
                            : 'text-slate-400'
                        }`}>
                          {therapist.activeMatchCount}/{therapist.weekly_capacity} clients
                        </span>
                      </div>
                      {therapist.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {therapist.specializations.slice(0, 5).map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                              {s}
                            </span>
                          ))}
                          {therapist.specializations.length > 5 && (
                            <span className="text-xs text-slate-400">+{therapist.specializations.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => toggleTherapistVerification(therapist.id, therapist.is_verified))}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex-shrink-0 ${
                        therapist.is_verified
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {therapist.is_verified ? 'Revoke' : 'Verify'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* ── Active Matches Tab ── */}
          {tab === 'matches' && (
            activeMatches.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-semibold text-slate-700">No active matches</p>
                <p className="text-sm text-slate-400 mt-1">Match clients to therapists from the Pending Clients tab.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeMatches.map(match => {
                  const isProposal = match.status === 'pending'
                  return (
                  <div key={match.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Client → Therapist avatars */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Initials name={match.client?.full_name ?? 'C'} url={match.client?.avatar_url ?? null} size="sm" />
                      <span className="text-slate-300 text-sm">→</span>
                      <Initials name={match.therapist?.full_name ?? 'T'} url={match.therapist?.avatar_url ?? null} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900">{match.client?.full_name}</span>
                        <span className="text-slate-300 text-xs">with</span>
                        <span className="text-sm font-medium text-slate-700">{match.therapist?.full_name}</span>
                        {match.tier && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            match.tier === 'professional' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {match.tier}
                          </span>
                        )}
                        {isProposal ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Proposed · awaiting client
                          </span>
                        ) : (
                          match.subscription && <StatusPill status={match.subscription.status} />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isProposal ? 'Proposed' : 'Matched'} {formatDate(match.started_at ?? match.created_at)}
                      </p>
                      {match.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">"{match.notes}"</p>
                      )}
                    </div>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => endMatch(match.id))}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors flex-shrink-0"
                    >
                      {isProposal ? 'Cancel proposal' : 'End match'}
                    </button>
                  </div>
                  )
                })}
              </div>
            )
          )}

          {/* ── Switch Requests Tab ── */}
          {tab === 'switches' && (
            switchRequests.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-3">✓</div>
                <p className="font-semibold text-slate-700">No pending switch requests</p>
                <p className="text-sm text-slate-400 mt-1">Switch requests from clients will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {switchRequests.map(req => (
                  <div key={req.id} className="px-6 py-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      {req.clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-slate-900 text-sm">{req.clientName}</span>
                        <span className="text-slate-300 text-xs">currently with</span>
                        <span className="text-sm text-slate-600">{req.therapistName}</span>
                      </div>
                      {req.reason && (
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="font-medium text-slate-500">Reason: </span>{req.reason}
                        </p>
                      )}
                      {req.details && (
                        <p className="text-sm text-slate-500 mt-0.5 italic leading-relaxed">&ldquo;{req.details}&rdquo;</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1.5">Submitted {formatDate(req.created_at)}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {req.match_id ? (
                        <button
                          disabled={isPending}
                          onClick={() => startTransition(() => actionSwitchRequest(req.id, req.match_id!))}
                          className="text-xs px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors disabled:opacity-60"
                        >
                          End match &amp; re-queue
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Match already ended</span>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
                        Client returns to<br/>pending match queue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Payouts Tab ── */}
          {tab === 'payouts' && (
            therapistPayouts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-semibold text-slate-700">No therapists yet</p>
                <p className="text-sm text-slate-400 mt-1">Payout balances appear once therapists complete paid sessions.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...therapistPayouts]
                  .sort((a, b) => b.outstandingPaise - a.outstandingPaise)
                  .map(p => {
                    const confirming = confirmPayoutId === p.therapistId
                    const nothingDue = p.outstandingPaise <= 0
                    return (
                      <div key={p.therapistId} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{p.therapistName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {p.outstandingCount} unsettled session{p.outstandingCount === 1 ? '' : 's'} · {inr(p.paidOutPaise)} paid out to date
                          </p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Outstanding</p>
                            <p className="text-lg font-black text-slate-900">{inr(p.outstandingPaise)}</p>
                          </div>
                          {nothingDue ? (
                            <span className="text-xs font-semibold text-emerald-600 px-4 py-2">Settled</span>
                          ) : confirming ? (
                            <div className="flex items-center gap-2">
                              <button
                                disabled={isPending}
                                onClick={() => {
                                  startTransition(async () => {
                                    await markTherapistPayout(p.therapistId)
                                    setConfirmPayoutId(null)
                                    router.refresh()
                                  })
                                }}
                                className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40"
                              >
                                {isPending ? 'Recording…' : `Confirm ${inr(p.outstandingPaise)}`}
                              </button>
                              <button
                                onClick={() => setConfirmPayoutId(null)}
                                disabled={isPending}
                                className="text-xs font-medium px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmPayoutId(p.therapistId)}
                              className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                            >
                              Mark paid
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )
          )}

          {/* ── Emails Tab ── */}
          {tab === 'emails' && (
            <>
              <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-slate-50/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter</span>
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
                  const isActive = emailFilter === f.key
                  return (
                    <button
                      key={f.key}
                      onClick={() => setEmailFilter(f.key)}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                      <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>
                    </button>
                  )
                })}
                <p className="text-[11px] text-slate-400 ml-auto">
                  Last 200 sends · live delivery / bounce / click status not synced yet
                </p>
              </div>

              {filteredEmailLogs.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">
                  No email logs match this filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredEmailLogs.map(log => {
                    const isFailed = log.send_status !== 'sent'
                    const statusLabel = {
                      sent: 'Accepted',
                      failed_no_api_key: 'No API key',
                      failed_resend_rejected: 'Resend rejected',
                      failed_threw: 'Network error',
                    }[log.send_status]
                    return (
                      <div key={log.id} className="px-6 py-3 flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            isFailed
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-900 break-all">{log.recipient}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">{log.template}</span>
                          </div>
                          {log.subject && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{log.subject}</p>
                          )}
                          {log.send_error && (
                            <p className="text-xs text-red-600 mt-1 font-mono break-words whitespace-pre-wrap">
                              {log.send_error}
                            </p>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span>{new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            {log.resend_id && (
                              <span className="font-mono">Resend: {log.resend_id.slice(0, 8)}…</span>
                            )}
                            {log.resend_status_code != null && (
                              <span>HTTP {log.resend_status_code}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </main>
      )}

        </div>
      </div>

      {/* Match Modal */}
      {matchingClient && (
        <MatchModal
          client={matchingClient}
          therapists={verifiedAvailable}
          onClose={() => setMatchingClient(null)}
        />
      )}
    </div>
  )
}
