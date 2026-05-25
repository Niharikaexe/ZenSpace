"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AssessmentButton } from "@/components/shared/AssessmentButton"
import { TreeOwl } from "@/components/home/TreeOwl"

export default function CTASection() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#233551]">

        {/* Top wave — teal section → navy (preserved) */}
        <div className="absolute -top-px left-0 w-full leading-none pointer-events-none">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20 block">
            <path d="M0,0 L1440,0 L1440,40 C1160,72 880,4 600,36 C360,62 160,8 0,40 Z" fill="#F0FAF9" />
          </svg>
        </div>

        {/* Tree+owl — mobile background layer */}
        <div className="lg:hidden mc-anim-bg absolute inset-0 flex items-center justify-end pr-0 pointer-events-none overflow-hidden">
          <div className="w-64 h-80 opacity-[0.12]">
            <TreeOwl />
          </div>
        </div>

        <div className="pt-28 md:pt-36 pb-24 md:pb-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.15fr_1fr]">

            {/* Copy */}
            <motion.div
              className="mc-content"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(126,192,183,0.15)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#7EC0B7]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7EC0B7]" />
                Free assessment
              </span>

              <h2
                className="mt-4 text-4xl font-black leading-[1.15] tracking-tight text-white md:text-5xl"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You&apos;ve done the reading.
                <br />
                Now, start the practice.
              </h2>

              <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-white/55">
                Take five minutes to tell us about your world. We&apos;ll help you find the right person to talk to. If it doesn&apos;t feel right, you pick someone else.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <AssessmentButton
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7EC0B7] px-8 py-4 text-sm font-black text-[#233551] shadow-[0_12px_28px_rgba(126,192,183,0.25)] transition hover:-translate-y-0.5 hover:bg-[#8DCFC6] hover:shadow-[0_18px_40px_rgba(126,192,183,0.35)]"
                  style={{ fontFamily: 'var(--font-lato)' }}
                />
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white/70 transition hover:border-white/50 hover:text-white"
                >
                  Create account →
                </Link>
              </div>

              <div className="mt-12 flex gap-12 text-white">
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>5,000+</div>
                  <div className="mt-1.5 text-xs text-white/45">Clients helped</div>
                </div>
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>4.9★</div>
                  <div className="mt-1.5 text-xs text-white/45">Average rating</div>
                </div>
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>100%</div>
                  <div className="mt-1.5 text-xs text-white/45">Licensed &amp; verified</div>
                </div>
              </div>
            </motion.div>

            {/* Tree + owl illustration — desktop only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="hidden lg:block relative mx-auto aspect-[360/440] w-full max-w-[360px]"
              aria-hidden
            >
              <TreeOwl />
            </motion.div>
          </div>
        </div>

        {/* Bottom wave — navy → white (preserved) */}
        <div className="absolute -bottom-px left-0 w-full leading-none pointer-events-none">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20 block">
            <path d="M0,35 C240,70 480,0 720,35 C900,60 1140,10 1440,35 L1440,70 L0,70 Z" fill="white" />
          </svg>
        </div>
      </section>
    </>
  )
}
