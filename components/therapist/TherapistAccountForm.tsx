'use client'

import { useState, useActionState } from 'react'
import { cn } from '@/lib/utils'
import {
  updateTherapistProfile,
  sendTherapistPasswordReset,
  type TherapistProfileState,
} from '@/app/actions/therapist-profile'
import { signOut } from '@/app/actions/auth'

const SPECIALIZATIONS = [
  'CBT (Cognitive Behavioral Therapy)',
  'DBT (Dialectical Behavior Therapy)',
  'ACT (Acceptance & Commitment Therapy)',
  'EMDR',
  'Psychodynamic therapy',
  'Person-centered / Humanistic',
  'Mindfulness-based / MBCT',
  'Solution-focused brief therapy',
  'Schema therapy',
  'Internal Family Systems (IFS)',
  'Narrative therapy',
  'Gottman method (couples)',
  'Emotionally Focused Therapy (EFT)',
  'Trauma-focused CBT',
  'Anxiety',
  'Depression',
  'Stress & burnout',
  'Trauma / PTSD',
  'Grief & loss',
  'Relationships',
  'Couples therapy',
  'Family conflicts',
  'Self-esteem & identity',
  'Life transitions',
  'OCD',
  'Addiction / substance use',
  'Adolescents & teens',
  'LGBTQ+ identity',
  'Anger management',
  'Eating disorders',
  'Sleep issues',
  'Postpartum / Perinatal',
  'ADHD / Neurodivergence',
  'Bipolar disorder',
  'Chronic illness',
  'Career counselling',
]

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia',
]

const inputCls =
  'w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30'

