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

const groundedRealities = [
  "You love each other, but the conversations keep hitting the same dead ends.",
  "You’ve started saying “I don’t want to fight,” only for it to lead to another argument.",
  "The silence in the house has become loud. You feel more like roommates than partners.",
  "You’ve thought about what leaving might look like, then felt a wave of guilt for even thinking it.",
  "Family and friends have tried to give advice, but it only added more noise to the room.",
]

const concerns = [
  {
    title: "When the family voice is too loud",
    body: "For navigating the unique pressure of in-laws and family expectations that live inside your marriage.",
  },
  {
    title: "When the connection feels on mute",
    body: "For the couples who share a bed and a bank account, but have lost the habit of sharing themselves.",
  },
  {
    title: "When the small things become big things",
    body: "For the “same three arguments” that keep happening because the real issue is hiding underneath.",
  },
  {
    title: "When life gets in the way of “us”",
    body: "For the drift that happens after children, career shifts, or just the grind of daily life.",
  },
  {
    title: "When trust needs a new foundation",
    body: "For finding a way forward after a breach of confidence, at a pace that works for both of you.",
  },
]

const steps = [
  {
    num: "01",
    title: "Share your sides, privately",
    body: "Each of you fills out a five-minute assessment. This is your chance to be honest about how you feel without the pressure of being “the reasonable one.” Your therapist reads both before you ever meet.",
  },
  {
    num: "02",
    title: "Meet the mediator",
    body: "Start with a free intro chat together. It’s a chance to see if the environment feels balanced and if the therapist is the right person to guide your practice.",
  },
  {
    num: "03",
    title: "Build the habit",
    body: "Join your weekly joint video conversations. Between sessions, you both have access to your dashboard to stay connected to the process. It’s about finding a rhythm that lasts.",
  },
]

const habitPoints = [
  {
    title: "A Neutral Room",
    body: "A dedicated hour every week where neither person has to be the “bad guy.”",
  },
  {
    title: "Support Between Conversations",
    body: "Use the dashboard to message your therapist whenever things feel heavy during the week.",
  },
  {
    title: "Flexibility for Both",
    body: "If the person you’re speaking with doesn’t feel like the right match for both of you, you can find a new therapist at any time.",
  },
]

const privacyPoints = [
  {
    title: "Confidentiality at the Core",
    body: "Your conversations stay inside the platform. We don’t share records with anyone — no family members, no employers, no exceptions.",
  },
  {
    title: "No Paper Trails",
    body: "Since everything is online, there’s no clinic for someone to see you walking into. Your practice exists only where you let it.",
  },
  {
    title: "Ownership of the Process",
    body: "You are both in control. You can pause, change, or stop your subscription whenever it feels right for your relationship.",
  },
]

const faqs = [
  {
    q: "Will the therapist take sides?",
    a: "No. Your therapist is there to support the relationship, not to decide who is “right.” They act as a bridge between two perspectives.",
  },
  {
    q: "What if only one of us wants to do this?",
    a: "It’s common for one partner to be more ready than the other. Start the assessment, and we can discuss how to bring both of you into the room comfortably.",
  },
  {
    q: "Is this different from talking to family?",
    a: "Yes. Family members are involved in your life; a therapist isn’t. They provide a neutral, grounded environment where you can say the things you can’t say at the dinner table.",
  },
  {
    q: "What happens in the first call?",
    a: "It’s a free intro chat. You’ll get a feel for the therapist’s approach and see if this is a room where you both feel heard.",
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
                <EyebrowBadge>For couples</EyebrowBadge>
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
                Relationships aren’t something you “fix” once and forget. They are a daily rhythm. If yours feels out of sync, we give you both a private room to hear each other again, guided by someone who understands the weight of a shared life.
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
                  Begin the couples assessment →
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xs text-[#7EC0B7]/80 font-medium"
              >
                Each partner shares their perspective privately. We take it from there.
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
                You aren’t failing.<br />
                You’re just<br />
                exhausted.
              </motion.h2>
              <p className="text-[#233551]/55 text-base leading-relaxed mt-5 max-w-sm">
                Most couples wait until they are at a breaking point before they look for support. You don’t have to wait for the house to be on fire to start a better practice.
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
                  Choosing therapy isn’t an admission of defeat. It’s a choice to give your relationship the space it deserves to breathe.
                </p>
                <Link
                  href="/questionnaire/couples"
                  className="inline-flex items-center gap-2 bg-[#7EC0B7] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#3D8A80] transition-colors"
                >
                  Begin the couples assessment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINDING YOUR RHYTHM TOGETHER ── */}
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
            A space for the things<br />that are hard to say.
          </motion.h2>
          <p className="text-[#233551]/55 text-base leading-relaxed mb-12 max-w-2xl">
            Finding your rhythm together starts with naming the friction without flinching.
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

      {/* ── THE PATH TO A BETTER PRACTICE ── */}
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
              Three steps to a new conversation.
            </h2>
            <p className="text-[#233551]/55 text-base leading-relaxed">
              We’ve built a straightforward way to bring a neutral perspective into your world.
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

      {/* ── THE SUSTAINABLE HABIT (₹5,999/week) ── */}
      <section className="bg-[#7EC0B7] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-3">₹5,999 / week</p>
            <h2
              className="text-3xl md:text-4xl font-black text-white mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              A shared commitment to balance.
            </h2>
            <p className="text-white/85 text-base leading-relaxed">
              Your subscription is a dedicated space for your relationship — a weekly habit that keeps the conversation moving forward.
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
              href="/questionnaire/couples"
              className="inline-flex items-center gap-2 bg-white text-[#233551] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#FFF5F2] transition-colors"
            >
              Begin your practice →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRIVACY & THE SHARED ROOM ── */}
      <section className="bg-[#F0FAF9] py-20 md:py-24">
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
              A space that is yours,<br />and yours alone.
            </h2>
            <p className="text-[#233551]/55 text-base leading-relaxed">
              In a world full of opinions from family and society, Zen Space stays strictly private.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {privacyPoints.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/70 backdrop-blur-sm border border-[#7EC0B7]/20 rounded-2xl p-6"
              >
                <h3 className="font-black text-[#233551] text-base mb-2" style={{ fontFamily: 'var(--font-lato)' }}>{p.title}</h3>
                <p className="text-[#233551]/60 text-sm leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
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
            Stop repeating the same day.<br />Start a new practice.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/60 text-base mb-8"
          >
            Take the five-minute assessment together and find a person who understands the rhythm of your life.
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
              Begin your practice →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
