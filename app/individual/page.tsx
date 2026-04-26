"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { useState } from "react"
import { Plus, Minus, MessageCircle, RefreshCw, Video } from "lucide-react"

const IndividualHero = () => (
  <section className="bg-white relative overflow-hidden min-h-[80vh] flex items-center">
    <div className="absolute right-0 top-0 w-[55%] h-full pointer-events-none select-none">
      <svg viewBox="0 0 640 780" fill="none" preserveAspectRatio="xMaxYMid slice" className="w-full h-full">
        <path d="M120,10 C260,-15 520,40 600,180 C680,320 640,520 520,650 C400,780 200,760 90,640 C-20,520 -40,310 60,180 C90,130 80,25 120,10 Z" fill="#FFE8E2" />
      </svg>
    </div>
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 w-full relative z-10">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl space-y-7">
        <span className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />Individual Therapy</span>
        <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-[#233551] leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-lato)" }}>Peace isn&apos;t a destination;<br />it&apos;s a practice.</h1>
        <p className="text-base text-[#233551]/55 leading-relaxed">You&apos;ve been looking for a room where you can finally hear yourself think. Zen Space can be that room. It&apos;s a habit for your head — a private, steady conversation with someone who understands your world.</p>
        <Link href="/questionnaire?type=individual" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-all duration-200 shadow-lg shadow-[#233551]/20">Start the assessment</Link>
        <p className="text-xs text-[#233551]/35 font-medium">Join thousands across India who have made their mental balance a priority.</p>
      </motion.div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20"><path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="#FFF5F2" /></svg>
    </div>
  </section>
)

const groundedPoints = [
  "You wake up with a weight on your chest before the day even begins.",
  "You’ve spent late nights looking for answers online, trying to name what you’re feeling.",
  "You manage everything at work, but feel like you’re fading away at home.",
]

const GroundedReality = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <motion.div className="lg:w-2/5 flex-shrink-0" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>It&apos;s been heavy for a while.</h2>
          <div className="mt-5 w-12 h-1 rounded-full bg-[#7EC0B7]" />
          <p className="mt-5 text-[#233551]/60 text-base leading-relaxed">Most of us wait until we&apos;re exhausted before we look for a way forward. You aren&apos;t alone in that.</p>
        </motion.div>
        <motion.div className="flex-1 space-y-6" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.12 }}>
          <div className="space-y-4">
            {groundedPoints.map((p, i) => (<div key={i} className="flex gap-4 items-start"><div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E8926A]" /><p className="text-[#233551]/65 text-base leading-relaxed">{p}</p></div>))}
          </div>
          <div className="bg-white rounded-2xl px-7 py-6 border-l-4 border-[#7EC0B7]">
            <p className="text-[#233551] text-base leading-relaxed font-medium">Therapy isn&apos;t a last resort for when things break.</p>
            <p className="text-[#233551]/60 text-sm leading-relaxed mt-2">It&apos;s the practice of making sure they don&apos;t. A space where you can set the weight down and just exist.</p>
          </div>
        </motion.div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none"><svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20"><path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="white" /></svg></div>
  </section>
)

const balanceTopics = [
  { label: "When the world feels too fast", desc: "For the racing thoughts and the sense that something is about to go wrong." },
  { label: "When you feel empty", desc: "For the days you’re just going through the motions, feeling flat and tired of pretending." },
  { label: "When the words don’t come out right", desc: "For the frustration that feels like it’s bubbling under the surface." },
  { label: "When the city feels too quiet", desc: "For the times you’re surrounded by people but still feel entirely on your own." },
  { label: "When you’re experiencing a loss", desc: "For when you need a place to grieve at your own pace, without being rushed." },
]

const FindingBalance = () => (
  <section className="bg-white py-20 md:py-28">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div className="text-center mb-14 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>Whatever is on your mind,<br />we have a space for it.</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {balanceTopics.map((t, i) => (<motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-[#FFF5F2] rounded-2xl p-6 border border-[#E8926A]/10"><h3 className="text-sm font-black text-[#233551] mb-2" style={{ fontFamily: "var(--font-lato)" }}>{t.label}</h3><p className="text-sm text-[#233551]/55 leading-relaxed">{t.desc}</p></motion.div>))}
      </div>
    </div>
  </section>
)

const steps = [
  { number: "01", title: "Share your world", desc: "Take five minutes to tell us what’s on your mind. This helps us find the right person to support your specific needs." },
  { number: "02", title: "Have a conversation", desc: "Start with a 15-minute introductory call. It’s a chance to see if the environment feels comfortable for you before you begin your subscription." },
  { number: "03", title: "Build the habit", desc: "Join your weekly video conversations and stay connected through messaging. This is your space, and you’re in control of how you use it." },
]

