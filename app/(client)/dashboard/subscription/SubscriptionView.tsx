'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ClientNav from '@/components/client/ClientNav'
import { formatInr } from '@/lib/plans'


// Cashfree v3 JS SDK loader.
function loadCashfreeScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && (window as any).Cashfree) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  userName: string
  isMatched: boolean
  therapistName: string | null
  perSessionInr: number
  bundleInr: number
  bundleSessions: number
  discountPct: number
  activeCreditsRemaining: number | null
  activeCreditsTotal: number | null
  paymentsEnabled: boolean
}

export default function SubscriptionView({
  userName,
  isMatched,
  therapistName,
  perSessionInr,
  bundleInr,
  bundleSessions,
  discountPct,
  activeCreditsRemaining,
  activeCreditsTotal,
  paymentsEnabled,
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'opening' | 'confirming'>('idle')
  const [error, setError] = useState<string | null>(null)
  const busy = phase !== 'idle'

  const hasActiveBundle = activeCreditsRemaining != null && activeCreditsRemaining > 0
  // Pay-as-you-go cost of the same number of sessions, for the savings callout.
  const payAsYouGoTotal = perSessionInr * bundleSessions
  const savings = payAsYouGoTotal - bundleInr

  async function handleBuyBundle() {
    setError(null)
    if (!paymentsEnabled) {
      setError('Payments aren’t configured yet. Please contact support.')
      return
    }
    setPhase('opening')
    try {
      const orderRes = await fetch('/api/payment/bundle-order', { method: 'POST' })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setError(orderData.error ?? 'Couldn’t start the payment. Please try again.')
        setPhase('idle')
        return
      }

      const loaded = await loadCashfreeScript()
      if (!loaded) {
        setError('Could not load the payment gateway. Check your connection and try again.')
        setPhase('idle')
        return
      }

      const { order_id, payment_session_id, mode, bundleId } = orderData

      const cashfree = (window as any).Cashfree({ mode: mode === 'sandbox' ? 'sandbox' : 'production' })
      const result = await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_modal' })

      if (result?.error) {
        setError(result.error.message ?? 'Payment was cancelled or didn’t complete.')
        setPhase('idle')
        return
      }

      setPhase('confirming')
      const verifyRes = await fetch('/api/payment/bundle-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, bundleId }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError(verifyData.error ?? `Payment went through but we couldn’t activate your bundle. Contact support with order ID: ${order_id}`)
        setPhase('idle')
        return
      }
      router.refresh()
      setPhase('idle')
    } catch {
      setError('Something went wrong. Please try again.')
      setPhase('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF5F2]">
      <ClientNav userName={userName} isMatched={isMatched} />

      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
          Your subscription
        </h1>
        <p className="text-sm text-[#233551]/55 mb-7 leading-relaxed">
          Pay as you go, one session at a time — or save with a monthly bundle.
        </p>

        {!isMatched ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center">
            <p className="text-sm font-bold text-[#233551] mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>
              Choose your therapist first
            </p>
            <p className="text-sm text-[#233551]/55 leading-relaxed mb-5">
              Once you’ve started with a therapist, you can pay per session or pick up a monthly bundle here.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#233551] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#2d4568] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active bundle status */}
            {hasActiveBundle && (
              <div className="bg-[#7EC0B7]/12 border border-[#7EC0B7]/25 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-wider mb-1">Your monthly bundle</p>
                <p className="text-sm text-[#233551]">
                  <span className="font-black text-lg">{activeCreditsRemaining}</span>
                  <span className="text-[#233551]/55"> of {activeCreditsTotal} sessions remaining</span>
                </p>
                <p className="text-xs text-[#233551]/45 mt-1.5 leading-relaxed">
                  Your next bookings with {therapistName} use these credits — no payment needed at checkout.
                </p>
              </div>
            )}

            {/* Pay-as-you-go */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Pay as you go</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                  {formatInr(perSessionInr)}
                </span>
                <span className="text-sm text-[#233551]/45">/ session</span>
              </div>
              <p className="text-xs text-[#233551]/45 mt-1.5 leading-relaxed">
                Book and pay one session at a time from your sessions page. No commitment.
              </p>
            </div>

            {/* Monthly bundle */}
            <div className="relative bg-white border-2 border-[#7EC0B7] rounded-2xl p-5 overflow-hidden">
              <span className="absolute top-0 right-0 text-[10px] font-bold text-white bg-[#E8926A] px-3 py-1 rounded-bl-xl">
                Save {discountPct}%
              </span>
              <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-wider mb-2">Monthly bundle</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                  {formatInr(bundleInr)}
                </span>
                <span className="text-sm text-[#233551]/45">/ {bundleSessions} sessions</span>
              </div>
              <p className="text-xs text-[#233551]/45 mt-1.5">
                That’s {formatInr(Math.round(bundleInr / bundleSessions))} per session.{' '}
                {savings > 0 && <span className="text-[#3D8A80] font-semibold">You save {formatInr(savings)}.</span>}
              </p>

              <ul className="mt-4 space-y-2">
                {[
                  `${bundleSessions} video sessions (50 min each) with ${therapistName}`,
                  'Credits applied automatically when you book — no checkout each time',
                  'Unlimited chat with your therapist between sessions',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-[#233551]/70 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                onClick={handleBuyBundle}
                disabled={busy || hasActiveBundle}
                className="mt-5 w-full py-3.5 bg-[#233551] text-white font-black text-sm rounded-2xl hover:bg-[#1e2d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasActiveBundle
                  ? 'You already have an active bundle'
                  : phase === 'opening'
                  ? 'Opening checkout…'
                  : phase === 'confirming'
                  ? 'Activating…'
                  : `Get the monthly bundle · ${formatInr(bundleInr)}`}
              </button>
              <p className="text-center text-xs text-[#233551]/35 mt-3">
                Secure payment via Cashfree · Non-refundable
              </p>
            </div>

            <Link
              href="/dashboard/sessions"
              className="block text-center text-sm font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
            >
              Go to your sessions →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
