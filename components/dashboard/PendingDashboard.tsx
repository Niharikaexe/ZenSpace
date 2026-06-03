'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SAMPLE_THERAPISTS = [
  {
    initials: 'DR',
    name: 'Dr. R.',
    specializations: ['Anxiety', 'Depression'],
    experience: '8 years',
    approach: 'Cognitive Behavioural Therapy',
    languages: ['English', 'Hindi'],
    note: 'Worked with clients across 3 countries.',
  },
  {
    initials: 'PS',
    name: 'Dr. S.',
    specializations: ['Trauma', 'PTSD'],
    experience: '12 years',
    approach: 'EMDR & Somatic Therapy',
    languages: ['English', 'Telugu'],
    note: 'Trained in the UK. Specialises in complex trauma.',
  },
  {
    initials: 'AM',
    name: 'Dr. M.',
    specializations: ['Relationships', 'Life Transitions'],
    experience: '6 years',
    approach: 'Person-Centred Therapy',
    languages: ['English', 'Marathi'],
    note: 'Understands the pressure of family expectations intimately.',
  },
  {
    initials: 'RK',
    name: 'Dr. K.',
    specializations: ['Stress', 'Self-esteem'],
    experience: '10 years',
    approach: 'Mindfulness-Based Therapy',
    languages: ['English', 'Tamil'],
    note: 'Former academic researcher turned therapist.',
  },
  {
    initials: 'NP',
    name: 'Dr. P.',
    specializations: ['Burnout', 'Work-Life Balance'],
    experience: '9 years',
    approach: 'Acceptance & Commitment Therapy',
    languages: ['English', 'Kannada'],
    note: 'Worked extensively with professionals in high-pressure roles.',
  },
  {
    initials: 'VJ',
    name: 'Dr. J.',
    specializations: ['Grief', 'Existential Concerns'],
    experience: '14 years',
    approach: 'Psychodynamic Therapy',
    languages: ['English', 'Bengali'],
    note: 'Trained in the US. No cultural stake in your choices.',
  },
]

const COMPARISON_ROWS = [
  { feature: 'Qualified, licensed therapist', mindcanopy: true, traditional: true },
  { feature: 'No clinic visits required', mindcanopy: true, traditional: false },
  { feature: 'Async text messaging anytime', mindcanopy: true, traditional: false },
  { feature: 'Weekly video sessions', mindcanopy: true, traditional: true },
  { feature: 'Switch therapist anytime', mindcanopy: true, traditional: false },
  { feature: 'Complete privacy — no one in your network knows', mindcanopy: true, traditional: false },
  { feature: 'Available across India', mindcanopy: true, traditional: false },
]

type QuestionnairePrefs = {
  type: 'individual' | 'couples' | 'teen'
  concerns: string[]
  therapistGender: string | null
} | null

interface Props {
  userName: string
  hasQuestionnaire: boolean
  questionnairePrefs: QuestionnairePrefs
  therapyCategory: 'individual' | 'couples' | 'teen'
}

