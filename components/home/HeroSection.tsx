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

const therapyTypes = [
  { label: "Individual", href: "/individual" },
  { label: "Couples", href: "/couples" },
  { label: "Teen", href: "/teen" },
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
              Peace isn&apos;t a destination;<br />
              it&apos;s a practice.
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

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-all duration-200 shadow-lg shadow-[#233551]/20 hover:shadow-xl hover:shadow-[#233551]/25 hover:-translate-y-0.5"
              >
                Start assessment
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full border-2 border-[#233551]/20 hover:border-[#233551]/50 transition-all duration-200 hover:-translate-y-0.5"
              >
                Find my therapist
              </Link>
            </motion.div>

            {/* Therapy type pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              <span className="text-xs text-[#233551]/40 font-medium self-center">Looking for:</span>
              {therapyTypes.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="text-xs font-semibold text-[#3D8A80] bg-[#7EC0B7]/12 hover:bg-[#7EC0B7]/25 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </motion.div>
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
