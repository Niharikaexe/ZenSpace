"use client"

import { motion } from "framer-motion"

const points = [
  "You&apos;ve probably spent a few late nights looking for answers online.",
  "You keep telling yourself you should just &ldquo;handle it,&rdquo; or wondering if what you&apos;re feeling is &ldquo;enough&rdquo; for therapy.",
]

const WhyNow = () => {
  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">
      {/* Subtle decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FFF5F2] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#E0F4F1] opacity-30 pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
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
              It&apos;s okay if you&apos;ve been waiting.
            </h2>
            {/* Teal underline accent */}
            <div className="mt-5 w-12 h-1 rounded-full bg-[#7EC0B7]" />
          </motion.div>

          {/* RIGHT: body */}
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="space-y-4 text-[#233551]/65 text-base leading-relaxed">
              {points.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>

            <div className="bg-[#FFF5F2] rounded-2xl px-7 py-6 border-l-4 border-[#E8926A]">
              <p className="text-[#233551] text-base leading-relaxed font-medium">
                Whatever you&apos;re carrying, it&apos;s enough.
              </p>
              <p className="text-[#233551]/60 text-sm leading-relaxed mt-2">
                Therapy isn&apos;t about being broken. It&apos;s about having a place to set the weight down.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default WhyNow
