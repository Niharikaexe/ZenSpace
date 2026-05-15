'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveQuestionnaire } from '@/app/actions/questionnaire'
import Footer from '@/components/home/Footer'

type StepId =
  | 'q1' | 'q2' | 'q3'
  | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'
  | 'q11' | 'q11a'
  | 'q12' | 'q12a' | 'q12b'
  | 'q13' | 'q14'

type Answers = {
  q1: string         // What's bringing you here (single)
  q2: string[]       // Main themes (multi)
  q3: string         // Support type (single)
  q4: string         // Self-relationship (single)
  q5: string         // Sleep (single)
  q6: string         // Racing thoughts (single)
  q7: string         // Social situations (single)
  q8: string         // Hope Likert (single)
  q9: string[]       // Coping (multi)
  q10: string[]      // Areas of life affected (multi)
  q11: string        // Medical Y/N
  q11a: string       // Medical text (optional, if q11=Yes)
  q12: string        // Past therapy Y/N
  q12a: string       // Past therapy helpful/unhelpful text (optional, if q12=Yes)
  q12b: string[]     // Therapist style preference (multi, if q12=Yes)
  q13: string        // Gender preference (single)
  q14: string[]      // Other characteristics (multi, optional)
}

const initialAnswers: Answers = {
  q1: '', q2: [], q3: '',
  q4: '', q5: '', q6: '', q7: '', q8: '', q9: [], q10: [],
  q11: '', q11a: '',
  q12: '', q12a: '', q12b: [],
  q13: '', q14: [],
}

