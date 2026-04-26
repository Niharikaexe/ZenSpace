'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TherapistNav } from '@/components/therapist/TherapistNav'

// Note: This page uses TherapistNav but is a client component.
// We pass a static name prop — for the real version, lift data fetch to a server wrapper.
// For now the nav gets the name from URL or a simple placeholder.

const SUBJECTS = [
  'Client match question',
  'Payment / payout request',
  'Technical issue',
  'Session scheduling',
  'Account issue',
  'Other',
]

export default function TherapistContactPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mailto fallback — wire to real backend when ready
    const mailtoUrl = `mailto:hello@zenspace.in?subject=${encodeURIComponent(subject || 'Therapist Query')}&body=${encodeURIComponent(message)}`
    window.open(mailtoUrl, '_blank')
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav without unread badge (client component — no server data) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/therapist/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-[#7EC0B7] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#7EC0B7]" />
            </div>
            <span className="font-black text-lg text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
              ZenSpace
            </span>
          </Link>
          <Link href="/therapist/dashboard" className="text-sm text-[#233551]/50 hover:text-[#233551] transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Contact Us
          </h1>
          <p className="text-sm text-[#233551]/45 mt-1">
            We usually respond within one working day.
          </p>
        </div>

        {sent ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-[#233551]">Message opened in your email client.</p>
            <p className="text-sm text-[#233551]/50">
              If nothing opened, email us at{' '}
              <a href="mailto:hello@zenspace.in" className="text-[#3D8A80] hover:underline">
                hello@zenspace.in
              </a>
            </p>
            <Link
              href="/therapist/dashboard"
              className="inline-block text-sm font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
            >
              ← Back to dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#233551] mb-1.5">Subject</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className={`text-xs px-3 py-2 rounded-xl border-2 text-left font-medium transition-all ${
                      subject === s
                        ? 'bg-[#233551] text-white border-[#233551]'
                        : 'bg-white text-[#233551]/65 border-slate-200 hover:border-[#7EC0B7]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#233551] mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Describe your query in detail..."
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              className="w-full py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-40"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Send message →
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
