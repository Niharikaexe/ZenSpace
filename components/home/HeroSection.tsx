"use client"

import { motion } from "framer-motion"
import Link from "next/link"

/* ── Inline SVG: woman hugging a heart-ball ── */
const HeroIllustration = () => (
  <svg viewBox="0 0 280 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Large tropical leaf — left back */}
    <path d="M38,265 C18,205 28,135 78,108 C68,148 52,205 38,265 Z" fill="#2A6B63" />
    <path d="M38,265 C55,208 66,158 78,108" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    {/* Large tropical leaf — right back */}
    <path d="M242,252 C262,190 252,122 200,102 C210,142 228,195 242,252 Z" fill="#2A6B63" />
    <path d="M242,252 C226,196 213,148 200,102" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    {/* Small leaf top-left */}
    <path d="M72,115 C52,85 62,45 92,38 C86,64 76,92 72,115 Z" fill="#3D8A80" />
    <path d="M72,115 C80,90 86,64 92,38" stroke="#2A6B63" strokeWidth="1" fill="none" />
    {/* Small leaf top-right */}
    <path d="M208,108 C228,78 218,38 188,32 C194,58 204,86 208,108 Z" fill="#3D8A80" />
    <path d="M208,108 C200,84 194,58 188,32" stroke="#2A6B63" strokeWidth="1" fill="none" />
    {/* Dress / body */}
    <ellipse cx="140" cy="240" rx="62" ry="62" fill="#E8926A" />
    {/* Neck */}
    <rect x="129" y="177" width="22" height="28" rx="11" fill="#FDBCA7" />
    {/* Head */}
    <circle cx="140" cy="150" r="40" fill="#FDBCA7" />
    {/* Hair */}
    <path d="M100,138 Q140,90 180,138 Q188,168 184,200 Q160,218 140,218 Q120,218 96,200 Q92,168 100,138 Z" fill="#1C0E08" />
    <path d="M100,138 Q86,170 90,208" stroke="#1C0E08" strokeWidth="9" fill="none" strokeLinecap="round" />
    <path d="M180,138 Q194,170 190,208" stroke="#1C0E08" strokeWidth="9" fill="none" strokeLinecap="round" />
    {/* Eyes */}
    <ellipse cx="128" cy="148" rx="5" ry="6" fill="#1C0E08" />
    <ellipse cx="152" cy="148" rx="5" ry="6" fill="#1C0E08" />
    <circle cx="130" cy="146" r="1.8" fill="white" />
    <circle cx="154" cy="146" r="1.8" fill="white" />
    {/* Smile */}
    <path d="M131,162 Q140,170 149,162" stroke="#D4795A" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Left arm hugging */}
    <path d="M88,222 Q72,200 82,184 Q97,173 112,185" stroke="#FDBCA7" strokeWidth="21" strokeLinecap="round" fill="none" />
    {/* Right arm hugging */}
    <path d="M192,222 Q208,200 198,184 Q183,173 168,185" stroke="#FDBCA7" strokeWidth="21" strokeLinecap="round" fill="none" />
    {/* Coral ball / heart */}
    <circle cx="140" cy="228" r="38" fill="#F97B5A" />
    {/* Ball highlights */}
    <circle cx="127" cy="215" r="9" fill="rgba(255,255,255,0.25)" />
    <circle cx="152" cy="238" r="5" fill="rgba(255,255,255,0.15)" />
  </svg>
)

