'use client'

import { useState, useTransition } from 'react'
import { signOut } from '@/app/actions/auth'
import { toggleTherapistVerification, endMatch, generateInviteCode, revokeInviteCode, approveApplication, rejectApplication, actionSwitchRequest } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import MatchModal from './MatchModal'

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
  phone: string | null
  city: string | null
  license_number: string
  license_body: string | null
  years_experience: number
  education: string | null
  specializations: string[]
  languages: string[]
  bio: string
  why_zenspace: string | null
  status: string
  submitted_at: string
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

export type ActiveMatch = {
  id: string
  client_id: string
  therapist_id: string
  status: string
  notes: string | null
  started_at: string | null
  created_at: string
  client: { id: string; full_name: string; avatar_url: string | null } | null
  therapist: { id: string; full_name: string; avatar_url: string | null } | null
  subscription: Subscription | null
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

function InfoField({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 font-medium mt-0.5 capitalize">{String(value)}</p>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'clients' | 'therapists' | 'matches' | 'applications' | 'switches'

export default function AdminDashboard({ adminName, unmatchedClients, therapists, activeMatches, totalClientCount, inviteCodes, applications, switchRequests }: Props) {
  const [tab, setTab] = useState<Tab>('clients')
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null)
  const [appNotes, setAppNotes] = useState<Record<string, string>>({})
  const [matchingClient, setMatchingClient] = useState<UnmatchedClient | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">ZenSpace Admin</p>
              <p className="text-xs text-slate-400">Welcome back, {adminName.split(' ')[0]}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="text-xs text-slate-600">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

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
          <div className="border-b border-slate-200 px-6 flex">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors -mb-px ${
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
              <div className="divide-y divide-slate-100">
                {applications.map(app => (
                  <div key={app.id}>
                    <div className="px-6 py-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {app.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900 text-sm">{app.full_name}</span>
                          <span className="text-xs text-slate-400">{app.email}</span>
                          {app.city && (
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{app.city}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-500">
                            {app.years_experience}y exp · {app.license_number}
                          </span>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                          <InfoField label="Email" value={app.email} />
                          <InfoField label="Phone" value={app.phone} />
                          <InfoField label="City" value={app.city} />
                          <InfoField label="License number" value={app.license_number} />
                          <InfoField label="License body" value={app.license_body} />
                          <InfoField label="Years experience" value={String(app.years_experience)} />
                          <InfoField label="Education" value={app.education} />
                          <div>
                            <p className="text-xs text-slate-400">Languages</p>
                            <p className="text-sm text-slate-700 font-medium mt-0.5">{app.languages.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Specializations</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.specializations.map(s => (
                                <span key={s} className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full capitalize">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-xs text-slate-400">Bio</p>
                            <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed">{app.bio}</p>
                          </div>
                          {app.why_zenspace && (
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-xs text-slate-400">Why ZenSpace</p>
                              <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed">{app.why_zenspace}</p>
                            </div>
                          )}
                        </div>

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
                      <div className="px-6 pb-5 pt-1 bg-slate-50 border-t border-slate-100">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                          <InfoField label="Gender" value={client.clientProfile?.gender} />
                          <InfoField label="Previous therapy" value={client.clientProfile?.previous_therapy ? 'Yes' : 'No'} />
                          <InfoField label="Session preference" value={client.clientProfile?.preferred_session_type} />
                          <InfoField
                            label="Therapist preference"
                            value={client.clientProfile?.preferred_therapist_gender || 'No preference'}
                          />
                          {client.clientProfile?.therapy_goals && (
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-xs text-slate-400">Therapy goals</p>
                              <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed">
                                {client.clientProfile.therapy_goals}
                              </p>
                            </div>
                          )}
                        </div>
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
                {activeMatches.map(match => (
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
                        {match.subscription && <StatusPill status={match.subscription.status} />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Matched {formatDate(match.started_at ?? match.created_at)}
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
                      End match
                    </button>
                  </div>
                ))}
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

        </div>
      </main>

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
