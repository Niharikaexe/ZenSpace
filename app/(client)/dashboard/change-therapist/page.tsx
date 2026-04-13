'use client'

import { useState } from 'react'
import { requestTherapistSwitch } from '@/app/actions/switch-therapist'
import ClientNav from '@/components/client/ClientNav'

const REASONS = [
  "The communication style doesn't feel right for me",
  "I'd like a therapist with different specializations",
  "Scheduling doesn't work for me",
  "I'd prefer a different therapist gender",
  "Personal reasons — I'd rather not say",
  "Other",
]

export default function ChangeTherapistPage() {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData()
    if (reason) formData.set('reason', reason)
    if (details) formData.set('details', details)
    const result = await requestTherapistSwitch({}, formData)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <ClientNav userName="" />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#3D8A80]">
                <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
              Request received.
            </h2>
            <p className="text-sm text-[#233551]/55 leading-relaxed">
              Our team will review it and get back to you within 1–2 business days to confirm your new match. Your current sessions remain active until then.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ClientNav userName="" />

      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
          Request a different therapist
        </h1>
        <p className="text-sm text-[#233551]/50 mb-8 leading-relaxed">
          No explanation required — but if you'd like to share why, it helps us find a better match faster. Your reason is private.
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
              placeholder="e.g. I'd prefer someone who specialises in work-related stress..."
              className="w-full min-h-[100px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}

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
      </main>
    </div>
  )
}
