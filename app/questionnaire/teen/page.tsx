'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveQuestionnaire } from '@/app/actions/questionnaire'
import Footer from '@/components/home/Footer'

type StepId =
  | 'q1' | 'q2' | 'q3' | 'q4'
  | 'q5' | 'q6' | 'q7' | 'q8' | 'q9'
  | 'q10' | 'q11' | 'q12' | 'q13'
  | 'q14' | 'q15' | 'q16'
  | 'q17' | 'q17a'
  | 'q18'

type Answers = {
  q1: string         // Recent feeling (single)
  q2: string         // Mixed feelings about therapy (single)
  q3: string         // Who wanted you here (single)
  q4: string         // Adults understand (single)
  q5: string         // School impact (single)
  q6: string         // Family (single)
  q7: string         // Friendships (single)
  q8: string         // Bullying (single)
  q9: string         // Hobbies (single)
  q10: string        // Worry frequency (single)
  q11: string        // Anger/trouble (single)
  q12: string        // Sleep (single)
  q13: string        // Self-image (single)
  q14: string        // Comfort with adults (single)
  q15: string[]      // Main themes (multi)
  q16: string[]      // What therapist they'd feel safe with (multi)
  q17: string        // Past therapy Y/N
  q17a: string       // Past therapy style preference (single, if q17=Yes)
  q18: string        // Anything else for therapist (text, optional)
}

const initialAnswers: Answers = {
  q1: '', q2: '', q3: '', q4: '',
  q5: '', q6: '', q7: '', q8: '', q9: '',
  q10: '', q11: '', q12: '', q13: '',
  q14: '', q15: [], q16: [],
  q17: '', q17a: '',
  q18: '',
}

function buildSteps(a: Answers): StepId[] {
  const steps: StepId[] = [
    'q1', 'q2', 'q3', 'q4',
    'q5', 'q6', 'q7', 'q8', 'q9',
    'q10', 'q11', 'q12', 'q13',
    'q14', 'q15', 'q16',
    'q17',
  ]
  if (a.q17 === 'Yes') steps.push('q17a')
  steps.push('q18')
  return steps
}

