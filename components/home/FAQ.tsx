"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Does this actually work online?",
    a: "Having a conversation from your own couch often makes it easier to be open. It's the same support, just in a more comfortable environment.",
  },
  {
    q: "Can I speak to them before I start?",
    a: "Yes. Every match starts with a short conversation to make sure the rhythm feels right for you. No payment before that call happens.",
  },
  {
    q: "What if we don't fit?",
    a: "It happens. You can find a new person on the platform whenever you need to. No awkwardness, just a new start.",
  },
  {
    q: "Will my information stay private?",
    a: "Always. Your space here is entirely separate from the rest of your life. We don't share anything with employers, family, or anyone else.",
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
            A few things you&apos;re probably wondering.
          </h2>
          <p className="text-[#233551]/50 text-base">
            Straight answers, no filler.
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
