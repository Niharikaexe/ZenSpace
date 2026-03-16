"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import Image from "next/image"

const steps = [
  {
    image: "/assets/how-it-works-1.png",
    title: "Get matched to the best therapist for you",
    description:
      "Answer a few questions to find a qualified therapist who fits your needs and preferences. Tap into the largest online network of credentialed providers.",
  },
  {
    image: "/assets/how-it-works-2.png",
    title: "Communicate your way",
    description:
      "Talk to your therapist however you feel comfortable — text, chat, audio, or video. You can expect the same professionalism as an in-office therapist.",
  },
  {
    image: "/assets/how-it-works-3.png",
    title: "Therapy when you need it",
    description:
      "You can message your therapist at any time, from anywhere. Schedule live sessions when it&apos;s convenient for you, and connect from any device.",
  },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h2
          className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How it works
        </motion.h2>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={step.title}>
              <motion.div
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <motion.div
                  className="flex-shrink-0"
                  whileInView={{ scale: [0.9, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={256}
                    height={208}
                    className="w-64 h-52 object-contain"
                  />
                </motion.div>

                <div className="text-center md:text-left">
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {i < steps.length - 1 && (
                <motion.div
                  className="flex justify-center my-8"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <ArrowDown size={28} className="text-primary" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
