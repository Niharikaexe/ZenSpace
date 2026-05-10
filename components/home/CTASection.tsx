"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function CTASection() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#233551]">

        {/* Top wave — teal section → navy (preserved) */}
        <div className="absolute top-0 left-0 w-full leading-none pointer-events-none">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-14 md:h-20">
            <path d="M0,0 L1440,0 L1440,40 C1160,72 880,4 600,36 C360,62 160,8 0,40 Z" fill="#F0FAF9" />
          </svg>
        </div>

        <div className="pt-28 md:pt-36 pb-24 md:pb-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.15fr_1fr]">

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(126,192,183,0.15)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#7EC0B7]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7EC0B7]" />
                Free assessment
              </span>

              <h2
                className="mt-4 text-4xl font-black leading-[1.15] tracking-tight text-white md:text-5xl"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                You&apos;ve done the reading.
                <br />
                Now, start the practice.
              </h2>

              <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-white/55">
                Take five minutes to tell us about your world. We&apos;ll help you find the right person to talk to. If it doesn&apos;t feel right, you pick someone else.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/questionnaire/individual"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7EC0B7] px-8 py-4 text-sm font-black text-[#233551] shadow-[0_12px_28px_rgba(126,192,183,0.25)] transition hover:-translate-y-0.5 hover:bg-[#8DCFC6] hover:shadow-[0_18px_40px_rgba(126,192,183,0.35)]"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  Start the assessment
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white/70 transition hover:border-white/50 hover:text-white"
                >
                  Create account →
                </Link>
              </div>

              <div className="mt-12 flex gap-12 text-white">
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>5,000+</div>
                  <div className="mt-1.5 text-xs text-white/45">Clients helped</div>
                </div>
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>4.9★</div>
                  <div className="mt-1.5 text-xs text-white/45">Average rating</div>
                </div>
                <div>
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-lato)' }}>100%</div>
                  <div className="mt-1.5 text-xs text-white/45">Licensed &amp; verified</div>
                </div>
              </div>
            </motion.div>

            {/* Tree + owl illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="relative mx-auto aspect-[360/440] w-full max-w-[360px]"
              aria-hidden
            >
              <TreeOwl />
            </motion.div>
          </div>
        </div>

        {/* Bottom wave — navy → white (preserved) */}
        <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-14 md:h-20">
            <path d="M0,35 C240,70 480,0 720,35 C900,60 1140,10 1440,35 L1440,70 L0,70 Z" fill="white" />
          </svg>
        </div>

        <style jsx>{`
          :global(.zs-cta-float-slow)   { animation: zs-cta-float-slow 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          :global(.zs-cta-float-medium) { animation: zs-cta-float-medium 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          :global(.zs-cta-float-fast)   { animation: zs-cta-float-fast 2.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          :global(.zs-cta-pulse)        { animation: zs-cta-pulse 2s ease-in-out infinite; }
          :global(.zs-cta-leaf-fall)    { animation: zs-cta-leaf-fall 6s ease-in infinite; transform-origin: center; }

          @keyframes zs-cta-float-slow   { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-18px) rotate(3deg); } }
          @keyframes zs-cta-float-medium { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-12px) rotate(-4deg); } }
          @keyframes zs-cta-float-fast   { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-8px) rotate(6deg); } }
          @keyframes zs-cta-pulse        { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
          @keyframes zs-cta-leaf-fall {
            0%   { transform: translate(0,0) rotate(0); opacity: 0; }
            10%  { opacity: 1; }
            100% { transform: translate(-40px, 200px) rotate(220deg); opacity: 0; }
          }
        `}</style>
      </section>
    </>
  )
}

