"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { useState } from "react"
import { Plus, Minus, MessageCircle, RefreshCw, Video } from "lucide-react"

const TeenHero = () => (
  <section className="bg-white relative overflow-hidden min-h-[80vh] flex items-center">
    <div className="absolute right-0 top-0 w-[55%] h-full pointer-events-none select-none">
      <svg viewBox="0 0 640 780" fill="none" preserveAspectRatio="xMaxYMid slice" className="w-full h-full">
        <path d="M120,10 C260,-15 520,40 600,180 C680,320 640,520 520,650 C400,780 200,760 90,640 C-20,520 -40,310 60,180 C90,130 80,25 120,10 Z" fill="#E8F0FF" />
        <path d="M200,60 C320,20 540,90 590,230 C640,370 580,540 450,630 C320,720 150,700 70,580 C-10,460 10,270 100,160 C140,108 140,85 200,60 Z" fill="#D5E2FF" fillOpacity="0.45" />
      </svg>
    </div>
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 w-full relative z-10">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl space-y-7">
        <span className="inline-flex items-center gap-2 bg-[#5B8DEF]/12 text-[#5B8DEF] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8DEF]" />Teen Therapy
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-[#233551] leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-lato)" }}>A room of your own.</h1>
        <p className="text-base text-[#233551]/55 leading-relaxed">For when the world feels too loud. A private space where you can say the things that are hard to say anywhere else — without being judged, fixed, or rushed.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/questionnaire?type=teen" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-all duration-200 shadow-lg shadow-[#233551]/20">Start the assessment</Link>
        </div>
        <p className="text-xs text-[#233551]/35 font-medium">Parental involvement is discussed with you first. This is your space.</p>
      </motion.div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
        <path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="#FFF5F2" />
      </svg>
    </div>
  </section>
)

const groundedPoints = [
  "You're expected to have it together — school, family, the future — all at once.",
  "You have thoughts you can't share with your parents without it becoming a bigger conversation than you wanted.",
  "Your friends are dealing with their own stuff. You don't want to be 'the one with problems.'",
  "You feel things intensely, and no one seems to understand why it's not as simple as just 'feeling better.'",
]

const GroundedReality = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <motion.div className="lg:w-2/5 flex-shrink-0" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>It&apos;s a lot to carry.</h2>
          <div className="mt-5 w-12 h-1 rounded-full bg-[#5B8DEF]" />
          <p className="mt-5 text-[#233551]/60 text-base leading-relaxed">Being a teenager in India right now is genuinely hard. You aren&apos;t being dramatic. You aren&apos;t overreacting. You just need somewhere to put it.</p>
        </motion.div>
        <motion.div className="flex-1 space-y-4" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.12 }}>
          {groundedPoints.map((p, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5B8DEF]" />
              <p className="text-[#233551]/65 text-base leading-relaxed">{p}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl px-7 py-6 border-l-4 border-[#5B8DEF] mt-6">
            <p className="text-[#233551] text-base leading-relaxed font-medium">You don&apos;t have to explain why you need this.</p>
            <p className="text-[#233551]/60 text-sm leading-relaxed mt-2">Your therapist is trained to meet you where you are, not where anyone else thinks you should be.</p>
          </div>
        </motion.div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
        <path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="white" />
      </svg>
    </div>
  </section>
)

const topics = [
  { label: "When school feels suffocating", desc: "Pressure from exams, competitions, and the constant comparison to where everyone else is going." },
  { label: "When home doesn't feel safe to talk", desc: "For when the conversations at the dinner table feel like a performance and you need somewhere else to be honest." },
  { label: "When friendships get complicated", desc: "For the falling-outs, the loneliness, and the social dynamics that no one tells you how to navigate." },
  { label: "When you don't recognise yourself", desc: "For when you're not sure who you are yet, and that uncertainty feels overwhelming." },
  { label: "When anxiety shows up uninvited", desc: "For the racing thoughts and the physical feeling of dread that arrives without an obvious reason." },
  { label: "When you've lost someone or something", desc: "For grief that doesn't fit neatly into any category — including the smaller losses no one acknowledges." },
]

const WhatYouCanTalkAbout = () => (
  <section className="bg-white py-20 md:py-28">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div className="text-center mb-14 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>This is what the room is for.</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-[#E8F0FF] rounded-2xl p-6 border border-[#5B8DEF]/10">
            <h3 className="text-sm font-black text-[#233551] mb-2" style={{ fontFamily: "var(--font-lato)" }}>{t.label}</h3>
            <p className="text-sm text-[#233551]/55 leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

const steps = [
  { number: "01", title: "Tell us about your world", desc: "A short assessment to help us understand what's going on for you and what kind of support would actually help." },
  { number: "02", title: "Meet your therapist", desc: "Start with a free 15-minute call. No commitment. Just a chance to see if the environment feels right before you decide anything." },
  { number: "03", title: "Make it your space", desc: "Weekly video conversations, plus messaging whenever you need it. Your therapist works around your schedule, not the other way around." },
]

const HowItWorks = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>How to find your person.</h2>
        <p className="text-[#233551]/55 text-base">Simple steps, no pressure at any of them.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="bg-white rounded-3xl p-7 shadow-sm shadow-[#233551]/6 border border-slate-100">
            <span className="text-4xl font-black text-[#5B8DEF]/25 mb-4 block" style={{ fontFamily: "var(--font-lato)" }}>{s.number}</span>
            <h3 className="text-base font-black text-[#233551] mb-3" style={{ fontFamily: "var(--font-lato)" }}>{s.title}</h3>
            <p className="text-sm text-[#233551]/55 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
        <path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="#233551" />
      </svg>
    </div>
  </section>
)

const features = [
  { icon: Video, label: "Weekly Video Sessions", desc: "A dedicated 50-minute conversation with your therapist, every week." },
  { icon: MessageCircle, label: "Messaging Between Sessions", desc: "When something happens on a Tuesday, you don't have to wait until Sunday." },
  { icon: RefreshCw, label: "Switch Anytime", desc: "If the fit isn't right, you find someone else. No awkward conversations, just a fresh start." },
]

const Pricing = () => (
  <section className="bg-[#233551] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>A habit for your head.</h2>
        <p className="text-white/55 text-base">A weekly space that&apos;s just yours. No one else gets to come in here.</p>
      </motion.div>
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl p-8 lg:w-72 flex-shrink-0">
          <span className="inline-block bg-[#E8F0FF] text-[#5B8DEF] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">Teen</span>
          <div className="mb-2">
            <span className="text-4xl font-black text-[#233551]" style={{ fontFamily: "var(--font-lato)" }}>₹2,999</span>
            <span className="text-[#233551]/40 text-sm ml-1">/week</span>
          </div>
          <p className="text-xs text-[#233551]/45 mb-6">1 video session (50 min) + unlimited async text</p>
          <Link href="/questionnaire?type=teen" className="block text-center bg-[#233551] text-white text-sm font-bold py-3 rounded-full hover:bg-[#2d4568] transition-all">Start the assessment</Link>
        </motion.div>
        <div className="flex-1 space-y-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-5">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#5B8DEF]/20 flex items-center justify-center">
                <f.icon size={18} className="text-[#7AABFF]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white mb-1" style={{ fontFamily: "var(--font-lato)" }}>{f.label}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
        <path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="white" />
      </svg>
    </div>
  </section>
)

const faqs = [
  { q: "Will my parents know what I said?", a: "What you say in sessions stays between you and your therapist. We discuss parental involvement with you before anything is shared, and it's a conversation you get to be part of." },
  { q: "I don't really know what's wrong. Is that okay?", a: "That's exactly where most people start. You don't need to have a clear problem to talk to someone. Your therapist helps you find the words." },
  { q: "What if I don't like my therapist?", a: "You can switch. No guilt, no explanation needed. Finding the right person matters more than sticking with the first one." },
  { q: "Will this actually help?", a: "Having a weekly space where someone is genuinely listening — with no agenda, no advice they're trying to push — tends to help. Not because it fixes things, but because it makes them clearer." },
]

const TeenFAQ = () => {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2 className="text-3xl md:text-4xl font-black text-[#233551] text-center mb-12" style={{ fontFamily: "var(--font-lato)" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          Questions you might have.
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
              <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open === i ? "border-[#5B8DEF]/40 bg-[#5B8DEF]/5" : "border-slate-100 bg-white"}`}>
                <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
                  <span className={`text-base font-bold ${open === i ? "text-[#5B8DEF]" : "text-[#233551]"}`} style={{ fontFamily: "var(--font-lato)" }}>{f.q}</span>
                  <span className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center ${open === i ? "bg-[#5B8DEF] text-white" : "bg-slate-100 text-[#233551]"}`}>
                    {open === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {open === i && <p className="px-6 pb-5 text-sm text-[#233551]/60 leading-relaxed">{f.a}</p>}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-14 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Link href="/questionnaire?type=teen" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#2d4568] transition-all shadow-lg shadow-[#233551]/20">Find your person</Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function TeenPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <TeenHero />
      <GroundedReality />
      <WhatYouCanTalkAbout />
      <HowItWorks />
      <Pricing />
      <TeenFAQ />
      <Footer />
    </div>
  )
}
