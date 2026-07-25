'use client'

import { useState, useTransition } from 'react'
import { submitFeedback, type FeedbackState } from './actions'

// The rest of the feedback, after the one tap they made in the email.
// Whatever they already answered arrives pre-filled, so nothing is asked twice.

const HEARD_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'somewhat', label: 'Somewhat' },
  { value: 'no', label: 'Not really' },
] as const

const AGAIN_OPTIONS = [
  { value: 'yes', label: 'Definitely' },
  { value: 'unsure', label: 'Not sure yet' },
  { value: 'switch', label: 'I’d rather switch' },
] as const

interface Props {
  sessionId: string
  therapistFirstName: string
  sessionDate: string | null
  existing: FeedbackState | null
}

export function FeedbackForm({ sessionId, therapistFirstName, sessionDate, existing }: Props) {
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null)
  const [feltHeard, setFeltHeard] = useState<string | null>(existing?.feltHeard ?? null)
  const [bookAgain, setBookAgain] = useState<string | null>(existing?.bookAgain ?? null)
  const [note, setNote] = useState(existing?.note ?? '')

  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('sessionId', sessionId)
      if (rating != null) fd.set('rating', String(rating))
      if (feltHeard) fd.set('feltHeard', feltHeard)
      if (bookAgain) fd.set('bookAgain', bookAgain)
      if (note.trim()) fd.set('note', note.trim())
      const res = await submitFeedback(fd)
      if (res.ok) setDone(true)
      else setError(res.error ?? 'Something went wrong. Please try again.')
    })
  }

  if (done) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-7">
        <h1
          className="text-xl font-black text-[#233551]"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Thank you, that&rsquo;s saved.
        </h1>
        <p className="text-sm text-[#233551]/60 mt-2 leading-relaxed">
          This genuinely helps us match people better. If something needs sorting out, someone from
          the team will be in touch.
        </p>
      </div>
    )
  }

  const pill = (selected: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
      selected
        ? 'bg-[#233551] border-[#233551] text-white'
        : 'bg-white border-slate-200 text-[#233551] hover:border-[#7EC0B7]'
    }`

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-7">
      <h1
        className="text-xl font-black text-[#233551] leading-snug"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        {existing?.rating || existing?.feltHeard || existing?.bookAgain
          ? 'Thanks, that’s saved.'
          : `How was your session with ${therapistFirstName}?`}
      </h1>
      <p className="text-sm text-[#233551]/55 mt-1.5">
        {dateLabel ? `Your session on ${dateLabel}. ` : ''}
        Anything else you want to add?
      </p>

      {/* rating */}
      <div className="mt-7">
        <p className="text-sm font-bold text-[#233551]">How would you rate the session?</p>
        <div className="flex gap-1.5 mt-2.5">
          {[1, 2, 3, 4, 5].map(n => {
            const on = rating != null && n <= rating
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} out of 5`}
                className={`w-12 h-11 rounded-xl border text-2xl leading-none transition-colors ${
                  on
                    ? 'border-[#E8926A] bg-[#FFF5F2] text-[#E8926A]'
                    : 'border-slate-200 bg-white text-slate-300 hover:border-[#E8926A]/50'
                }`}
              >
                ★
              </button>
            )
          })}
        </div>
      </div>

      {/* felt heard */}
      <div className="mt-7">
        <p className="text-sm font-bold text-[#233551]">Did you feel heard?</p>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {HEARD_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setFeltHeard(o.value)}
              className={pill(feltHeard === o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* book again */}
      <div className="mt-7">
        <p className="text-sm font-bold text-[#233551]">
          Would you book with {therapistFirstName} again?
        </p>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {AGAIN_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setBookAgain(o.value)}
              className={pill(bookAgain === o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* note */}
      <div className="mt-7">
        <label htmlFor="note" className="text-sm font-bold text-[#233551]">
          In your own words
        </label>
        <textarea
          id="note"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="What worked, what didn’t, anything you’d change…"
          className="mt-2.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#233551] placeholder:text-[#233551]/35 leading-relaxed focus:border-[#7EC0B7] focus:outline-none focus:ring-1 focus:ring-[#7EC0B7]"
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex items-center rounded-full bg-[#3D8A80] px-7 py-3 text-sm font-bold text-white hover:bg-[#33756c] disabled:opacity-60 transition-colors"
      >
        {isPending ? 'Sending…' : 'Send feedback'}
      </button>
      <p className="text-xs text-[#233551]/40 mt-3">
        Your rating is already saved. This adds the rest.
      </p>
    </form>
  )
}
