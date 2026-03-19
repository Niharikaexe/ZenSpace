'use client'

import { useState, useActionState } from 'react'
import { submitTherapistOnboarding, type OnboardState } from './actions'
import { Button } from '@/components/ui/button'

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

const STEPS = ['Invite Code', 'Your Account', 'Credentials', 'Your Profile']

// ─── Step components ──────────────────────────────────────────────────────────

function StepInviteCode({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Enter your invite code</h2>
        <p className="text-sm text-slate-500 mt-1">Your invite code was shared by the ZenSpace admin.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Invite Code</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          placeholder="e.g. ZENSPACE2024"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
          autoFocus
        />
      </div>
    </div>
  )
}

function StepAccount({
  values, onChange,
}: {
  values: { fullName: string; email: string; password: string; confirmPassword: string }
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">This is how you'll sign in to ZenSpace.</p>
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
      <Field label="Password" required hint="Minimum 8 characters">
        <input
          type="password"
          value={values.password}
          onChange={e => onChange('password', e.target.value)}
          placeholder="••••••••"
          className={inputCls}
        />
      </Field>
      <Field label="Confirm password" required>
        <input
          type="password"
          value={values.confirmPassword}
          onChange={e => onChange('confirmPassword', e.target.value)}
          placeholder="••••••••"
          className={`${inputCls} ${values.confirmPassword && values.confirmPassword !== values.password ? 'border-red-300 focus:ring-red-400' : ''}`}
        />
        {values.confirmPassword && values.confirmPassword !== values.password && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
        )}
      </Field>
    </div>
  )
}

function StepCredentials({
  values, onChange,
}: {
  values: { licenseNumber: string; licenseState: string; yearsExperience: string; education: string }
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Your credentials</h2>
        <p className="text-sm text-slate-500 mt-1">These will be reviewed and verified by the admin.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="License number" required className="col-span-2 sm:col-span-1">
          <input
            type="text"
            value={values.licenseNumber}
            onChange={e => onChange('licenseNumber', e.target.value)}
            placeholder="RCI/2019/XXXXX"
            className={inputCls}
          />
        </Field>
        <Field label="State of license" className="col-span-2 sm:col-span-1">
          <input
            type="text"
            value={values.licenseState}
            onChange={e => onChange('licenseState', e.target.value)}
            placeholder="e.g. Maharashtra"
            className={inputCls}
          />
        </Field>
      </div>
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
      <Field label="Education / Degree">
        <input
          type="text"
          value={values.education}
          onChange={e => onChange('education', e.target.value)}
          placeholder="M.Phil Clinical Psychology, NIMHANS"
          className={inputCls}
        />
      </Field>
    </div>
  )
}

