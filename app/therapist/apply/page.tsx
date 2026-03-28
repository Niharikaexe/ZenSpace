'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { submitTherapistApplication, type ApplyState } from './actions'

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Stress', 'Relationships', 'Grief', 'Trauma',
  'Self-esteem', 'Life transitions', 'PTSD', 'Burnout', 'OCD', 'Addiction',
  'Family therapy', 'Adolescents', 'LGBTQ+', 'Career', 'Anger management',
  'Eating disorders', 'Sleep issues', 'Chronic illness',
]

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia',
]

const STEPS = ['Personal', 'Credentials', 'Practice']

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30'

const textareaCls =
  'w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none'

function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
        {label}
        {required && <span className="text-[#E8926A] ml-0.5">*</span>}
        {hint && (
          <span className="text-xs font-normal text-[#233551]/40 ml-1.5">{hint}</span>
        )}
      </label>
      {children}
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepPersonal({
  values,
  onChange,
}: {
  values: { fullName: string; email: string; phone: string; city: string }
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-black text-[#233551]"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Tell us about yourself
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          Basic details so we can get in touch.
        </p>
      </div>
      <Field label="Full name" required>
        <input
          type="text"
          value={values.fullName}
          onChange={e => onChange('fullName', e.target.value)}
          placeholder="Dr. Priya Sharma"
          className={inputCls}
        />
      </Field>
      <Field label="Email address" required>
        <input
          type="email"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="priya@example.com"
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone number" hint="optional">
          <input
            type="tel"
            value={values.phone}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={inputCls}
          />
        </Field>
        <Field label="City" hint="optional">
          <input
            type="text"
            value={values.city}
            onChange={e => onChange('city', e.target.value)}
            placeholder="Mumbai"
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  )
}

function StepCredentials({
  values,
  onChange,
}: {
  values: {
    licenseNumber: string
    licenseBody: string
    yearsExperience: string
    education: string
  }
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-black text-[#233551]"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Your credentials
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          We verify every therapist before they join the platform.
        </p>
      </div>
      <Field label="License number" required>
        <input
          type="text"
          value={values.licenseNumber}
          onChange={e => onChange('licenseNumber', e.target.value)}
          placeholder="RCI/2019/XXXXX or state council number"
          className={inputCls}
        />
      </Field>
      <Field label="Licensing body" hint="optional">
        <input
          type="text"
          value={values.licenseBody}
          onChange={e => onChange('licenseBody', e.target.value)}
          placeholder="e.g. RCI, State Medical Council"
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Years of experience" required>
          <input
            type="number"
            min={0}
            max={60}
            value={values.yearsExperience}
            onChange={e => onChange('yearsExperience', e.target.value)}
            placeholder="5"
            className={inputCls}
          />
        </Field>
        <Field label="Highest qualification" hint="optional">
          <input
            type="text"
            value={values.education}
            onChange={e => onChange('education', e.target.value)}
            placeholder="M.Phil Clinical Psychology"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-xl px-4 py-3">
        <p className="text-xs text-[#3D8A80] leading-relaxed">
          <span className="font-semibold">Don&apos;t have your documents handy?</span> That&apos;s fine — fill in what you can.
          We&apos;ll ask for certificates and a CV during our intro call.
        </p>
      </div>
    </div>
  )
}

function StepPractice({
  values,
  onChange,
  toggleSpecialization,
  toggleLanguage,
}: {
  values: {
    specializations: string[]
    languages: string[]
    bio: string
    whyZenspace: string
  }
  onChange: (key: string, value: string) => void
  toggleSpecialization: (s: string) => void
  toggleLanguage: (l: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-black text-[#233551]"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Your practice
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          Help us understand your expertise and approach.
        </p>
      </div>

      <Field label="Areas of specialisation" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {SPECIALIZATIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialization(s)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                values.specializations.includes(s)
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {values.specializations.length === 0 && (
          <p className="text-xs text-[#233551]/40 mt-2">Select at least one area.</p>
        )}
      </Field>

      <Field label="Languages you work in" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLanguage(l)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                values.languages.includes(l)
                  ? 'bg-[#7EC0B7] text-white border-[#7EC0B7]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Brief bio" required hint="2–4 sentences, shown to matched clients">
        <textarea
          value={values.bio}
          onChange={e => onChange('bio', e.target.value)}
          placeholder="Describe your background, approach, and what clients can expect when working with you..."
          rows={4}
          className={textareaCls}
        />
      </Field>

      <Field label="Why do you want to join ZenSpace?" hint="optional">
        <textarea
          value={values.whyZenspace}
          onChange={e => onChange('whyZenspace', e.target.value)}
          placeholder="What draws you to online therapy? What kind of clients do you most want to work with?"
          rows={3}
          className={textareaCls}
        />
      </Field>
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="text-center py-6 space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2
          className="text-2xl font-black text-[#233551]"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Application received.
        </h2>
        <p className="text-sm text-[#233551]/60 leading-relaxed max-w-sm mx-auto">
          We review every application personally. If your profile looks like a good fit,
          we&apos;ll reach out within <span className="font-semibold text-[#233551]">3–5 working days</span> to
          set up a short intro call.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-left space-y-3">
        <p className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest">What happens next</p>
        {[
          { step: '1', text: 'We review your application and credentials' },
          { step: '2', text: 'We schedule a 30-minute intro call' },
          { step: '3', text: 'If it\'s a fit, we share your invite code' },
          { step: '4', text: 'You complete onboarding and go live' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {step}
            </span>
            <p className="text-sm text-[#233551]/70">{text}</p>
          </div>
        ))}
      </div>
      <Link
        href="/"
        className="inline-block text-sm font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors"
      >
        ← Back to ZenSpace
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const initialState: ApplyState = {}

export default function TherapistApplyPage() {
  const [step, setStep] = useState(0)
  const [state, formAction, isPending] = useActionState(submitTherapistApplication, initialState)

  const [personal, setPersonal] = useState({ fullName: '', email: '', phone: '', city: '' })
  const [creds, setCreds] = useState({ licenseNumber: '', licenseBody: '', yearsExperience: '', education: '' })
  const [practice, setPractice] = useState({
    specializations: [] as string[],
    languages: ['English'] as string[],
    bio: '',
    whyZenspace: '',
  })

  const updatePersonal = (key: string, value: string) => setPersonal(prev => ({ ...prev, [key]: value }))
  const updateCreds = (key: string, value: string) => setCreds(prev => ({ ...prev, [key]: value }))
  const updatePractice = (key: string, value: string) => setPractice(prev => ({ ...prev, [key]: value }))

  const toggleSpecialization = (s: string) =>
    setPractice(prev => ({
      ...prev,
      specializations: prev.specializations.includes(s)
        ? prev.specializations.filter(x => x !== s)
        : [...prev.specializations, s],
    }))

  const toggleLanguage = (l: string) =>
    setPractice(prev => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter(x => x !== l)
        : [...prev.languages, l],
    }))

  function canAdvance(): boolean {
    if (step === 0) {
      return personal.fullName.trim().length >= 2 && personal.email.includes('@')
    }
    if (step === 1) {
      return creds.licenseNumber.trim().length > 0 && creds.yearsExperience !== ''
    }
    if (step === 2) {
      return (
        practice.bio.trim().length >= 10 &&
        practice.specializations.length > 0 &&
        practice.languages.length > 0
      )
    }
    return false
  }

  const isLastStep = step === STEPS.length - 1
  const progressPercent = Math.round((step / STEPS.length) * 100)

  if (state.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <SuccessScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="font-black text-lg text-[#233551] flex-shrink-0"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
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
        {/* Step pills */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-bold px-3 py-1 rounded-full transition-all',
                  i === step
                    ? 'bg-[#233551] text-white'
                    : i < step
                    ? 'bg-[#7EC0B7]/20 text-[#3D8A80]'
                    : 'bg-slate-100 text-[#233551]/30',
                )}
              >
                {i < step ? '✓ ' : ''}{label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-[#233551]/20 text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <form action={formAction}>
            {/* Hidden fields — sent on final submit */}
            <input type="hidden" name="fullName" value={personal.fullName} />
            <input type="hidden" name="email" value={personal.email} />
            <input type="hidden" name="phone" value={personal.phone} />
            <input type="hidden" name="city" value={personal.city} />
            <input type="hidden" name="licenseNumber" value={creds.licenseNumber} />
            <input type="hidden" name="licenseBody" value={creds.licenseBody} />
            <input type="hidden" name="yearsExperience" value={creds.yearsExperience} />
            <input type="hidden" name="education" value={creds.education} />
            <input type="hidden" name="specializations" value={JSON.stringify(practice.specializations)} />
            <input type="hidden" name="languages" value={JSON.stringify(practice.languages)} />
            <input type="hidden" name="bio" value={practice.bio} />
            <input type="hidden" name="whyZenspace" value={practice.whyZenspace} />

            {/* Step content */}
            {step === 0 && <StepPersonal values={personal} onChange={updatePersonal} />}
            {step === 1 && <StepCredentials values={creds} onChange={updateCreds} />}
            {step === 2 && (
              <StepPractice
                values={practice}
                onChange={updatePractice}
                toggleSpecialization={toggleSpecialization}
                toggleLanguage={toggleLanguage}
              />
            )}

            {/* Server error */}
            {state?.error && isLastStep && (
              <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {state.error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-8 mt-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-full border-2 border-slate-200 text-sm font-semibold text-[#233551] hover:border-[#233551]/40 transition-colors"
                >
                  Back
                </button>
              )}
              {isLastStep ? (
                <button
                  type="submit"
                  disabled={isPending || !canAdvance()}
                  className="flex-1 py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {isPending ? 'Submitting...' : 'Submit application →'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  className="flex-1 py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  Continue →
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Already have an invite code */}
        <p className="text-center text-xs text-[#233551]/35 mt-5">
          Already have an invite code?{' '}
          <Link href="/therapist/onboard" className="text-[#3D8A80] hover:underline">
            Complete onboarding
          </Link>
        </p>
      </div>
    </div>
  )
}