function buildSteps(a: Answers): StepId[] {
  const steps: StepId[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11']
  if (a.q11 === 'Yes') steps.push('q11a')
  steps.push('q12')
  if (a.q12 === 'Yes') steps.push('q12a', 'q12b')
  steps.push('q13', 'q14')
  return steps
}

function sectionLabel(step: StepId): string {
  if (step === 'q1' || step === 'q2' || step === 'q3') return "Section A — What's bringing you here"
  if (step === 'q4' || step === 'q5' || step === 'q6' || step === 'q7' || step === 'q8' || step === 'q9' || step === 'q10' || step === 'q11' || step === 'q11a') return "Section B — How you've been"
  if (step === 'q12' || step === 'q12a' || step === 'q12b') return 'Your therapy history'
  return 'Section C — Your therapist'
}

function OptionButton({
  selected, onClick, children, className,
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
        'rounded-xl text-sm font-medium border-2 transition-all px-4 py-3 min-h-[48px] text-left',
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

export default function IndividualQuestionnairePage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [stepIndex, setStepIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })
  }, [])

  const steps = useMemo(() => buildSteps(answers), [answers])
  const step = steps[stepIndex]
  const totalSteps = steps.length
  const progressPercent = Math.round((stepIndex / totalSteps) * 100)

  function setSingle<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function toggleMulti(key: 'q2' | 'q9' | 'q10' | 'q12b' | 'q14', value: string) {
    setAnswers(prev => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function canProceed(): boolean {
    switch (step) {
      case 'q1': return !!answers.q1
      case 'q2': return answers.q2.length > 0
      case 'q3': return !!answers.q3
      case 'q4': return !!answers.q4
      case 'q5': return !!answers.q5
      case 'q6': return !!answers.q6
      case 'q7': return !!answers.q7
      case 'q8': return !!answers.q8
      case 'q9': return answers.q9.length > 0
      case 'q10': return answers.q10.length > 0
      case 'q11': return !!answers.q11
      case 'q11a': return true // text, optional
      case 'q12': return !!answers.q12
      case 'q12a': return true // text, optional
      case 'q12b': return answers.q12b.length > 0
      case 'q13': return !!answers.q13
      case 'q14': return true // multi, optional
      default: return true
    }
  }

  async function handleNext() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(i => i + 1)
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
      sessionStorage.setItem('mindcanopy_questionnaire', JSON.stringify(data))
      router.push('/signup')
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  const isLast = stepIndex === totalSteps - 1

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-black text-lg text-[#233551] flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
            MindCanopy
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

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">
            {sectionLabel(step)}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm">

          {step === 'q1' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What&apos;s bringing you here right now?
              </h2>
              <p className="text-sm text-[#233551]/50">Pick what feels most accurate.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Something specific happened recently and I need to process it',
                  "I've been struggling for a while and I'm finally ready to do something about it",
                  'I want to understand myself better — no crisis, just growth',
                  "I'm not sure yet — I just know something feels off",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q1 === opt} onClick={() => setSingle('q1', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q2' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What are the main themes you hope to address in therapy?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Depression, low mood, or loss of motivation',
                  'Anxiety, worry, or panic',
                  'Trauma or difficult past experiences',
                  'Grief or loss',
                  'Relationship or family issues',
                  'Work, study, burnout, or stress',
                  'Self-esteem, identity, or confidence',
                  'Substance use or addictive behaviours',
                  'Something else',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q2.includes(opt)} onClick={() => toggleMulti('q2', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q3' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What kind of support are you mostly looking for right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Practical tools and coping strategies',
                  'A safe place to talk and feel heard',
                  'Help understanding patterns from my past',
                  'Support with a specific decision or situation',
                  "I'm not sure yet",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q3 === opt} onClick={() => setSingle('q3', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q4' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you describe your relationship with yourself overall?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Mostly positive — I have a stable sense of who I am and what I'm worth",
                  'Mixed — I have good days but struggle with self-doubt',
                  'Fairly critical — I tend to see my flaws more clearly than my strengths',
                  "Harsh — I find it difficult to feel like I'm good enough",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q4 === opt} onClick={() => setSingle('q4', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q5' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you describe your sleep over the past month?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Good — I fall asleep easily and wake up rested',
                  "Inconsistent — some nights are fine, others aren't",
                  'Poor — I often struggle to fall or stay asleep',
                  'Very poor — sleep problems are significantly affecting my daily life',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q5 === opt} onClick={() => setSingle('q5', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q6' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How often do racing thoughts or worry keep you awake at night?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Rarely', 'Once or twice a week', 'Several nights a week', 'Almost every night'].map(opt => (
                  <OptionButton key={opt} selected={answers.q6 === opt} onClick={() => setSingle('q6', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q7' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How do you feel about social situations — meeting new people, being in groups, speaking up?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Comfortable — I generally enjoy being social',
                  'Mildly uncomfortable in some situations but I manage',
                  'Anxious in most social situations — I usually push through but it takes effort',
                  'Significantly anxious — I often avoid social situations because of how they make me feel',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q7 === opt} onClick={() => setSingle('q7', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q8' && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-[#233551]/60 uppercase tracking-wider">How much do you agree with this statement?</p>
              <blockquote className="text-lg font-medium text-[#233551] italic border-l-4 border-[#7EC0B7] pl-4 py-1 leading-relaxed">
                &ldquo;Even during difficult periods, I believe things can get better with the right support.&rdquo;
              </blockquote>
              <div className="grid grid-cols-1 gap-2">
                {['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'].map(opt => (
                  <OptionButton key={opt} selected={answers.q8 === opt} onClick={() => setSingle('q8', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q9' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                When life gets hard, what do you typically reach for?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I talk to someone I trust',
                  'I throw myself into work or staying busy',
                  'I withdraw and wait for it to pass',
                  'I tend to numb out — phone, food, alcohol, or other distractions',
                  'I try to actively problem-solve and take action',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q9.includes(opt)} onClick={() => toggleMulti('q9', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q10' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Which areas of your life are most affected right now?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Work or studies',
                  'Family relationships',
                  'Romantic relationships',
                  'Friendships and social life',
                  'Physical health or sleep',
                  'Finances',
                  'Self-esteem',
                  'None of these feel right',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q10.includes(opt)} onClick={() => toggleMulti('q10', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q11' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Any medical conditions, medications, or recent health events you&apos;d like your therapist to know about?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {['Yes', 'No'].map(opt => (
                  <OptionButton key={opt} selected={answers.q11 === opt} onClick={() => setSingle('q11', opt)} className="text-center justify-center">{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q11a' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Briefly tell us what they should know.
              </h2>
              <p className="text-sm text-[#233551]/50">Optional.</p>
              <textarea
                value={answers.q11a}
                onChange={e => setSingle('q11a', e.target.value)}
                placeholder="e.g. medication, ongoing condition, recent health event..."
                className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {step === 'q12' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Have you been in therapy before?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {['Yes', 'No'].map(opt => (
                  <OptionButton key={opt} selected={answers.q12 === opt} onClick={() => setSingle('q12', opt)} className="text-center justify-center">{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q12a' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What was most helpful or unhelpful about that experience?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — this helps us match you better.</p>
              <textarea
                value={answers.q12a}
                onChange={e => setSingle('q12a', e.target.value)}
                placeholder="What worked, what didn't, what you'd want different..."
                className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {step === 'q12b' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What kind of therapist style do you think would suit you best now?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'More listening and supportive',
                  'More structured — practical tools and exercises',
                  'More insight-oriented — connecting patterns from the past',
                  'Direct and challenging — I want someone who pushes me',
                  "I'm open — I'd rather they decide what's right",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q12b.includes(opt)} onClick={() => toggleMulti('q12b', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q13' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you have a preference about your therapist&apos;s gender?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "I'd prefer a female therapist",
                  "I'd prefer a male therapist",
                  "I'd prefer a non-binary or gender-diverse therapist",
                  'No strong preference',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q13 === opt} onClick={() => setSingle('q13', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q14' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Any other characteristics that matter to you in a therapist?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Speaks a specific Indian language',
                  'Familiar with my cultural background',
                  'Within a specific age range',
                  'Has expertise with LGBTQ+ identity',
                  'Has expertise with neurodivergence (ADHD, autism)',
                  'Has expertise with relationships or couples work',
                  'No specific preferences',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q14.includes(opt)} onClick={() => toggleMulti('q14', opt)}>{opt}</OptionButton>
                ))}
              </div>
              <p className="text-xs text-[#233551]/40 pt-2">
                Your answers will help us match you with our best therapist.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6 mt-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
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
              {submitting ? 'Saving...' : isLast ? 'Find my therapist →' : 'Continue'}
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
      <Footer />
    </div>
  )
}
