"use client"

import { buttonVariants } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const CTASection = () => {
  return (
    <section className="bg-[hsl(var(--hero-dark))] py-20 md:py-28 relative overflow-hidden">
      {/* Wavy top border */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 md:h-16" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,0 L0,0 Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Check Your Mental Well-being Score
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed">
              Feeling a little unsure about your mental health lately? No worries — here is a quick self-rating scale recommended by the World Health Organization. It can give you some insight into how you&apos;re feeling. Keep in mind this tool doesn&apos;t replace a professional opinion.
            </p>
            <Link
              href="/questionnaire"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2")}
            >
              Start Assessment <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-primary-foreground/20 shadow-2xl">
              <Image
                src="/assets/wellbeing-zen.png"
                alt="Zen meditation"
                width={288}
                height={288}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wavy bottom border */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg viewBox="0 0 1440 60" className="w-full h-12 md:h-16" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,0 L0,0 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  )
}

export default CTASection
