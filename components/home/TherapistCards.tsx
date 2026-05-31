"use client"

import { useEffect, useRef } from "react"
import { Star } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

interface FloatDotProps {
  top?: string
  bottom?: string
  left?: string
  right?: string
  size: number
  color: string
  delay: number
  duration: number
  reduce: boolean
}

const FloatDot = ({ top, bottom, left, right, size, color, delay, duration, reduce }: FloatDotProps) => (
  <motion.span
    style={{
      position: "absolute",
      top, bottom, left, right,
      width: size, height: size,
      borderRadius: 9999,
      background: color,
      opacity: 0.8,
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={reduce ? { opacity: 0.8, scale: 1, y: 0 } : { opacity: 0.8, scale: 1, y: [0, -10, 0, 8, 0] }}
    transition={
      reduce
        ? { duration: 0.5, delay }
        : {
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 },
          }
    }
  />
)

const MeditatingFigure = () => {
  const reduce = useReducedMotion()
  return (
    <div className="relative w-full h-full">
      <motion.svg
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ transformOrigin: "center" }}
        animate={reduce ? undefined : { rotate: [0, 4, -3, 0], scale: [1, 1.02, 0.99, 1] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        aria-hidden
      >
        <path
          d="M460,90 C540,140 580,240 560,340 C540,440 470,520 360,540 C240,560 130,510 80,420 C30,330 50,220 130,150 C210,80 380,40 460,90 Z"
          fill="#FFE8E2"
        />
      </motion.svg>

      <motion.img
        src="/assets/individual-therapy.png"
        alt=""
        style={{ position: "absolute", inset: "8% 6% 6% 8%", width: "86%", height: "86%", objectFit: "contain" }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={
          reduce
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 1, y: [0, -6, 0], scale: [1, 1.015, 1] }
        }
        transition={
          reduce
            ? { duration: 0.6 }
            : {
                opacity: { duration: 0.9, delay: 0.3, ease: "easeOut" },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.9 },
                scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.9 },
              }
        }
      />

      <FloatDot top="8%" left="12%" size={26} color="#E8926A" delay={0.4} duration={6.5} reduce={!!reduce} />
      <FloatDot bottom="14%" right="10%" size={26} color="#7EC0B7" delay={0.7} duration={7.5} reduce={!!reduce} />
      <FloatDot top="38%" right="4%" size={18} color="#F97B5A" delay={1.0} duration={5.5} reduce={!!reduce} />
    </div>
  )
}

const therapists = [
  { name: "Priya Menon",     specialty: "Anxiety & Depression",   bio: "London-trained, based in Bengaluru. CBT for chronic anxiety and low mood.",            rating: 4.9, reviews: 312, available: true,  initials: "PM" },
  { name: "Sarah Mitchell",  specialty: "Couples & Family",       bio: "UK-licensed couples therapist. Communication breakdown and long-term conflict.",        rating: 4.8, reviews: 256, available: true,  initials: "SM" },
  { name: "Arjun Kapoor",    specialty: "Trauma & PTSD",          bio: "EMDR-trained, based in Delhi. Complex, relational and developmental trauma.",          rating: 5.0, reviews: 287, available: false, initials: "AK" },
  { name: "Amara Williams",  specialty: "Teen & Adolescent",      bio: "NYU-trained. Works with teens navigating academic pressure and identity.",             rating: 4.9, reviews: 189, available: true,  initials: "AW" },
  { name: "Neha Iyer",       specialty: "Burnout & Work Stress",  bio: "Pune-based, ex-corporate. Specialises in high-performance burnout and boundaries.",   rating: 4.7, reviews: 221, available: true,  initials: "NI" },
  { name: "David Okafor",    specialty: "Self-Esteem & Identity", bio: "Toronto-based psychodynamic therapist. Inner critic and life transitions.",            rating: 4.8, reviews: 175, available: true,  initials: "DO" },
  { name: "Karan Sharma",    specialty: "Grief & Loss",           bio: "Delhi-based, trained at Tavistock. Bereavement, estrangement and unexpected loss.",   rating: 4.9, reviews: 198, available: false, initials: "KS" },
  { name: "Emily Park",      specialty: "Work-Life Balance",      bio: "Singapore-based. Helps clients redesign their relationship with work.",                rating: 4.6, reviews: 144, available: true,  initials: "EP" },
  { name: "Meera Joshi",     specialty: "Couples & Relationships",bio: "Mumbai-based, Gottman-method certified. Long-term and pre-marital couples work.",     rating: 4.9, reviews: 232, available: true,  initials: "MJ" },
  { name: "James Chen",      specialty: "Anxiety & OCD",          bio: "Toronto-trained. ERP and CBT for OCD, panic and generalised anxiety.",                rating: 4.8, reviews: 167, available: true,  initials: "JC" },
]

const TherapistCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Skip continuous scroll on mobile — let users swipe naturally
    if (window.innerWidth < 768) return
    let frame: number
    let paused = false

    const tick = () => {
      if (!paused && el) {
        el.scrollLeft += 0.5
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0
        }
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    const pause = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', pause)
    el.addEventListener('touchend', resume)

    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
    }
  }, [])

  return (
    <section id="therapists" className="bg-[#233551] relative overflow-hidden">

      {/* Decorative dots */}
      <div className="absolute top-12 left-16 w-2 h-2 rounded-full bg-[#7EC0B7] pulse-dot opacity-60" />
      <div className="absolute top-28 right-24 w-1.5 h-1.5 rounded-full bg-white pulse-dot float-delay-1 opacity-30" />
      <div className="absolute top-20 left-1/3 w-1.5 h-1.5 rounded-full bg-[#E8926A] pulse-dot float-delay-2 opacity-50" />
      <div className="absolute bottom-40 right-16 w-2 h-2 rounded-full bg-[#7EC0B7] pulse-dot float-delay-1 opacity-40" />
      <div className="absolute bottom-60 left-10 w-1 h-1 rounded-full bg-white pulse-dot float-delay-3 opacity-25" />

      <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-28 md:pb-36 relative z-10">

        {/* Top area: illustration + text */}
        <div className="relative flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 mb-12 md:mb-16">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute md:relative right-0 -top-6 md:right-auto md:top-auto w-36 h-44 sm:w-44 sm:h-56 md:w-64 md:h-80 opacity-[0.18] md:opacity-100 pointer-events-none md:pointer-events-auto flex-shrink-0"
          >
            <MeditatingFigure />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="flex-1 space-y-6 relative z-10"
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              People we’ve met <br /> 
              and trust.
            </h2>

            <p className="text-white/55 text-base leading-relaxed max-w-md">
            Finding someone to talk to shouldn’t feel like a research project. We’ve already had the initial conversations with every therapist on MindCanopy to make sure they’re the right fit for this environment. We keep their profiles simple and honest, so you can spend less time scrolling and more time finding the person who understands your world.
            </p>

            <div className="flex flex-wrap gap-8 pt-2">
              {[
                { value: "5,000+", label: "Clients helped" },
                { value: "4.9★", label: "Average rating" },
                { value: "100%", label: "Licensed & verified" },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-lato)' }}>{stat.value}</div>
                  <div className="text-xs text-white/45 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-bold text-white/35 uppercase tracking-widest">Meet a few of our therapists</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Auto-scrolling cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[...therapists, ...therapists].map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % therapists.length) * 0.06 }}
              className="bg-[#1d2d47] rounded-2xl p-5 border border-white/8 hover:border-white/20 hover:bg-[#243654] transition-all duration-300 min-w-[230px] max-w-[250px] flex-shrink-0"
            >
              <div className="flex flex-col items-center text-center space-y-3.5">
                <div className="w-16 h-16 rounded-full bg-[#7EC0B7]/25 border border-[#7EC0B7]/30 flex items-center justify-center">
                  <span className="text-base font-black text-[#7EC0B7]" style={{ fontFamily: 'var(--font-lato)' }}>
                    {t.initials}
                  </span>
                </div>

                {t.available ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7EC0B7] bg-[#7EC0B7]/12 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-pulse" />
                    Available Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 bg-white/6 px-3 py-1 rounded-full">
                    Next Available Tomorrow
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-black text-white" style={{ fontFamily: 'var(--font-lato)' }}>
                    {t.name}
                  </h3>
                  <p className="text-xs text-[#7EC0B7] mt-0.5 font-medium">{t.specialty}</p>
                </div>

                <p className="text-xs text-white/45 leading-relaxed">{t.bio}</p>

                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-white">{t.rating}</span>
                  <span className="text-xs text-white/35">({t.reviews})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom wave → peach (Testimonials) */}
      <div className="absolute -bottom-px left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20 block">
          <path
            d="M0,36 C280,72 560,0 840,36 C1020,60 1220,10 1440,36 L1440,72 L0,72 Z"
            fill="#FFF5F2"
          />
        </svg>
      </div>
    </section>
  )
}

export default TherapistCards
