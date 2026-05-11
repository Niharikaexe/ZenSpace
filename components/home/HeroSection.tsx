"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import OwlMascot from "@/components/home/OwlMascot"

/* ── Floating decorative SVGs (desktop only) ── */
const LeafSVG = ({ color = "#7EC0B7", className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 36 52" fill="none" className={className}>
    <path d="M18,50 C18,50 0,36 0,18 C0,0 18,0 18,0 C18,0 36,0 36,18 C36,36 18,50 18,50 Z" fill={color} fillOpacity="0.75" />
    <path d="M18,50 L18,0" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
)

const StarSVG = ({ color = "#FF8C5A", className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
  </svg>
)

/* ── Category card figure illustrations ── */
const IndividualFigure = () => (
  <svg viewBox="0 0 60 72" fill="none" className="w-full h-full drop-shadow-sm">
    {/* Body */}
    <ellipse cx="30" cy="54" rx="14" ry="10" fill="white" fillOpacity="0.18"/>
    <rect x="22" y="38" width="16" height="20" rx="8" fill="white" fillOpacity="0.22"/>
    {/* Head */}
    <circle cx="30" cy="28" r="11" fill="white" fillOpacity="0.30"/>
    {/* Leaf accent */}
    <path d="M46 36 C52 28 60 34 54 42 C48 40 46 36 46 36Z" fill="white" fillOpacity="0.20"/>
    <path d="M50 40 L54 32" stroke="white" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round"/>
    {/* Small dot */}
    <circle cx="18" cy="20" r="3" fill="white" fillOpacity="0.15"/>
  </svg>
)

const CouplesFigure = () => (
  <svg viewBox="0 0 72 72" fill="none" className="w-full h-full drop-shadow-sm">
    {/* Left person */}
    <circle cx="22" cy="26" r="9" fill="white" fillOpacity="0.28"/>
    <ellipse cx="22" cy="50" rx="10" ry="8" fill="white" fillOpacity="0.18"/>
    <rect x="14" y="34" width="16" height="18" rx="8" fill="white" fillOpacity="0.20"/>
    {/* Right person */}
    <circle cx="50" cy="26" r="9" fill="white" fillOpacity="0.28"/>
    <ellipse cx="50" cy="50" rx="10" ry="8" fill="white" fillOpacity="0.18"/>
    <rect x="42" y="34" width="16" height="18" rx="8" fill="white" fillOpacity="0.20"/>
    {/* Connection heart */}
    <path d="M36 40 C36 37 33 34 30 36 C28 37 28 40 30 42 L36 48 L42 42 C44 40 44 37 42 36 C39 34 36 37 36 40Z" fill="white" fillOpacity="0.30"/>
  </svg>
)

const TeenFigure = () => (
  <svg viewBox="0 0 60 72" fill="none" className="w-full h-full drop-shadow-sm">
    {/* Body */}
    <rect x="21" y="37" width="18" height="22" rx="9" fill="white" fillOpacity="0.22"/>
    {/* Head */}
    <circle cx="30" cy="26" r="11" fill="white" fillOpacity="0.30"/>
    {/* Hair accent */}
    <path d="M20 22 C20 14 28 10 36 13 C38 14 40 16 40 22" fill="white" fillOpacity="0.15"/>
    {/* Sparkle stars */}
    <path d="M48 18 L49.2 22.2 L53 23 L49.2 23.8 L48 28 L46.8 23.8 L43 23 L46.8 22.2 Z" fill="white" fillOpacity="0.35"/>
    <path d="M14 14 L14.8 16.8 L17 17 L14.8 17.2 L14 20 L13.2 17.2 L11 17 L13.2 16.8 Z" fill="white" fillOpacity="0.30"/>
    <circle cx="52" cy="34" r="2.5" fill="white" fillOpacity="0.20"/>
  </svg>
)

const therapyTypes = [
  {
    label: "Individual",
    sub: "For myself",
    tagline: "Just you and a person who listens.",
    href: "/questionnaire/individual",
    bg: "#233551",
    Figure: IndividualFigure,
  },
  {
    label: "Couples",
    sub: "For me and my partner",
    tagline: "Finding the rhythm again.",
    href: "/questionnaire/couples",
    bg: "#E8926A",
    Figure: CouplesFigure,
  },
  {
    label: "Teen",
    sub: "For my child",
    tagline: "A room of your own.",
    href: "/questionnaire/teen",
    bg: "#3D8A80",
    Figure: TeenFigure,
  },
]

const HeroSection = () => {
  return (
    <section className="bg-white relative overflow-hidden min-h-[90vh] flex items-center">

      {/* Background peach blob — desktop only */}
      <div className="hidden lg:block mc-anim-bg absolute right-0 top-0 w-[55%] h-full pointer-events-none select-none">
        <svg viewBox="0 0 640 780" fill="none" preserveAspectRatio="xMaxYMid slice" className="w-full h-full">
          <path
            d="M120,10 C260,-15 520,40 600,180 C680,320 640,520 520,650 C400,780 200,760 90,640 C-20,520 -40,310 60,180 C90,130 80,25 120,10 Z"
            fill="#FFE8E2"
          />
          <path
            d="M200,60 C320,20 540,90 590,230 C640,370 580,540 450,630 C320,720 150,700 70,580 C-10,460 10,270 100,160 C140,108 140,85 200,60 Z"
            fill="#FFD6CD"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── LEFT: Text + category cards ── */}
          <div className="mc-content flex-1 space-y-7 w-full">

            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
                Trusted by 5,000+ across India
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[3.6rem] font-black text-[#233551] leading-[1.1] tracking-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Peace isn't a milestone<br />
              it's a practice
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base text-[#233551]/55 leading-relaxed max-w-md"
            >
              Most of us wait until things are heavy before we reach out. Find someone who understands your world and start the habit of checking in.
            </motion.p>

            {/* Category cards — stacked, full-width */}
            <div className="flex flex-col gap-2.5 pt-1 max-w-lg">
              {therapyTypes.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <Link
                    href={t.href}
                    className="group relative flex items-center justify-between px-6 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ backgroundColor: t.bg }}
                  >
                    {/* Subtle shine on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
                    />

                    {/* Left: label + subtitle */}
                    <div className="relative z-10">
                      <p className="text-white text-xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>
                        {t.label}
                      </p>
                      <p className="text-white/65 text-sm mt-1 font-medium">{t.sub}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-white/50 text-xs">{t.tagline}</span>
                      </div>
                    </div>

                    {/* Right: figure + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
                      <div className="w-14 h-14 md:w-16 md:h-16 opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                        <t.Figure />
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 16 16">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Owl Mascot — desktop only ── */}
          <div className="hidden lg:block flex-shrink-0 relative w-[380px] h-[380px] xl:w-[440px] xl:h-[440px]">

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="w-full h-full rounded-full bg-[#233551] overflow-hidden relative shadow-2xl float-slow"
            >
              <OwlMascot className="w-full h-full" />
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.8 }} className="absolute -top-4 -right-4 float-medium float-delay-1">
              <StarSVG color="#FF8C5A" className="w-8 h-8" />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1 }} className="absolute -bottom-2 -left-6 float-fast float-delay-2">
              <StarSVG color="#FF8C5A" className="w-5 h-5" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="absolute top-1/3 -right-8 float-slow float-delay-3">
              <LeafSVG color="#7EC0B7" className="w-7 h-10 rotate-45" />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.1 }} className="absolute top-1/4 -left-10 float-medium">
              <StarSVG color="#F97B5A" className="w-4 h-4 opacity-70" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1 }} className="absolute -top-6 left-8 float-slow float-delay-1">
              <LeafSVG color="#7EC0B7" className="w-5 h-7 -rotate-12" />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom organic wave */}
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path
            d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z"
            fill="#FFF5F2"
          />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
