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
    <circle cx="160" cy="160" r="110" fill="#7EC0B7" fillOpacity="0.12" />
    <circle cx="160" cy="150" r="70" fill="#7EC0B7" fillOpacity="0.18" />
    <circle cx="160" cy="150" r="40" fill="#7EC0B7" fillOpacity="0.25" />
    <circle cx="230" cy="90" r="35" fill="#F97B5A" fillOpacity="0.28" />
    <circle cx="90" cy="90" r="25" fill="#E8926A" fillOpacity="0.32" />
    <circle cx="250" cy="200" r="18" fill="#7EC0B7" fillOpacity="0.45" />
    <circle cx="70" cy="210" r="15" fill="#F97B5A" fillOpacity="0.35" />
    <circle cx="160" cy="260" r="12" fill="#E8926A" fillOpacity="0.40" />
    <circle cx="200" cy="55" r="8" fill="#7EC0B7" fillOpacity="0.55" />
    <circle cx="120" cy="270" r="6" fill="#F97B5A" fillOpacity="0.45" />
    <circle cx="40" cy="155" r="5" fill="#7EC0B7" fillOpacity="0.50" />
    <circle cx="280" cy="150" r="5" fill="#E8926A" fillOpacity="0.45" />
  </svg>
)

const groundedRealities = [
  "You feel a weight in your chest before exams, but honestly, it’s there even on the weekends.",
  "You’ve gotten very good at putting on a version of yourself for your parents and teachers that feels nothing like the real you.",
  "You’ve tried talking to friends, but they didn’t quite get it, so you just stopped bringing it up.",
  "You spend a lot of time scrolling, feeling like everyone else has figured out a “life” that you haven’t.",
  "You’ve Googled how you’re feeling at 2 AM more than once, wondering if anyone else feels this flat.",
]

const concerns = [
  {
    title: "When the pressure to perform is too much",
    body: "For when the fear of failing or letting people down makes it hard to even start.",
  },
  {
    title: "The gap between the screen and real life",
    body: "For the exhaustion that comes from comparing your “inside” to everyone else’s “outside.”",
  },
  {
    title: "When you’re trying to figure out who you are",
    body: "For the times you feel like you’re just a collection of other people’s expectations.",
  },
  {
    title: "When the anger comes out too fast",
    body: "For the moments you feel frustrated and reactive, and you aren’t sure why.",
  },
  {
    title: "When the world feels too quiet",
    body: "For the feeling of being surrounded by people at school or home, but still feeling entirely on your own.",
  },
  {
    title: "When your brain works differently",
    body: "For when focusing feels like an uphill battle and you’re tired of being called “lazy.”",
  },
]

const steps = [
  {
    num: "01",
    title: "Share your perspective, discreetly",
    body: "Take five minutes to tell us what’s on your mind. This is your personal space. It helps us find a therapist who understands your world.",
  },
  {
    num: "02",
    title: "Have a conversation",
    body: "Start with a free intro chat. It’s a chance to see if the therapist feels like someone you can actually talk to before you start your practice.",
  },
  {
    num: "03",
    title: "Make it your habit",
    body: "Join your weekly video conversations from wherever you feel safe. You can also message your therapist through your dashboard whenever you need to check in between sessions.",
  },
]

const habitPoints = [
  {
    title: "A Private Room",
    body: "A dedicated time every week where you can speak freely without anyone else listening in.",
  },
  {
    title: "Support Whenever",
    body: "Use the messaging feature in your dashboard to reach out to your therapist during the week when things feel heavy.",
  },
  {
    title: "Total Autonomy",
    body: "This is your practice. If you feel you need a different perspective, you can find a new therapist at any time without any awkwardness.",
  },
]

const faqs = [
  {
    q: "Do my parents see what I say?",
    a: "No. What you say to your therapist stays between the two of you. Having a private room to speak is the only way therapy actually works.",
  },
  {
    q: "I don’t know what to say. Is that okay?",
    a: "Most people start that way. Your therapist is there to help you find the words, or just to sit with you until you’re ready to speak.",
  },
  {
    q: "What if my parents are the ones who want me to do this?",
    a: "It’s okay to be unsure. Use the free intro chat to see if you feel comfortable. This is about your balance, no one else’s.",
  },
  {
    q: "What happens in the first call?",
    a: "It’s just a free intro chat. You’ll get a feel for the therapist and the environment. No pressure, no “fixing” — just a conversation to see if it feels right.",
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

export default function AdolescentsPageClient() {
  return (
    <main className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-[#233551] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 400 600" fill="none" className="w-full h-full">
              <circle cx="250" cy="150" r="180" fill="#7EC0B7" />
              <circle cx="150" cy="450" r="130" fill="#F97B5A" />
            </svg>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-7">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <EyebrowBadge>For teens</EyebrowBadge>
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
                Between exams, family expectations, and the constant noise of being online, it’s easy to feel like your own voice is getting drowned out. Zen Space is a room of your own — a private place to find your balance and start a habit of checking in on yourself.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/questionnaire/teen"
                  className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#d47d58] transition-all duration-200 shadow-lg shadow-[#E8926A]/30 hover:-translate-y-0.5"
                >
                  Begin the teen assessment →
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xs text-[#7EC0B7]/80 font-medium"
              >
                A private space where you don’t have to be “perfect.”
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
                It’s okay if<br />
                you aren’t sure<br />
                how to say it.
              </motion.h2>
              <p className="text-[#233551]/55 text-base leading-relaxed mt-5 max-w-sm">
                Most people your age wait a long time before they talk to someone. You don’t have to wait until things are “serious enough” to start a better practice.
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
                  Therapy isn’t a sign that something is wrong with you. It’s just a way to make sure you have the space to breathe in a world that asks a lot of you.
                </p>
                <Link
                  href="/questionnaire/teen"
                  className="inline-flex items-center gap-2 bg-[#7EC0B7] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#3D8A80] transition-colors"
                >
                  Begin the teen assessment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINDING YOUR OWN VOICE ── */}
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
            A space for the things<br />you can’t say elsewhere.
          </motion.h2>
          <p className="text-[#233551]/55 text-base leading-relaxed mb-12 max-w-2xl">
            Finding your own voice starts with having one room where you don’t have to perform.
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

      {/* ── YOUR PATH TO A PRIVATE SPACE ── */}
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
              Three steps to your own rhythm.
            </h2>
            <p className="text-[#233551]/55 text-base leading-relaxed">
              We’ve made it simple and private to find a person who actually listens.
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
              A commitment to your own balance.
            </h2>
            <p className="text-white/85 text-base leading-relaxed">
              Your subscription is a dedicated space for you — a weekly habit that helps you navigate your world on your own terms.
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
              href="/questionnaire/teen"
              className="inline-flex items-center gap-2 bg-white text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#FFF5F2] transition-colors"
            >
              Begin your practice →
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
            You’ve done the reading.<br />Now, take the key.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-base mb-8"
          >
            Start the five-minute assessment and find a person who understands the rhythm of your life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/questionnaire/teen"
              className="inline-flex items-center gap-2 bg-[#E8926A] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#d47d58] transition-colors shadow-lg shadow-[#E8926A]/30"
            >
              Begin your practice →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
