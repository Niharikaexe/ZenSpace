'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PLANS, type PlanKey, type PlanCategory } from '@/lib/plans'

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  userName: string
  userEmail: string
  category?: PlanCategory
  onSuccess?: () => void
}

export function SubscriptionPlans({ userName, userEmail, category = 'individual', onSuccess }: Props) {
  const router = useRouter()

  // Four plan keys for this category in fixed order:
  // [Essentials weekly, Essentials monthly, Premium weekly, Premium monthly].
  const planKeys = useMemo<PlanKey[]>(() => {
    return category === 'couples'
      ? ['couples_basic_weekly', 'couples_basic_monthly', 'couples_premium_weekly', 'couples_premium_monthly']
      : ['basic_weekly', 'basic_monthly', 'premium_weekly', 'premium_monthly']
  }, [category])

  // Tier-by-cadence matrix
  const planMatrix = useMemo(() => ({
    weekly:  { Essentials: planKeys[0], Premium: planKeys[2] },
    monthly: { Essentials: planKeys[1], Premium: planKeys[3] },
  }), [planKeys]) as Record<'weekly' | 'monthly', Record<'Essentials' | 'Premium', PlanKey>>

  const [cadence, setCadence] = useState<'weekly' | 'monthly'>('monthly')
  const [tier, setTier] = useState<'Essentials' | 'Premium'>('Essentials')
  const selectedKey: PlanKey = planMatrix[cadence][tier]
  const selected = PLANS[selectedKey]

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRazorpay()
  }, [])

  async function handleSubscribe() {
    setIsLoading(true)
    setError(null)

    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        setError('Could not load payment gateway. Please check your connection.')
        return
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedKey }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to initiate payment. Please try again.')
        return
      }

      const { order_id, amount, currency, key } = await res.json()

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: 'MindCanopy',
        description: `${PLANS[selectedKey].name} — ${PLANS[selectedKey].cadence}`,
        order_id,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#0d9488' },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
        handler: async (response) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedKey,
            }),
          })

          if (verifyRes.ok) {
            onSuccess?.()
            router.refresh()
          } else {
            setError('Payment received but verification failed. Contact support.')
            setIsLoading(false)
          }
        },
      })

      rzp.open()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[subscription-plans/checkout-throw]', {
        planKey: selectedKey,
        err: err instanceof Error ? err.message : String(err),
      })
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const tiers: Array<'Essentials' | 'Premium'> = ['Essentials', 'Premium']

  return (
    <div className="space-y-4">
      {/* Cadence toggle */}
      <div className="inline-flex w-full sm:w-auto bg-slate-100 rounded-full p-1">
        {(['weekly', 'monthly'] as const).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCadence(c)}
            className={cn(
              'flex-1 sm:flex-none sm:px-6 py-2 rounded-full text-xs font-bold transition-all capitalize',
              cadence === c
                ? 'bg-white text-[#233551] shadow-sm'
                : 'text-[#233551]/50 hover:text-[#233551]'
            )}
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {c}
            {c === 'monthly' && (
              <span className="ml-1.5 text-[10px] text-[#3D8A80] font-bold">Save more</span>
            )}
          </button>
        ))}
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiers.map(t => {
          const key = planMatrix[cadence][t]
          const plan = PLANS[key]
          const isSelected = tier === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                'relative text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EC0B7]',
                isSelected
                  ? 'border-[#7EC0B7] bg-[#7EC0B7]/8'
                  : 'border-slate-200 bg-white hover:border-[#7EC0B7]/50'
              )}
            >
              {plan.highlight && cadence === 'monthly' && (
                <Badge className="absolute top-3 right-3 bg-[#233551] text-white text-xs">
                  Best Value
                </Badge>
              )}
              <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-wider">{t}</p>
              <p className="mt-2">
                <span className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>{plan.price}</span>
                <span className="text-[#233551]/50 text-sm ml-1">/ {plan.per}</span>
              </p>
              <p className="text-xs text-[#233551]/50 mt-1">{plan.tagline}</p>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        className="w-full bg-[#233551] hover:bg-[#2d4568] text-white py-5 text-base font-bold"
        style={{ fontFamily: 'var(--font-lato)' }}
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? 'Opening payment...' : `Subscribe — ${selected.price} / ${selected.per}`}
      </Button>

      <p className="text-xs text-center text-[#233551]/35">
        Secure payments via Razorpay · Subscription is non-refundable
      </p>
    </div>
  )
}
