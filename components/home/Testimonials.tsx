"use client"

import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "I'd tried this before and felt like a case file. At Zen Space, my therapist didn't start with a label. She just listened. For the first time, I felt like I could actually breathe.",
    name: "R.K.",
    city: "Mumbai",
  },
  {
    quote:
      "The messaging between our weekly conversations is what changed things for me. When I'm having a rough Wednesday, I don't have to wait until Sunday to feel heard.",
    name: "P.A.",
    city: "Bengaluru",
  },
  {
    quote:
      "It's just a private room on my laptop. No one in my life needs to know I'm here, and that gave me the courage to finally start the practice.",
    name: "S.M.",
    city: "Delhi",
  },
]

/* Opening quote SVG */
const QuoteMark = () => (
  <svg viewBox="0 0 40 32" fill="none" className="w-8 h-6 opacity-20">
    <path
      d="M0 32V20C0 13.3 2 8 6 4C10 0 15.3 0 22 0v6c-4 0-7 1.3-9 4C11 13 10 16.7 10 21h8v11H0zm22 0V20c0-6.7 2-12 6-16C32 0 37.3 0 44 0v6c-4 0-7 1.3-9 4-2 2.7-3 6.3-3 11h8v11H22z"
      fill="#233551"
    />
  </svg>
)

const Testimonials = () => {
  return (
    <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
      {/* Decorative leaves */}
      <div className="absolute top-10 right-12 w-24 h-24 rounded-full bg-[#7EC0B7]/10 pointer-events-none" />
      <div className="absolute bottom-10 left-12 w-16 h-16 rounded-full bg-[#E8926A]/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            What it actually feels like.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white rounded-3xl p-7 shadow-sm shadow-[#233551]/6 border border-slate-100 flex flex-col"
            >
              <QuoteMark />
              <p className="text-[#233551]/75 text-sm leading-relaxed mt-4 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-[#233551]">{t.name}</p>
                <p className="text-xs text-[#233551]/40 mt-0.5">{t.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
