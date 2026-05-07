'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardNav } from './DashboardNav'
import { cancelSubscription } from '@/app/actions/subscription'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function planLabel(plan: string) {
  return plan.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export interface SubscriptionData {
  id: string
  plan: string
  status: 'active' | 'cancelled' | 'expired' | 'paused' | 'pending'
  current_period_end: string | null
  current_period_start: string | null
  cancelled_at: string | null
  amount: number
  currency: string
}

interface Props {
  userName: string
  isMatched: boolean
  subscription: SubscriptionData | null
}

export function SubscriptionManager({ userName, isMatched, subscription }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  const isActive = subscription?.status === 'active' && !cancelled
  const isCancelledPending = (subscription?.status === 'cancelled' || cancelled) &&
    !!subscription?.current_period_end &&
    new Date(subscription.current_period_end) > new Date()

  async function handleCancel() {
    setCancelling(true)
    setError(null)
    const result = await cancelSubscription()
    setCancelling(false)
    if (result.error) {
      setError(result.error)
      setConfirming(false)
    } else {
      setCancelled(true)
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav userName={userName} isMatched={isMatched} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[#233551]/45 hover:text-[#233551] transition-colors mb-6"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <h1 className="text-2xl font-black text-[#233551] mb-8" style={{ fontFamily: 'var(--font-lato)' }}>
          Subscription
        </h1>

        {/* No subscription state */}
        {!subscription ? (
          <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#233551]/30">
                <path d="M3 10h18M7 15h.01M11 15h2M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#233551] mb-1">No active subscription</p>
            <p className="text-xs text-[#233551]/45 mb-6 leading-relaxed">
              Choose a plan to unlock messaging and video sessions with your therapist.
            </p>
            <Link
              href="/dashboard/subscribe"
              className="inline-flex items-center gap-1.5 bg-[#233551] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#2d4568] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Choose a plan →
            </Link>
          </section>
        ) : (
          <>
            {/* Current plan card */}
            <section className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 shadow-sm">
              <h2 className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-5">
                Current plan
              </h2>

              {/* Cancelled success banner */}
              {cancelled && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">Subscription cancelled</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    You still have access until{' '}
                    {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'your period ends'}.
                    After that, messaging and video sessions will be paused.
                  </p>
                </div>
              )}

              {/* Status + plan name */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-lg font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                    {planLabel(subscription.plan)}
                  </p>
                  <p className="text-sm text-[#233551]/50 mt-0.5">
                    {(subscription.amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    {subscription.plan.includes('weekly') ? ' / week' : ' / month'}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                  isActive ? 'bg-emerald-100 text-emerald-700'
                  : isCancelledPending ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
                }`}>
                  {isActive ? 'Active' : isCancelledPending ? 'Ending' : 'Cancelled'}
                </span>
              </div>

              {/* Billing info */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                {subscription.current_period_start && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#233551]/50">Current period started</span>
                    <span className="text-[#233551] font-medium">{formatDate(subscription.current_period_start)}</span>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#233551]/50">{isActive ? 'Renews on' : 'Access until'}</span>
                    <span className={`font-medium ${isCancelledPending ? 'text-amber-700' : 'text-[#233551]'}`}>
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
                {!isActive && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#233551]/50">Auto-renew</span>
                    <span className="text-red-500 font-medium">Off</span>
                  </div>
                )}
              </div>

              {/* Re-subscribe CTA when cancelled */}
              {(isCancelledPending || (!isActive && !isCancelledPending)) && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    href="/dashboard/subscribe"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3D8A80] hover:underline"
                  >
                    Choose a new plan →
                  </Link>
                </div>
              )}
            </section>

            {/* Upgrade / change plan */}
            {isActive && (
              <section className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-1">
                      Change plan
                    </h2>
                    <p className="text-sm text-[#233551]/50 leading-relaxed">
                      Upgrade to premium or switch billing cadence.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/subscribe"
                    className="flex-shrink-0 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#7EC0B7]/25 transition-colors"
                  >
                    View plans →
                  </Link>
                </div>
              </section>
            )}

            {/* Cancel section */}
            {isActive && (
              <section className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">
                  Cancel subscription
                </h2>

                {!confirming ? (
                  <>
                    <p className="text-sm text-[#233551]/50 mb-4 leading-relaxed">
                      {subscription.current_period_end
                        ? `You'll keep access until ${formatDate(subscription.current_period_end)}. Subscriptions are non-refundable.`
                        : "You'll keep access until the end of your current period. Subscriptions are non-refundable."}
                    </p>
                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      className="border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-5 py-2 rounded-full transition-colors"
                    >
                      Cancel subscription
                    </button>
                  </>
                ) : (
                  <div className="bg-red-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">Are you sure?</p>
                    <p className="text-xs text-red-700 mb-4 leading-relaxed">
                      Your subscription is non-refundable. You&apos;ll still have full access until{' '}
                      {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'the end of your period'}.
                      After that, messaging and video sessions will be paused.
                    </p>
                    {error && (
                      <p className="text-xs text-red-600 bg-red-100 rounded-xl px-4 py-2.5 mb-3">{error}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelling...' : 'Yes, cancel my plan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConfirming(false); setError(null) }}
                        disabled={cancelling}
                        className="text-sm text-[#233551]/50 hover:text-[#233551] font-medium transition-colors disabled:opacity-30"
                      >
                        Keep my subscription
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Payment note */}
        <p className="text-xs text-center text-[#233551]/30 mt-6">
          Payments are processed securely by Razorpay · Subscriptions are non-refundable
        </p>
      </main>
    </div>
  )
}
