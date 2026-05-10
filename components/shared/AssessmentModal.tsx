"use client"

import Link from "next/link"

interface Props {
  onClose: () => void
}

export function AssessmentModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(35,53,81,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3
          className="text-xl font-black text-[#233551] mb-2"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          Who is the assessment for?
        </h3>
        <p className="text-sm text-[#233551]/55 mb-6">
          We&apos;ll show you the right questions.
        </p>

        <div className="space-y-3">
          {[
            { label: "Individual", sub: "For yourself", href: "/questionnaire/individual", color: "bg-[#7EC0B7]/12 hover:bg-[#7EC0B7]/20 border-[#7EC0B7]/25" },
            { label: "Couples", sub: "For you and your partner", href: "/questionnaire/couples", color: "bg-[#E8926A]/12 hover:bg-[#E8926A]/20 border-[#E8926A]/25" },
            { label: "Teen", sub: "For a young person aged 14–20", href: "/questionnaire/teen", color: "bg-[#233551]/8 hover:bg-[#233551]/12 border-[#233551]/15" },
          ].map(opt => (
            <Link
              key={opt.label}
              href={opt.href}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-150 group ${opt.color}`}
              onClick={onClose}
            >
              <div>
                <p className="font-black text-[#233551] text-sm" style={{ fontFamily: "var(--font-lato)" }}>
                  {opt.label}
                </p>
                <p className="text-xs text-[#233551]/50 mt-0.5">{opt.sub}</p>
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#233551]/40 group-hover:text-[#233551] group-hover:translate-x-0.5 transition-all">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-xs text-[#233551]/40 hover:text-[#233551]/70 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
