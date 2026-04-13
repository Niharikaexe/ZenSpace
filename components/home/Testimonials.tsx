"use client"

import { motion } from "framer-motion"

const quotes = [
  {
    text: "I’d tried this before and felt like a case file. At Zen Space, my therapist didn’t start with a label. She just listened. For the first time, I felt like I could actually breathe.",
    name: "R.K.",
    location: "Mumbai",
    concern: "Anxiety & burnout",
    delay: 0.1,
  },
  {
    text: "The messaging between our weekly conversations is what changed things for me. When I’m having a rough Wednesday, I don’t have to wait until Sunday to feel heard.",
    name: "P.A.",
    location: "Bengaluru",
    concern: "Work stress",
    delay: 0.2,
  },
  {
    text: "It’s just a private room on my laptop. No one in my life needs to know I’m here, and that gave me the courage to finally start the practice.",
    name: "S.M.",
    location: "Delhi",
    concern: "Relationship issues",
    delay: 0.3,
  },
  {
    text: "My parents don’t know I go to therapy. Not because I’m hiding it — just because it’s mine. That distinction matters more than I thought it would.",
    name: "A.V.",
    location: "Hyderabad",
    concern: "Family pressure",
    delay: 0.4,
  },
  {
    text: "Three therapists before this one. The first two were fine. This one actually gets the specific version of my problems — the Indian-family, corporate-job, quarter-life kind.",
    name: "N.T.",
    location: "Pune",
    concern: "Identity & career",
    delay: 0.5,
  },
]

const Testimonials = () => {
  return (
    <section className="bg-[#FFF5F2] pt-16 md:pt-20 pb-20 md:pb-28 relative overflow-hidden">

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: q.delay, ease: "easeOut" }}
              className="bg-white rounded-3xl p-7 flex flex-col gap-5 border-t-4 border-[#7EC0B7] shadow-md shadow-[#233551]/6 hover:shadow-xl hover:shadow-[#233551]/8 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="text-6xl leading-none text-[#7EC0B7]/30 font-black select-none -mb-2"
                style={{ fontFamily: 'var(--font-lato)' }}
                aria-hidden
              >
                &quot;
              </div>

              <p className="text-[#233551]/70 text-sm leading-relaxed flex-1">
                {q.text}
              </p>

              <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
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

      </div>
    </section>
  )
}

export default Testimonials
