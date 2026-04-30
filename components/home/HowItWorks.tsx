"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const steps = [
  { number: "01", title: "Tell us about your world", description: "A few questions to help us understand your rhythm. It takes five minutes and helps us find the right person for your specific needs." },
  { number: "02", title: "Have a conversation", description: "Meet the therapist we've paired you with for a 15-minute introductory chat. It's a chance to see if the environment feels right before you commit to the practice." },
  { number: "03", title: "Make it a habit", description: "Start your weekly conversations through video or messaging. It's your space, on your schedule. If you ever feel like you need a different perspective, you can find a new therapist whenever you like." },
]

const Leaf = ({ w = 32, h = 48, rotate = 0, color = "#7EC0B7", opacity = 0.55 }: { w?: number; h?: number; rotate?: number; color?: string; opacity?: number }) => (
  <svg viewBox="0 0 32 48" fill="none" style={{ width: w, height: h, transform: `rotate(${rotate}deg)`, opacity }}>
    <path d="M16,46 C16,46 0,32 0,16 C0,0 16,0 16,0 C16,0 32,0 32,16 C32,32 16,46 16,46 Z" fill={color} />
    <path d="M16,46 L16,0" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
)

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-[#FFF5F2] py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-10 left-6 float-slow float-delay-1 pointer-events-none"><Leaf w={28} h={42} rotate={-25} color="#7EC0B7" opacity={0.45} /></div>
      <div className="absolute top-24 right-8 float-medium pointer-events-none"><Leaf w={22} h={34} rotate={40} color="#E8926A" opacity={0.35} /></div>
      <div className="absolute bottom-16 left-1/4 float-slow float-delay-2 pointer-events-none"><Leaf w={18} h={28} rotate={-10} color="#7EC0B7" opacity={0.35} /></div>
      <div className="absolute bottom-10 right-1/4 float-medium float-delay-1 pointer-events-none"><Leaf w={24} h={36} rotate={30} color="#E8926A" opacity={0.3} /></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div className="text-center mb-16 max-w-xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-black text-[#233551] leading-tight mb-4" style={{ fontFamily: 'var(--font-lato)' }}>From joining to your<br />first conversation.</h2>
          <p className="text-[#233551]/55 text-base leading-relaxed">Just a straightforward path to finding your balance.</p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="flex-1 space-y-10">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.15 }} className="flex gap-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#233551] flex items-center justify-center shadow-md shadow-[#233551]/20">
                  <span className="text-white text-sm font-black" style={{ fontFamily: 'var(--font-lato)' }}>{step.number}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-black text-[#233551] mb-1.5" style={{ fontFamily: 'var(--font-lato)' }}>{step.title}</h3>
                  <p className="text-sm text-[#233551]/55 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="flex-1 lg:max-w-sm w-full" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#233551]/8 border border-white relative overflow-hidden">
              <div className="absolute -top-3 -right-3 opacity-20 rotate-45"><Leaf w={48} h={72} rotate={0} color="#7EC0B7" opacity={1} /></div>
              <div className="absolute -bottom-4 -left-3 opacity-15 -rotate-30"><Leaf w={40} h={60} rotate={0} color="#E8926A" opacity={1} /></div>
              <span className="inline-block bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">Free intro call</span>
              <h3 className="text-xl font-black text-[#233551] leading-snug mb-4" style={{ fontFamily: 'var(--font-lato)' }}>Before you pay anything, you talk to them first.</h3>
              <p className="text-sm text-[#233551]/55 leading-relaxed mb-6">Every match starts with a free 15-minute call. If it doesn't feel right, you pick someone else. No invoice, no awkwardness.</p>
              <Link href="/questionnaire" className="inline-flex items-center gap-2 text-sm font-bold text-[#233551] border-2 border-[#233551]/20 px-5 py-2.5 rounded-full hover:border-[#233551]/50 hover:bg-[#233551]/4 transition-all duration-200">Start the assessment →</Link>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path d="M0,36 C280,72 560,0 840,36 C1020,60 1220,10 1440,36 L1440,72 L0,72 Z" fill="#233551" />
        </svg>
      </div>
    </section>
  )
}

export default HowItWorks
