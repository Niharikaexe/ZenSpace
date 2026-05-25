"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AssessmentModal } from "@/components/shared/AssessmentModal"

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

const bubbles: Bubble[] = [
  { label: "Anxiety",           top: "7%",  left: "8%",  size: "md", color: "navy-light",  float: "float-slow",                 delay: 0.05 },
  { label: "Burnout",           top: "5%",  left: "32%", size: "sm", color: "coral-solid", float: "float-medium float-delay-1", delay: 0.10 },
  { label: "Grief",             top: "6%",  left: "55%", size: "sm", color: "teal-light",  float: "float-slow float-delay-2",   delay: 0.08 },
  { label: "Loneliness",        top: "4%",  left: "76%", size: "sm", color: "navy-light",  float: "float-medium float-delay-3", delay: 0.14 },
  { label: "Trauma",            top: "8%",  left: "92%", size: "sm", color: "coral-light", float: "float-slow float-delay-1",   delay: 0.12 },
  { label: "Depression",        top: "27%", left: "3%",  size: "md", color: "teal-solid",  float: "float-slow float-delay-2",   delay: 0.18 },
  { label: "Overthinking",      top: "24%", left: "23%", size: "sm", color: "navy-light",  float: "float-medium float-delay-1", delay: 0.20 },
  { label: "Work stress",       top: "22%", left: "76%", size: "sm", color: "coral-light", float: "float-slow float-delay-3",   delay: 0.16 },
  { label: "Teen struggles",    top: "28%", left: "92%", size: "sm", color: "navy-solid",  float: "float-medium float-delay-2", delay: 0.22 },
  { label: "In-laws",           top: "48%", left: "3%",  size: "sm", color: "teal-light",  float: "float-medium float-delay-1", delay: 0.24 },
  { label: "Anger",             top: "50%", left: "92%", size: "sm", color: "coral-solid", float: "float-slow float-delay-3",   delay: 0.26 },
  { label: "Trust issues",      top: "68%", left: "2%",  size: "sm", color: "navy-light",  float: "float-slow float-delay-2",   delay: 0.28 },
  { label: "Panic attacks",     top: "72%", left: "20%", size: "sm", color: "teal-solid",  float: "float-medium float-delay-1", delay: 0.22 },
  { label: "Relationship",      top: "70%", left: "74%", size: "md", color: "navy-light",  float: "float-slow float-delay-3",   delay: 0.18 },
  { label: "Imposter syndrome", top: "74%", left: "92%", size: "sm", color: "coral-light", float: "float-medium float-delay-2", delay: 0.20 },
  { label: "Identity",          top: "90%", left: "6%",  size: "sm", color: "navy-solid",  float: "float-slow float-delay-1",   delay: 0.32 },
  { label: "Marital conflicts", top: "88%", left: "28%", size: "md", color: "teal-light",  float: "float-medium float-delay-3", delay: 0.28 },
  { label: "Low self-worth",    top: "91%", left: "52%", size: "sm", color: "coral-light", float: "float-slow float-delay-2",   delay: 0.30 },
  { label: "Sleep & stress",    top: "88%", left: "72%", size: "sm", color: "teal-solid",  float: "float-medium float-delay-1", delay: 0.26 },
  { label: "Quarter-life",      top: "90%", left: "90%", size: "md", color: "coral-solid", float: "float-slow float-delay-3",   delay: 0.34 },
]