function TreeOwl() {
  return (
    <svg
      viewBox="0 0 360 440"
      width="100%"
      height="100%"
      className="block h-full w-full overflow-visible [transform:scaleX(-1)]"
    >
      <defs>
        <radialGradient id="zs-cta-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7EC0B7" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#7EC0B7" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#7EC0B7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="220" r="200" fill="url(#zs-cta-aura)" />

      {/* Trunk */}
      <path
        d="M70,440 C70,320 90,260 96,180 C100,120 92,70 110,30 C120,12 130,8 140,12 C146,18 142,40 138,80 C132,140 138,210 146,280 C152,340 150,400 156,440 Z"
        fill="#3D2A1F"
      />
      <path
        d="M104,420 C100,330 110,260 112,180 C114,120 110,80 122,40"
        stroke="#5A3D2A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Owl-bearing branch */}
      <path d="M130,178 C180,170 240,170 320,166" stroke="#3D2A1F" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M250,170 C262,156 274,148 286,144" stroke="#3D2A1F" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M290,168 C300,154 310,146 320,140" stroke="#3D2A1F" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M310,167 C320,180 326,190 332,200" stroke="#3D2A1F" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Top branch */}
      <path d="M126,90 C150,76 184,68 214,62" stroke="#3D2A1F" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M170,72 C176,56 184,46 196,40" stroke="#3D2A1F" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Top-branch leaves */}
      <g className="zs-cta-float-slow">
        <ellipse cx="150" cy="64" rx="11" ry="6" fill="#7EC0B7" transform="rotate(-30 150 64)" />
        <ellipse cx="170" cy="52" rx="11" ry="6" fill="#3D8A80" transform="rotate(-20 170 52)" />
      </g>
      <g className="zs-cta-float-medium">
        <ellipse cx="200" cy="44" rx="11" ry="6" fill="#7EC0B7" transform="rotate(-10 200 44)" />
        <ellipse cx="216" cy="54" rx="11" ry="6" fill="#3D8A80" transform="rotate(20 216 54)" />
      </g>

      {/* Right-canopy leaves */}
      <g className="zs-cta-float-medium">
        <ellipse cx="278" cy="138" rx="12" ry="6.5" fill="#7EC0B7" transform="rotate(-25 278 138)" />
        <ellipse cx="296" cy="130" rx="11" ry="6" fill="#3D8A80" transform="rotate(-10 296 130)" />
        <ellipse cx="306" cy="142" rx="11" ry="6" fill="#7EC0B7" transform="rotate(15 306 142)" />
      </g>
      <g className="zs-cta-float-slow">
        <ellipse cx="316" cy="124" rx="11" ry="6" fill="#3D8A80" transform="rotate(-15 316 124)" />
        <ellipse cx="332" cy="132" rx="12" ry="6.5" fill="#7EC0B7" transform="rotate(-5 332 132)" />
      </g>
      <g className="zs-cta-float-fast">
        <ellipse cx="320" cy="200" rx="10" ry="5.5" fill="#7EC0B7" transform="rotate(20 320 200)" />
        <ellipse cx="334" cy="194" rx="11" ry="6" fill="#3D8A80" transform="rotate(-5 334 194)" />
      </g>

      {/* Floating petals */}
      <circle cx="60" cy="100" r="3" fill="#E8926A" className="zs-cta-float-slow" />
      <circle cx="340" cy="240" r="3.5" fill="#7EC0B7" className="zs-cta-float-medium" />
      <circle cx="40" cy="220" r="2.5" fill="#F97B5A" className="zs-cta-pulse" />
      <circle cx="320" cy="40" r="2.5" fill="#7EC0B7" className="zs-cta-pulse" />

      {/* Owl */}
      <g transform="translate(165,100)">
        <ellipse cx="35" cy="40" rx="28" ry="32" fill="#E8926A" />
        <ellipse cx="35" cy="48" rx="18" ry="22" fill="#FDBCA7" />
        <path d="M11,38 C5,46 9,58 18,64 C22,56 18,46 16,40 Z" fill="#3D2A1F" opacity=".5" />
        <path d="M59,38 C65,46 61,58 52,64 C48,56 52,46 54,40 Z" fill="#3D2A1F" opacity=".5" />
        <path
          d="M28,42 Q31,46 28,50 M35,42 Q38,46 35,50 M42,42 Q45,46 42,50"
          stroke="#E8926A"
          strokeWidth="1"
          fill="none"
          opacity=".6"
        />
        <path d="M14,14 C16,4 22,4 24,10 C25,16 21,20 17,22 Z" fill="#E8926A" />
        <path d="M56,14 C54,4 48,4 46,10 C45,16 49,20 53,22 Z" fill="#E8926A" />
        <circle cx="25" cy="28" r="9" fill="#FFF5F2" />
        <circle cx="45" cy="28" r="9" fill="#FFF5F2" />
        <circle cx="25" cy="29" r="4" fill="#233551" />
        <circle cx="45" cy="29" r="4" fill="#233551" />
        <circle cx="26" cy="28" r="1.4" fill="#FFFFFF" />
        <circle cx="46" cy="28" r="1.4" fill="#FFFFFF" />
        <path d="M32,36 L38,36 L35,42 Z" fill="#F97B5A" />
        <path
          d="M23,70 C22,74 23,76 26,76 M28,70 C28,74 29,76 32,76"
          stroke="#3D2A1F"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40,70 C40,74 41,76 44,76 M45,70 C46,74 47,76 50,76"
          stroke="#3D2A1F"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Falling leaf */}
      <ellipse cx="220" cy="220" rx="6" ry="3" fill="#7EC0B7" className="zs-cta-leaf-fall" />
    </svg>
  )
}
