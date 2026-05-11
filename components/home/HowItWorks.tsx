"use client"

import { motion } from "framer-motion"

/* ─── Tiny human bust (reusable across all illustrations) ─── */
interface TinyHumanProps {
  cx: number; cy: number; r: number; tilt?: number;
  accent?: string; bg?: string; skin?: string; hair?: string;
}
const TinyHuman = ({ cx, cy, r, tilt = 0, accent = "#7EC0B7", bg = "#6BB3AA", skin = "#F0D8B8", hair = "#233551" }: TinyHumanProps) => {
  const s = r / 28
  return (
    <g transform={`translate(${cx},${cy}) rotate(${tilt}) scale(${s})`}>
      <path d="M-22,30 Q-22,12 0,8 Q22,12 22,30 L22,36 L-22,36 Z" fill={bg}/>
      <rect x="-5" y="0" width="10" height="10" rx="2" fill={skin}/>
      <circle cx="0" cy="-8" r="16" fill={skin}/>
      <path d="M-15,-8 Q-16,-22 0,-24 Q16,-22 15,-8 Q15,-14 10,-16 Q0,-19 -10,-16 Q-15,-14 -15,-8 Z" fill={hair}/>
      <path d="M-15,-8 Q-17,-2 -14,4" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="-5" cy="-8" r="1.6" fill="#1A0E06"/>
      <circle cx="5"  cy="-8" r="1.6" fill="#1A0E06"/>
      <path d="M-3,-2 Q0,1 3,-2" stroke="#C8683A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="-9" cy="-4" rx="3" ry="2" fill="#F4826A" fillOpacity="0.30"/>
      <ellipse cx="9"  cy="-4" rx="3" ry="2" fill="#F4826A" fillOpacity="0.30"/>
      <path d="M-6,8 L0,12 L6,8" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </g>
  )
}

/* ─── Step 01 — Grid of human faces with a selection ring ─── */
const Step01Illustration = () => {
  const palettes = [
    { skin:"#F0D8B8", hair:"#233551" },
    { skin:"#D9A878", hair:"#1C0E08" },
    { skin:"#B07850", hair:"#2A1810" },
    { skin:"#F0D8B8", hair:"#8B4A2A" },
    { skin:"#E8B886", hair:"#233551" },
    { skin:"#C28B5C", hair:"#1C0E08" },
  ]
  const humans: (TinyHumanProps & { key: number })[] = [
    { key:0,  cx:52,  cy:60,  r:34, accent:"#7EC0B7", bg:"#5EA9A0", ...palettes[0] },
    { key:1,  cx:120, cy:55,  r:30, accent:"#96CECA", bg:"#7EC0B7", tilt:-5, ...palettes[1] },
    { key:2,  cx:184, cy:58,  r:32, accent:"#7EC0B7", bg:"#6BB3AA", tilt:4,  ...palettes[2] },
    { key:3,  cx:248, cy:54,  r:28, accent:"#96CECA", bg:"#5EA9A0", tilt:-3, ...palettes[3] },
    { key:4,  cx:52,  cy:130, r:30, accent:"#7EC0B7", bg:"#4A9490", tilt:6,  ...palettes[4] },
    { key:5,  cx:120, cy:128, r:34, accent:"#96CECA", bg:"#7EC0B7", ...palettes[5] },
    { key:6,  cx:184, cy:132, r:28, accent:"#7EC0B7", bg:"#5EA9A0", tilt:-4, ...palettes[0] },
    { key:7,  cx:248, cy:126, r:32, accent:"#96CECA", bg:"#6BB3AA", tilt:3,  ...palettes[2] },
    { key:8,  cx:52,  cy:196, r:30, accent:"#7EC0B7", bg:"#5EA9A0", tilt:2,  ...palettes[1] },
    { key:9,  cx:120, cy:200, r:28, accent:"#96CECA", bg:"#4A9490", tilt:-6, ...palettes[3] },
    { key:10, cx:184, cy:194, r:32, accent:"#7EC0B7", bg:"#7EC0B7", tilt:3,  ...palettes[4] },
    { key:11, cx:248, cy:198, r:30, accent:"#96CECA", bg:"#6BB3AA", ...palettes[5] },
  ]
  return (
    <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <rect width="300" height="230" fill="#E8F6F4" rx="12"/>
      <line x1="86"  y1="10" x2="86"  y2="220" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.20"/>
      <line x1="152" y1="10" x2="152" y2="220" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.20"/>
      <line x1="218" y1="10" x2="218" y2="220" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.20"/>
      <line x1="10"  y1="94"  x2="290" y2="94"  stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.20"/>
      <line x1="10"  y1="163" x2="290" y2="163" stroke="#7EC0B7" strokeWidth="0.5" strokeOpacity="0.20"/>
      <clipPath id="gridClip"><rect x="0" y="0" width="300" height="215"/></clipPath>
      <g clipPath="url(#gridClip)">
        {humans.map(({ key, ...h }) => <TinyHuman key={key} {...h}/>)}
      </g>
      <circle cx="120" cy="128" r="40" fill="none" stroke="#7EC0B7" strokeWidth="3" strokeOpacity="0.8"/>
      <circle cx="120" cy="128" r="43" fill="none" stroke="#7EC0B7" strokeWidth="1" strokeOpacity="0.3"/>
      <rect x="60" y="200" width="180" height="24" rx="12" fill="#7EC0B7"/>
      <circle cx="225" cy="212" r="10" fill="white" opacity="0.95"/>
      <text x="90" y="216" fontSize="9" fill="white" fontWeight="700" fontFamily="Lato,sans-serif" letterSpacing="0.05em">FIND MY THERAPIST</text>
    </svg>
  )
}

