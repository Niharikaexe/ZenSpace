"use client"

import { motion } from "framer-motion"
import Link from "next/link"

type BubbleColor =
  | "teal-solid" | "teal-light"
  | "navy-solid" | "navy-light"
  | "coral-solid" | "coral-light"

type BubbleSize = "sm" | "md" | "lg"

interface Bubble {
  label: string
  top: string
  left: string
  size: BubbleSize
  color: BubbleColor
  float: string
  delay: number
}

/* Positions are the centre of each circle — achieved via -translate-x-1/2 -translate-y-1/2 */
const bubbles: Bubble[] = [
  // ── top row ──────────────────────────────────────────────────────
  { label: "Anxiety",           top: "7%",  left: "8%",  size: "md", color: "navy-light",  float: "float-slow",                 delay: 0.05 },
  { label: "Burnout",           top: "5%",  left: "32%", size: "sm", color: "coral-solid", float: "float-medium float-delay-1", delay: 0.10 },
  { label: "Grief",             top: "6%",  left: "55%", size: "sm", color: "teal-light",  float: "float-slow float-delay-2",   delay: 0.08 },
  { label: "Loneliness",        top: "4%",  left: "76%", size: "sm", color: "navy-light",  float: "float-medium float-delay-3", delay: 0.14 },
  { label: "Trauma",            top: "8%",  left: "92%", size: "sm", color: "coral-light", float: "float-slow float-delay-1",   delay: 0.12 },

  // ── upper diagonal ───────────────────────────────────────────────
  { label: "Depression",        top: "27%", left: "3%",  size: "md", color: "teal-solid",  float: "float-slow float-delay-2",   delay: 0.18 },
  { label: "Overthinking",      top: "24%", left: "23%", size: "sm", color: "navy-light",  float: "float-medium float-delay-1", delay: 0.20 },
  { label: "Work stress",       top: "22%", left: "76%", size: "sm", color: "coral-light", float: "float-slow float-delay-3",   delay: 0.16 },
  { label: "Teen struggles",    top: "28%", left: "92%", size: "sm", color: "navy-solid",  float: "float-medium float-delay-2", delay: 0.22 },

  // ── middle sides (flanking centre text) ──────────────────────────
  { label: "In-laws",           top: "48%", left: "3%",  size: "sm", color: "teal-light",  float: "float-medium float-delay-1", delay: 0.24 },
  { label: "Anger",             top: "50%", left: "92%", size: "sm", color: "coral-solid", float: "float-slow float-delay-3",   delay: 0.26 },

  // ── lower diagonal ───────────────────────────────────────────────
  { label: "Trust issues",      top: "68%", left: "2%",  size: "sm", color: "navy-light",  float: "float-slow float-delay-2",   delay: 0.28 },
  { label: "Panic attacks",     top: "72%", left: "20%", size: "sm", color: "teal-solid",  float: "float-medium float-delay-1", delay: 0.22 },
  { label: "Relationship",      top: "70%", left: "74%", size: "md", color: "navy-light",  float: "float-slow float-delay-3",   delay: 0.18 },
  { label: "Imposter syndrome", top: "74%", left: "92%", size: "sm", color: "coral-light", float: "float-medium float-delay-2", delay: 0.20 },

  // ── bottom row ───────────────────────────────────────────────────
  { label: "Identity",          top: "90%", left: "6%",  size: "sm", color: "navy-solid",  float: "float-slow float-delay-1",   delay: 0.32 },
  { label: "Marital conflicts", top: "88%", left: "28%", size: "md", color: "teal-light",  float: "float-medium float-delay-3", delay: 0.28 },
  { label: "Low self-worth",    top: "91%", left: "52%", size: "sm", color: "coral-light", float: "float-slow float-delay-2",   delay: 0.30 },
  { label: "Sleep & stress",    top: "88%", left: "72%", size: "sm", color: "teal-solid",  float: "float-medium float-delay-1", delay: 0.26 },
  { label: "Quarter-life",      top: "90%", left: "90%", size: "md", color: "coral-solid", float: "float-slow float-delay-3",   delay: 0.34 },
]

