'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPeriodEnd(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  if (d < now) return null
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MatchedDashboard({ userName, userEmail, therapist, matchedSince, subscription }: Props) {
  const [gateOpen, setGateOpen] = useState(false)
  const [gateAction, setGateAction] = useState<string>('')

  const isSubscribed = !!subscription && !!formatPeriodEnd(subscription.periodEnd)

  function handleGatedAction(action: string, href: string) {
    if (!isSubscribed) {
      setGateAction(action)
      setGateOpen(true)
      return
    }
    window.location.href = href
  }

  return (
    <div className="space-y-6">
      {/* Subscription status banner */}
      {!isSubscribed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Subscribe to start your sessions</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You&apos;ve been matched! Subscribe to message your therapist and book sessions.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            onClick={() => { setGateAction('access your sessions'); setGateOpen(true) }}
          >
            Subscribe
          </Button>
        </div>
      )}

      {isSubscribed && subscription && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
          <p className="text-sm text-teal-800">
            <span className="font-semibold capitalize">{subscription.plan}</span> subscription active
            {subscription.periodEnd && (
              <span className="text-teal-600 font-normal">
                {' '}· renews {formatPeriodEnd(subscription.periodEnd)}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Therapist profile card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              {therapist.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={therapist.avatarUrl}
                  alt={therapist.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 font-bold text-xl flex items-center justify-center">
                  {initials(therapist.fullName)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{therapist.fullName}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {therapist.yearsExperience} years experience
                    {therapist.approach ? ` · ${therapist.approach}` : ''}
                  </p>
                </div>
                <Badge className="bg-teal-100 text-teal-700 border-0 text-xs shrink-0">
                  Your therapist
                </Badge>
              </div>

              {therapist.bio && (
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{therapist.bio}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {therapist.specializations.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span>Speaks: {therapist.languages.join(', ')}</span>
                <span>·</span>
                <span>Matched since {formatDate(matchedSince)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Your sessions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionCard
            icon="💬"
            title="Message"
            description="Chat with your therapist in real time"
            locked={!isSubscribed}
            onClick={() => handleGatedAction('send a message', '/dashboard/chat')}
          />
          <ActionCard
            icon="📹"
            title="Video session"
            description="Schedule or join a video call"
            locked={!isSubscribed}
            onClick={() => handleGatedAction('schedule a video session', '/dashboard/video')}
          />
          <ActionCard
            icon="📋"
            title="Session notes"
            description="View notes from your sessions"
            locked={false}
            onClick={() => { window.location.href = '/dashboard/notes' }}
          />
        </div>
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

function ActionCard({
  icon,
  title,
  description,
  locked,
  onClick,
}: {
  icon: string
  title: string
  description: string
  locked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      {locked && (
        <span className="absolute top-3 right-3 text-xs text-amber-600 font-medium">🔒</span>
      )}
      <span className="text-2xl">{icon}</span>
      <p className="font-semibold text-slate-800 mt-2 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </button>
  )
}
