'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PLANS, getPlanKey, type PlanKey, type PlanCadence, type PlanCategory } from '@/lib/plans'

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  userName: string
  userEmail: string
  activeSubscription: { plan: string; status: string; current_period_end: string | null } | null
  therapyType: string | null  // 'individual' | 'couples' | 'teen' | null
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#3D8A80] flex-shrink-0 mt-0.5">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Toggle({ options, value, onChange }: {
  options: { key: string; label: string; badge?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="inline-flex bg-slate-100 rounded-full p-1 gap-1">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5',
            value === opt.key
              ? 'bg-[#233551] text-white shadow-sm'
              : 'text-[#233551]/50 hover:text-[#233551]'
          )}
        >
          {opt.label}
          {opt.badge && (
            <span className={cn(
              'text-xs font-bold',
              value === opt.key ? 'text-[#7EC0B7]' : 'text-[#3D8A80]'
            )}>
              {opt.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function PlanCard({
  planKey,
  selected,
  onSelect,
}: {
  planKey: PlanKey
  selected: boolean
  onSelect: () => void
}) {
  const plan = PLANS[planKey]
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative text-left rounded-3xl border-2 p-6 transition-all w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EC0B7] bg-white',
        selected ? 'border-[#233551] shadow-md' : 'border-slate-200 hover:border-[#7EC0B7]/60'
      )}
    >
      {plan.highlight && (
        <span className="absolute top-4 right-4 text-xs font-bold text-white bg-[#E8926A] px-2.5 py-0.5 rounded-full">
          Popular
        </span>
      )}
      {selected && (
        <span className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#233551] flex items-center justify-center">
          <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <div className="mt-4">
        <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest mb-1">{plan.name}</p>
        <p className="text-xs text-[#233551]/45 mb-3">{plan.tagline}</p>
        <div className="mb-5">
          <span className="text-3xl font-black text-[#233551]">{plan.price}</span>
          <span className="text-sm text-[#233551]/45 ml-1">/ {plan.per}</span>
        </div>
        <div className="space-y-2">
          {plan.features.map(f => (
            <div key={f} className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-xs text-[#233551]/65 leading-relaxed">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}

export default function SubscribeCheckout({ userName, userEmail, activeSubscription, therapyType }: Props) {
  const router = useRouter()

  // Determine locked category from questionnaire — couples users only see couples plans,
  // individual/teen users only see individual plans. null = unknown (show individual).
  const lockedCategory: PlanCategory = therapyType === 'couples' ? 'couples' : 'individual'

  const [category] = useState<PlanCategory>(lockedCategory)
  const [cadence, setCadence] = useState<PlanCadence>('weekly')
  const [tier, setTier] = useState<'basic' | 'premium'>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlanKey: PlanKey = getPlanKey(category, tier, cadence)
  const selectedPlan = PLANS[selectedPlanKey]
  const isAlreadySubscribed = !!activeSubscription

  async function handleSubscribe() {
    setError(null)
    setLoading(true)

    try {
      const createRes = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlanKey }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        setError(createData.error ?? 'Failed to create subscription.')
        setLoading(false)
        return
      }

      const { subscription_id, key } = createData

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Could not load the payment gateway. Check your connection and try again.')
        setLoading(false)
        return
      }

      const rzp = new (window as any).Razorpay({
        key,
        subscription_id,
        name: 'ZenSpace',
        description: `${selectedPlan.name} — ${selectedPlan.price}/${selectedPlan.per}`,
        theme: { color: '#233551' },
        prefill: { name: userName, email: userEmail },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlanKey,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) {
              setError(verifyData.error ?? 'Payment verification failed. Contact support.')
              setLoading(false)
              return
            }
            router.push('/dashboard?subscribed=1')
          } catch {
            setError('Something went wrong after payment. Contact support with payment ID: ' + response.razorpay_payment_id)
            setLoading(false)
          }
        },
      })

      rzp.on('payment.failed', function (response: any) {
        setError(response.error?.description ?? 'Payment failed. Please try again.')
        setLoading(false)
      })

      rzp.open()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard">
            <span className="font-black text-xl tracking-tight text-[#233551]">ZenSpace</span>
          </Link>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-slate-300">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#233551]/50">Choose a plan</span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-12">

        {/* Already subscribed banner */}
        {isAlreadySubscribed && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-800">You have an active subscription</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Plan: <span className="font-semibold capitalize">{activeSubscription!.plan.replace(/_/g, ' ')}</span>
                {activeSubscription!.current_period_end && (
                  <> · Renews {new Date(activeSubscription!.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex-shrink-0 text-xs font-bold text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#233551] mb-2">
            Start when you&apos;re ready.
          </h1>
          <p className="text-[#233551]/55 max-w-sm mx-auto text-sm leading-relaxed">
            {category === 'couples'
              ? 'Couples therapy, online. One session a week. Both of you, from wherever you are.'
              : 'A therapist, a messaging channel, and a weekly session. No clinics. No waiting rooms.'}
          </p>
          <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-[#233551]/8 text-[#233551]/60 capitalize">
            {category === 'couples' ? 'Couples plans' : 'Individual plans'}
          </span>
        </div>

        {/* Billing cadence toggle */}
        <div className="flex justify-center mb-8">
          <Toggle
            value={cadence}
            onChange={v => setCadence(v as PlanCadence)}
            options={[
              { key: 'weekly', label: 'Weekly' },
              { key: 'monthly', label: 'Monthly', badge: 'Save ~10%' },
            ]}
          />
        </div>

        {/* Plan cards — Basic and Premium for the selected category + cadence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <PlanCard
            planKey={getPlanKey(category, 'basic', cadence)}
            selected={tier === 'basic'}
            onSelect={() => setTier('basic')}
          />
          <PlanCard
            planKey={getPlanKey(category, 'premium', cadence)}
            selected={tier === 'premium'}
            onSelect={() => setTier('premium')}
          />
        </div>

        {/* CTA box */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm font-black text-[#233551]">
                {selectedPlan.name} — {selectedPlan.price}/{selectedPlan.per}
              </p>
              <p className="text-xs text-[#233551]/45 mt-0.5">
                Billed {cadence} · Non-refundable · Cancel anytime
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || isAlreadySubscribed}
            className={cn(
              'w-full font-bold py-3.5 rounded-full text-sm transition-colors',
              isAlreadySubscribed
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : loading
                ? 'bg-[#233551]/70 text-white cursor-wait'
                : 'bg-[#233551] hover:bg-[#2d4568] text-white'
            )}
          >
            {loading
              ? 'Opening checkout…'
              : isAlreadySubscribed
              ? 'Already subscribed'
              : `Subscribe — ${selectedPlan.price}/${selectedPlan.per} →`}
          </button>

          <p className="text-center text-xs text-[#233551]/30 mt-3">
            Secure payments via Razorpay · Non-refundable
          </p>
        </div>

        <p className="text-center text-xs text-[#233551]/30 mt-6">
          Questions?{' '}
          <Link href="/dashboard/contact" className="text-[#3D8A80] hover:underline">Contact us</Link>
          {' '}or{' '}
          <Link href="/dashboard/faq" className="text-[#3D8A80] hover:underline">read the FAQ</Link>
        </p>
      </main>
    </div>
  )
}
