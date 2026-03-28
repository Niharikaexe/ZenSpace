'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PaymentGateModal } from './PaymentGateModal'

interface TherapistInfo {
  fullName: string
  avatarUrl: string | null
  specializations: string[]
  bio: string | null
  approach: string | null
  yearsExperience: number
  languages: string[]
}

interface SubscriptionInfo {
  plan: string
  periodEnd: string | null
}

interface Props {
  userName: string
  userEmail: string
  therapist: TherapistInfo
  matchedSince: string
  subscription: SubscriptionInfo | null
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPeriodEnd(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (d < new Date()) return null
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ACTIONS = [
  {
    id: 'chat',
    label: 'Message',
    sub: 'Send a text to your therapist — right now, or whenever something comes up.',
    href: '/dashboard/chat',
    locked: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#7EC0B7]">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'video',
    label: 'Video session',
    sub: 'Schedule or join a 50-minute video call with your therapist.',
    href: '/dashboard/video',
    locked: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#7EC0B7]">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Session notes',
    sub: 'View notes from your completed sessions.',
    href: '/dashboard/notes',
    locked: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#7EC0B7]">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function MatchedDashboard({ userName, userEmail, therapist, matchedSince, subscription }: Props) {
  const [gateOpen, setGateOpen] = useState(false)
  const [gateAction, setGateAction] = useState('')

  const isSubscribed = !!subscription && !!formatPeriodEnd(subscription.periodEnd)
  const firstName = userName.split(' ')[0]

  function handleAction(action: typeof ACTIONS[number]) {
    if (action.locked && !isSubscribed) {
      setGateAction(action.label.toLowerCase())
      setGateOpen(true)
      return
    }
    window.location.href = action.href
  }

  return (
    <div>
      {/* Welcome line */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Welcome back, {firstName}.
        </h1>
        {!isSubscribed && (
          <p className="text-sm text-[#233551]/50 mt-1">
            Your therapist is ready.{' '}
            <Link href="/dashboard/subscribe" className="text-[#3D8A80] font-semibold hover:underline">
              Subscribe to start →
            </Link>
          </p>
        )}
      </div>

      {/* Subscription status banner */}
      {isSubscribed && subscription && (
        <div className="bg-[#7EC0B7]/12 border border-[#7EC0B7]/25 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#3D8A80] flex-shrink-0" />
          <p className="text-sm text-[#233551]">
            <span className="font-semibold capitalize">{subscription.plan}</span> subscription active
            {subscription.periodEnd && formatPeriodEnd(subscription.periodEnd) && (
              <span className="text-[#233551]/50"> · renews {formatPeriodEnd(subscription.periodEnd)}</span>
            )}
          </p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT: Therapist panel */}
        <aside className="lg:w-72 xl:w-80 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sticky top-20">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
              <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">Your Therapist</span>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              {therapist.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={therapist.avatarUrl}
                  alt={therapist.fullName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#7EC0B7]/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#233551] text-white font-black text-2xl flex items-center justify-center border-4 border-[#7EC0B7]/20" style={{ fontFamily: 'var(--font-lato)' }}>
                  {initials(therapist.fullName)}
                </div>
              )}
              <h2 className="text-base font-black text-[#233551] mt-3" style={{ fontFamily: 'var(--font-lato)' }}>
                {therapist.fullName}
              </h2>
              {therapist.approach && (
                <p className="text-xs text-[#233551]/50 mt-0.5">{therapist.approach}</p>
              )}
              <p className="text-xs text-[#233551]/40 mt-0.5">{therapist.yearsExperience} years experience</p>
            </div>

            {/* Bio */}
            {therapist.bio && (
              <p className="text-xs text-[#233551]/60 leading-relaxed mb-4 border-t border-slate-100 pt-4">
                {therapist.bio}
              </p>
            )}

            {/* Specializations */}
            {therapist.specializations.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#233551]/40 uppercase tracking-wider mb-2">Specializes in</p>
                <div className="flex flex-wrap gap-1.5">
                  {therapist.specializations.map(s => (
                    <span key={s} className="text-xs bg-[#7EC0B7]/15 text-[#3D8A80] px-2.5 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div className="text-xs text-[#233551]/45 border-t border-slate-100 pt-4 space-y-1">
              <p><span className="text-[#233551]/60 font-medium">Languages:</span> {therapist.languages.join(', ')}</p>
              <p><span className="text-[#233551]/60 font-medium">Matched:</span> {formatDate(matchedSince)}</p>
            </div>

            {/* Change therapist link */}
            <Link
              href="/dashboard/change-therapist"
              className="mt-4 block text-center text-xs text-[#233551]/35 hover:text-[#3D8A80] transition-colors"
            >
              Request a different therapist
            </Link>
          </div>
        </aside>

        {/* RIGHT: Main area */}
        <main className="flex-1 min-w-0">
          <h2 className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Your sessions</h2>

          <div className="space-y-3">
            {ACTIONS.map(action => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action)}
                className="w-full text-left bg-white border border-slate-100 rounded-2xl p-5 hover:border-[#7EC0B7]/40 hover:shadow-sm transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EC0B7]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#7EC0B7]/12 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7EC0B7]/20 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                        {action.label}
                      </p>
                      <p className="text-xs text-[#233551]/50 mt-0.5 leading-relaxed">{action.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    {action.locked && !isSubscribed && (
                      <span className="text-xs font-semibold text-[#E8926A] bg-[#E8926A]/10 px-2.5 py-1 rounded-full">
                        Subscribe
                      </span>
                    )}
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#233551]/25 group-hover:text-[#7EC0B7] group-hover:translate-x-0.5 transition-all">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Unsubscribed CTA */}
          {!isSubscribed && (
            <div className="mt-6 bg-[#233551] rounded-2xl p-5 text-white">
              <p className="text-sm font-black mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
                Unlock messaging and video sessions
              </p>
              <p className="text-sm text-white/55 mb-4 leading-relaxed">
                Your therapist is waiting. Subscribe to start your first session.
              </p>
              <Link
                href="/dashboard/subscribe"
                className="inline-flex items-center gap-1.5 bg-[#7EC0B7] text-[#233551] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#6db0a7] transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Choose a plan →
              </Link>
            </div>
          )}
        </main>
      </div>

      <PaymentGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        userName={userName}
        userEmail={userEmail}
        action={gateAction}
      />
    </div>
  )
}
