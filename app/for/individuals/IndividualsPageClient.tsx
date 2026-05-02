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

const groundedRealities = [
  "You wake up with a weight on your chest before the day even begins.",
  "You’ve spent late nights looking for answers online, trying to name what you’re feeling.",
  "You manage everything at work, but feel like you’re fading away at home.",
]

const concerns = [
  {
    title: "When the world feels too fast",
    body: "For the racing thoughts and the sense that something is about to go wrong.",
  },
  {
    title: "When you feel empty",
    body: "For the days you’re just going through the motions, feeling flat and tired of pretending.",
  },
  {
    title: "When the words don’t come out right",
    body: "For the frustration that feels like it’s bubbling under the surface.",
  },
  {
    title: "When the city feels too quiet",
    body: "For the times you’re surrounded by people but still feel entirely on your own.",
  },
  {
    title: "When you’re experiencing a loss",
    body: "For when you need a place to grieve at your own pace, without being rushed.",
  },
]

const steps = [
  {
    num: "01",
    title: "Share your world",
    body: "Take five minutes to tell us what’s on your mind. This helps us find the right person to support your specific needs.",
  },
  {
    num: "02",
    title: "Have a conversation",
    body: "Start with a free intro chat. It’s a chance to see if the environment feels comfortable for you before you begin your subscription.",
  },
  {
    num: "03",
    title: "Build the habit",
    body: "Join your weekly video conversations and stay connected through messaging. This is your space, and you’re in control of how you use it.",
  },
]

const habitPoints = [
  {
    title: "Consistent Support",
    body: "A weekly dedicated time to focus on your mental practice.",
  },
  {
    title: "Always Connected",
    body: "Use the messaging feature inside your dashboard whenever you need to check in between sessions.",
  },
  {
    title: "Total Flexibility",
    body: "If you feel you need a different perspective, you can switch therapists at any time.",
  },
]

const faqs = [
  {
    q: "Is this different from a regular appointment?",
    a: "It’s a conversation. Instead of a clinical office, you’re in your own space, speaking with someone who is there to listen and guide you through your daily practice.",
  },
  {
    q: "What if I don’t know exactly what’s wrong?",
    a: "That’s exactly why we’re here. Most people start with a feeling they can’t quite name. Your therapist helps you find the words.",
  },
  {
    q: "Will anyone find out I’m here?",
    a: "Your privacy is built into the foundation of Zen Space. This is your private environment, and we keep it that way.",
  },
  {
    q: "What happens in the first call?",
    a: "It’s a free intro chat. You get to see how it feels to talk to your therapist and decide if this is the right space for your practice.",
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
                <EyebrowBadge>For individuals</EyebrowBadge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Peace isn’t a milestone,<br />
                it’s a practice
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base text-white/60 leading-relaxed max-w-lg"
              >
                You’ve been looking for a room where you can finally hear yourself think. Zen Space can be that room. It’s a habit for your head — a private, steady conversation with someone who understands your world.
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
                  Start the assessment →
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xs text-[#7EC0B7]/80 font-medium"
              >
                Join thousands across India who have made their mental balance a priority.
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

      {/* ── GROUNDED REALITY ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <EyebrowBadge>The grounded reality</EyebrowBadge>
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
                It’s been heavy<br />
                for a while.
              </motion.h2>
              <p className="text-[#233551]/55 text-base leading-relaxed mt-5 max-w-sm">
                Most of us wait until we’re exhausted before we look for a way forward. You aren’t alone in that.
              </p>
            </div>

            <div className="lg:w-3/5 space-y-5">
              {groundedRealities.map((point, i) => (
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
                  Therapy isn’t a last resort for when things break. It’s the practice of making sure they don’t. It’s a space where you can set the weight down and just exist.
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

      {/* ── FINDING YOUR BALANCE ── */}
      <section className="bg-[#FFF5F2] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-[#233551] mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Whatever is on your mind,<br />we have a space for it.
          </motion.h2>
          <p className="text-[#233551]/55 text-base leading-relaxed mb-12 max-w-2xl">
            Finding your balance isn’t about labels. It’s about having a place for the feeling, even before it has a name.
          </p>

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

      {/* ── YOUR PATH TO A HABIT ── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-black text-[#233551] mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Three steps to your new rhythm.
            </h2>
            <p className="text-[#233551]/55 text-base leading-relaxed">
              We’ve made it simple to find a space that feels right for you.
            </p>
          </motion.div>

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

      {/* ── THE SUSTAINABLE HABIT (₹2,999/week) ── */}
      <section className="bg-[#7EC0B7] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-3">₹2,999 / week</p>
            <h2
              className="text-3xl md:text-4xl font-black text-white mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              A commitment to yourself.
            </h2>
            <p className="text-white/85 text-base leading-relaxed">
              Your subscription is more than just a weekly video call. It’s a lifestyle choice that gives you the tools to find your balance every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {habitPoints.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
              >
                <h3 className="font-black text-white text-base mb-2" style={{ fontFamily: 'var(--font-lato)' }}>{h.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed">{h.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/questionnaire/individual"
              className="inline-flex items-center gap-2 bg-white text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#FFF5F2] transition-colors"
            >
              Start the assessment →
            </Link>
          </div>
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
            You’ve done the reading.<br />Now, start the practice.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-base mb-8"
          >
            Take five minutes to tell us about your world. We’ll help you find the right person to talk to.
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
              Start the assessment →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
