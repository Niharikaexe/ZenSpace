"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/home/Footer"
import { useState } from "react"
import { Plus, Minus, Shield, Video, MessageCircle, RefreshCw } from "lucide-react"

const CouplesHero = () => (
  <section className="bg-white relative overflow-hidden min-h-[80vh] flex items-center">
    <div className="absolute right-0 top-0 w-[55%] h-full pointer-events-none select-none">
      <svg viewBox="0 0 640 780" fill="none" preserveAspectRatio="xMaxYMid slice" className="w-full h-full">
        <path d="M120,10 C260,-15 520,40 600,180 C680,320 640,520 520,650 C400,780 200,760 90,640 C-20,520 -40,310 60,180 C90,130 80,25 120,10 Z" fill="#EDE8FF" />
        <path d="M200,60 C320,20 540,90 590,230 C640,370 580,540 450,630 C320,720 150,700 70,580 C-10,460 10,270 100,160 C140,108 140,85 200,60 Z" fill="#DDD5FF" fillOpacity="0.45" />
      </svg>
    </div>
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 w-full relative z-10">
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl space-y-7">
        <span className="inline-flex items-center gap-2 bg-[#7B68EE]/12 text-[#7B68EE] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7B68EE]" />Couples Therapy
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-[#233551] leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-lato)" }}>
          Peace isn&apos;t a destination;<br />it&apos;s a practice.
        </h1>
        <p className="text-base text-[#233551]/55 leading-relaxed">
          Relationships aren&apos;t something you &ldquo;fix&rdquo; once and forget. They are a daily rhythm. If yours feels out of sync, we give you both a private room to hear each other again, guided by someone who understands the weight of a shared life.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/questionnaire?type=couples" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#2d4568] transition-all duration-200 shadow-lg shadow-[#233551]/20">
            Begin the couples assessment
          </Link>
        </div>
        <p className="text-xs text-[#233551]/35 font-medium">Each partner shares their perspective privately. We take it from there.</p>
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
  "You love each other, but the conversations keep hitting the same dead ends.",
  "You've started saying \"I don't want to fight,\" only for it to lead to another argument.",
  "The silence in the house has become loud. You feel more like roommates than partners.",
  "You've thought about what leaving might look like, then felt a wave of guilt for even thinking it.",
  "Family and friends have tried to give advice, but it only added more noise to the room.",
]

const GroundedReality = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <motion.div className="lg:w-2/5 flex-shrink-0" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>You aren&apos;t failing.<br />You&apos;re just exhausted.</h2>
          <div className="mt-5 w-12 h-1 rounded-full bg-[#7B68EE]" />
          <p className="mt-5 text-[#233551]/60 text-base leading-relaxed">Most couples wait until they are at a breaking point before they look for support. You don&apos;t have to wait for the house to be on fire to start a better practice.</p>
        </motion.div>
        <motion.div className="flex-1 space-y-4" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.12 }}>
          {groundedPoints.map((p, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7B68EE]" />
              <p className="text-[#233551]/65 text-base leading-relaxed">{p}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl px-7 py-6 border-l-4 border-[#7B68EE] mt-6">
            <p className="text-[#233551] text-base leading-relaxed font-medium">Choosing therapy isn&apos;t an admission of defeat.</p>
            <p className="text-[#233551]/60 text-sm leading-relaxed mt-2">It&apos;s a choice to give your relationship the space it deserves to breathe.</p>
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

const rhythmTopics = [
  { label: "When the family voice is too loud", desc: "For navigating the unique pressure of in-laws and family expectations that live inside your marriage." },
  { label: "When the connection feels on mute", desc: "For the couples who share a bed and a bank account, but have lost the habit of sharing themselves." },
  { label: "When the small things become big things", desc: "For the \"same three arguments\" that keep happening because the real issue is hiding underneath." },
  { label: "When life gets in the way of \"us\"", desc: "For the drift that happens after children, career shifts, or just the grind of daily life." },
  { label: "When trust needs a new foundation", desc: "For finding a way forward after a breach of confidence, at a pace that works for both of you." },
]

const FindingRhythm = () => (
  <section className="bg-white py-20 md:py-28">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div className="text-center mb-14 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>A space for the things<br />that are hard to say.</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rhythmTopics.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-[#F5F3FF] rounded-2xl p-6 border border-[#7B68EE]/10">
            <h3 className="text-sm font-black text-[#233551] mb-2" style={{ fontFamily: "var(--font-lato)" }}>{t.label}</h3>
            <p className="text-sm text-[#233551]/55 leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

const steps = [
  { number: "01", title: "Share your sides, privately", desc: "Each of you fills out a five-minute assessment. This is your chance to be honest about how you feel without the pressure of being 'the reasonable one.' Your therapist reads both before you ever meet." },
  { number: "02", title: "Meet the mediator", desc: "Start with a 15-minute introductory call together. It's a chance to see if the environment feels balanced and if the therapist is the right person to guide your practice." },
  { number: "03", title: "Build the habit", desc: "Join your weekly joint video conversations. Between sessions, you both have access to your dashboard to stay connected to the process. It's about finding a rhythm that lasts." },
]

const HowItWorks = () => (
  <section className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>Three steps to a new conversation.</h2>
        <p className="text-[#233551]/55 text-base">We&apos;ve built a straightforward way to bring a neutral perspective into your world.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="bg-white rounded-3xl p-7 shadow-sm shadow-[#233551]/6 border border-slate-100">
            <span className="text-4xl font-black text-[#7B68EE]/25 mb-4 block" style={{ fontFamily: "var(--font-lato)" }}>{s.number}</span>
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
  { icon: Video, label: "A Neutral Room", desc: "A dedicated hour every week where neither person has to be the 'bad guy.'" },
  { icon: MessageCircle, label: "Support Between Conversations", desc: "Use the dashboard to message your therapist whenever things feel heavy during the week." },
  { icon: RefreshCw, label: "Flexibility for Both", desc: "If the person you're speaking with doesn't feel like the right match for both of you, you can find a new therapist at any time." },
]

const Pricing = () => (
  <section className="bg-[#233551] py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: "var(--font-lato)" }}>A shared commitment to balance.</h2>
        <p className="text-white/55 text-base">Your subscription is a dedicated space for your relationship — a weekly habit that keeps the conversation moving forward.</p>
      </motion.div>
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl p-8 lg:w-72 flex-shrink-0">
          <span className="inline-block bg-[#EDE8FF] text-[#7B68EE] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">Couples</span>
          <div className="mb-2">
            <span className="text-4xl font-black text-[#233551]" style={{ fontFamily: "var(--font-lato)" }}>₹5,999</span>
            <span className="text-[#233551]/40 text-sm ml-1">/week</span>
          </div>
          <p className="text-xs text-[#233551]/45 mb-6">1 couples session (60 min) + text for both partners</p>
          <Link href="/questionnaire?type=couples" className="block text-center bg-[#233551] text-white text-sm font-bold py-3 rounded-full hover:bg-[#2d4568] transition-all">Begin your practice</Link>
        </motion.div>
        <div className="flex-1 space-y-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-5">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#7B68EE]/20 flex items-center justify-center">
                <f.icon size={18} className="text-[#9B8EFF]" />
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

const privacyPoints = [
  { icon: Shield, title: "Confidentiality at the Core", desc: "Your conversations stay inside the platform. We don't share records with anyone — no family members, no employers, no exceptions." },
  { icon: Shield, title: "No Paper Trails", desc: "Since everything is online, there's no clinic for someone to see you walking into. Your practice exists only where you let it." },
  { icon: RefreshCw, title: "Ownership of the Process", desc: "You are both in control. You can pause, change, or stop your subscription whenever it feels right for your relationship." },
]

const PrivacySection = () => (
  <section className="bg-white py-20 md:py-24">
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        <motion.div className="lg:w-2/5 flex-shrink-0" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight" style={{ fontFamily: "var(--font-lato)" }}>A space that is yours, and yours alone.</h2>
          <div className="mt-5 w-12 h-1 rounded-full bg-[#7B68EE]" />
          <p className="mt-5 text-[#233551]/60 text-base leading-relaxed">In a world full of opinions from family and society, Zen Space stays strictly private.</p>
        </motion.div>
        <div className="flex-1 space-y-7">
          {privacyPoints.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex gap-5">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#EDE8FF] flex items-center justify-center">
                <p.icon size={18} className="text-[#7B68EE]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#233551] mb-1.5" style={{ fontFamily: "var(--font-lato)" }}>{p.title}</h3>
                <p className="text-sm text-[#233551]/55 leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const faqs = [
  { q: "Will the therapist take sides?", a: "No. Your therapist is there to support the relationship, not to decide who is 'right.' They act as a bridge between two perspectives." },
  { q: "What if only one of us wants to do this?", a: "It's common for one partner to be more ready than the other. Start the assessment, and we can discuss how to bring both of you into the room comfortably." },
  { q: "Is this different from talking to family?", a: "Yes. Family members are involved in your life; a therapist isn't. They provide a neutral, grounded environment where you can say the things you can't say at the dinner table." },
  { q: "What happens in the first call?", a: "It's a 15-minute introduction. You'll get a feel for the therapist's approach and see if this is a room where you both feel heard." },
]

const CouplesFAQ = () => {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bg-[#FFF5F2] py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2 className="text-3xl md:text-4xl font-black text-[#233551] text-center mb-12" style={{ fontFamily: "var(--font-lato)" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          A few things you&apos;re probably wondering.
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
              <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${open === i ? "border-[#7B68EE]/40 bg-[#7B68EE]/5" : "border-slate-100 bg-white"}`}>
                <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
                  <span className={`text-base font-bold ${open === i ? "text-[#7B68EE]" : "text-[#233551]"}`} style={{ fontFamily: "var(--font-lato)" }}>{f.q}</span>
                  <span className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center ${open === i ? "bg-[#7B68EE] text-white" : "bg-slate-100 text-[#233551]"}`}>
                    {open === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {open === i && <p className="px-6 pb-5 text-sm text-[#233551]/60 leading-relaxed">{f.a}</p>}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-14 text-center space-y-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-[#233551]/50 text-sm">Stop repeating the same day. Start a new practice.</p>
          <Link href="/questionnaire?type=couples" className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#2d4568] transition-all shadow-lg shadow-[#233551]/20">Begin your practice</Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function CouplesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CouplesHero />
      <GroundedReality />
      <FindingRhythm />
      <HowItWorks />
      <Pricing />
      <PrivacySection />
      <CouplesFAQ />
      <Footer />
    </div>
  )
}
