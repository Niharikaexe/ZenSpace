"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const BuddhaSVG = () => (
  <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    {/* Lotus base */}
    <ellipse cx="40" cy="82" rx="22" ry="5" fill="#7EC0B7" fillOpacity="0.3"/>
    <path d="M22 78 Q26 70 32 72 Q36 68 40 70 Q44 68 48 72 Q54 70 58 78 Q48 76 40 76 Q32 76 22 78Z" fill="#7EC0B7" fillOpacity="0.45"/>
    <path d="M28 76 Q30 66 36 68 Q40 64 44 68 Q50 66 52 76 Q46 74 40 74 Q34 74 28 76Z" fill="#7EC0B7" fillOpacity="0.6"/>
    {/* Crossed legs */}
    <path d="M18 72 Q22 58 32 60 Q36 62 40 62 Q44 62 48 60 Q58 58 62 72" stroke="#7EC0B7" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
    {/* Robe/body */}
    <path d="M28 60 Q24 50 26 40 Q28 34 40 34 Q52 34 54 40 Q56 50 52 60 Q46 64 40 64 Q34 64 28 60Z" fill="#7EC0B7" fillOpacity="0.25"/>
    {/* Arms in meditation mudra */}
    <path d="M28 52 Q22 56 20 60 Q24 62 28 58" stroke="#7EC0B7" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
    <path d="M52 52 Q58 56 60 60 Q56 62 52 58" stroke="#7EC0B7" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
    {/* Hands at lap */}
    <ellipse cx="40" cy="60" rx="8" ry="4" fill="#7EC0B7" fillOpacity="0.35"/>
    {/* Neck */}
    <rect x="36" y="28" width="8" height="8" rx="4" fill="#7EC0B7" fillOpacity="0.4"/>
    {/* Head */}
    <circle cx="40" cy="22" r="12" fill="#7EC0B7" fillOpacity="0.25" stroke="#7EC0B7" strokeWidth="1.5" strokeOpacity="0.4"/>
    {/* Ushnisha */}
    <circle cx="40" cy="11" r="4" fill="#7EC0B7" fillOpacity="0.4"/>
    {/* Closed eyes */}
    <path d="M35 21 Q37 23 39 21" stroke="#7EC0B7" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" fill="none"/>
    <path d="M41 21 Q43 23 45 21" stroke="#7EC0B7" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" fill="none"/>
    {/* Smile */}
    <path d="M37 25 Q40 27 43 25" stroke="#7EC0B7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" fill="none"/>
    {/* Aura rings */}
    <circle cx="40" cy="22" r="17" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 4"/>
    <circle cx="40" cy="22" r="22" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="2 6"/>
  </svg>
)

const BuddhaDecoration = () => (
  <div className="relative w-52 h-52 md:w-64 md:h-64 float-slow flex-shrink-0">
    <div className="absolute inset-0 rounded-full border-2 border-[#7EC0B7]/20" />
    <div className="absolute inset-6 rounded-full border border-[#7EC0B7]/15 bg-[#7EC0B7]/6" />
    <div className="absolute inset-12 rounded-full bg-[#7EC0B7]/12 border border-[#7EC0B7]/25 flex items-center justify-center">
      <BuddhaSVG />
    </div>
    <div className="absolute top-4 right-10 w-2.5 h-2.5 rounded-full bg-[#7EC0B7]/50 pulse-dot" />
    <div className="absolute bottom-8 left-6 w-2 h-2 rounded-full bg-[#E8926A]/50 pulse-dot float-delay-1" />
    <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-white/30 pulse-dot float-delay-2" />
  </div>
)

const CategoryPopup = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(35,53,81,0.6)', backdropFilter: 'blur(4px)' }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <h3
        className="text-xl font-black text-[#233551] mb-2"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        Who is the assessment for?
      </h3>
      <p className="text-sm text-[#233551]/55 mb-6">
        We&apos;ll show you the right questions.
      </p>
      <div className="space-y-3">
        {[
          { label: "Individual", sub: "For yourself", href: "/questionnaire/individual", color: "bg-[#7EC0B7]/12 hover:bg-[#7EC0B7]/20 border-[#7EC0B7]/25" },
          { label: "Couples", sub: "For you and your partner", href: "/questionnaire/couples", color: "bg-[#E8926A]/12 hover:bg-[#E8926A]/20 border-[#E8926A]/25" },
          { label: "Teen", sub: "For a young person aged 14–20", href: "/questionnaire/teen", color: "bg-[#233551]/8 hover:bg-[#233551]/12 border-[#233551]/15" },
        ].map(opt => (
          <Link
            key={opt.label}
            href={opt.href}
            className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-150 group ${opt.color}`}
            onClick={onClose}
          >
            <div>
              <p className="font-black text-[#233551] text-sm" style={{ fontFamily: 'var(--font-lato)' }}>{opt.label}</p>
              <p className="text-xs text-[#233551]/50 mt-0.5">{opt.sub}</p>
            </div>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#233551]/40 group-hover:text-[#233551] group-hover:translate-x-0.5 transition-all">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-5 w-full text-xs text-[#233551]/40 hover:text-[#233551]/70 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
)

const CTASection = () => {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
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
                  You’ve done the reading.<br /> Now, start the practice.
                </h2>

                <p className="text-white/55 text-base leading-relaxed max-w-md">
                Take five minutes to tell us about your world. We’ll help you find the right person to talk to. If it doesn&apos;t feel right, you pick someone else.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#7EC0B7] text-[#233551] text-sm font-black px-8 py-4 rounded-full hover:bg-[#8DCFC6] transition-all duration-200 shadow-lg shadow-[#7EC0B7]/25 hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Start the assessment
                  </button>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 text-white/70 text-sm font-bold px-8 py-4 rounded-full border border-white/20 hover:border-white/50 hover:text-white transition-all duration-200"
                  >
                    Create account →
                  </Link>
                </div>
              </motion.div>

              {/* ── Right: Buddha decoration ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <BuddhaDecoration />
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

      {showPopup && <CategoryPopup onClose={() => setShowPopup(false)} />}
    </>
  )
}

export default CTASection