const colorStyles: Record<BubbleColor, string> = {
  "teal-solid":  "bg-[#7EC0B7] text-white shadow-md shadow-[#7EC0B7]/30 hover:bg-[#6AADA4] hover:shadow-lg hover:shadow-[#7EC0B7]/40",
  "teal-light":  "bg-[#7EC0B7]/15 text-[#3D8A80] hover:bg-[#7EC0B7] hover:text-white hover:shadow-md hover:shadow-[#7EC0B7]/30",
  "navy-solid":  "bg-[#233551] text-white shadow-md shadow-[#233551]/25 hover:bg-[#2d4568] hover:shadow-lg hover:shadow-[#233551]/30",
  "navy-light":  "bg-[#EEF1F6] text-[#233551] hover:bg-[#233551] hover:text-white hover:shadow-md hover:shadow-[#233551]/20",
  "coral-solid": "bg-[#E8926A] text-white shadow-md shadow-[#E8926A]/30 hover:bg-[#D9824E] hover:shadow-lg hover:shadow-[#E8926A]/40",
  "coral-light": "bg-[#FFE8E2] text-[#C8683A] hover:bg-[#E8926A] hover:text-white hover:shadow-md hover:shadow-[#E8926A]/25",
}

const sizeStyles: Record<BubbleSize, string> = {
  sm: "w-20 h-20 text-[11px]",
  md: "w-24 h-24 text-xs",
  lg: "w-28 h-28 text-xs",
}

const BubbleChip = ({ bubble }: { bubble: Bubble }) => (
  <motion.div
    className="absolute -translate-x-1/2 -translate-y-1/2"
    style={{ top: bubble.top, left: bubble.left }}
    initial={{ opacity: 0, scale: 0.4 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.45, delay: bubble.delay, type: "spring", stiffness: 260, damping: 20 }}
  >
    <Link
      href="/signup"
      className={`
        ${bubble.float}
        ${colorStyles[bubble.color]}
        ${sizeStyles[bubble.size]}
        rounded-full flex items-center justify-center text-center
        font-semibold leading-tight px-2
        transition-all duration-200 cursor-pointer select-none
        hover:scale-110
      `}
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {bubble.label}
    </Link>
  </motion.div>
)

const TherapyNeeds = () => {
  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Eyebrow */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            What brings people here
          </span>
        </motion.div>

        {/* ── Desktop: bubble cloud with centred heading ── */}
        <div className="hidden md:block relative w-full" style={{ height: "560px" }}>

          {/* Centre text — absolutely centred */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2
              className="text-4xl lg:text-5xl font-black text-[#233551] leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Whatever it is —<br />there&apos;s a name for it.
            </h2>
            <p className="text-[#233551]/45 text-sm mt-3 leading-relaxed">
              Click what resonates. We&apos;ll take it from there.
            </p>
            {/* Subtle teal accent dot cluster beneath */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
              <span className="w-1 h-1 rounded-full bg-[#7EC0B7]/50" />
              <span className="w-1 h-1 rounded-full bg-[#7EC0B7]/30" />
            </div>
          </motion.div>

          {/* Floating bubbles */}
          {bubbles.map((bubble) => (
            <BubbleChip key={bubble.label} bubble={bubble} />
          ))}
        </div>

        {/* ── Mobile: heading + flex-wrap chips ── */}
        <div className="md:hidden">
          <motion.h2
            className="text-3xl font-black text-[#233551] leading-tight text-center mb-8"
            style={{ fontFamily: 'var(--font-lato)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Whatever it is —<br />there&apos;s a name for it.
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-3">
            {bubbles.map((bubble, i) => (
              <motion.div
                key={bubble.label}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04, type: "spring", stiffness: 280, damping: 22 }}
              >
                <Link
                  href="/signup"
                  className={`
                    ${colorStyles[bubble.color]}
                    w-20 h-20 rounded-full flex items-center justify-center text-center
                    text-[11px] font-semibold leading-tight px-2
                    transition-all duration-200
                  `}
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {bubble.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bottom nudge ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-[#233551]/40 mt-10"
        >
          Don&apos;t see yours?{" "}
          <Link
            href="/questionnaire"
            className="text-[#3D8A80] font-semibold hover:underline transition-colors"
          >
            Tell us in the assessment →
          </Link>
        </motion.p>

      </div>
    </section>
  )
}

export default TherapyNeeds
