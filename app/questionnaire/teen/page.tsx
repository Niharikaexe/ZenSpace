'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TOTAL_QUESTIONS = 8

type Answers = {
  q1: string[]
  q2: string
  q3: string[]
  q4: string
  q5: string
  q6: string
  q7: string[]
  q8: string
}

const initialAnswers: Answers = {
  q1: [],
  q2: '',
  q3: [],
  q4: '',
  q5: '',
  q6: '',
  q7: [],
  q8: '',
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
  if (q <= 6) return 'Section B — Your context'
  return 'Section C — Preferences'
}

export default function TeenQuestionnairePage() {
  const router = useRouter()
  const [current, setCurrent] = useState(1)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)

  function toggleMulti(key: 'q1' | 'q3' | 'q7', value: string) {
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
    if (current === 3) return answers.q3.length > 0
    if (current === 4) return !!answers.q4
    if (current === 5) return !!answers.q5
    if (current === 6) return !!answers.q6
    if (current === 7) return answers.q7.length > 0
    if (current === 8) return true // textarea optional
    return true
  }

  function handleNext() {
    if (current < TOTAL_QUESTIONS) {
      setCurrent(c => c + 1)
    } else {
      sessionStorage.setItem(
        'zenspace_questionnaire',
        JSON.stringify({ type: 'teen', answers })
      )
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
          {/* Privacy badge — visible on private-feeling questions */}
          {current <= 4 && (
            <span className="text-xs font-bold text-white bg-[#E8926A] px-3 py-1 rounded-full">
              Private — your parents don&apos;t see this
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">

          {/* Q1 */}
          {current === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What made you decide to try this?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply — no wrong answers here.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "I've been feeling anxious or worried a lot",
                  "I've been really low or sad",
                  "Something happened that I can't stop thinking about",
                  "I get angry really quickly and I hate it",
                  "I feel alone even around people",
                  "My parents wanted me to try it",
                  "I'm not totally sure — I just wanted to talk to someone",
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
                On a scale of 1–5, how much is this affecting your daily life?
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "1", sub: "barely" },
                  { label: "2", sub: "" },
                  { label: "3", sub: "somewhat" },
                  { label: "4", sub: "" },
                  { label: "5", sub: "a lot" },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSingle('q2', opt.label)}
                    className={cn(
                      'rounded-xl border-2 transition-all px-3 py-4 text-center flex flex-col items-center gap-1',
                      answers.q2 === opt.label
                        ? 'bg-[#233551] text-white border-[#233551]'
                        : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5'
                    )}
                  >
                    <span className="text-xl font-black" style={{ fontFamily: 'var(--font-lato)' }}>{opt.label}</span>
                    {opt.sub && <span className="text-xs opacity-70">{opt.sub}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Q3 */}
          {current === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Has anything changed recently that might have triggered this?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that feel right.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Exams or academic pressure",
                  "A fight with a friend or someone I care about",
                  "Social media stuff",
                  "Family situation at home",
                  "Something happened to me personally",
                  "Not sure — it's been building for a while",
                  "Nothing obvious",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q3.includes(opt)} onClick={() => toggleMulti('q3', opt)}>
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
                How often do you feel this way?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Almost every day",
                  "A few times a week",
                  "Once in a while",
                  "It comes and goes",
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
                Are you in school or college right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "School (Class 9–12)",
                  "College / University",
                  "Taking a gap",
                  "Working",
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
                Have you ever talked to anyone about this before?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "No — this is the first time",
                  "I tried talking to a friend",
                  "I talked to a parent",
                  "I saw a counsellor at school",
                  "I've been to therapy before",
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
                Is there anything you want your therapist to know before you meet?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that feel true.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "I don't want to feel judged",
                  "I find it hard to talk about feelings",
                  "I want practical advice, not just listening",
                  "I'm not sure what I need",
                  "Something else — I'll write it below",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q7.includes(opt)} onClick={() => toggleMulti('q7', opt)}>
                    {opt}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q8 */}
          {current === 8 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Anything specific you want to say?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — totally fine to skip.</p>
              <textarea
                value={answers.q8}
                onChange={e => setSingle('q8', e.target.value)}
                placeholder="Anything at all. No judgment."
                className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
              <p className="text-xs text-[#233551]/40 pt-2">
                Your therapist will ask what they need in the first session. This is just a head start.
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
              disabled={!canProceed()}
              className="flex-1 py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {current === TOTAL_QUESTIONS ? 'Find my therapist →' : 'Continue'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#233551]/35 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#3D8A80] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