/* ─── Step 02 — Human on laptop video call ─── */
const Step02Illustration = () => (
  <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect width="300" height="230" fill="#EAF4F3" rx="12"/>
    <path d="M30,190 L270,190 L258,205 L42,205 Z" fill="#233551"/>
    <path d="M42,205 L258,205" stroke="#1a2840" strokeWidth="1.5"/>
    <ellipse cx="150" cy="191" rx="20" ry="4" fill="#1a2840" opacity="0.4"/>
    <rect x="44" y="44" width="212" height="148" rx="8" fill="#233551"/>
    <rect x="52" y="52" width="196" height="132" rx="5" fill="#1d4a42"/>
    <circle cx="150" cy="48" r="3" fill="#1a2840"/>
    <rect x="56" y="56" width="188" height="124" rx="4" fill="#2A6B63"/>
    <rect x="60" y="60" width="86" height="58" rx="4" fill="#1E5048"/>
    <TinyHuman cx={103} cy={82} r={20} bg="#3D8A80" accent="#96CECA" skin="#D9A878" hair="#1C0E08"/>
    <rect x="150" y="60" width="90" height="58" rx="4" fill="#1a3d35"/>
    <TinyHuman cx={195} cy={82} r={20} bg="#5EA9A0" accent="#7EC0B7" tilt={-4} skin="#B07850" hair="#2A1810"/>
    <rect x="72" y="122" width="156" height="54" rx="4" fill="#7EC0B7"/>
    <rect x="72" y="155" width="156" height="21" rx="0" fill="#5EA9A0"/>
    <g className="human-head">
      <TinyHuman cx={150} cy={138} r={30} bg="#233551" accent="#7EC0B7" skin="#F0D8B8" hair="#1C0E08"/>
    </g>
    <rect x="80" y="163" width="68" height="10" rx="3" fill="#233551" opacity="0.7"/>
    <text x="84" y="171" fontSize="6" fill="white" fontFamily="Lato,sans-serif" fontWeight="700">Dr. Sarah Mitchell</text>
    <rect x="80" y="168" width="140" height="8" rx="4" fill="#1E5048" opacity="0.6"/>
    <circle cx="100" cy="172" r="4" fill="#7EC0B7" opacity="0.8"/>
    <circle cx="115" cy="172" r="4" fill="#7EC0B7" opacity="0.8"/>
    <circle cx="200" cy="172" r="4" fill="#ef4444" opacity="0.9"/>
    <circle cx="234" cy="64" r="4" fill="#ef4444"/>
    <text x="214" y="68" fontSize="7" fill="white" fontFamily="Lato,sans-serif" fontWeight="700">LIVE</text>
  </svg>
)

