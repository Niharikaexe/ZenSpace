'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const EyebrowBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
    {children}
  </span>
)

const AbstractIllustration = () => (
  <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="120" cy="160" r="80" fill="#7EC0B7" fillOpacity="0.18" />
    <circle cx="200" cy="160" r="80" fill="#E8926A" fillOpacity="0.18" />
    <circle cx="160" cy="160" r="55" fill="#7EC0B7" fillOpacity="0.22" />
    <circle cx="100" cy="120" r="28" fill="#7EC0B7" fillOpacity="0.35" />
    <circle cx="220" cy="120" r="28" fill="#E8926A" fillOpacity="0.35" />
    <circle cx="160" cy="220" r="20" fill="#F97B5A" fillOpacity="0.30" />
    <circle cx="70" cy="200" r="10" fill="#7EC0B7" fillOpacity="0.50" />
    <circle cx="250" cy="200" r="10" fill="#E8926A" fillOpacity="0.45" />
    <circle cx="160" cy="80" r="8" fill="#7EC0B7" fillOpacity="0.55" />
    <circle cx="160" cy="270" r="6" fill="#F97B5A" fillOpacity="0.40" />
  </svg>
)

const painPoints = [
  "Every conversation about the same three things ends the same way.",
  "You've started prefacing things with 'I don't want to fight, but...' — and fighting anyway.",
  "You've thought about what leaving would look like. Then felt terrible about it.",
  "You feel more like roommates than partners. You can't remember when that happened.",
  "Family and friends have tried to help. It made things worse.",
]

const concerns = [
  {
    title: "Communication Breakdown",
    body: "Not the big fights. The thousand small moments where you tried to say something and it came out wrong.",
  },
  {
    title: "Emotional Distance",
    body: "Sharing a bed, sharing bills. Not much else. You're not sure when it got this quiet.",
  },
  {
    title: "Intimacy",
    body: "Physical or emotional — or both. Hard to bring up. We've seen it before.",
  },
  {
    title: "In-law Pressure",
    body: "When your family's expectations live inside your marriage. ZenSpace therapists understand Indian dynamics.",
  },
  {
    title: "Financial Conflict",
    body: "Money is never just money. It's about control, security, and what you value.",
  },
  {
    title: "Post-children Drift",
    body: "You love your kids. You also miss each other. That's not a bad thing to admit.",
  },
]

const steps = [
  {
    num: "1",
    title: "Each partner fills in separately",
    body: "Private answers. No pressure to be 'the reasonable one'. Your therapist reads both sides.",
  },
  {
    num: "2",
    title: "Your first session together",
    body: "Your therapist has context before you start. No catching up. You begin.",
  },
  {
    num: "3",
    title: "Work at your own pace",
    body: "Weekly joint sessions. Text support between. Decide together what you're working toward.",
  },
]

const faqs = [
  {
    q: "Does couples therapy actually work?",
    a: "The data says yes — when both partners are willing to show up. You don't need to agree on everything. You just need to both be here.",
  },
  {
    q: "Will the therapist take sides?",
    a: "No. Your therapist's job is to understand both of you — not to decide who's right. They've heard both sides before yours.",
  },
  {
    q: "What if only one of us wants to try this?",
    a: "That's common. It's worth having the first call together anyway. If one of you is curious enough to be here, that's a start.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#233551] text-base">{q}</span>
        <span className="ml-4 flex-shrink-0 text-[#7EC0B7] text-xl font-light">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#233551]/65 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

export default function CouplesPageClient() {
  return (
    <main className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-[#233551] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 400 600" fill="none" className="w-full h-full">
              <circle cx="200" cy="200" r="180" fill="#E8926A" />
              <circle cx="300" cy="420" r="140" fill="#7EC0B7" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-7">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <EyebrowBadge>Online couples therapy</EyebrowBadge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You're not failing your relationship.<br />
                You're both just exhausted.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base text-white/60 leading-relaxed max-w-lg"
              >
                When communication breaks down, it doesn't mean it's over. It means you need someone in the room who isn't on either side. That's what we're here for.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/questionnaire/couples"
                  className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#d47d58] transition-all duration-200 shadow-lg shadow-[#E8926A]/30 hover:-translate-y-0.5"
                >
                  Start couples assessment →
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xs text-[#7EC0B7]/80 font-medium"
              >
                Each partner fills in privately. Your therapist reads both.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80"
            >
              <AbstractIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <EyebrowBadge>Sound familiar?</EyebrowBadge>
          </div>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="lg:w-2/5">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-5xl font-black text-[#233551] leading-[1.15]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You love each other.<br />
                You just can't<br />
                seem to talk anymore.
              </motion.h2>
            </div>

            <div className="lg:w-3/5 space-y-5">
              {painPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-1 flex-shrink-0 self-stretch rounded-full bg-[#7EC0B7] min-h-[2.5rem]" />
                  <p className="text-[#233551]/75 text-base leading-relaxed">{point}</p>
                </motion.div>
              ))}

              <div className="border-t border-slate-100 pt-6 mt-6">
                <p className="text-[#233551]/60 text-sm leading-relaxed mb-5">
                  Coming to therapy isn't giving up. It's giving this a real chance.
                </p>
                <Link
                  href="/questionnaire/couples"
                  className="inline-flex items-center gap-2 bg-[#7EC0B7] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#3D8A80] transition-colors"
                >
                  Take the couples assessment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE ADDRESS ── */}
      <section className="bg-[#FFF5F2] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-[#233551] mb-12"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            What couples come to us with
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {concerns.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="h-1 bg-[#7EC0B7]" />
                <div className="p-6">
                  <h3 className="font-bold text-[#233551] text-base mb-2">{c.title}</h3>
                  <p className="text-[#233551]/60 text-sm leading-relaxed">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-[#233551] mb-12 text-center"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Three steps. No waiting room.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8926A] text-white font-black text-lg flex items-center justify-center mb-5" style={{ fontFamily: 'var(--font-lato)' }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-[#233551] text-base mb-2">{step.title}</h3>
                <p className="text-[#233551]/55 text-sm leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="bg-[#7EC0B7] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-white mb-3"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            ₹5,999/week for couples
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/80 text-base mb-8"
          >
            60-minute joint session + text support for both partners.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 bg-white text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#FFF5F2] transition-colors"
            >
              See all plans
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-[#233551] mb-10"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Questions
          </motion.h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#233551] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            The first session isn't a commitment. It's a conversation.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-base mb-8"
          >
            15 minutes, no charge, no pressure. See what therapy actually looks like for you two.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/questionnaire/couples"
              className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#d47d58] transition-colors shadow-lg shadow-[#E8926A]/30"
            >
              Book your free intro call →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
