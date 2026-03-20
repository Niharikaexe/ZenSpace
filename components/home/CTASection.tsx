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
              <span className="inline-block bg-[#7EC0B7]/20 text-[#7EC0B7] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                Free Assessment
              </span>
              <h2
                className="text-3xl md:text-4xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Check your mental<br />well-being score
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-md">
                Feeling a little unsure about your mental health lately? Here&apos;s a quick self-rating scale recommended by the World Health Organization. Keep in mind this tool doesn&apos;t replace a professional opinion.
              </p>
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 text-sm font-bold text-white border-2 border-white/25 px-7 py-3.5 rounded-full hover:border-white/60 hover:bg-white/8 transition-all duration-200"
              >
                Start assessment →
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