const HowItWorks = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>Three steps to your new rhythm.</h2>
        <p className="text-[#233551]/55 text-base">We&apos;ve made it simple to find a space that feels right for you.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (<motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="bg-white rounded-3xl p-7 shadow-sm shadow-[#233551]/6 border border-slate-100"><span className="text-4xl font-black text-[#E8926A]/30 mb-4 block" style={{ fontFamily: "var(--font-lato)" }}>{s.number}</span><h3 className="text-base font-black text-[#233551] mb-3" style={{ fontFamily: "var(--font-lato)" }}>{s.title}</h3><p className="text-sm text-[#233551]/55 leading-relaxed">{s.desc}</p></motion.div>))}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none"><svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20"><path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="#233551" /></svg></div>
  </section>
)

const features = [
  { icon: Video, label: "Consistent Support", desc: "A weekly dedicated time to focus on your mental practice." },
  { icon: MessageCircle, label: "Always Connected", desc: "Use the messaging feature whenever you need to check in between sessions." },
  { icon: RefreshCw, label: "Total Flexibility", desc: "Switch therapists at any time. No explanation needed." },
]

const Pricing = () => (
  <section className="bg-[#233551] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>A commitment to yourself.</h2>
        <p className="text-white/55 text-base">Your subscription is more than just a weekly video call. It&apos;s a lifestyle choice that gives you the tools to find your balance every day.</p>
      </motion.div>
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl p-8 lg:w-72 flex-shrink-0">
          <span className="inline-block bg-[#E0F4F1] text-[#3D8A80] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">Essentials</span>
          <div className="mb-2"><span className="text-4xl font-black text-[#233551]" style={{ fontFamily: "var(--font-lato)" }}>₹2,999</span><span className="text-[#233551]/40 text-sm ml-1">/week</span></div>
          <p className="text-xs text-[#233551]/45 mb-6">1 video session (50 min) + unlimited async text</p>
          <Link href="/questionnaire?type=individual" className="block text-center bg-[#233551] text-white text-sm font-bold py-3 rounded-full hover:bg-[#2d4568] transition-all">Start the assessment</Link>
        </motion.div>
        <div className="flex-1 space-y-6">
          {features.map((f, i) => (<motion.div key={i} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-5"><div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#7EC0B7]/20 flex items-center justify-center"><f.icon size={18} className="text-[#7EC0B7]" /></div><div><h3 className="text-sm font-black text-white mb-1" style={{ fontFamily: "var(--font-lato)" }}>{f.label}</h3><p className="text-sm text-white/50 leading-relaxed">{f.desc}</p></div></motion.div>))}
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none"><svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20"><path d="M0,35 C200,70 400,0 600,35 C800,70 1000,5 1200,30 C1320,45 1400,20 1440,35 L1440,70 L0,70 Z" fill="white" /></svg></div>
  </section>
)

const faqs = [
  { q: "Is this different from a regular appointment?", a: "It’s a conversation. Instead of a clinical office, you’re in your own space, speaking with someone who is there to listen and guide you through your daily practice." },
  { q: "What if I don’t know exactly what’s wrong?", a: "That’s exactly why we’re here. Most people start with a feeling they can’t quite name. Your therapist helps you find the words." },
  { q: "Will anyone find out I’m here?", a: "Your privacy is built into the foundation of Zen Space. This is your private environment, and we keep it that way." },
  { q: "What happens in the first call?", a: "It’s a 15-minute introduction. You get to see how it feels to talk to your therapist and decide if this is the right space for your practice." },
]

const IndividualFAQ = () => {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2 className="text-3xl md:text-4xl font-black text-[#233551] text-center mb-12" style={{ fontFamily: "var(--font-lato)" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>A few things you&apos;re probably wondering.</motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (<motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}><div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open === i ? "border-[#7EC0B7]/40 bg-[#7EC0B7]/5" : "border-slate-100 bg-white"}`}><button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpen(open === i ? null : i)}><span className={`text-base font-bold ${open === i ? "text-[#3D8A80]" : "text-[#233551]"}`} style={{ fontFamily: "var(--font-lato)" }}>{f.q}</span><span className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center ${open === i ? "bg-[#7EC0B7] text-white" : "bg-slate-100 text-[#233551]"}`}>{open === i ? <Minus size={14} /> : <Plus size={14} />}</span></button>{open === i && <p className="px-6 pb-5 text-sm text-[#233551]/60 leading-relaxed">{f.a}</p>}</div></motion.div>))}
        </div>
        <motion.div className="mt-14 text-center space-y-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-[#233551]/50 text-sm">Ready to start?</p>
          <Link href="/questionnaire?type=individual" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#2d4568] transition-all shadow-lg shadow-[#233551]/20">Start the assessment</Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function IndividualPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar /><IndividualHero /><GroundedReality /><FindingBalance /><HowItWorks /><Pricing /><IndividualFAQ /><Footer />
    </div>
  )
}
