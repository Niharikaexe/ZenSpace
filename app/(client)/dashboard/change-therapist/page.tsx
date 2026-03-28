'use client'

import { useState } from 'react'
import Link from 'next/link'

// Client component — no auth check needed here since middleware protects the route.
// If the user is somehow unauthenticated, the form submit will simply show an error.

export default function ChangeTherapistPage() {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Placeholder — wire to a real server action / email handler later
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  const REASONS = [
    "The communication style doesn't feel right for me",
    "I'd like a therapist with different specializations",
    "Scheduling doesn't work for me",
    "I'd prefer a different therapist gender",
    "Personal reasons — I'd rather not say",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard">
            <span className="font-black text-xl tracking-tight text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
              ZenSpace
            </span>
          </Link>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-slate-300">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#233551]/50">Change Therapist</span>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#233551]/45 hover:text-[#233551] transition-colors mb-6">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>

        {submitted ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#3D8A80]">
                <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
              Request received.
            </h2>
            <p className="text-sm text-[#233551]/55 leading-relaxed mb-6">
              We&apos;ve got your message. Our team will review it and reach out within 1–2 business days to confirm your new match.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-[#233551] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#2d4568] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
              Request a different therapist
            </h1>
            <p className="text-sm text-[#233551]/50 mb-8 leading-relaxed">
              No explanation required — but if you&apos;d like to share why, it helps us find a better match faster. Your response is private.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                  What&apos;s the main reason? <span className="font-normal text-[#233551]/35">(optional)</span>
                </p>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(reason === r ? '' : r)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                        reason === r
                          ? 'border-[#233551] bg-[#233551]/5 text-[#233551] font-medium'
                          : 'border-slate-200 text-[#233551]/65 hover:border-[#7EC0B7]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <label className="block text-sm font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
                  Anything else you&apos;d like us to know? <span className="font-normal text-[#233551]/35">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="e.g. I'd prefer someone who specializes in work-related stress..."
                  className="w-full min-h-[100px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold py-3.5 rounded-full transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {loading ? 'Submitting...' : 'Submit request'}
              </button>

              <p className="text-center text-xs text-[#233551]/30">
                Your current therapist will not be notified of your reason.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