/* ─── Step 03 — Two phones (chat + booking) ─── */
const Step03Illustration = () => (
  <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect width="300" height="230" fill="#EDF6F5" rx="12"/>
    <rect x="28" y="24" width="96" height="182" rx="14" fill="#233551" opacity="0.95"/>
    <rect x="33" y="34" width="86" height="162" rx="8" fill="white"/>
    <rect x="58" y="27" width="36" height="8" rx="4" fill="#1a2840"/>
    <rect x="33" y="34" width="86" height="26" rx="8" fill="#7EC0B7"/>
    <TinyHuman cx={50} cy={50} r={10} bg="#5EA9A0" accent="#96CECA" skin="#F0D8B8" hair="#233551"/>
    <rect x="62" y="42" width="40" height="5" rx="2.5" fill="white" opacity="0.9"/>
    <rect x="62" y="50" width="26" height="4" rx="2"   fill="white" opacity="0.55"/>
    <rect x="37" y="66"  width="58" height="18" rx="8" fill="#E8F6F4"/>
    <rect x="37" y="88"  width="48" height="14" rx="7" fill="#E8F6F4"/>
    <rect x="57" y="108" width="58" height="16" rx="8" fill="#7EC0B7"/>
    <rect x="65" y="128" width="50" height="14" rx="7" fill="#7EC0B7"/>
    <rect x="37" y="148" width="60" height="16" rx="8" fill="#E8F6F4"/>
    <rect x="33" y="182" width="86" height="14" rx="7" fill="#F1F5F9"/>
    <circle cx="112" cy="189" r="5" fill="#7EC0B7"/>
    <rect x="42" y="71"  width="44" height="3" rx="1.5" fill="#3D8A80" opacity="0.4"/>
    <rect x="42" y="77"  width="32" height="3" rx="1.5" fill="#3D8A80" opacity="0.3"/>
    <rect x="62" y="113" width="46" height="3" rx="1.5" fill="white"   opacity="0.7"/>
    <rect x="70" y="133" width="36" height="3" rx="1.5" fill="white"   opacity="0.7"/>
    <rect x="176" y="14"  width="96" height="182" rx="14" fill="#233551" opacity="0.95"/>
    <rect x="181" y="24"  width="86" height="162" rx="8"  fill="white"/>
    <rect x="206" y="17"  width="36" height="8"   rx="4"  fill="#1a2840"/>
    <rect x="181" y="24"  width="86" height="22"  rx="8"  fill="#FFF5F2"/>
    <text x="188" y="38" fontSize="8" fill="#233551" fontFamily="Lato,sans-serif" fontWeight="900">MindCanopy</text>
    <rect x="186" y="52" width="76" height="52" rx="8" fill="#7EC0B7"/>
    <TinyHuman cx={210} cy={68} r={14} bg="#233551" accent="#96CECA" skin="#D9A878" hair="#1C0E08"/>
    <rect x="225" y="58" width="30" height="5"  rx="2.5" fill="white" opacity="0.9"/>
    <rect x="225" y="66" width="22" height="4"  rx="2"   fill="white" opacity="0.6"/>
    <rect x="225" y="74" width="26" height="4"  rx="2"   fill="white" opacity="0.6"/>
    <rect x="186" y="88" width="76" height="10" rx="5"   fill="white" opacity="0.25"/>
    <text x="200" y="96" fontSize="6" fill="white" fontFamily="Lato,sans-serif" fontWeight="700">Book Session</text>
    <rect x="186" y="110" width="76" height="36" rx="6" fill="#F8FAFB"/>
    <rect x="186" y="110" width="76" height="12" rx="6" fill="#E8F6F4"/>
    <text x="210" y="120" fontSize="7" fill="#3D8A80" fontFamily="Lato,sans-serif" fontWeight="700">May 2026</text>
    {[0,1,2,3,4,5,6].map(d => (
      <rect key={d} x={188+d*10} y={125} width="8" height="8" rx="2" fill={d===2 ? "#7EC0B7" : "#F1F5F9"}/>
    ))}
    {[0,1,2,3,4,5,6].map(d => (
      <text key={d} x={190+d*10} y={131.5} fontSize="4.5" fill={d===2 ? "white" : "#233551"} fontFamily="Lato,sans-serif" fontWeight={d===2 ? "900" : "400"}>{d+5}</text>
    ))}
    <rect x="186" y="152" width="76" height="16" rx="8" fill="#233551"/>
    <text x="200" y="163" fontSize="7" fill="white" fontFamily="Lato,sans-serif" fontWeight="700">₹2,999 / week</text>
    <rect x="186" y="174" width="76" height="12" rx="6" fill="#7EC0B7"/>
    <text x="204" y="182" fontSize="6.5" fill="#233551" fontFamily="Lato,sans-serif" fontWeight="900">Get started →</text>
    <path d="M128,115 Q152,100 172,115" stroke="#7EC0B7" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 3" opacity="0.6"/>
    <circle cx="150" cy="107" r="8" fill="#7EC0B7" opacity="0.15"/>
    <TinyHuman cx={150} cy={106} r={10} bg="#5EA9A0" accent="#96CECA" tilt={5} skin="#F0D8B8" hair="#233551"/>
  </svg>
)

