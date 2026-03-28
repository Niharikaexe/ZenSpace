'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveQuestionnaire } from '@/app/actions/questionnaire'

const TOTAL_QUESTIONS = 11

type Answers = {
  q1: string[]
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string
  q10: string
  q11: string
}

const initialAnswers: Answers = {
  q1: [],
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  q6: '',
  q7: '',
  q8: '',
  q9: '',
  q10: '',
  q11: '',
}

function OptionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl text-sm font-medium border-2 transition-all px-4 py-3 text-left',
        selected
          ? 'bg-[#233551] text-white border-[#233551]'
          : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5',
        className
      )}
    >
      {children}
    </button>
  )
}

function sectionLabel(q: number) {
  if (q <= 4) return "Section A — What's going on"
  if (q <= 7) return 'Section B — Your context'
  return 'Section C — Preferences'
}

export default function IndividualQuestionnairePage() {
  const router = useRouter()
  const [current, setCurrent] = useState(1)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })
  }, [])

  function toggleMulti(key: 'q1', value: string) {
    setAnswers(prev => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function setSingle(key: keyof Answers, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function canProceed(): boolean {
    if (current === 1) return answers.q1.length > 0
    if (current === 2) return !!answers.q2
    if (current === 3) return !!answers.q3
    if (current === 4) return !!answers.q4
    if (current === 5) return !!answers.q5
    if (current === 6) return !!answers.q6
    if (current === 7) return true // textarea, optional
    if (current === 8) return !!answers.q8
    if (current === 9) return true // textarea, optional
    if (current === 10) return !!answers.q10
    if (current === 11) return !!answers.q11
    return true
  }

  async function handleNext() {
    if (current < TOTAL_QUESTIONS) {
      setCurrent(c => c + 1)
      return
    }
    const data = { type: 'individual', answers }
    if (isAuthenticated) {
      setSubmitting(true)
      setSaveError(null)
      const result = await saveQuestionnaire(data)
      setSubmitting(false)
      if (result.error) { setSaveError(result.error); return }
      router.push('/dashboard')
    } else {
      sessionStorage.setItem('zenspace_questionnaire', JSON.stringify(data))
      router.push('/signup')
    }
  }

  const progressPercent = Math.round(((current - 1) / TOTAL_QUESTIONS) * 100)

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-black text-lg text-[#233551] flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
            ZenSpace
          </Link>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7EC0B7] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-[#233551]/40 flex-shrink-0">{progressPercent}%</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">
            {sectionLabel(current)}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">

          {/* Q1 */}
          {current === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What&apos;s been going on for you lately?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "I've been feeling anxious or on edge a lot",
                  "I'm overwhelmed and burned out",
                  "I'm struggling with anger or irritability",
                  "I've been feeling low or depressed",
                  "I went through a breakup or loss",
                  "I feel lonely or disconnected from people around me",
                  "I don't know how to describe it — I just know something's off",
                  "Something else",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q1.includes(opt)} onClick={() => toggleMulti('q1', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q2 */}
          {current === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How long has this been going on?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "A few weeks",
                  "A few months",
                  "Over 6 months",
                  "Over a year",
                  "I'm not sure",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q2 === opt} onClick={() => setSingle('q2', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q3 */}
          {current === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Does this affect your daily life?
              </h2>
              <p className="text-sm text-[#233551]/50">Be honest — there&apos;s no wrong answer.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Yes, significantly — work, relationships, sleep",
                  "Somewhat — I function, but it takes a lot",
                  "Occasionally",
                  "Not sure",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q3 === opt} onClick={() => setSingle('q3', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q4 */}
          {current === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Have you spoken to anyone about this before?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Yes — a therapist or counsellor",
                  "Yes — a doctor or GP",
                  "Yes — a friend or family member",
                  "No — this is the first time",
                  "I've tried to bring it up but not had a real conversation",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q4 === opt} onClick={() => setSingle('q4', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q5 */}
          {current === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you describe your life setup right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Living alone",
                  "Living with family (parents/siblings)",
                  "Living with a partner",
                  "Living with roommates/friends",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q5 === opt} onClick={() => setSingle('q5', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q6 */}
          {current === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What&apos;s your work or study situation?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Working full-time",
                  "Working part-time",
                  "Studying",
                  "Between jobs",
                  "Running my own business",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q6 === opt} onClick={() => setSingle('q6', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q7 */}
          {current === 7 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Is there anything specific you&apos;d like your therapist to understand about you before your first session?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional.</p>
              <textarea
                value={answers.q7}
                onChange={e => setSingle('q7', e.target.value)}
                placeholder="Anything you want them to know..."
                className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {/* Q8 */}
          {current === 8 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you have a preference for your therapist&apos;s gender?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Female therapist",
                  "Male therapist",
                  "No preference",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q8 === opt} onClick={() => setSingle('q8', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q9 */}
          {current === 9 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Is there anything about your background or culture that you&apos;d like your therapist to be aware of?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional.</p>
              <textarea
                value={answers.q9}
                onChange={e => setSingle('q9', e.target.value)}
                placeholder="e.g. family dynamics, cultural expectations, religious background..."
                className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {/* Q10 */}
          {current === 10 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What does a successful therapy experience look like for you?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "I want practical tools and techniques",
                  "I want to understand myself better",
                  "I want to process something specific",
                  "I want to feel less alone",
                  "I'm not sure yet — I'm open",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q10 === opt} onClick={() => setSingle('q10', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q11 */}
          {current === 11 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How comfortable are you with video calls?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Completely comfortable",
                  "Somewhat — I'm a bit nervous",
                  "Not sure — I've never done this before",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q11 === opt} onClick={() => setSingle('q11', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
              <p className="text-xs text-[#233551]/40 pt-2">
                Your answers are only seen by your matched therapist.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6 mt-2">
            {current > 1 && (
              <button
                type="button"
                onClick={() => setCurrent(c => c - 1)}
                className="flex-1 py-3 rounded-full border-2 border-slate-200 text-sm font-semibold text-[#233551] hover:border-[#233551]/40 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className="flex-1 py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {submitting ? 'Saving...' : current === TOTAL_QUESTIONS ? 'Find my therapist →' : 'Continue'}
            </button>
          </div>
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mt-3">{saveError}</p>
          )}
        </div>

        {isAuthenticated === false && (
          <p className="text-center text-xs text-[#233551]/35 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3D8A80] hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
