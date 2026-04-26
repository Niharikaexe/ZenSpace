"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const CTASection = () => {
  return (
    <section className="bg-[#233551] relative overflow-hidden">
      {/* Top wave continues from therapist section */}
      <div className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">

            {/* Left: text */}
            <motion.div
              className="flex-1 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2
                className="text-3xl md:text-4xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You&apos;ve done the reading.<br />Now, start the practice.
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-md">
                Take five minutes to tell us about your world. We&apos;ll help you find the right person to talk to.
              </p>
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 bg-white text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#F0F8F7] transition-all duration-200 shadow-lg shadow-black/20"
              >
                Start the assessment →
              </Link>
            </motion.div>

            {/* Right: decorative teal circle with inner pattern */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="float-slow">
                <div className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-[#7EC0B7]/15 border-2 border-[#7EC0B7]/25 flex items-center justify-center relative">
                  {/* Inner ring */}
                  <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-[#7EC0B7]/15 border border-[#7EC0B7]/20 flex items-center justify-center">
                    {/* Center: emoji/icon */}
                    <div className="text-center space-y-1">
                      <div className="text-5xl">🧘</div>
                      <p className="text-[#7EC0B7] text-xs font-bold">Find your calm</p>
                    </div>
                  </div>
                  {/* Orbiting dot */}
                  <div className="absolute top-3 right-8 w-3 h-3 rounded-full bg-[#7EC0B7]/60 pulse-dot" />
                  <div className="absolute bottom-6 left-5 w-2 h-2 rounded-full bg-[#E8926A]/60 pulse-dot float-delay-1" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave → white FAQ section */}
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path
            d="M0,35 C240,70 480,0 720,35 C900,60 1140,10 1440,35 L1440,70 L0,70 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}

export default CTASection
