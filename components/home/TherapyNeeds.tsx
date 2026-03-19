"use client"

import { motion } from "framer-motion"
import { Heart, Briefcase, Sparkles, Users } from "lucide-react"

const categories = [
  {
    icon: Heart,
    title: "Mental Health",
    items: ["Depression", "Anxiety & Panic Attacks", "Shame & Guilt", "OCD & ADHD"],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Briefcase,
    title: "Work Life",
    items: ["Work Pressure", "Difficult Manager", "Productivity", "Work Relationships"],
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    items: ["Communication Skills", "Presentation Skills", "Decision Making", "Goal Setting"],
    color: "text-emerald",
    bgColor: "bg-emerald/10",
  },
  {
    icon: Users,
    title: "Relationship",
    items: ["Trust Issues", "Interpersonal Abuse", "Difficult In-Laws", "Marital Conflicts"],
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

const TherapyNeeds = () => {
  return (
    <section className="bg-background py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Therapy For Your Every Need
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Everyone&apos;s mental health journey is unique. Whether you&apos;re struggling with a mental health condition or simply need a safe space to vent, we&apos;ve got you covered.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center mb-4`}>
                <cat.icon size={24} className={cat.color} />
              </div>
              <h3 className={`font-display text-xl font-semibold ${cat.color} mb-4`}>
                {cat.title}
              </h3>
              <ul className="space-y-3">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer border-b border-border/50 pb-2 last:border-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <button className={`mt-4 text-sm font-medium ${cat.color} hover:underline`}>
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
