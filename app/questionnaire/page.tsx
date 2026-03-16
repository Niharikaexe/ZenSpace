'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 5

export type QuestionnaireData = {
  primary_concern: string
  therapy_goals: string
  gender: string
  previous_therapy: boolean | null
  preferred_therapist_gender: string
  preferred_session_type: 'chat' | 'video'
}

const initialData: QuestionnaireData = {
  primary_concern: '',
  therapy_goals: '',
  gender: '',
  previous_therapy: null,
  preferred_therapist_gender: 'no_preference',
  preferred_session_type: 'chat',
}

const CONCERNS = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'stress', label: 'Stress & Burnout' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'trauma', label: 'Trauma & PTSD' },
  { value: 'self_esteem', label: 'Self-esteem' },
  { value: 'life_transitions', label: 'Life Transitions' },
  { value: 'other', label: 'Other' },
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

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
        'rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        selected
          ? 'bg-teal-600 text-white border-teal-600'
          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50',
        className
      )}
    >
      {children}
    </button>
  )
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<QuestionnaireData>(initialData)

  function update<K extends keyof QuestionnaireData>(key: K, value: QuestionnaireData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function canProceed() {
    if (step === 1) return !!data.primary_concern
    if (step === 2) return data.therapy_goals.trim().length >= 10
    if (step === 3) return !!data.gender
    if (step === 4) return data.previous_therapy !== null
    return true
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      sessionStorage.setItem('zenspace_questionnaire', JSON.stringify(data))
      router.push('/signup')
    }
  }

  const stepMeta: Record<number, { title: string; desc: string }> = {
    1: { title: 'What brings you here?', desc: 'Select the primary reason you\'re seeking therapy.' },
    2: { title: 'What are your goals?', desc: 'Tell us what you hope to achieve through therapy.' },
    3: { title: 'Tell us about yourself', desc: 'This helps us understand you better.' },
    4: { title: 'Your preferences', desc: 'Help us find your best match.' },
    5: { title: 'How would you like to connect?', desc: 'Choose your preferred way to have sessions.' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-teal-700">ZenSpace</h1>
          <p className="text-sm text-teal-600 mt-1">Help us find the right therapist for you</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                i < step ? 'bg-teal-500' : 'bg-teal-100'
              )}
            />
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <p className="text-xs text-teal-500 font-medium uppercase tracking-wider mb-1">
              Step {step} of {TOTAL_STEPS}
            </p>
            <CardTitle>{stepMeta[step].title}</CardTitle>
            <CardDescription>{stepMeta[step].desc}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Step 1: Primary concern */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONCERNS.map(c => (
                  <OptionButton
                    key={c.value}
                    selected={data.primary_concern === c.value}
                    onClick={() => update('primary_concern', c.value)}
                    className="px-3 py-2.5"
                  >
                    {c.label}
                  </OptionButton>
                ))}
              </div>
            )}

            {/* Step 2: Therapy goals */}
            {step === 2 && (
              <div className="space-y-2">
                <Textarea
                  placeholder="e.g. I want to manage my anxiety better, improve my relationships, and feel more at peace..."
                  value={data.therapy_goals}
                  onChange={e => update('therapy_goals', e.target.value)}
                  className="min-h-[140px] resize-none"
                />
                <p className="text-xs text-slate-400">
                  {data.therapy_goals.trim().length < 10
                    ? `${10 - data.therapy_goals.trim().length} more characters needed`
                    : '✓ Looks good'}
                </p>
              </div>
            )}

            {/* Step 3: Gender */}
            {step === 3 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">What is your gender?</p>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map(g => (
                    <OptionButton
                      key={g.value}
                      selected={data.gender === g.value}
                      onClick={() => update('gender', g.value)}
                      className="px-3 py-2.5"
                    >
                      {g.label}
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Previous therapy + therapist gender preference */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Have you been in therapy before?
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ].map(opt => (
                      <OptionButton
                        key={String(opt.value)}
                        selected={data.previous_therapy === opt.value}
                        onClick={() => update('previous_therapy', opt.value)}
                        className="flex-1 py-2.5"
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Do you have a preferred therapist gender?
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: 'No preference', value: 'no_preference' },
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                    ].map(opt => (
                      <OptionButton
                        key={opt.value}
                        selected={data.preferred_therapist_gender === opt.value}
                        onClick={() => update('preferred_therapist_gender', opt.value)}
                        className="flex-1 py-2.5 text-xs sm:text-sm"
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Session type */}
            {step === 5 && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    value: 'chat' as const,
                    label: 'Text / Chat',
                    desc: 'Message your therapist at your own pace',
                  },
                  {
                    value: 'video' as const,
                    label: 'Video Sessions',
                    desc: 'Face-to-face sessions over video call',
                  },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('preferred_session_type', opt.value)}
                    className={cn(
                      'w-full p-4 rounded-lg text-left border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                      data.preferred_session_type === opt.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    )}
                  >
                    <p className="font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(s => s - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!canProceed()}
                onClick={handleNext}
              >
                {step === TOTAL_STEPS ? 'Create my account →' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