/* ── Floating leaf SVG ── */
const LeafSVG = ({ color = "#7EC0B7", className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 36 52" fill="none" className={className}>
    <path d="M18,50 C18,50 0,36 0,18 C0,0 18,0 18,0 C18,0 36,0 36,18 C36,36 18,50 18,50 Z" fill={color} fillOpacity="0.75" />
    <path d="M18,50 L18,0" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
)

/* ── Star / sparkle SVG ── */
const StarSVG = ({ color = "#FF8C5A", className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
  </svg>
)

/* ── Category card icon SVGs ── */
const IndividualIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
    <circle cx="20" cy="14" r="7" fill="#7EC0B7" />
    <path d="M6,36 C6,27 12,22 20,22 C28,22 34,27 34,36" stroke="#7EC0B7" strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
)

const CouplesIcon = () => (
  <svg viewBox="0 0 48 40" fill="none" className="w-full h-full">
    <circle cx="16" cy="13" r="6" fill="#E8926A" />
    <path d="M4,36 C4,28 9,23 16,23 C19,23 22,24 24,26" stroke="#E8926A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <circle cx="32" cy="13" r="6" fill="#7EC0B7" />
    <path d="M44,36 C44,28 39,23 32,23 C29,23 26,24 24,26" stroke="#7EC0B7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M21,30 Q24,28 27,30" stroke="#233551" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3"/>
  </svg>
)

const TeenIcon = () => (
  <svg viewBox="0 0 40 44" fill="none" className="w-full h-full">
    <circle cx="20" cy="13" r="7" fill="#F97B5A" />
    <path d="M8,38 C8,29 13,24 20,24 C27,24 32,29 32,38" stroke="#F97B5A" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M30,8 L32,4 L34,8" stroke="#7EC0B7" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="36" cy="6" r="2" fill="#7EC0B7" opacity="0.7"/>
    <circle cx="28" cy="3" r="1.5" fill="#E8926A" opacity="0.8"/>
  </svg>
)

const therapyTypes = [
  {
    label: "Individual",
    tagline: "Just you and your therapist",
    href: "/for/individuals",
    Icon: IndividualIcon,
    accent: "#7EC0B7",
    bg: "from-[#7EC0B7]/10 to-[#7EC0B7]/5",
    border: "border-[#7EC0B7]/25",
    hoverBorder: "hover:border-[#7EC0B7]/60",
    hoverBg: "hover:from-[#7EC0B7]/18 hover:to-[#7EC0B7]/10",
    iconBg: "bg-[#7EC0B7]/15",
    dot: "bg-[#7EC0B7]",
  },
  {
    label: "Couples",
    tagline: "Both of you, one room",
    href: "/for/couples",
    Icon: CouplesIcon,
    accent: "#E8926A",
    bg: "from-[#E8926A]/10 to-[#E8926A]/5",
    border: "border-[#E8926A]/25",
    hoverBorder: "hover:border-[#E8926A]/60",
    hoverBg: "hover:from-[#E8926A]/18 hover:to-[#E8926A]/10",
    iconBg: "bg-[#E8926A]/15",
    dot: "bg-[#E8926A]",
  },
  {
    label: "Teen",
    tagline: "For the under-18s who get it",
    href: "/for/adolescents",
    Icon: TeenIcon,
    accent: "#F97B5A",
    bg: "from-[#F97B5A]/10 to-[#F97B5A]/5",
    border: "border-[#F97B5A]/25",
    hoverBorder: "hover:border-[#F97B5A]/60",
    hoverBg: "hover:from-[#F97B5A]/18 hover:to-[#F97B5A]/10",
    iconBg: "bg-[#F97B5A]/15",
    dot: "bg-[#F97B5A]",
  },
]

const HeroSection = () => {
  return (
    <section className="bg-white relative overflow-hidden min-h-[90vh] flex items-center">

      {/* ── Background wavy peach blob (right side) ── */}
      <div className="absolute right-0 top-0 w-[55%] h-full pointer-events-none select-none">
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

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── LEFT: Text content ── */}
          <div className="flex-1 space-y-7">
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
              Therapy that treats<br />
              you like an adult
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base text-[#233551]/55 leading-relaxed max-w-md"
            >
              You&apos;ve probably Googled what you&apos;re feeling. That&apos;s a start. We&apos;ll take it from here — with a real therapist, real sessions, and no waiting rooms.
            </motion.p>

            {/* Therapy type category cards */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              {therapyTypes.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex-1"
                >
                  <Link
                    href={t.href}
                    className={`group relative flex flex-col gap-3 bg-gradient-to-br ${t.bg} ${t.hoverBg} border ${t.border} ${t.hoverBorder} px-5 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
                  >
                    {/* Subtle corner glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(ellipse at 0% 100%, ${t.accent}18 0%, transparent 60%)` }} />

                    {/* Icon */}
                    <div className={`w-10 h-10 ${t.iconBg} rounded-xl flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110`}>
                      <t.Icon />
                    </div>

                    {/* Label + tagline */}
                    <div>
                      <p className="text-sm font-black text-[#233551] leading-none mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
                        {t.label}
                      </p>
                      <p className="text-xs text-[#233551]/50 leading-tight">{t.tagline}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 mt-auto">
                      <span className="text-xs font-semibold" style={{ color: t.accent }}>Learn more</span>
                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" style={{ color: t.accent }}>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Active dot */}
                    <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${t.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Illustration area ── */}
          <div className="flex-shrink-0 relative w-72 h-72 md:w-[380px] md:h-[380px] lg:w-[440px] lg:h-[440px]">

            {/* Dark navy circle — illustration container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="w-full h-full rounded-full bg-[#233551] overflow-hidden relative shadow-2xl"
            >
              {/* Floating illustration */}
              <div className="float-slow w-full h-full flex items-end justify-center pt-6">
                <HeroIllustration />
              </div>
            </motion.div>

            {/* Floating star — top right */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -top-4 -right-4 float-medium float-delay-1"
            >
              <StarSVG color="#FF8C5A" className="w-8 h-8" />
            </motion.div>

            {/* Floating star — bottom left */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-2 -left-6 float-fast float-delay-2"
            >
              <StarSVG color="#FF8C5A" className="w-5 h-5" />
            </motion.div>

            {/* Floating leaf — right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute top-1/3 -right-8 float-slow float-delay-3"
            >
              <LeafSVG color="#7EC0B7" className="w-7 h-10 rotate-45" />
            </motion.div>

            {/* Floating small star — mid left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="absolute top-1/4 -left-10 float-medium"
            >
              <StarSVG color="#F97B5A" className="w-4 h-4 opacity-70" />
            </motion.div>

            {/* Floating teal leaf — top left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -top-6 left-8 float-slow float-delay-1"
            >
              <LeafSVG color="#7EC0B7" className="w-5 h-7 -rotate-12" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Bottom organic wave → peach section ── */}
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
