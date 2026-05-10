"use client"

import { motion } from "framer-motion"

const items = [
  "You know something's off, but you can't quite name it.",
  "You've Googled your symptoms at 2am more than once.",
  "You keep thinking you should just deal with it.",
  "You're not sure it's 'bad enough' for therapy.",
]

const ProblemRecognition = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF5F2] via-white to-[#F0FAF9] py-24">
      {/* Asymmetric color blobs */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[520px] bg-[rgba(126,192,183,0.40)]"
        style={{ borderRadius: "62% 38% 54% 46% / 48% 60% 40% 52%" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-28 h-[480px] w-[480px] bg-[rgba(232,146,106,0.30)]"
        style={{ borderRadius: "48% 52% 38% 62% / 60% 44% 56% 40%" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-[20%] top-[30%] h-44 w-44 rounded-full bg-[rgba(249,123,90,0.22)]"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full bg-[rgba(126,192,183,0.18)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#3D8A80]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#7EC0B7]" />
          Sound familiar?
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-[#233551] md:text-5xl"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          You&apos;ve probably been{" "}
          <span className="relative inline-block text-[#3D8A80]">
            putting this off
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-10 h-[0.3em] rounded-sm bg-[rgba(126,192,183,0.35)]"
            />
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mx-auto mt-5 max-w-xl text-base italic leading-relaxed text-[rgba(35,53,81,0.55)]"
        >
          You&apos;re not alone in that. Most people wait{" "}
          <strong className="not-italic font-bold text-[#233551]">two years</strong>{" "}
          before they talk to anyone.
        </motion.p>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl border border-white/90 bg-white/70 p-6 text-left text-base leading-relaxed text-[#233551] shadow-[0_4px_16px_rgba(35,53,81,0.05)] backdrop-blur-md"
            >
              <span className="w-8 flex-shrink-0 text-xl font-black leading-none tracking-tight text-[#E8926A]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{t}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-10 max-w-lg text-base italic leading-relaxed text-[rgba(35,53,81,0.55)]"
        >
          &ldquo;Therapy isn&apos;t for people who are broken. It&apos;s for people who are tired of carrying things alone.&rdquo;
        </motion.p>
      </div>
    </section>
  )
}

export default ProblemRecognition
