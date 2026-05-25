"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

const quotes = [
  {
    text: "I felt heard from the first session. That hadn't happened in years.",
    name: "Riya K.",
    location: "Mumbai",
    concern: "Anxiety",
    initial: "R",
    color: "bg-[#233551]",
  },
  {
    text: "She doesn't tell me what to do. She helps me figure it out.",
    name: "Priya A.",
    location: "Bengaluru",
    concern: "Work stress",
    initial: "P",
    color: "bg-[#3D8A80]",
  },
  {
    text: "I cancelled twice before showing up. Glad I didn't cancel a third time.",
    name: "Sahil M.",
    location: "Delhi",
    concern: "Relationships",
    initial: "S",
    color: "bg-[#E8926A]",
  },
  {
    text: "Honestly, just having someone to text on a Wednesday changed everything.",
    name: "Aisha V.",
    location: "Hyderabad",
    concern: "Family",
    initial: "A",
    color: "bg-[#233551]",
  },
  {
    text: "He didn't sugarcoat anything. That's exactly what I needed.",
    name: "Nikhil T.",
    location: "Pune",
    concern: "Career",
    initial: "N",
    color: "bg-[#3D8A80]",
  },
  {
    text: "I was nervous about doing this online. It feels more private than I expected.",
    name: "Kavya R.",
    location: "Chennai",
    concern: "Grief",
    initial: "K",
    color: "bg-[#E8926A]",
  },
  {
    text: "First therapist who didn't tell me to journal more or meditate. We actually talked.",
    name: "Tanvi S.",
    location: "Gurgaon",
    concern: "Burnout",
    initial: "T",
    color: "bg-[#233551]",
  },
  {
    text: "Switched once. No drama, no explaining. Found my person on the second try.",
    name: "Rohan D.",
    location: "Bengaluru",
    concern: "Anxiety",
    initial: "R",
    color: "bg-[#3D8A80]",
  },
  {
    text: "I show up in pyjamas, with chai. I think that's the only reason I kept going.",
    name: "Meera J.",
    location: "Kolkata",
    concern: "Low mood",
    initial: "M",
    color: "bg-[#E8926A]",
  },
]

const VISIBLE = 3

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 72 : -72 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -72 : 72 }),
}

const mobileVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -56 : 56 }),
}

export default function Testimonials() {
  // Desktop: 3 cards at a time, 2 pages
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)

  // Mobile: 1 card at a time, 6 pages
  const [mobilePage, setMobilePage] = useState(0)
  const [mobileDir, setMobileDir] = useState(1)

  const totalPages = Math.ceil(quotes.length / VISIBLE)

  function goNext() {
    if (page < totalPages - 1) { setDirection(1); setPage(p => p + 1) }
  }
  function goPrev() {
    if (page > 0) { setDirection(-1); setPage(p => p - 1) }
  }

  function mobileNext() {
    setMobileDir(1)
    setMobilePage(p => (p + 1) % quotes.length)
  }
  function mobilePrev() {
    setMobileDir(-1)
    setMobilePage(p => (p - 1 + quotes.length) % quotes.length)
  }

  const visible = quotes.slice(page * VISIBLE, page * VISIBLE + VISIBLE)
  const mobileQuote = quotes[mobilePage]

  return (
    <section className="bg-[#FFF5F2] pt-16 md:pt-20 pb-20 md:pb-28 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="mc-anim-bg absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,146,106,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="mc-anim-bg absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(126,192,183,0.08) 0%, transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-12 md:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7EC0B7] mb-4">
            Real stories
          </p>
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

        {/* ── Mobile: single-card carousel ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">

            {/* Left arrow */}
            <button
              onClick={mobilePrev}
              aria-label="Previous testimonial"
              className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-[#233551]/15 flex items-center justify-center text-[#233551]/40 hover:border-[#233551]/40 hover:text-[#233551] transition-all duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Card */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={mobileDir}>
                <motion.div
                  key={mobilePage}
                  custom={mobileDir}
                  variants={mobileVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="bg-white rounded-3xl p-6 shadow-sm shadow-[#233551]/6 border border-slate-100">

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-[#233551]/75 text-sm leading-relaxed mb-5">
                      &ldquo;{mobileQuote.text}&rdquo;
                    </p>

                    {/* Attribution */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className={`w-10 h-10 rounded-full ${mobileQuote.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-[11px] font-black text-white" style={{ fontFamily: 'var(--font-lato)' }}>
                          {mobileQuote.initial}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                          {mobileQuote.name} · {mobileQuote.location}
                        </p>
                        <p className="text-[10px] text-[#7EC0B7] font-semibold mt-0.5">{mobileQuote.concern}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right arrow */}
            <button
              onClick={mobileNext}
              aria-label="Next testimonial"
              className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-[#233551]/15 flex items-center justify-center text-[#233551]/40 hover:border-[#233551]/40 hover:text-[#233551] transition-all duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => { setMobileDir(i > mobilePage ? 1 : -1); setMobilePage(i) }}
                aria-label={`Go to testimonial ${i + 1}`}
                className="mc-touch px-1"
              >
                <span className={`block rounded-full transition-all duration-300 ${
                  i === mobilePage
                    ? 'w-5 h-2 bg-[#7EC0B7]'
                    : 'w-2 h-2 bg-[#233551]/15 hover:bg-[#233551]/30'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop: 3-card carousel ── */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                className="grid grid-cols-3 gap-6"
              >
                {visible.map((q) => (
                  <div
                    key={q.name}
                    className="bg-white rounded-3xl p-7 flex flex-col gap-5 shadow-sm shadow-[#233551]/6 border border-slate-100 hover:shadow-lg hover:shadow-[#233551]/8 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className="text-5xl leading-none font-black text-[#7EC0B7]/20 select-none -mb-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                      aria-hidden
                    >
                      &ldquo;
                    </div>

                    <p className="text-[#233551]/70 text-sm leading-relaxed flex-1">
                      {q.text}
                    </p>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <div className={`w-9 h-9 rounded-full ${q.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-[10px] font-black text-white" style={{ fontFamily: 'var(--font-lato)' }}>
                          {q.initial}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                          {q.name} · {q.location}
                        </p>
                        <p className="text-[10px] text-[#7EC0B7] font-semibold mt-0.5">{q.concern}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop arrows + dots */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={goPrev}
              disabled={page === 0}
              aria-label="Previous testimonials"
              className="w-11 h-11 rounded-full border-2 border-[#233551]/15 flex items-center justify-center text-[#233551]/40 hover:border-[#233551]/40 hover:text-[#233551] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > page ? 1 : -1); setPage(i) }}
                  aria-label={`Go to page ${i + 1}`}
                  className="mc-touch px-2"
                >
                  <span className={`block rounded-full transition-all duration-300 ${
                    i === page
                      ? 'w-6 h-2 bg-[#7EC0B7]'
                      : 'w-2 h-2 bg-[#233551]/15 hover:bg-[#233551]/30'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={page === totalPages - 1}
              aria-label="Next testimonials"
              className="w-11 h-11 rounded-full border-2 border-[#233551]/15 flex items-center justify-center text-[#233551]/40 hover:border-[#233551]/40 hover:text-[#233551] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
