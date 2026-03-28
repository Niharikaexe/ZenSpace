'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

// NOTE: Pricing and plan details to be updated when finalized with Niharika
type Tier = 'essentials' | 'premium'
type Cadence = 'weekly' | 'monthly'

const TIERS: Record<Tier, {
  name: string
  tagline: string
  weekly: { price: string; billing: string }
  monthly: { price: string; billing: string; saving: string }
  features: string[]
  notIncluded: string[]
}> = {
  essentials: {
    name: 'Essentials',
    tagline: 'Everything you need to start',
    weekly: { price: '₹2,999', billing: 'per week' },
    monthly: { price: '₹9,999', billing: 'per month', saving: 'Save ~17%' },
    features: [
      '1 video session per week (50 min)',
      'Unlimited async text messaging',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Globally trained therapists',
      'Complete privacy — no one in your network knows',
    ],
    notIncluded: [
      'Priority message response',
      'Foreign therapist access',
    ],
  },
  premium: {
    name: 'Premium',
    tagline: 'For those who want more',
    weekly: { price: '₹4,499', billing: 'per week' },
    monthly: { price: '₹14,999', billing: 'per month', saving: 'Save ~17%' },
    features: [
      '1 video session per week (50 min)',
      'Unlimited async text messaging',
      'Priority message response',
      'Foreign therapist access',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Complete privacy — no one in your network knows',
    ],
    notIncluded: [],
  },
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#3D8A80] flex-shrink-0">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-slate-300 flex-shrink-0">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function SubscribePage() {
  const [cadence, setCadence] = useState<Cadence>('monthly')
  const [selectedTier, setSelectedTier] = useState<Tier>('essentials')

  // Placeholder subscribe handler — will wire to Razorpay when plans are finalized
  function handleSubscribe() {
    alert(`Subscribe to ${TIERS[selectedTier].name} (${cadence}) — Razorpay integration coming soon.`)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav — static props since this is a client page; userName will be injected via layout later */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard">
            <span className="font-black text-xl tracking-tight text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
              ZenSpace
            </span>
          </Link>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-slate-300">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#233551]/50">Choose a plan</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
            Start when you&apos;re ready.
          </h1>
          <p className="text-[#233551]/55 max-w-md mx-auto text-sm leading-relaxed">
            One subscription gets you a therapist, a messaging channel, and a weekly video session. No clinics. No waiting rooms.
          </p>
        </div>

        {/* Weekly / Monthly toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-full p-1 gap-1">
            {(['weekly', 'monthly'] as Cadence[]).map(c => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-semibold transition-all',
                  cadence === c
                    ? 'bg-[#233551] text-white shadow-sm'
                    : 'text-[#233551]/50 hover:text-[#233551]'
                )}
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {c === 'weekly' ? 'Weekly' : 'Monthly'}
                {c === 'monthly' && <span className="ml-1.5 text-xs text-[#7EC0B7] font-bold">Save 17%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {(Object.entries(TIERS) as [Tier, typeof TIERS[Tier]][]).map(([key, tier]) => {
            const pricing = cadence === 'weekly' ? tier.weekly : tier.monthly
            const isSelected = selectedTier === key
            const isPremium = key === 'premium'

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTier(key)}
                className={cn(
                  'relative text-left rounded-3xl border-2 p-6 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7EC0B7]',
                  isSelected
                    ? 'border-[#233551] bg-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#7EC0B7]/50'
                )}
              >
                {isPremium && (
                  <span className="absolute top-4 right-4 text-xs font-bold text-white bg-[#E8926A] px-2.5 py-0.5 rounded-full">
                    Premium
                  </span>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <span className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#233551] flex items-center justify-center">
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}

                <div className="mt-4">
                  <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest mb-1">{tier.name}</p>
                  <p className="text-xs text-[#233551]/45 mb-3">{tier.tagline}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                      {pricing.price}
                    </span>
                    <span className="text-sm text-[#233551]/45 ml-1">{pricing.billing}</span>
                    {cadence === 'monthly' && 'saving' in pricing && (
                      <span className="ml-2 text-xs font-bold text-[#3D8A80]">{(pricing as { saving: string }).saving}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <span className="mt-0.5"><CheckIcon /></span>
                        <span className="text-xs text-[#233551]/65 leading-relaxed">{f}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <span className="mt-0.5"><XIcon /></span>
                        <span className="text-xs text-slate-300 leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                {TIERS[selectedTier].name} — {cadence === 'weekly' ? TIERS[selectedTier].weekly.price + '/week' : TIERS[selectedTier].monthly.price + '/month'}
              </p>
              <p className="text-xs text-[#233551]/45 mt-0.5">
                {cadence === 'monthly'
                  ? 'Billed monthly · Cancel anytime · Non-refundable'
                  : 'Billed weekly · Cancel anytime · Non-refundable'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full bg-[#233551] hover:bg-[#2d4568] text-white font-bold py-3.5 rounded-full text-sm transition-colors"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Subscribe with Razorpay →
          </button>

          <p className="text-center text-xs text-[#233551]/30 mt-3">
            Secure payments via Razorpay · Your subscription is non-refundable
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