/* ─── Step data ─── */
const steps = [
  {
    num: "01",
    title: "Tell us what you need",
    body: "Fill in a short questionnaire about what's been on your mind. No login needed yet.",
    Ill: Step01Illustration,
  },
  {
    num: "02",
    title: "We find your therapist",
    body: "Our team reviews your answers and hand-picks a therapist who fits.",
    Ill: Step02Illustration,
  },
  {
    num: "03",
    title: "Meet, then commit",
    body: "Talk for 15 minutes free. If it clicks, start your subscription. No pressure.",
    Ill: Step03Illustration,
  },
]

/* ─── Decorative leaf (kept for section ambiance) ─── */
const Leaf = ({ style }: { style: React.CSSProperties }) => (
  <svg viewBox="0 0 28 42" fill="none" style={style} className="pointer-events-none select-none">
    <path d="M14,40 C14,40 0,28 0,14 C0,0 14,0 14,0 C14,0 28,0 28,14 C28,28 14,40 14,40 Z" fill="#7EC0B7" fillOpacity="0.35"/>
    <path d="M14,40 L14,0" stroke="#7EC0B7" strokeWidth="1" strokeOpacity="0.2"/>
  </svg>
)

const HowItWorks = () => (
  <section id="how-it-works" className="bg-[#FFF5F2] pt-20 md:pt-28 pb-28 md:pb-40 relative overflow-hidden">

    {/* Floating leaf decorations */}
    <div className="absolute top-8 left-8 float-slow float-delay-1">
      <Leaf style={{ width: 26, height: 38, transform: "rotate(-20deg)", opacity: 0.6 }}/>
    </div>
    <div className="absolute top-20 right-12 float-medium">
      <Leaf style={{ width: 20, height: 30, transform: "rotate(35deg)", opacity: 0.45 }}/>
    </div>
    <div className="absolute bottom-36 left-20 float-slow float-delay-2">
      <Leaf style={{ width: 16, height: 24, transform: "rotate(-8deg)", opacity: 0.35 }}/>
    </div>
    <div className="absolute bottom-40 right-16 float-medium float-delay-1">
      <Leaf style={{ width: 22, height: 32, transform: "rotate(25deg)", opacity: 0.4 }}/>
    </div>

    <div className="max-w-6xl mx-auto px-6 relative z-10">

      {/* Section header */}
      <motion.div
        className="text-center mb-14 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-[11px] font-black uppercase tracking-[0.12em] px-4 py-2 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] inline-block"/>
          How it works
        </div>
        <h2
          className="text-3xl md:text-4xl font-black text-[#233551] leading-tight"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          Three steps to your first session
        </h2>
      </motion.div>

      {/* 3-step cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(35,53,81,0.08)] border border-slate-100"
          >
            {/* Illustration */}
            <div className="h-[200px] bg-[#EAF4F3] overflow-hidden">
              <s.Ill/>
            </div>
            {/* Text */}
            <div className="px-6 pt-5 pb-6">
              <div
                className="text-[11px] font-black text-[#7EC0B7] tracking-[0.08em] mb-1.5"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                {s.num}
              </div>
              <h3
                className="text-base font-black text-[#233551] mb-2"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                {s.title}
              </h3>
              <p className="text-[13px] text-[#233551]/55 leading-relaxed">
                {s.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>

    {/* Bottom wave → dark navy (TherapistCards section) */}
    <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-24">
        <path
          d="M0,40 C180,80 360,0 540,40 C720,80 900,10 1080,40 C1200,60 1340,20 1440,40 L1440,80 L0,80 Z"
          fill="#233551"
        />
      </svg>
    </div>
  </section>
)

export default HowItWorks