function sectionLabel(step: StepId): string {
  if (step === 'q1' || step === 'q2' || step === 'q3' || step === 'q4') return "Section A — Where you're at"
  if (step === 'q5' || step === 'q6' || step === 'q7' || step === 'q8' || step === 'q9') return 'Section B — Your world'
  if (step === 'q10' || step === 'q11' || step === 'q12' || step === 'q13') return "Section C — How you've been feeling"
  return 'Section D — Your therapist'
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

export default function TeenQuestionnairePage() {
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

  function toggleMulti(key: 'q15' | 'q16', value: string) {
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
      case 'q2': return !!answers.q2
      case 'q3': return !!answers.q3
      case 'q4': return !!answers.q4
      case 'q5': return !!answers.q5
      case 'q6': return !!answers.q6
      case 'q7': return !!answers.q7
      case 'q8': return !!answers.q8
      case 'q9': return !!answers.q9
      case 'q10': return !!answers.q10
      case 'q11': return !!answers.q11
      case 'q12': return !!answers.q12
      case 'q13': return !!answers.q13
      case 'q14': return !!answers.q14
      case 'q15': return answers.q15.length > 0
      case 'q16': return answers.q16.length > 0
      case 'q17': return !!answers.q17
      case 'q17a': return !!answers.q17a
      case 'q18': return true // text, optional
      default: return true
    }
  }

  async function handleNext() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(i => i + 1)
      return
    }
    const data = { type: 'teen', answers }
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
  // Section A questions are validating/sensitive — show "private" reassurance badge
  const isValidating = step === 'q1' || step === 'q2' || step === 'q3' || step === 'q4'

  return (
    <div className="min-h-screen bg-white">
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
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">
            {sectionLabel(step)}
          </span>
          {isValidating && (
            <span className="text-xs font-bold text-white bg-[#E8926A] px-3 py-1 rounded-full">
              Private — your parents don&apos;t see this
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm">

          {step === 'q1' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                In the last few weeks, which of these fits you best?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I feel mostly okay',
                  'I feel stressed or down some days',
                  'I feel stressed, low, or worried most days',
                  "I feel like I'm struggling almost every day",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q1 === opt} onClick={() => setSingle('q1', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q2' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Lots of teens have mixed feelings about therapy. Which best describes you today?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I really want help',
                  "I'm unsure but willing to try",
                  "I don't know if I need this",
                  "I don't really want to be here",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q2 === opt} onClick={() => setSingle('q2', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q3' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Who most wanted you to come to therapy?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly me',
                  'Me and my parent/guardian together',
                  'Mostly my parent/guardian',
                  'Someone else (school, a doctor, or another adult)',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q3 === opt} onClick={() => setSingle('q3', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q4' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you feel that the adults in your life really understand what you&apos;re going through?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Yes, mostly understood',
                  'Somewhat, but not fully',
                  "Not really — I don't feel understood",
                  "I don't talk about my feelings with adults",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q4 === opt} onClick={() => setSingle('q4', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q5' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How much are your current difficulties affecting school or studies?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Not at all',
                  'A little',
                  'Quite a bit',
                  "A lot — I'm struggling to keep up",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q5 === opt} onClick={() => setSingle('q5', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q6' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Overall, how would you describe your relationship with your family or caregivers?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly positive and supportive',
                  'Mixed — good days and hard days',
                  'Often tense',
                  'Very distant or strained',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q6 === opt} onClick={() => setSingle('q6', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q7' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Which best describes your friendships and social life?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I have close friends I can rely on',
                  "I have some friends but don't feel very close to them",
                  'I feel left out or lonely much of the time',
                  'I prefer to stay mostly on my own',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q7 === opt} onClick={() => setSingle('q7', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q8' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                In the past year, have you experienced bullying or being left out on purpose (in person or online)?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'No, not really',
                  'Sometimes',
                  'Yes, often',
                  "I'd rather not say",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q8 === opt} onClick={() => setSingle('q8', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q9' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Which best describes your hobbies and interests right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I have activities I enjoy and do regularly',
                  "I have interests but rarely feel like doing them",
                  "I've lost interest in almost everything",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q9 === opt} onClick={() => setSingle('q9', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q10' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How often do you feel very nervous or worried about school, friends, or your future?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Rarely', 'Sometimes', 'Often', 'Almost all the time'].map(opt => (
                  <OptionButton key={opt} selected={answers.q10 === opt} onClick={() => setSingle('q10', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q11' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you get into trouble at home or school because of anger, impulsive actions, or breaking rules?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Never', 'Once in a while', 'Pretty often', 'All the time'].map(opt => (
                  <OptionButton key={opt} selected={answers.q11 === opt} onClick={() => setSingle('q11', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q12' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Which best describes your sleep lately?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I sleep well most nights',
                  'I struggle to fall asleep or stay asleep',
                  'I sleep a lot more than usual',
                  'My sleep is very irregular',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q12 === opt} onClick={() => setSingle('q12', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q13' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How do you generally feel about yourself?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly positive',
                  'Mixed',
                  'Often critical or not good enough',
                  'Very negative — I dislike myself',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q13 === opt} onClick={() => setSingle('q13', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q14' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How comfortable do you feel talking honestly with adults about your feelings or problems?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Very comfortable', 'Somewhat', 'Not very', 'I avoid it completely'].map(opt => (
                  <OptionButton key={opt} selected={answers.q14 === opt} onClick={() => setSingle('q14', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q15' && (
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
                  'Family or relationship issues',
                  'School stress or burnout',
                  'Self-esteem, identity, or confidence',
                  'Substance use or risky behaviours',
                  'Something else',
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q15.includes(opt)} onClick={() => toggleMulti('q15', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q16' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What kind of therapist would you feel safest with?
              </h2>
              <p className="text-sm text-[#233551]/50">
                Select all that apply. We try to provide therapists who don&apos;t feel like another parent.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Someone calm and easy-going',
                  'Someone warm and a bit funny',
                  'Someone who treats me like an adult',
                  "Someone who won't lecture me about Indian culture or family",
                  "Someone who isn't judgemental about my generation",
                  'Someone direct who actually answers my questions',
                  "I don't know yet",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q16.includes(opt)} onClick={() => toggleMulti('q16', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q17' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Have you been in therapy before?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {['Yes', 'No'].map(opt => (
                  <OptionButton key={opt} selected={answers.q17 === opt} onClick={() => setSingle('q17', opt)} className="text-center justify-center">{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q17a' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Thinking about what worked or didn&apos;t, what kind of therapist style suits you best now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly listening and supportive — giving me space to talk',
                  'Balanced — both listening and gently challenging me',
                  'More structured and practical — tools, exercises, homework',
                  'Very direct and honest — willing to challenge my patterns',
                  "I'm not sure yet — open to different styles",
                ].map(opt => (
                  <OptionButton key={opt} selected={answers.q17a === opt} onClick={() => setSingle('q17a', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {step === 'q18' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Is there anything else you want your therapist to know about you, your family, or your situation before you meet?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — totally fine to skip.</p>
              <textarea
                value={answers.q18}
                onChange={e => setSingle('q18', e.target.value)}
                placeholder="Anything at all. No judgment."
                className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
              <p className="text-xs text-[#233551]/40 pt-2">
                Your therapist will ask what they need in the first session. This is just a head start.
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
