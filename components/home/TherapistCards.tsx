"use client"

import { useEffect, useRef } from "react"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const WomanIllustration = () => (
  <svg viewBox="0 0 280 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <ellipse cx="140" cy="220" rx="115" ry="130" fill="rgba(126,192,183,0.10)" />
    <path d="M30,300 C10,240 22,160 72,130 C62,170 48,230 30,300 Z" fill="#2A6B63" />
    <path d="M30,300 C48,242 60,180 72,130" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    <path d="M250,290 C270,228 258,148 208,118 C218,158 234,222 250,290 Z" fill="#2A6B63" />
    <path d="M250,290 C234,230 220,166 208,118" stroke="#1E5048" strokeWidth="1.5" fill="none" />
    <path d="M55,148 C35,118 45,78 75,68 C69,94 60,124 55,148 Z" fill="#3D8A80" fillOpacity="0.8" />
    <path d="M225,140 C245,110 235,70 205,60 C211,86 220,116 225,140 Z" fill="#3D8A80" fillOpacity="0.8" />
    <ellipse cx="140" cy="290" rx="68" ry="72" fill="#E8926A" />
    <circle cx="122" cy="268" r="7" fill="white" fillOpacity="0.75" />
    <circle cx="148" cy="282" r="5.5" fill="white" fillOpacity="0.65" />
    <circle cx="138" cy="255" r="4" fill="white" fillOpacity="0.5" />
    <rect x="129" y="195" width="22" height="30" rx="11" fill="#FDBCA7" />
    <circle cx="140" cy="172" r="44" fill="#FDBCA7" />
    <path d="M96,158 Q140,100 184,158 Q194,192 190,232 Q164,252 140,252 Q116,252 90,232 Q86,192 96,158 Z" fill="#1C0E08" />
    <path d="M96,158 Q80,192 84,232" stroke="#1C0E08" strokeWidth="10" fill="none" strokeLinecap="round" />
    <path d="M184,158 Q200,192 196,232" stroke="#1C0E08" strokeWidth="10" fill="none" strokeLinecap="round" />
    <circle cx="112" cy="128" r="11" fill="#7EC0B7" />
    <circle cx="104" cy="118" r="5.5" fill="#B8E4DF" />
    <circle cx="121" cy="117" r="5" fill="#B8E4DF" />
    <circle cx="112" cy="110" r="4.5" fill="#B8E4DF" />
    <circle cx="112" cy="128" r="3.5" fill="white" fillOpacity="0.9" />
    <circle cx="168" cy="120" r="9.5" fill="#FFB5A7" />
    <circle cx="160" cy="112" r="4.5" fill="#FFD6CF" />
    <circle cx="177" cy="111" r="4" fill="#FFD6CF" />
    <circle cx="168" cy="104" r="4" fill="#FFD6CF" />
    <circle cx="168" cy="120" r="3" fill="white" fillOpacity="0.9" />
    <circle cx="142" cy="106" r="8" fill="#7EC0B7" fillOpacity="0.85" />
    <circle cx="136" cy="99" r="4" fill="#A8D9D4" />
    <circle cx="149" cy="99" r="3.5" fill="#A8D9D4" />
    <circle cx="142" cy="106" r="2.5" fill="white" fillOpacity="0.9" />
    <ellipse cx="129" cy="170" rx="5" ry="6" fill="#1C0E08" />
    <ellipse cx="151" cy="170" rx="5" ry="6" fill="#1C0E08" />
    <circle cx="131" cy="168" r="1.8" fill="white" />
    <circle cx="153" cy="168" r="1.8" fill="white" />
    <path d="M132,184 Q140,192 148,184" stroke="#D4795A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M62,345 C42,310 48,272 76,256 C70,282 64,316 62,345 Z" fill="#2A6B63" />
    <path d="M218,348 C238,313 232,275 204,259 C210,285 216,319 218,348 Z" fill="#2A6B63" />
  </svg>
)

const therapists = [
  { name: "Dr. Sarah Mitchell", specialty: "Anxiety & Depression",   bio: "Specialises in cognitive behavioural approaches for chronic anxiety and low mood.", rating: 4.9, reviews: 328, available: true,  initials: "SM" },
  { name: "Dr. James Chen",     specialty: "Couples & Family",       bio: "Works with partners navigating communication breakdown and long-term conflict cycles.", rating: 4.8, reviews: 256, available: true,  initials: "JC" },
  { name: "Dr. Amara Williams", specialty: "Trauma & PTSD",          bio: "Trauma-focused therapy for survivors of complex, relational and developmental trauma.", rating: 5.0, reviews: 412, available: false, initials: "AW" },
  { name: "Dr. David Okafor",   specialty: "Teen & Adolescent",      bio: "Helps teenagers navigate academic pressure, identity questions and family stress.", rating: 4.9, reviews: 189, available: true,  initials: "DO" },
  { name: "Dr. Emily Park",     specialty: "Stress Management",      bio: "Evidence-informed work for burnout, high-performance anxiety and boundary-setting.", rating: 4.7, reviews: 203, available: true,  initials: "EP" },
  { name: "Dr. Maria Santos",   specialty: "Self-Esteem & Identity", bio: "Psychodynamic work focused on self-worth, inner critic patterns and life transitions.", rating: 4.8, reviews: 175, available: true,  initials: "MS" },
  { name: "Dr. Robert Kim",     specialty: "Grief & Loss",           bio: "Compassionate support through bereavement, estrangement and unexpected life changes.", rating: 4.9, reviews: 291, available: false, initials: "RK" },
  { name: "Dr. Lisa Thompson",  specialty: "Work-Life Balance",      bio: "Helps clients redesign their relationship with work without compromising wellbeing.", rating: 4.6, reviews: 144, available: true,  initials: "LT" },
]

const TherapistCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
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

      {/* Top wave from peach section */}
      <div className="absolute top-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path
            d="M0,36 C280,72 560,0 840,36 C1020,60 1220,10 1440,36 L1440,0 L0,0 Z"
            fill="#FFF5F2"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-28 md:pb-36 relative z-10">

        {/* Top area: illustration + text */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-16">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-shrink-0 w-52 h-64 md:w-64 md:h-80 relative"
          >
            <div className="float-slow w-full h-full">
              <WomanIllustration />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="flex-1 space-y-6"
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Hand-picked therapists,<br />just for you
            </h2>

            <p className="text-white/55 text-base leading-relaxed max-w-md">
              Every therapist that we work with has been carefully screened and assessed by our clinical team. With a rigorous quality standard and clear, easy-to-understand summaries of experience, finding the right therapist for you is faster and easier than ever.
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
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
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
