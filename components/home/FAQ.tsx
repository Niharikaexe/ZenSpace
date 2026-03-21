"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Does online therapy actually work?",
    a: "For most people, yes. The research is pretty clear — and honestly, not having to commute to a clinic means you actually show up. A good therapist is a good therapist, regardless of whether they're in the same room.",
  },
  {
    q: "What does it cost?",
    a: "Our Essentials plan is ₹2,999/week — that's one 50-minute video session plus unlimited text messaging with your therapist. Premium is ₹4,499/week and includes access to our foreign-trained therapists. Couples therapy starts at ₹5,999/week. If you want to commit to a month, that's ₹9,999 for four sessions.",
  },
  {
    q: "Can I try before I pay?",
    a: "Yes. Before any money changes hands, you get a free 15-minute call with your potential therapist. If it doesn't feel right, you pick someone else. No invoice, no awkwardness.",
  },
  {
    q: "What if my therapist and I don't click?",
    a: "You switch. That's it. No explanation needed, no guilt trip. You're not firing anyone — you're finding your person. Therapist fit matters more than most people realise.",
  },
  {
    q: "Will anyone know I'm here?",
    a: "No. Not your employer, not your family, not anyone in your building. Your sessions and messages are encrypted and private. This is yours.",
  },
  {
    q: "Do you prescribe medication?",
    a: "We don't. ZenSpace is a talk therapy and counselling platform — no prescriptions, no diagnoses. If you think you need medication, we'll say so honestly and help you find the right person for that.",
  },
]

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-white py-20 md:py-28 relative overflow-hidden">
      {/* Subtle peach blob decoration */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FFE8E2] opacity-40 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#E0F4F1] opacity-30 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] mb-4"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Frequently asked questions
          </h2>
          <p className="text-[#233551]/50 text-base">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <div
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  open === i
                    ? "border-[#7EC0B7]/40 bg-[#7EC0B7]/5 shadow-md shadow-[#7EC0B7]/10"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className={`text-base font-bold transition-colors ${
                      open === i ? "text-[#3D8A80]" : "text-[#233551]"
                    }`}
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    open === i ? "bg-[#7EC0B7] text-white" : "bg-slate-100 text-[#233551]"
                  }`}>
                    {open === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-6 pb-5 text-sm text-[#233551]/60 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
