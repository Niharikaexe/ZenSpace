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
    <circle cx="160" cy="160" r="120" fill="#7EC0B7" fillOpacity="0.12" />
    <circle cx="160" cy="160" r="80" fill="#7EC0B7" fillOpacity="0.18" />
    <circle cx="160" cy="160" r="45" fill="#7EC0B7" fillOpacity="0.28" />
    <circle cx="220" cy="100" r="30" fill="#E8926A" fillOpacity="0.35" />
    <circle cx="95" cy="220" r="22" fill="#F97B5A" fillOpacity="0.30" />
    <circle cx="240" cy="220" r="16" fill="#7EC0B7" fillOpacity="0.45" />
    <circle cx="80" cy="110" r="12" fill="#E8926A" fillOpacity="0.40" />
    <circle cx="190" cy="55" r="9" fill="#7EC0B7" fillOpacity="0.55" />
    <circle cx="130" cy="260" r="8" fill="#F97B5A" fillOpacity="0.38" />
    <circle cx="60" cy="170" r="6" fill="#7EC0B7" fillOpacity="0.50" />
    <circle cx="265" cy="155" r="5" fill="#E8926A" fillOpacity="0.45" />
  </svg>
)

const painPoints = [
  "You wake up tired even after 8 hours. The anxiety starts before you open your eyes.",
  "You keep it together at work. Fall apart at home. Feel guilty about both.",
  "You've Googled 'am I depressed' more than once but talked yourself out of it.",
  "You told yourself you'd do something about this when things got worse. They have.",
  "You don't want advice from your family. You want someone who isn't in your life.",
]

const concerns = [
  {
    title: "Anxiety & Panic",
    body: "Racing thoughts. Tight chest. The sense that something is about to go wrong.",
  },
  {
    title: "Burnout",
    body: "You're functional on the outside. Empty on the inside. You can't remember the last time you felt okay.",
  },
  {
    title: "Depression",
    body: "Not sad exactly. More like... nothing. Flat. And tired of pretending otherwise.",
  },
  {
    title: "Anger",
    body: "It comes out wrong and you know it. But you don't know what's underneath it.",
  },
  {
    title: "Loneliness",
    body: "You have people in your life. You still feel completely alone.",
  },
  {
    title: "Breakups & Grief",
    body: "Loss doesn't wait for you to be ready. We help you process it without rushing you.",
  },
]

const steps = [
  {
    num: "1",
    title: "Answer a few questions",
    body: "5 minutes. Tells us what you're dealing with and what you need from a therapist.",
  },
  {
    num: "2",
    title: "Meet your therapist",
    body: "Free intro chat. If the fit isn't right, you choose someone else.",
  },
  {
    num: "3",
    title: "Start when you're ready",
    body: "Weekly sessions, text between sessions. Everything inside ZenSpace.",
  },
]

const faqs = [
  {
    q: "Is this real therapy or just an app?",
    a: "ZenSpace connects you with licensed therapists — not chatbots, not AI. Real people, trained professionals, weekly sessions over video.",
  },
  {
    q: "What if I don't know exactly what I'm struggling with?",
    a: "That's fine. Most people don't. The assessment helps. And your therapist will spend the first session understanding you, not diagnosing you.",
  },
  {
    q: "Is this confidential?",
    a: "Everything you say stays between you and your therapist. We don't share your data. Your colleagues, family, and landlord will never know.",
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

export default function IndividualsPageClient() {
  return (
    <main className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-[#233551] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 400 600" fill="none" className="w-full h-full">
              <circle cx="300" cy="150" r="200" fill="#7EC0B7" />
              <circle cx="100" cy="400" r="150" fill="#E8926A" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-7">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <EyebrowBadge>Online therapy for individuals</EyebrowBadge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Your anxiety has a name.<br />
                So does the way out.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base text-white/60 leading-relaxed max-w-lg"
              >
                Burnout isn't weakness. Anxiety isn't overthinking. Loneliness in a crowded city is real. Talk to a therapist who gets it — online, private, no waiting.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/questionnaire/individual"
                  className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#d47d58] transition-all duration-200 shadow-lg shadow-[#E8926A]/30 hover:-translate-y-0.5"
                >
                  Start Assessment →
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xs text-[#7EC0B7]/80 font-medium"
              >
                5,000+ people across India. No clinic. No prescription. No judgment.
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
                You're not broken.<br />
                You're just carrying<br />
                too much alone.
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
                  This isn't about being weak. Most people wait over two years before they talk to anyone. You're already ahead.
                </p>
                <Link
                  href="/questionnaire/individual"
                  className="inline-flex items-center gap-2 bg-[#7EC0B7] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#3D8A80] transition-colors"
                >
                  Take the 5-min assessment →
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
            Whatever it is — there's a name for it
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
            Starts at ₹2,999/week
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/80 text-base mb-8"
          >
            Weekly video session + unlimited text with your therapist. No hidden fees.
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
            The first call is free. The conversation is private.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-base mb-8"
          >
            No commitment. No invoice. Just 15 minutes with a therapist to see if it feels right.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/questionnaire/individual"
              className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#d47d58] transition-colors shadow-lg shadow-[#E8926A]/30"
            >
              Start your free intro chat →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
