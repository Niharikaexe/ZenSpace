"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const recognitions = [
  "You know something's off, but you can't quite name it.",
  "You've Googled your symptoms at 2am more than once.",
  "You keep thinking you should just deal with it.",
  "You're not sure it's 'bad enough' for therapy.",
]

const RecognitionItem = ({ text, index }: { text: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 28 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
    className="flex gap-4 items-start"
  >
    {/* Animated teal left bar */}
    <div className="flex-shrink-0 w-0.5 self-stretch relative overflow-hidden rounded-full bg-[#7EC0B7]/15">
      <motion.div
        className="absolute top-0 left-0 w-full bg-[#7EC0B7] rounded-full"
        initial={{ height: "0%" }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.2, ease: "easeOut" }}
      />
    </div>
    {/* Text */}
    <p className="text-[#233551]/75 text-base leading-relaxed py-0.5">
      {text}
    </p>
  </motion.div>
)

const ProblemRecognition = () => {
  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">

      {/* Subtle decorative blobs — peach and teal, low opacity */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,232,226,0.6) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(126,192,183,0.12) 0%, transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* ── LEFT: Pull quote ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex-1 lg:sticky lg:top-24"
          >
            {/* Large decorative quotation mark */}
            <div
              className="text-[120px] leading-none text-[#7EC0B7]/20 font-black select-none -mb-6"
              style={{ fontFamily: 'var(--font-lato)' }}
              aria-hidden
            >
              "
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-[2.6rem] font-black text-[#233551] leading-[1.15] tracking-tight mb-5"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              You&apos;ve probably<br />
              been putting<br />
              this off.
            </h2>

            <p className="text-base text-[#233551]/50 leading-relaxed max-w-xs italic">
              You&apos;re not alone in that. Most people wait two years before they talk to anyone.
            </p>

            {/* Teal accent line */}
            <motion.div
              className="mt-8 h-1 w-12 bg-[#7EC0B7] rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>

          {/* ── RIGHT: Recognition list + CTA ── */}
          <div className="flex-1 space-y-7">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold uppercase tracking-widest text-[#7EC0B7]"
            >
              Sound familiar?
            </motion.p>

            {/* Recognition items */}
            <div className="space-y-6">
              {recognitions.map((text, i) => (
                <RecognitionItem key={i} text={text} index={i} />
              ))}
            </div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="pt-2"
            >
              <div className="h-px bg-[#233551]/8 mb-7" />

              <p className="text-sm text-[#233551]/50 leading-relaxed mb-5">
                Therapy isn&apos;t for people who are broken. It&apos;s for people who are tired of carrying things alone.
              </p>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemRecognition
