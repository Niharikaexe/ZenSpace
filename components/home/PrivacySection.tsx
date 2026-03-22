"use client"

import { motion } from "framer-motion"

const items = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <rect x="6" y="14" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M10 14V10a6 6 0 1 1 12 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="21" r="2" fill="currentColor" />
      </svg>
    ),
    title: "Nobody in your life will know.",
    body: "No shared records with your employer, your family, or anyone else. Your sessions are yours. We don't contact anyone on your behalf — ever.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <path d="M16 4L6 9v8c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V9L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 16l3.5 3.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "No clinic. No paper trail.",
    body: "Everything happens inside the platform. No invoices on shared bank statements, no waiting rooms someone you know might walk into. It exists only where you let it.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <path d="M8 16h16M8 10h10M8 22h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M22 19l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Leave whenever you want.",
    body: "No contracts. No cancellation fees. No \"please speak to a retention specialist.\" If you need to stop, you stop. That's it.",
  },
]

const PrivacySection = () => {
  return (
    <section className="bg-[#F0FAF9] py-20 md:py-24 relative overflow-hidden">

      {/* Subtle teal decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#7EC0B7]/6 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#7EC0B7]/6 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <motion.div
          className="text-center max-w-xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            Privacy
          </span>
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            It&apos;s yours.<br />All of it.
          </h2>
          <p className="text-[#233551]/50 text-base leading-relaxed">
            Therapy works best when you&apos;re not worried about who&apos;s watching. So we made sure no one is.
          </p>
        </motion.div>

        {/* ── Three trust items ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              className="flex flex-col gap-4 bg-white/70 backdrop-blur-sm rounded-3xl p-7 border border-[#7EC0B7]/20 shadow-sm"
            >
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-2xl bg-[#7EC0B7]/15 flex items-center justify-center text-[#3D8A80] flex-shrink-0">
                {item.icon}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3
                  className="text-base font-black text-[#233551] leading-snug"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#233551]/55 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default PrivacySection
