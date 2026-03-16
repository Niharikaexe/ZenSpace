"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const therapyCards = [
  {
    title: "Individual",
    subtitle: "For myself",
    image: "/assets/individual-therapy.png",
    bg: "bg-[hsl(var(--card-green))]",
    href: "/questionnaire?type=individual",
  },
  {
    title: "Couples",
    subtitle: "For me and my partner",
    image: "/assets/couples-therapy.png",
    bg: "bg-[hsl(var(--card-teal))]",
    href: "/questionnaire?type=couples",
  },
  {
    title: "Teen",
    subtitle: "For my child",
    image: "/assets/teen-therapy.png",
    bg: "bg-[hsl(var(--card-amber))]",
    href: "/questionnaire?type=teen",
  },
]

const HeroSection = () => {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--hero-dark))] min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            You deserve to be happy.
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-lg mx-auto">
            What type of therapy are you looking for?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {therapyCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`${card.bg} rounded-2xl p-6 pb-0 cursor-pointer relative overflow-hidden group min-h-[320px] flex flex-col justify-between transition-all duration-500`}
              style={{
                transform: hovered === i ? "scale(1.03)" : "scale(1)",
                boxShadow: hovered === i
                  ? "0 20px 60px -15px rgba(0,0,0,0.4)"
                  : "0 4px 20px -5px rgba(0,0,0,0.2)",
              }}
            >
              <Link href={card.href} className="flex flex-col h-full">
                <div className="relative z-10">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                    {card.title}
                  </h3>
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <span>{card.subtitle}</span>
                    <motion.div
                      animate={{ x: hovered === i ? 6 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="flex justify-center mt-4"
                  animate={{
                    y: hovered === i ? -8 : 0,
                    scale: hovered === i ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Image
                    src={card.image}
                    alt={`${card.title} therapy illustration`}
                    width={224}
                    height={224}
                    className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-lg"
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