function CheckIcon({ ok }: { ok: boolean }) {
  if (ok) return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7EC0B7]/20">
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#3D8A80]">
        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-red-400">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function TherapistCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = SAMPLE_THERAPISTS.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 3500)
    return () => clearInterval(id)
  }, [paused, next])

  const t = SAMPLE_THERAPISTS[current]

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm min-h-[176px] flex flex-col justify-between transition-all duration-300">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-base flex items-center justify-center flex-shrink-0"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {t.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                {t.name}
              </p>
              <span className="text-[10px] font-bold text-[#3D8A80] bg-[#7EC0B7]/15 px-2 py-0.5 rounded-full">
                {t.experience}
              </span>
            </div>
            <p className="text-xs text-[#233551]/55 mt-0.5">{t.approach}</p>
            <p className="text-xs text-[#233551]/40 mt-2 italic leading-relaxed">&ldquo;{t.note}&rdquo;</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {t.specializations.map(s => (
              <span key={s} className="text-[11px] bg-[#7EC0B7]/12 text-[#3D8A80] px-2.5 py-0.5 rounded-full font-medium">
                {s}
              </span>
            ))}
            <span className="text-[11px] bg-slate-100 text-[#233551]/50 px-2.5 py-0.5 rounded-full font-medium">
              {t.languages.join(' · ')}
            </span>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-7 h-7 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-[#233551]/50 hover:text-[#233551] transition-colors"
        aria-label="Previous therapist"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-7 h-7 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-[#233551]/50 hover:text-[#233551] transition-colors"
        aria-label="Next therapist"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {SAMPLE_THERAPISTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? 'w-4 h-1.5 bg-[#3D8A80]'
                : 'w-1.5 h-1.5 bg-[#233551]/15 hover:bg-[#233551]/30'
            }`}
            aria-label={`Go to therapist ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function PendingDashboard({
  userName,
  hasQuestionnaire,
  questionnairePrefs,
  therapyCategory,
}: Props) {
  const firstName = userName.split(' ')[0]

  function buildPreferencesList(): string[] {
    if (!questionnairePrefs) return []
    const lines: string[] = []

    if (questionnairePrefs.type === 'couples') {
      lines.push('A therapist who works with couples — someone who can hold both sides of the relationship, not just one')
    } else if (questionnairePrefs.type === 'teen') {
      lines.push('A therapist who genuinely understands young adults (14–20), without talking down to them')
    }

    if (questionnairePrefs.concerns.length > 0) {
      const concerns = questionnairePrefs.concerns.slice(0, 3).join(', ')
      lines.push(`Real experience with what you're navigating — ${concerns}`)
    }

    // Only surface gender when the client expressed an actual preference.
    // The questionnaire stores "No strong preference" for no-preference, so check
    // for the specific gender keywords rather than excluding a single string.
    const gender = questionnairePrefs.therapistGender?.toLowerCase() ?? ''
    if (gender.includes('female')) {
      lines.push("A female therapist, since that's who you said you'd feel most at ease with")
    } else if (gender.includes('male')) {
      lines.push("A male therapist, since that's who you said you'd feel most at ease with")
    } else if (gender.includes('non-binary') || gender.includes('gender-diverse')) {
      lines.push('A non-binary or gender-diverse therapist, as you asked for')
    }

    return lines
  }

  const preferencesList = buildPreferencesList()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          {firstName}, we&apos;re matching you with the most aligned therapists.
        </h1>
      </div>

      {/* Status banner */}
      <div className="bg-[#7EC0B7]/12 border border-[#7EC0B7]/25 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
        <div className="flex gap-1 mt-0.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#233551]">We&apos;re finding your match</p>
          <p className="text-sm text-[#233551]/60 mt-0.5 leading-relaxed">
            Thank you for sharing your preferences. Our team is personally reviewing your responses to hand-pick therapists for you. This usually takes 24–48 hours — we&apos;ll let you know the moment they&apos;re ready. No payment needed yet.
          </p>
        </div>
      </div>

      {/* Questionnaire prompt — shown if user signed up without answering */}
      {!hasQuestionnaire && (
        <div className="bg-[#FFF5F2] border border-[#E8926A]/30 rounded-2xl px-5 py-4 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Help us find the right therapist for you
              </p>
              <p className="text-sm text-[#233551]/55 mt-1 leading-relaxed">
                You haven&apos;t answered the intake questionnaire yet. It takes about 5 minutes and helps us match you accurately.
              </p>
            </div>
            <Link
              href={`/questionnaire/${therapyCategory}`}
              className="flex-shrink-0 bg-[#E8926A] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#d4784f] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Answer now →
            </Link>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 mb-8" />

      {/* What happens next */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
          What happens next?
        </h2>
        <ul className="space-y-3">
          {[
            'You will receive a personalized match to a qualified, globally trained therapist.',
            'Your therapist will thoughtfully review what you shared and find an approach that fits you.',
            'You will begin communicating with your therapist online — and your therapy process begins.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#233551]/70 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Who will be my therapist */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          Who will be your therapist?
        </h2>
        <p className="text-sm text-[#233551]/60 mb-4 leading-relaxed">
          We&apos;ll find a personalized therapist match based on your preferences
          {questionnairePrefs ? ':' : '. Once you answer the questionnaire, you\'ll see your preferences here.'}
        </p>
        {preferencesList.length > 0 ? (
          <ul className="space-y-2">
            {preferencesList.map((pref, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#233551]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                {pref}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {[
              'A licensed, experienced therapist matched to your concerns and goals',
              'Someone with no cultural stake in your choices — they\'re here for you, not your family',
              'A therapist whose availability works with your schedule',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#233551]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* How do I talk to my therapist */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          How do you talk to your therapist?
        </h2>
        <p className="text-sm text-[#233551]/60 leading-relaxed">
          You have two ways to connect. You can send text messages to your therapist at any time — between sessions, on a Tuesday evening, whenever something comes up. You can also schedule weekly video sessions (50 minutes) to work through things face to face, without leaving your room.
        </p>
      </section>

      {/* MindCanopy vs Traditional comparison */}
      <section className="mb-10">
        <h2 className="text-lg font-black text-[#233551] mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
          MindCanopy vs traditional in-office therapy
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[#233551]/50 font-medium text-xs" />
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-black text-white bg-[#233551] px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-lato)' }}>
                    MindCanopy
                  </span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#233551]/50">In-office</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.feature} className={cn('border-b border-slate-100 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                  <td className="px-4 py-3 text-xs text-[#233551]/70">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><CheckIcon ok={row.mindcanopy} /></td>
                  <td className="px-4 py-3 text-center"><CheckIcon ok={row.traditional} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Therapist carousel */}
      <section className="mb-10">
        <p className="text-xs font-bold text-[#233551]/30 uppercase tracking-widest mb-4">
          The kind of therapist we&apos;re finding for you
        </p>
        <div className="px-4">
          <TherapistCarousel />
        </div>
        <p className="text-xs text-[#233551]/30 text-center mt-5">
          Profiles are anonymised for privacy. Your matched therapists will be revealed once they&apos;re ready.
        </p>
      </section>

    </div>
  )
}
