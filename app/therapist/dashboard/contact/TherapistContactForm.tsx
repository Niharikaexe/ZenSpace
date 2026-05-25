'use client'

import { useState } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  'Client match question',
  'Payment / payout request',
  'Technical issue',
  'Session scheduling',
  'Account issue',
  'Other',
]

export function TherapistContactForm() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const mailtoUrl = `mailto:admin@mindcanopy.in?subject=${encodeURIComponent(subject || 'Therapist Query')}&body=${encodeURIComponent(message)}`
    window.open(mailtoUrl, '_blank')
    setSent(true)
  }

  return (
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
            <a href="mailto:admin@mindcanopy.in" className="text-[#3D8A80] hover:underline">
              admin@mindcanopy.in
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
  )
}
