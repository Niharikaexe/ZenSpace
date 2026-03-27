"use client"

import { motion } from "framer-motion"

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
    <section className="bg-[#FFF5F2] pt-28 md:pt-36 pb-20 md:pb-28 relative overflow-hidden">

      {/* Top wave from navy (TherapistCards) */}
      <div className="absolute top-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path
            d="M0,36 C280,72 560,0 840,36 C1020,60 1220,10 1440,36 L1440,0 L0,0 Z"
            fill="#233551"
          />
        </svg>
      </div>

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
        <div className="grid md:grid-cols-3 gap-6">
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
