"use client"

import { useEffect, useRef, useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const therapists = [
  { name: "Dr. Sarah Mitchell", specialty: "Anxiety & Depression",    rating: 4.9, reviews: 328, available: true,  initials: "SM" },
  { name: "Dr. James Chen",     specialty: "Couples & Family",        rating: 4.8, reviews: 256, available: true,  initials: "JC" },
  { name: "Dr. Amara Williams", specialty: "Trauma & PTSD",           rating: 5.0, reviews: 412, available: false, initials: "AW" },
  { name: "Dr. David Okafor",   specialty: "Teen & Adolescent",       rating: 4.9, reviews: 189, available: true,  initials: "DO" },
  { name: "Dr. Emily Park",     specialty: "Stress Management",       rating: 4.7, reviews: 203, available: true,  initials: "EP" },
  { name: "Dr. Maria Santos",   specialty: "Self-Esteem & Identity",  rating: 4.8, reviews: 175, available: true,  initials: "MS" },
  { name: "Dr. Robert Kim",     specialty: "Grief & Loss",            rating: 4.9, reviews: 291, available: false, initials: "RK" },
  { name: "Dr. Lisa Thompson",  specialty: "Work-Life Balance",       rating: 4.6, reviews: 144, available: true,  initials: "LT" },
]

const TherapistCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll)
    checkScroll()
    return () => el.removeEventListener("scroll", checkScroll)
  }, [])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
  }

  return (
    <section id="therapists" className="bg-secondary/50 py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Meet Our Therapists
            </h2>
            <p className="text-muted-foreground text-lg">
              Licensed, experienced professionals ready to support your journey.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("left")} disabled={!canScrollLeft}>
              <ChevronLeft size={20} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("right")} disabled={!canScrollRight}>
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        >
          {therapists.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 min-w-[260px] max-w-[280px] snap-start flex-shrink-0"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-display font-bold text-primary">{t.initials}</span>
                </div>

                {t.available ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald bg-emerald/10 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                    Available Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Next Available Tomorrow
                  </span>
                )}

                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.specialty}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{t.rating}</span>
                  <span className="text-sm text-muted-foreground">({t.reviews})</span>
                </div>

                <Button variant="hero-outline" size="sm" className="w-full rounded-full">
                  View Profile
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TherapistCards
