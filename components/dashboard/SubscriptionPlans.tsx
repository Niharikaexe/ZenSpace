'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Plan = 'weekly' | 'monthly'

const PLANS: Record<Plan, {
  label: string
  display: string
  subtext: string
  description: string
  badge?: string
}> = {
  weekly: {
    label: 'Weekly',
    display: '₹1,200',
    subtext: '/ week',
    description: 'Flexible — cancel anytime',
  },
  monthly: {
    label: 'Monthly',
    display: '₹3,999',
    subtext: '/ month',
    description: 'Save 17% vs weekly',
    badge: 'Best Value',
  },
}

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
  onSuccess?: () => void
}

export function SubscriptionPlans({ userName, userEmail, onSuccess }: Props) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly')
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

      // Create order server-side
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to initiate payment. Please try again.')
        return
      }

      const { order_id, amount, currency, key } = await res.json()

      // Open Razorpay checkout popup
      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: 'ZenSpace',
        description: `${PLANS[selectedPlan].label} Therapy Subscription`,
        order_id,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#0d9488' },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
        handler: async (response) => {
          // Verify payment server-side
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
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
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, plan]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedPlan(key)}
            className={cn(
              'relative text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EC0B7]',
              selectedPlan === key
                ? 'border-[#7EC0B7] bg-[#7EC0B7]/8'
                : 'border-slate-200 bg-white hover:border-[#7EC0B7]/50'
            )}
          >
            {plan.badge && (
              <Badge className="absolute top-3 right-3 bg-[#233551] text-white text-xs">
                {plan.badge}
              </Badge>
            )}
            <p className="text-sm font-medium text-[#233551]/50">{plan.label}</p>
            <p className="mt-1">
              <span className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>{plan.display}</span>
              <span className="text-[#233551]/50 text-sm ml-1">{plan.subtext}</span>
            </p>
            <p className="text-xs text-[#233551]/50 mt-1">{plan.description}</p>
          </button>
        ))}
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
        {isLoading ? 'Opening payment...' : `Subscribe — ${PLANS[selectedPlan].display}`}
      </Button>

      <p className="text-xs text-center text-[#233551]/35">
        Secure payments via Razorpay · Subscription is non-refundable
      </p>
    </div>
  )
}
