"use client"

import { motion } from "framer-motion"

/* ── Step data ── */
const steps = [
  {
    number: "01",
    label: "Tell us about your world",
    body: "A few questions to help us understand your rhythm. It takes five minutes and helps us find the right person for your specific needs.",
    sub: "We read every answer to match you with the right therapist.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M11 10h10M11 15h10M11 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    teal: false,
  },
  {
    number: "02",
    label: "Have a conversation",
    body: "Meet the therapist we’ve paired you with for a 15-minute introductory chat. It’s a chance to see if the environment feels right before you commit to the practice.",
    sub: "Align with your matched therapist.",
    badge: "FREE INTRO CHAT",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" />
        <path d="M16 10v6l4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    teal: true,
  },
  {
    number: "03",
    label: "Make it a habit",
    body: "Start your weekly conversations through video or messaging. It’s your space, on your schedule. If you ever feel like you need a different perspective, you can find a new therapist whenever you like.",
    sub: "Switch therapists anytime.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <rect x="4" y="8" width="24" height="17" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M21 16.5l-7-4.5v9l7-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    teal: false,
  },
]

/* ── Chevron connector (desktop only) ── */
const Connector = ({ delay }: { delay: number }) => (
  <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-10 mt-12 relative">
    {/* Dashed line */}
    <motion.div
      className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      {[0,1,2].map(i => (
        <div key={i} className="w-1 h-1 rounded-full bg-[#233551]/20" />
      ))}
    </motion.div>
    {/* Arrow */}
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay + 0.1 }}
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M7 4l6 6-6 6" stroke="#233551" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  </div>
)

/* ── Individual step card ── */
const StepCard = ({ step, index }: { step: typeof steps[number]; index: number }) => {
  const isTeal = step.teal

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={`flex-1 rounded-3xl p-8 flex flex-col gap-5 relative overflow-hidden
        ${isTeal
          ? "bg-[#233551] shadow-2xl shadow-[#233551]/30 scale-[1.02] z-10"
          : "bg-white border border-slate-100 shadow-md shadow-[#233551]/6"
        }`}
    >
      {/* Subtle decorative circle inside teal card */}
      {isTeal && (
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#7EC0B7]/10 pointer-events-none" />
      )}
      {isTeal && (
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/4 pointer-events-none" />
      )}

      {/* Top row: number + icon */}
      <div className="flex items-start justify-between">
        {/* Step number bubble */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 380, damping: 22, delay: index * 0.15 + 0.2 }}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md
            ${isTeal ? "bg-[#7EC0B7] shadow-[#7EC0B7]/30" : "bg-[#233551] shadow-[#233551]/20"}`}
        >
          <span
            className={`text-sm font-black tracking-tighter ${isTeal ? "text-white" : "text-white"}`}
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {step.number}
          </span>
        </motion.div>

        {/* Icon */}
        <div className={isTeal ? "text-[#7EC0B7]" : "text-[#233551]/30"}>
          {step.icon}
        </div>
      </div>

      {/* Free intro badge (step 2 only) */}
      {step.badge && (
        <span className="inline-flex items-center gap-1.5 self-start bg-[#7EC0B7]/20 text-[#7EC0B7] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-[#7EC0B7]" />
          {step.badge}
        </span>
      )}

      {/* Text */}
      <div className="flex-1 flex flex-col gap-3">
        <h3
          className={`text-xl font-black leading-snug ${isTeal ? "text-white" : "text-[#233551]"}`}
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {step.label}
        </h3>

        <p className={`text-sm leading-relaxed ${isTeal ? "text-white/70" : "text-[#233551]/55"}`}>
          {step.body}
        </p>

        <p className={`text-xs leading-relaxed ${isTeal ? "text-[#7EC0B7]" : "text-[#7EC0B7]"} font-medium`}>
          {step.sub}
        </p>
      </div>
    </motion.div>
  )
}

/* ── Stat item ── */
const Stat = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="text-center"
  >
    <div
      className="text-2xl md:text-3xl font-black text-[#233551] mb-1"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {value}
    </div>
    <div className="text-xs text-[#233551]/45 font-medium">{label}</div>
  </motion.div>
)

/* ── Decorative leaf ── */
const Leaf = ({ style }: { style: React.CSSProperties }) => (
  <svg viewBox="0 0 28 42" fill="none" style={style} className="pointer-events-none select-none">
    <path d="M14,40 C14,40 0,28 0,14 C0,0 14,0 14,0 C14,0 28,0 28,14 C28,28 14,40 14,40 Z" fill="#7EC0B7" fillOpacity="0.35" />
    <path d="M14,40 L14,0" stroke="#7EC0B7" strokeWidth="1" strokeOpacity="0.2" />
  </svg>
)

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-[#FFF5F2] pt-20 md:pt-28 pb-28 md:pb-40 relative overflow-hidden">

      {/* Floating leaf decorations */}
      <div className="absolute top-8 left-8 float-slow float-delay-1">
        <Leaf style={{ width: 26, height: 38, transform: "rotate(-20deg)", opacity: 0.6 }} />
      </div>
      <div className="absolute top-20 right-12 float-medium">
        <Leaf style={{ width: 20, height: 30, transform: "rotate(35deg)", opacity: 0.45 }} />
      </div>
      <div className="absolute bottom-36 left-20 float-slow float-delay-2">
        <Leaf style={{ width: 16, height: 24, transform: "rotate(-8deg)", opacity: 0.35 }} />
      </div>
      <div className="absolute bottom-40 right-16 float-medium float-delay-1">
        <Leaf style={{ width: 22, height: 32, transform: "rotate(25deg)", opacity: 0.4 }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Section header ── */}
        <motion.div
          className="text-center mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-[#7EC0B7]" />
            <span className="text-[#3D8A80] text-xs font-black uppercase tracking-[0.2em]">How it works</span>
            <div className="h-px w-12 bg-[#7EC0B7]" />
          </div>
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
             From joining to your first conversation.
          </h2>
          <p className="text-[#233551]/55 text-base leading-relaxed">
            Just a straightforward path to finding your balance.
          </p>
        </motion.div>

        {/* ── 3-step cards ── */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
          <StepCard step={steps[0]} index={0} />
          <Connector delay={0.3} />
          <StepCard step={steps[1]} index={1} />
          <Connector delay={0.5} />
          <StepCard step={steps[2]} index={2} />
        </div>

        {/* ── Bottom stats bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 pt-10 border-t border-[#233551]/8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="< 48hrs" label="Sign-up to first session" delay={0.55} />
            <Stat value="15 min" label="Free intro call included" delay={0.65} />
            <Stat value="Switch" label="Therapists anytime" delay={0.75} />
            <Stat value="₹0" label="Needed to get matched" delay={0.85} />
          </div>
        </motion.div>

      </div>

      {/* ── Bottom wave → dark navy (TherapistCards) ── */}
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-24">
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,10 1080,40 C1200,60 1340,20 1440,40 L1440,80 L0,80 Z"
            fill="#233551"
          />
        </svg>
      </div>
    </section>
  )
}

export default HowItWorks