function Field({
  label, hint, required, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
        {label}
        {required && <span className="text-[#E8926A] ml-0.5">*</span>}
        {hint && <span className="text-xs font-normal text-[#233551]/40 ml-1.5">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

interface Props {
  initialData: {
    fullName: string
    bio: string
    approach: string
    yearsExperience: number
    weeklyCapacity: number
    specializations: string[]
    languages: string[]
    acceptsNewClients: boolean
    email: string
    isVerified: boolean
    paypalEmail: string
    bankAccountName: string
    bankAccountNumber: string
    bankIfsc: string
  }
}

const initialState: TherapistProfileState = {}

export function TherapistAccountForm({ initialData }: Props) {
  const [state, formAction, isPending] = useActionState(updateTherapistProfile, initialState)

  const [fullName, setFullName] = useState(initialData.fullName)
  const [bio, setBio] = useState(initialData.bio)
  const [approach, setApproach] = useState(initialData.approach)
  const [yearsExp, setYearsExp] = useState(String(initialData.yearsExperience))
  const [capacity, setCapacity] = useState(String(initialData.weeklyCapacity))
  // Strip any "free text" values not in the predefined list back into the Other field
  const knownSpecs = new Set(SPECIALIZATIONS)
  const knownLangs = new Set(LANGUAGES)
  const [specializations, setSpecializations] = useState<string[]>(
    initialData.specializations.filter(s => knownSpecs.has(s))
  )
  const [specializationOther, setSpecializationOther] = useState(
    initialData.specializations.filter(s => !knownSpecs.has(s)).join(', ')
  )
  const [languages, setLanguages] = useState<string[]>(
    initialData.languages.filter(l => knownLangs.has(l))
  )
  const [languageOther, setLanguageOther] = useState(
    initialData.languages.filter(l => !knownLangs.has(l)).join(', ')
  )
  const [acceptsNew, setAcceptsNew] = useState(initialData.acceptsNewClients)

  // Payment info — two tabs (PayPal + Bank)
  const [payTab, setPayTab] = useState<'paypal' | 'bank'>(
    initialData.bankAccountNumber && !initialData.paypalEmail ? 'bank' : 'paypal'
  )
  const [paypalEmail, setPaypalEmail] = useState(initialData.paypalEmail)
  const [bankAccountName, setBankAccountName] = useState(initialData.bankAccountName)
  const [bankAccountNumber, setBankAccountNumber] = useState(initialData.bankAccountNumber)
  const [bankIfsc, setBankIfsc] = useState(initialData.bankIfsc)

  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  const toggleSpec = (s: string) =>
    setSpecializations(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )

  const toggleLang = (l: string) =>
    setLanguages(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    )

  async function handlePasswordReset() {
    setResetLoading(true)
    setResetError(null)
    const result = await sendTherapistPasswordReset()
    setResetLoading(false)
    if (result.error) setResetError(result.error)
    else setResetSent(true)
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden computed fields */}
      <input type="hidden" name="specializations" value={JSON.stringify(specializations)} />
      <input type="hidden" name="specializationOther" value={specializationOther} />
      <input type="hidden" name="languages" value={JSON.stringify(languages)} />
      <input type="hidden" name="languageOther" value={languageOther} />
      <input type="hidden" name="acceptsNewClients" value={String(acceptsNew)} />

      {/* Section: Identity */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-12 h-12 rounded-2xl bg-[#7EC0B7]/15 text-[#3D8A80] text-lg font-black flex items-center justify-center"
            style={{ fontFamily: 'var(--font-lato)' }}>
            {fullName[0]?.toUpperCase() ?? 'T'}
          </div>
          <div>
            <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Profile photo</p>
            <p className="text-xs text-[#233551]/40 mt-0.5">Photo upload coming soon</p>
          </div>
        </div>

        <Field label="Full name" required>
          <input
            name="fullName"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Email address" hint="Contact support to change">
          <div className={cn(inputCls, 'bg-slate-50 text-[#233551]/50 cursor-not-allowed')}>
            {initialData.email}
          </div>
        </Field>

        {initialData.isVerified && (
          <div className="flex items-center gap-2 text-xs text-[#3D8A80]">
            <div className="w-4 h-4 rounded-full bg-[#7EC0B7] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Verified therapist
          </div>
        )}
      </section>

      {/* Section: Professional */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Professional Details</p>

        <Field label="Bio" required hint="Shown to matched clients">
          <textarea
            name="bio"
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Describe your background, approach, and what clients can expect..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Years of experience" required>
            <input
              name="yearsExperience"
              type="number"
              min={0}
              max={60}
              value={yearsExp}
              onChange={e => setYearsExp(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Weekly client capacity" hint="max active clients">
            <input
              name="weeklyCapacity"
              type="number"
              min={1}
              max={50}
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Accepting new clients">
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => setAcceptsNew(true)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                acceptsNew
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551]/55 border-slate-200 hover:border-[#7EC0B7]',
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setAcceptsNew(false)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                !acceptsNew
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551]/55 border-slate-200 hover:border-[#7EC0B7]',
              )}
            >
              No
            </button>
          </div>
        </Field>
      </section>

      {/* Section: Specialisations */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Areas of Specialisation</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpec(s)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                specializations.includes(s)
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551]/60 border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={specializationOther}
          onChange={e => setSpecializationOther(e.target.value)}
          placeholder="Other (please specify)"
          className={inputCls}
        />
        {specializations.length === 0 && !specializationOther.trim() && (
          <p className="text-xs text-[#E8926A]">Select at least one area or specify in &ldquo;Other&rdquo;.</p>
        )}
      </section>

      {/* Section: Languages */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Languages</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLang(l)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                languages.includes(l)
                  ? 'bg-[#7EC0B7] text-white border-[#7EC0B7]'
                  : 'bg-white text-[#233551]/60 border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={languageOther}
          onChange={e => setLanguageOther(e.target.value)}
          placeholder="Other language (please specify)"
          className={inputCls}
        />
      </section>

      {/* Section: Payment info */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Payment Info</p>
            <p className="text-xs text-[#233551]/45 mt-1">
              Where MindCanopy should send your payouts. Only admins can see this.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setPayTab('paypal')}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors',
              payTab === 'paypal'
                ? 'border-[#7EC0B7] text-[#233551]'
                : 'border-transparent text-[#233551]/45 hover:text-[#233551]',
            )}
          >
            PayPal
          </button>
          <button
            type="button"
            onClick={() => setPayTab('bank')}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors',
              payTab === 'bank'
                ? 'border-[#7EC0B7] text-[#233551]'
                : 'border-transparent text-[#233551]/45 hover:text-[#233551]',
            )}
          >
            Bank Account
          </button>
        </div>

        {payTab === 'paypal' ? (
          <Field label="PayPal email" hint="For international payouts">
            <input
              name="paypalEmail"
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="you@paypal.com"
              className={inputCls}
            />
          </Field>
        ) : (
          <div className="space-y-4">
            <Field label="Account holder name">
              <input
                name="bankAccountName"
                type="text"
                value={bankAccountName}
                onChange={e => setBankAccountName(e.target.value)}
                placeholder="Name as on bank record"
                className={inputCls}
              />
            </Field>
            <Field label="Account number">
              <input
                name="bankAccountNumber"
                type="text"
                inputMode="numeric"
                value={bankAccountNumber}
                onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234567890"
                className={inputCls}
              />
            </Field>
            <Field label="IFSC code">
              <input
                name="bankIfsc"
                type="text"
                value={bankIfsc}
                onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
                maxLength={11}
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Always include the inactive tab's fields as hidden inputs so they persist on save */}
        {payTab === 'bank' && (
          <input type="hidden" name="paypalEmail" value={paypalEmail} />
        )}
        {payTab === 'paypal' && (
          <>
            <input type="hidden" name="bankAccountName" value={bankAccountName} />
            <input type="hidden" name="bankAccountNumber" value={bankAccountNumber} />
            <input type="hidden" name="bankIfsc" value={bankIfsc} />
          </>
        )}
      </section>

      {/* Section: Security */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Security</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#233551]">Password</p>
            <p className="text-xs text-[#233551]/40 mt-0.5">Receive a reset link at {initialData.email}</p>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetLoading || resetSent}
            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border-2 border-slate-200 text-[#233551] hover:border-[#7EC0B7] transition-colors disabled:opacity-50"
          >
            {resetLoading ? 'Sending...' : resetSent ? '✓ Email sent' : 'Send reset email'}
          </button>
        </div>
        {resetError && <p className="text-xs text-red-500">{resetError}</p>}
      </section>

      {/* Save / sign out */}
      {state?.error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="px-4 py-3 bg-[#7EC0B7]/15 border border-[#7EC0B7]/30 rounded-xl text-sm text-[#3D8A80] font-medium">
          Profile saved successfully.
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          formAction={signOut}
          className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          Sign out
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 rounded-full bg-[#233551] text-white text-sm font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {isPending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
