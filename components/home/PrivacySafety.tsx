"use client"

import { motion } from "framer-motion"
import { Lock, MapPin, RefreshCw } from "lucide-react"

const pillars = [
  {
    icon: Lock,
    title: "A Private Record",
    body: "Your conversations exist only between you and your therapist. We don't share your details with anyone.",
  },
  {
    icon: MapPin,
    title: "Your Environment",
    body: "Your therapy happens wherever you feel most comfortable. Your couch, your car, wherever the door closes.",
  },
  {
    icon: RefreshCw,
    title: "Your Choice",
    body: "This is your practice. You can pause, change therapists, or stop your subscription at any time.",
  },
]

const PrivacySafety = () => {
  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7EC0B7]/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

          {/* LEFT: headline */}
          <motion.div
            className="lg:w-2/5 flex-shrink-0"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="text-3xl md:text-4xl font-black text-[#233551] leading-tight"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Your space is strictly yours.
            </h2>
            <div className="mt-5 w-12 h-1 rounded-full bg-[#7EC0B7]" />
            <p className="mt-6 text-[#233551]/60 text-base leading-relaxed">
              Therapy works best when you know you&apos;re in a room where no one else can see in. We&apos;ve built Zen Space to ensure it stays that way.
            </p>
          </motion.div>

          {/* RIGHT: pillars */}
          <div className="flex-1 space-y-8">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#E0F4F1] flex items-center justify-center">
                  <p.icon size={18} className="text-[#3D8A80]" strokeWidth={2} />
                </div>
                <div>
                  <h3
                    className="text-base font-black text-[#233551] mb-1.5"
                    style={{ fontFamily: "var(--font-lato)" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#233551]/55 leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PrivacySafety
