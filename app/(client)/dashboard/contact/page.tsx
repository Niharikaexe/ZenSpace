'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 700)
  }

  const SUBJECTS = [
    'I have a question about my subscription',
    'I need help with the platform',
    'I want to report a technical issue',
    'I have a concern about my therapist',
    'Something else',
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
          <span className="text-sm text-[#233551]/50">Contact Us</span>
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
              Message sent.
            </h2>
            <p className="text-sm text-[#233551]/55 leading-relaxed mb-6">
              We&apos;ve received your message and will get back to you within 1 business day.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 bg-[#233551] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#2d4568] transition-colors" style={{ fontFamily: 'var(--font-lato)' }}>
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
              Contact us
            </h1>
            <p className="text-sm text-[#233551]/50 mb-8">
              We usually respond within 1 business day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>What is this about?</p>
                <div className="space-y-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(subject === s ? '' : s)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                        subject === s
                          ? 'border-[#233551] bg-[#233551]/5 text-[#233551] font-medium'
                          : 'border-slate-200 text-[#233551]/65 hover:border-[#7EC0B7]/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <label className="block text-sm font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
                  Your message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what you need..."
                  className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold py-3.5 rounded-full transition-colors disabled:opacity-50"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
