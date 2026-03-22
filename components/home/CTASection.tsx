"use client"

import { motion } from "framer-motion"
import Link from "next/link"

/* ── Teal concentric ring decoration ── */
const RingDecoration = () => (
  <div className="relative w-52 h-52 md:w-64 md:h-64 float-slow flex-shrink-0">
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full border-2 border-[#7EC0B7]/20" />
    {/* Mid ring */}
    <div className="absolute inset-6 rounded-full border border-[#7EC0B7]/25 bg-[#7EC0B7]/6" />
    {/* Inner ring */}
    <div className="absolute inset-14 rounded-full bg-[#7EC0B7]/15 border border-[#7EC0B7]/30 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-[#7EC0B7]" />
    </div>
    {/* Orbiting dots */}
    <div className="absolute top-4 right-10 w-2.5 h-2.5 rounded-full bg-[#7EC0B7]/50 pulse-dot" />
    <div className="absolute bottom-8 left-6 w-2 h-2 rounded-full bg-[#E8926A]/50 pulse-dot float-delay-1" />
    <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-white/30 pulse-dot float-delay-2" />
  </div>
)

const CTASection = () => {
  return (
    <section className="bg-[#233551] relative overflow-hidden">

      {/* Top wave from teal section (PrivacySection) → navy */}
      <div className="absolute top-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path d="M0,0 L1440,0 L1440,40 C1160,72 880,4 600,36 C360,62 160,8 0,40 Z" fill="#F0FAF9" />
        </svg>
      </div>

      <div className="py-20 md:py-28 pt-28 md:pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">

            {/* ── Left: text ── */}
            <motion.div
              className="flex-1 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/20 text-[#7EC0B7] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
                Free assessment
              </span>

              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You&apos;ve read enough.<br />Now start.
              </h2>

              <p className="text-white/55 text-base leading-relaxed max-w-md">
                5 minutes. A few questions. No payment upfront. Then you meet your therapist — free. If it doesn&apos;t feel right, you pick someone else.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center justify-center gap-2 bg-[#7EC0B7] text-[#233551] text-sm font-black px-8 py-4 rounded-full hover:bg-[#8DCFC6] transition-all duration-200 shadow-lg shadow-[#7EC0B7]/25 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  Start the assessment
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 text-white/70 text-sm font-bold px-8 py-4 rounded-full border border-white/20 hover:border-white/50 hover:text-white transition-all duration-200"
                >
                  Create account →
                </Link>
              </div>

              <p className="text-white/25 text-xs pt-1">
                No credit card. No clinic. No waiting rooms.
              </p>
            </motion.div>

            {/* ── Right: ring decoration ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <RingDecoration />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave → white (FAQ) */}
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path d="M0,35 C240,70 480,0 720,35 C900,60 1140,10 1440,35 L1440,70 L0,70 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}

export default CTASection