function StepProfile({
  values, onChange, toggleSpecialization, toggleLanguage,
}: {
  values: {
    bio: string; approach: string; weeklyCapacity: string
    specializations: string[]; languages: string[]
  }
  onChange: (key: string, value: string) => void
  toggleSpecialization: (s: string) => void
  toggleLanguage: (l: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
        <p className="text-sm text-slate-500 mt-1">Help clients understand your approach and expertise.</p>
      </div>

      <Field label="About you (bio)" required hint="Shown to matched clients">
        <textarea
          value={values.bio}
          onChange={e => onChange('bio', e.target.value)}
          placeholder="Tell clients about your background, approach, and what to expect from working with you..."
          rows={4}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </Field>

      <Field label="Therapeutic approach">
        <input
          type="text"
          value={values.approach}
          onChange={e => onChange('approach', e.target.value)}
          placeholder="e.g. CBT, DBT, Person-centred, Mindfulness-based"
          className={inputCls}
        />
      </Field>

      <Field label="Areas of specialisation" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {SPECIALIZATIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialization(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                values.specializations.includes(s)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {values.specializations.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">Select at least one area.</p>
        )}
      </Field>

      <Field label="Languages you work in" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLanguage(l)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                values.languages.includes(l)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Weekly client capacity" hint="Max number of active clients you can handle">
        <input
          type="number"
          min={1}
          max={50}
          value={values.weeklyCapacity}
          onChange={e => onChange('weeklyCapacity', e.target.value)}
          className={`${inputCls} w-28`}
        />
      </Field>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

function Field({
  label, required, hint, children, className = '',
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="text-xs text-slate-400 font-normal ml-1.5">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const initialState: OnboardState = {}

export default function TherapistOnboardPage() {
  const [step, setStep] = useState(0)
  const [state, formAction, isPending] = useActionState(submitTherapistOnboarding, initialState)

  // Form field state
  const [inviteCode, setInviteCode] = useState('')
  const [account, setAccount] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [creds, setCreds] = useState({ licenseNumber: '', licenseState: '', yearsExperience: '', education: '' })
  const [profile, setProfile] = useState({
    bio: '', approach: '', weeklyCapacity: '10',
    specializations: [] as string[],
    languages: ['English'] as string[],
  })

  const updateAccount = (key: string, value: string) => setAccount(prev => ({ ...prev, [key]: value }))
  const updateCreds = (key: string, value: string) => setCreds(prev => ({ ...prev, [key]: value }))
  const updateProfile = (key: string, value: string) => setProfile(prev => ({ ...prev, [key]: value }))

  const toggleSpecialization = (s: string) =>
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.includes(s)
        ? prev.specializations.filter(x => x !== s)
        : [...prev.specializations, s],
    }))

  const toggleLanguage = (l: string) =>
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter(x => x !== l)
        : [...prev.languages, l],
    }))

  // Per-step validation before advancing
  function canAdvance(): boolean {
    if (step === 0) return inviteCode.trim().length > 0
    if (step === 1) {
      return (
        account.fullName.trim().length >= 2 &&
        account.email.includes('@') &&
        account.password.length >= 8 &&
        account.password === account.confirmPassword
      )
    }
    if (step === 2) return creds.licenseNumber.trim().length > 0 && creds.yearsExperience !== ''
    if (step === 3) return profile.bio.trim().length >= 10 && profile.specializations.length > 0 && profile.languages.length > 0
    return false
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-white font-bold text-base">Z</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">ZenSpace</h1>
          <p className="text-sm text-slate-500">Therapist Onboarding</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

          {/* Progress bar */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              {STEPS.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-emerald-500' : 'bg-slate-100'
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</span>
              <span className="text-xs font-medium text-emerald-600">{STEPS[step]}</span>
            </div>
          </div>

          <form action={formAction}>
            {/* Hidden fields — all form data sent on final submit */}
            <input type="hidden" name="inviteCode" value={inviteCode} />
            <input type="hidden" name="fullName" value={account.fullName} />
            <input type="hidden" name="email" value={account.email} />
            <input type="hidden" name="password" value={account.password} />
            <input type="hidden" name="licenseNumber" value={creds.licenseNumber} />
            <input type="hidden" name="licenseState" value={creds.licenseState} />
            <input type="hidden" name="yearsExperience" value={creds.yearsExperience} />
            <input type="hidden" name="education" value={creds.education} />
            <input type="hidden" name="bio" value={profile.bio} />
            <input type="hidden" name="approach" value={profile.approach} />
            <input type="hidden" name="specializations" value={JSON.stringify(profile.specializations)} />
            <input type="hidden" name="languages" value={JSON.stringify(profile.languages)} />
            <input type="hidden" name="weeklyCapacity" value={profile.weeklyCapacity} />

            {/* Step content */}
            <div className="px-6 py-6">
              {step === 0 && <StepInviteCode value={inviteCode} onChange={setInviteCode} />}
              {step === 1 && <StepAccount values={account} onChange={updateAccount} />}
              {step === 2 && <StepCredentials values={creds} onChange={updateCreds} />}
              {step === 3 && (
                <StepProfile
                  values={profile}
                  onChange={updateProfile}
                  toggleSpecialization={toggleSpecialization}
                  toggleLanguage={toggleLanguage}
                />
              )}

              {/* Server error */}
              {state?.error && isLastStep && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {state.error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:invisible"
              >
                ← Back
              </button>

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isPending || !canAdvance()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                >
                  {isPending ? 'Creating account...' : 'Complete Setup'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                >
                  Continue →
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