// Fewer bubbles for mobile — scattered at edges, center kept clear for the heading
const mobileBubbles = [
  { label: "Anxiety",        top: "7%",  left: "10%", color: "navy-light"  as BubbleColor, float: "float-slow",                 delay: 0.05 },
  { label: "Burnout",        top: "4%",  left: "72%", color: "coral-solid" as BubbleColor, float: "float-medium float-delay-1", delay: 0.10 },
  { label: "Loneliness",     top: "6%",  left: "90%", color: "teal-light"  as BubbleColor, float: "float-slow float-delay-2",   delay: 0.08 },
  { label: "Depression",     top: "26%", left: "5%",  color: "teal-solid"  as BubbleColor, float: "float-slow float-delay-3",   delay: 0.14 },
  { label: "Teen struggles", top: "30%", left: "87%", color: "navy-solid"  as BubbleColor, float: "float-medium float-delay-2", delay: 0.18 },
  { label: "Grief",          top: "52%", left: "3%",  color: "coral-light" as BubbleColor, float: "float-medium float-delay-1", delay: 0.20 },
  { label: "Overthinking",   top: "55%", left: "87%", color: "navy-light"  as BubbleColor, float: "float-slow float-delay-3",   delay: 0.16 },
  { label: "Work stress",    top: "72%", left: "8%",  color: "coral-solid" as BubbleColor, float: "float-slow float-delay-1",   delay: 0.22 },
  { label: "Identity",       top: "75%", left: "82%", color: "teal-light"  as BubbleColor, float: "float-medium float-delay-3", delay: 0.24 },
  { label: "Relationship",   top: "88%", left: "4%",  color: "navy-light"  as BubbleColor, float: "float-slow float-delay-2",   delay: 0.28 },
  { label: "Quarter-life",   top: "90%", left: "52%", color: "coral-light" as BubbleColor, float: "float-medium float-delay-1", delay: 0.26 },
  { label: "Panic attacks",  top: "88%", left: "86%", color: "teal-solid"  as BubbleColor, float: "float-slow float-delay-3",   delay: 0.30 },
]

const colorStyles: Record<BubbleColor, string> = {
  "teal-solid":  "bg-[#7EC0B7] text-white shadow-md shadow-[#7EC0B7]/30",
  "teal-light":  "bg-[#7EC0B7]/15 text-[#3D8A80]",
  "navy-solid":  "bg-[#233551] text-white shadow-md shadow-[#233551]/25",
  "navy-light":  "bg-[#EEF1F6] text-[#233551]",
  "coral-solid": "bg-[#E8926A] text-white shadow-md shadow-[#E8926A]/30",
  "coral-light": "bg-[#FFE8E2] text-[#C8683A]",
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
    <div
      className={`
        ${bubble.float}
        ${colorStyles[bubble.color]}
        ${sizeStyles[bubble.size]}
        rounded-full flex items-center justify-center text-center
        font-semibold leading-tight px-2 select-none
      `}
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {bubble.label}
    </div>
  </motion.div>
)

const TherapyNeeds = () => {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <section className="bg-white py-20 md:py-28 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">

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
            </motion.div>

            {/* Floating bubbles */}
            {bubbles.map((bubble) => (
              <BubbleChip key={bubble.label} bubble={bubble} />
            ))}
          </div>

          {/* ── Mobile: scattered background bubbles + centred heading ── */}
          <div className="md:hidden relative overflow-hidden" style={{ minHeight: '400px' }}>

            {/* Background bubbles — scattered at edges, center clear */}
            {mobileBubbles.map((b, i) => (
              <motion.div
                key={b.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: b.top, left: b.left }}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: b.delay, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div
                  className={`
                    ${b.float}
                    ${colorStyles[b.color]}
                    w-[68px] h-[68px] rounded-full flex items-center justify-center text-center
                    text-[10px] font-semibold leading-tight px-2 select-none opacity-80
                  `}
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {b.label}
                </div>
              </motion.div>
            ))}

            {/* Heading — centered over the bubble field */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none px-10">
              <motion.h2
                className="text-3xl font-black text-[#233551] leading-tight text-center"
                style={{ fontFamily: 'var(--font-lato)' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                Whatever it is —<br />there&apos;s a name for it.
              </motion.h2>
            </div>
          </div>

          {/* ── Bottom nudge ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#233551] px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-all duration-200 shadow-lg shadow-[#233551]/20 hover:-translate-y-0.5"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Talk to us with a short assessment →
            </button>
          </motion.div>

        </div>
      </section>

      {showPopup && <AssessmentModal onClose={() => setShowPopup(false)} />}
    </>
  )
}

export default TherapyNeeds
