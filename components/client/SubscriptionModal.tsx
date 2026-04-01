'use client'

import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
  trigger?: 'chat' | 'session'
  therapyType?: string | null // 'individual' | 'couples' | 'teen' | null
}

const INDIVIDUAL_PLANS = [
  {
    name: 'Basic',
    price: '₹1,799',
    per: 'week',
    features: ['1 video session (50 min)', 'Unlimited async text messaging'],
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹4,499',
    per: 'week',
    features: ['Priority text response', 'Foreign therapist access'],
    highlight: true,
  },
]

const COUPLES_PLANS = [
  {
    name: 'Couples Basic',
    price: '₹3,200',
    per: 'week',
    features: ['1 couples session (60 min)', 'Text for both partners'],
    highlight: false,
  },
  {
    name: 'Couples Premium',
    price: '₹7,499',
    per: 'week',
    features: ['Priority text response', 'Foreign therapist access'],
    highlight: true,
  },
]

export default function SubscriptionModal({ onClose, trigger = 'chat', therapyType }: Props) {
  const router = useRouter()

  const plans = therapyType === 'couples' ? COUPLES_PLANS : INDIVIDUAL_PLANS

  const heading =
    trigger === 'session'
      ? 'Subscribe to book a session'
      : 'Subscribe to send messages'

  const subtext =
    trigger === 'session'
      ? 'Sessions are included in all ZenSpace plans. Pick one that works for you.'
      : 'Text your therapist anytime — between sessions, after a hard day, whenever.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#233551] px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">ZenSpace Plans</p>
          <h2 className="text-white text-xl font-black leading-snug">{heading}</h2>
          <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{subtext}</p>
        </div>

        {/* Plans */}
        <div className="px-6 py-5 space-y-3">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between gap-4 ${
                plan.highlight
                  ? 'border-[#7EC0B7] bg-[#7EC0B7]/5'
                  : 'border-slate-200'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-[#233551]">{plan.name}</p>
                  {plan.highlight && (
                    <span className="text-[10px] font-black bg-[#7EC0B7] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#233551]/45 leading-relaxed">
                  {plan.features.join(' · ')}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-black text-[#233551]">{plan.price}</p>
                <p className="text-[11px] text-[#233551]/40">/{plan.per}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={() => router.push('/dashboard/subscribe')}
            className="w-full py-3.5 bg-[#233551] text-white font-black text-sm rounded-2xl hover:bg-[#1e2d47] transition-colors"
          >
            See all plans and subscribe →
          </button>
          <p className="text-center text-xs text-[#233551]/35 mt-3">
            15-minute intro call is free. No payment required to start.
          </p>
        </div>
      </div>
    </div>
  )
}
