'use client'

import { useState, useEffect } from 'react'

const reviews = [
  {
    text: "I'd tried this before and felt like a case file. At MindCanopy, my therapist didn't start with a label. She just listened. For the first time, I felt like I could actually breathe.",
    name: "R.K., 31",
    location: "Mumbai",
  },
  {
    text: "The messaging between our weekly conversations is what changed things for me. When I'm having a rough Wednesday, I don't have to wait until Sunday to feel heard.",
    name: "P.A., 26",
    location: "Bengaluru",
  },
  {
    text: "It's just a private room on my laptop. No one in my life needs to know I'm here, and that gave me the courage to finally start.",
    name: "S.M., 29",
    location: "Delhi",
  },
  {
    text: "My parents don't know I go to therapy. Not because I'm hiding it — just because it's mine. That distinction matters more than I thought it would.",
    name: "A.V., 24",
    location: "Hyderabad",
  },
  {
    text: "Three therapists before this one. The first two were fine. This one actually gets the specific version of my problems — the Indian-family, corporate-job, quarter-life kind.",
    name: "N.T., 28",
    location: "Pune",
  },
  {
    text: "I didn't know what I needed. I just knew something wasn't right. My therapist helped me name it — slowly, without any rush. That patience made all the difference.",
    name: "K.R., 33",
    location: "Chennai",
  },
]

export default function RotatingTestimonial() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % reviews.length)
        setVisible(true)
      }, 350)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const review = reviews[index]

  return (
    <div
      className="bg-[#E8926A]/15 border border-[#E8926A]/25 rounded-2xl px-5 py-4 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="text-white/90 text-sm leading-relaxed italic">
        &quot;{review.text}&quot;
      </p>
      <p className="text-[#E8926A] text-xs font-semibold mt-2">
        — {review.name}, {review.location}
      </p>
      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-3 h-3 text-[#E8926A]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  )
}
