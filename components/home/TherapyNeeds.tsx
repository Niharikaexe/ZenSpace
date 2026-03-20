"use client"

import { motion } from "framer-motion"
import { Heart, Briefcase, Sparkles, Users } from "lucide-react"

const categories = [
  {
    icon: Heart,
    title: "Mental Health",
    items: ["Depression", "Anxiety & Panic Attacks", "Shame & Guilt", "OCD & ADHD"],
    iconBg: "bg-[#FFE8E4]",
    iconColor: "text-[#E8926A]",
    accent: "#E8926A",
  },
  {
    icon: Briefcase,
    title: "Work Life",
    items: ["Work Pressure", "Difficult Manager", "Productivity", "Work Relationships"],
    iconBg: "bg-[#E0F4F1]",
    iconColor: "text-[#3D8A80]",
    accent: "#3D8A80",
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    items: ["Communication Skills", "Presentation Skills", "Decision Making", "Goal Setting"],
    iconBg: "bg-[#EDE8FF]",
    iconColor: "text-[#7B68EE]",
    accent: "#7B68EE",
  },
  {
    icon: Users,
    title: "Relationship",
    items: ["Trust Issues", "Interpersonal Abuse", "Difficult In-Laws", "Marital Conflicts"],
    iconBg: "bg-[#E8F0FF]",
    iconColor: "text-[#5B8DEF]",
    accent: "#5B8DEF",
  },
]

/* Small decorative leaf */
const MiniLeaf = ({ rotate = 0, color = "#7EC0B7" }: { rotate?: number; color?: string }) => (
  <svg viewBox="0 0 28 42" fill="none" style={{ transform: `rotate(${rotate}deg)` }} className="w-7 h-10">
    <path d="M14,40 C14,40 0,28 0,14 C0,0 14,0 14,0 C14,0 28,0 28,14 C28,28 14,40 14,40 Z" fill={color} fillOpacity="0.5" />
    <path d="M14,40 L14,0" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
  </svg>
)

const TherapyNeeds = () => {
  return (
    <section className="bg-white py-20 md:py-28 overflow-hidden relative">
      {/* Decorative corner leaves */}
      <div className="absolute top-12 left-8 opacity-60 float-slow">
        <MiniLeaf rotate={-20} color="#7EC0B7" />
      </div>
      <div className="absolute top-16 right-10 opacity-50 float-medium float-delay-1">
        <MiniLeaf rotate={30} color="#FFB5A7" />
      </div>
      <div className="absolute bottom-12 left-16 opacity-40 float-slow float-delay-2">
        <MiniLeaf rotate={15} color="#7EC0B7" />
      </div>
      <div className="absolute bottom-20 right-8 opacity-50 float-medium">
        <MiniLeaf rotate={-35} color="#FFB5A7" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="text-3xl md:text-4xl font-black text-[#233551] mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Therapy for your every need
          </h2>
          <p className="text-[#233551]/55 text-base leading-relaxed">
            Everyone&apos;s mental health journey is unique. Whether you&apos;re struggling with a condition or simply need a safe space — we&apos;ve got you covered.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
              style={{ boxShadow: '0 2px 20px rgba(35,53,81,0.06)' }}
            >
              <div className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center mb-5`}>
                <cat.icon size={22} className={cat.iconColor} strokeWidth={2} />
              </div>
              <h3
                className="text-lg font-black text-[#233551] mb-4"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {cat.title}
              </h3>
              <ul className="space-y-2.5">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#233551]/55 hover:text-[#233551] transition-colors border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="mt-5 text-xs font-bold transition-colors"
                style={{ color: cat.accent }}
              >
                Read More →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TherapyNeeds
