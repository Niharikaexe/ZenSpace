"use client"

import { motion } from "framer-motion"
import { Shield, Award, Users, Lock } from "lucide-react"

const badges = [
  { icon: Users, label: "International Therapists" },
  { icon: Shield, label: "DPDP Compliant" },
  { icon: Lock, label: "Complete Privacy" },
  { icon: Award, label: "Licensed & Verified" },
]

const TrustBar = () => {
  return (
    <section className="bg-[#FFF5F2] py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {badges.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center justify-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#3D8A80]" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-[#233551]/70">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBar
