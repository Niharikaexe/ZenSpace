"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

/* ── Animated counter ── */
const useCounter = (target: number, inView: boolean, duration = 1800) => {
  const [count, setCount] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [inView, target, duration])

  return count
}

const AnimatedStat = ({ value, suffix = "", label, delay }: {
  value: number; suffix?: string; label: string; delay: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const count = useCounter(value, inView)

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        className="text-3xl md:text-4xl font-black text-[#233551] mb-1"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        {count}{suffix}
      </div>
      <div className="text-xs text-[#233551]/45 font-medium leading-snug max-w-[120px] mx-auto">{label}</div>
    </motion.div>
  )
}

const quotes = [
  {
    text: "I'd been to two therapists before and cancelled after the first session both times. My ZenSpace therapist didn't try to diagnose me in the first ten minutes. She just listened. That was enough.",
    name: "R.K.",
    location: "Mumbai",
    concern: "Anxiety & burnout",
    delay: 0.1,
  },
  {
    text: "The messaging between sessions is what I didn't know I needed. I had a bad meeting on a Wednesday. Instead of spiralling till Sunday, I sent a voice note and got a response that actually helped.",
    name: "P.A.",
    location: "Bengaluru",
    concern: "Work stress",
    delay: 0.2,
  },
  {
    text: "My family still doesn't know I'm in therapy. Not because I'm ashamed — I just don't want their opinions on it. ZenSpace made that easy. No clinic, no invoices on shared accounts. Just me and my therapist.",
    name: "S.M.",
    location: "Delhi",
    concern: "Relationship issues",
    delay: 0.3,
  },
]

const Testimonials = () => {
  return (
    <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">

      {/* Subtle peach blob top-right */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,146,106,0.10) 0%, transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            Real stories
          </span>
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Things people said<br />after their first session.
          </h2>
          <p className="text-[#233551]/50 text-sm leading-relaxed">
            Names shortened for privacy. Everything else is exactly what they sent us.
          </p>
        </motion.div>

        {/* ── Quote cards ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {quotes.map((q) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: q.delay, ease: "easeOut" }}
              className="bg-white rounded-3xl p-7 flex flex-col gap-5 border-t-4 border-[#7EC0B7] shadow-md shadow-[#233551]/6 hover:shadow-xl hover:shadow-[#233551]/8 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Large opening quote */}
              <div
                className="text-6xl leading-none text-[#7EC0B7]/30 font-black select-none -mb-2"
                style={{ fontFamily: 'var(--font-lato)' }}
                aria-hidden
              >
                "
              </div>

              {/* Quote text */}
              <p className="text-[#233551]/70 text-sm leading-relaxed flex-1">
                {q.text}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                {/* Initials avatar */}
                <div className="w-9 h-9 rounded-full bg-[#233551] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-[#7EC0B7]" style={{ fontFamily: 'var(--font-lato)' }}>
                    {q.name.split(".")[0]}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                    {q.name} · {q.location}
                  </p>
                  <p className="text-[10px] text-[#7EC0B7] font-medium mt-0.5">{q.concern}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Animated stats bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl px-8 py-8 border border-slate-100 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={5000}  suffix="+"  label="People helped across India"  delay={0.35} />
            <AnimatedStat value={92}    suffix="%"  label="Feel heard in their first session" delay={0.45} />
            <AnimatedStat value={15}    suffix=" min" label="Free intro call — before you pay" delay={0.55} />
            <AnimatedStat value={48}    suffix="hrs" label="From sign-up to first session" delay={0.65} />
          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default Testimonials
