"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Essentials",
    price: "₹2,999",
    period: "/week",
    tagline: "Everything you need to begin.",
    features: [
      "1 video session per week (50 min)",
      "Unlimited async text messaging",
      "Free intro chat",
      "Switch therapist anytime",
    ],
    cta: "Get started",
    href: "/questionnaire",
    featured: false,
    badge: null,
  },
  {
    name: "Premium",
    price: "₹4,499",
    period: "/week",
    tagline: "More access. Global expertise.",
    features: [
      "1 video session per week (50 min)",
      "Priority text — faster responses",
      "Foreign-trained therapist access",
      "Session notes (read-only)",
      "Free intro chat",
      "Switch therapist anytime",
    ],
    cta: "Start Premium",
    href: "/questionnaire",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Monthly",
    price: "₹9,999",
    period: "/month",
    tagline: "Commit to the process. Save in it.",
    features: [
      "4 video sessions per month (50 min)",
      "Unlimited async text messaging",
      "Free intro chat",
      "Switch therapist anytime",
      "~17% savings vs weekly",
    ],
    cta: "Choose monthly",
    href: "/questionnaire",
    featured: false,
    badge: "Best value",
  },
]

const PricingPlans = () => {
  return (
    <section id="pricing" className="bg-white relative overflow-hidden pt-20 md:pt-28 pb-24 md:pb-32">

      {/* Top wave from navy (TherapistCards) → white */}
      <div className="absolute top-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path d="M0,0 L1440,0 L1440,40 C1200,68 960,8 720,36 C480,64 240,4 0,40 Z" fill="#233551" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            Pricing
          </span>
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            No surprises.<br />Pay for what you use.
          </h2>
          <p className="text-[#233551]/50 text-base leading-relaxed">
            You&apos;re not locked in. No contracts, no hidden fees. Start with the intro chat — it&apos;s free.
          </p>
        </motion.div>

        {/* ── Plan cards ── */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              className={`flex-1 rounded-3xl p-8 flex flex-col relative overflow-hidden
                ${plan.featured
                  ? "bg-[#233551] shadow-2xl shadow-[#233551]/30 scale-[1.03] z-10"
                  : "bg-white border border-slate-100 shadow-md shadow-[#233551]/6"
                }`}
            >
              {/* Decorative glow — featured card only */}
              {plan.featured && (
                <>
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#7EC0B7]/10 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/4 pointer-events-none" />
                </>
              )}

              {/* Badge */}
              {plan.badge && (
                <span className={`self-start inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5
                  ${plan.featured
                    ? "bg-[#7EC0B7]/20 text-[#7EC0B7]"
                    : "bg-[#FFF0E8] text-[#C8683A]"
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${plan.featured ? "bg-[#7EC0B7]" : "bg-[#E8926A]"}`} />
                  {plan.badge}
                </span>
              )}

              {/* Plan name */}
              <h3
                className={`text-lg font-black mb-1 ${plan.featured ? "text-white" : "text-[#233551]"}`}
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {plan.name}
              </h3>
              <p className={`text-xs mb-6 ${plan.featured ? "text-white/55" : "text-[#233551]/45"}`}>
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-7">
                <span
                  className={`text-4xl font-black leading-none ${plan.featured ? "text-white" : "text-[#233551]"}`}
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {plan.price}
                </span>
                <span className={`text-sm mb-1 ${plan.featured ? "text-white/45" : "text-[#233551]/40"}`}>
                  {plan.period}
                </span>
              </div>

              {/* Divider */}
              <div className={`h-px mb-6 ${plan.featured ? "bg-white/10" : "bg-slate-100"}`} />

              {/* Features */}
              <ul className="space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5
                      ${plan.featured ? "bg-[#7EC0B7]/20" : "bg-[#7EC0B7]/15"}`}
                    >
                      <Check size={10} className="text-[#7EC0B7]" strokeWidth={3} />
                    </span>
                    <span className={`text-sm leading-snug ${plan.featured ? "text-white/70" : "text-[#233551]/60"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`mt-8 w-full py-3.5 rounded-full text-sm font-black text-center transition-all duration-200 hover:-translate-y-0.5
                  ${plan.featured
                    ? "bg-[#7EC0B7] text-[#233551] hover:bg-[#8DCFC6] shadow-lg shadow-[#7EC0B7]/25 hover:shadow-xl"
                    : "bg-[#233551] text-white hover:bg-[#2d4568] shadow-md shadow-[#233551]/15 hover:shadow-lg"
                  }`}
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10 space-y-2"
        >
          <p className="text-xs text-[#233551]/35">
            All plans include a free intro chat before any payment. No credit card needed to get matched.
          </p>
          <p className="text-xs text-[#233551]/30">
            Looking for couples therapy?{" "}
            <Link href="/questionnaire?type=couples" className="text-[#3D8A80] font-semibold hover:underline">
              ₹5,999/week — one session for both partners →
            </Link>
          </p>
        </motion.div>

      </div>
    </section>
  )
}

export default PricingPlans
