"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const quotes = [
  {
    text: "I'd tried this before and felt like a case file. At MindCanopy, my therapist didn't start with a label. She just listened. For the first time, I felt like I could actually breathe.",
    name: "R.K.",
    location: "Mumbai",
    concern: "Anxiety & burnout",
    initial: "R",
    color: "bg-[#233551]",
  },
  {
    text: "The messaging between our weekly conversations is what changed things for me. When I'm having a rough Wednesday, I don't have to wait until Sunday to feel heard.",
    name: "P.A.",
    location: "Bengaluru",
    concern: "Work stress",
    initial: "P",
    color: "bg-[#3D8A80]",
  },
  {
    text: "It's just a private room on my laptop. No one in my life needs to know I'm here, and that gave me the courage to finally start.",
    name: "S.M.",
    location: "Delhi",
    concern: "Relationship issues",
    initial: "S",
    color: "bg-[#E8926A]",
  },
  {
    text: "My parents don't know I go to therapy. Not because I'm hiding it — just because it's mine. That distinction matters more than I thought it would.",
    name: "A.V.",
    location: "Hyderabad",
    concern: "Family pressure",
    initial: "A",
    color: "bg-[#233551]",
  },
  {
    text: "Three therapists before this one. The first two were fine. This one actually gets the specific version of my problems — the Indian-family, corporate-job, quarter-life kind.",
    name: "N.T.",
    location: "Pune",
    concern: "Identity & career",
    initial: "N",
    color: "bg-[#3D8A80]",
  },
  {
    text: "I didn't know what I needed. I just knew something wasn't right. My therapist helped me name it — slowly, without any rush. That patience made all the difference.",
    name: "K.R.",
    location: "Chennai",
    concern: "Grief & loss",
    initial: "K",
    color: "bg-[#E8926A]",
  },
]

const VISIBLE = 3

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 72 : -72 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -72 : 72 }),
}

export default function Testimonials() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)

  const totalPages = Math.ceil(quotes.length / VISIBLE)

  function goNext() {
    if (page < totalPages - 1) {
      setDirection(1)
      setPage(p => p + 1)
    }
  }

  function goPrev() {
    if (page > 0) {
      setDirection(-1)
      setPage(p => p - 1)
    }
  }

  const visible = quotes.slice(page * VISIBLE, page * VISIBLE + VISIBLE)

  return (
    <section className="bg-[#FFF5F2] pt-16 md:pt-20 pb-20 md:pb-28 relative overflow-hidden">
      {/* Decorative blobs — mc-anim-bg keeps them subtle on mobile */}
      <div
        className="mc-anim-bg absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,146,106,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="mc-anim-bg absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(126,192,183,0.08) 0%, transparent 70%)" }}
      />

      <div className="mc-content max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-14"
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

        {/* Carousel */}
        <div className="relative">
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
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {visible.map((q) => (
                  <div
                    key={q.name}
                    className="bg-white rounded-3xl p-7 flex flex-col gap-5 shadow-sm shadow-[#233551]/6 border border-slate-100 hover:shadow-lg hover:shadow-[#233551]/8 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Large quote mark */}
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

          {/* Arrow buttons */}
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

            {/* Page dots — wrapped in mc-touch padding for tap target */}
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
