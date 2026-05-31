'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { PLANS, getPlanKey, type PlanCategory } from '@/lib/plans'

interface CategoryPricingProps {
  /** Which plan family to show — 'individual' (also used for teens) or 'couples'. */
  category: PlanCategory
  /** Where the card CTAs send the user (the matching questionnaire route). */
  ctaHref: string
  /** Optional heading override. */
  heading?: string
  subheading?: string
}

export function CategoryPricing({
  category,
  ctaHref,
  heading = 'What you get on each plan.',
  subheading = "Start with a free intro chat. Plans appear in your dashboard after you're matched. Switch therapists anytime, cancel whenever.",
}: CategoryPricingProps) {
  // Cadence is hidden from the visitor on this section (prices live in-app).
  // We show the weekly variants here so the feature copy stays per-week,
  // which reads as the natural unit of regular therapy.
  const basic = PLANS[getPlanKey(category, 'basic', 'weekly')]
  const premium = PLANS[getPlanKey(category, 'premium', 'weekly')]

  const cards = [
    {
      key: 'basic',
      name: basic.name,
      tagline: basic.tagline,
      features: basic.features,
      featured: false,
      badge: null as string | null,
      startsFrom: category === 'individual' ? '₹799' : null,
    },
    {
      key: 'premium',
      name: premium.name,
      tagline: premium.tagline,
      features: premium.features,
      featured: true,
      badge: 'Most popular',
      startsFrom: category === 'individual' ? '₹2,999' : null,
    },
  ]

  return (
    <section id="pricing" className="bg-white py-20 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            Plans
          </span>
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {heading}
          </h2>
          <p className="text-[#233551]/50 text-base leading-relaxed">{subheading}</p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
          {cards.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-3xl p-8 flex flex-col relative overflow-hidden ${
                plan.featured
                  ? 'bg-[#233551] shadow-2xl shadow-[#233551]/25'
                  : 'bg-white border border-slate-100 shadow-md shadow-[#233551]/6'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#7EC0B7]/10 pointer-events-none" />
              )}

              {plan.badge && (
                <span
                  className={`self-start inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 ${
                    plan.featured ? 'bg-[#7EC0B7]/20 text-[#7EC0B7]' : 'bg-[#FFF0E8] text-[#C8683A]'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${plan.featured ? 'bg-[#7EC0B7]' : 'bg-[#E8926A]'}`} />
                  {plan.badge}
                </span>
              )}

              <h3
                className={`text-lg font-black mb-1 ${plan.featured ? 'text-white' : 'text-[#233551]'}`}
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {plan.name}
              </h3>
              <p className={`text-xs mb-4 ${plan.featured ? 'text-white/55' : 'text-[#233551]/45'}`}>
                {plan.tagline}
              </p>

              {plan.startsFrom && (
                <p className={`text-sm font-bold mb-6 ${plan.featured ? 'text-[#7EC0B7]' : 'text-[#3D8A80]'}`}>
                  Starts from{' '}
                  <span
                    className={`text-xl font-black ${plan.featured ? 'text-white' : 'text-[#233551]'}`}
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {plan.startsFrom}
                  </span>
                </p>
              )}

              <div className={`h-px mb-6 ${plan.featured ? 'bg-white/10' : 'bg-slate-100'}`} />

              <ul className="space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.featured ? 'bg-[#7EC0B7]/20' : 'bg-[#7EC0B7]/15'
                      }`}
                    >
                      <Check size={10} className="text-[#7EC0B7]" strokeWidth={3} />
                    </span>
                    <span className={`text-sm leading-snug ${plan.featured ? 'text-white/70' : 'text-[#233551]/60'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={ctaHref}
                className={`mt-8 w-full py-3.5 rounded-full text-sm font-black text-center transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-[#7EC0B7] text-[#233551] hover:bg-[#8DCFC6] shadow-lg shadow-[#7EC0B7]/25'
                    : 'bg-[#233551] text-white hover:bg-[#2d4568] shadow-md shadow-[#233551]/15'
                }`}
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#233551]/35 mt-8">
          All plans include a free intro chat before any payment. No credit card needed to get matched.
        </p>
      </div>
    </section>
  )
}
