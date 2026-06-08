'use client'

import { useState, useRef, useTransition, useActionState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  updateTherapistProfile,
  sendTherapistPasswordReset,
  saveTherapistAvatar,
  deleteTherapistAvatar,
  type TherapistProfileState,
} from '@/app/actions/therapist-profile'
import { signOut } from '@/app/actions/auth'
import { TIMEZONE_OPTIONS } from '@/lib/timezones'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Client groups — three prominent picks shown above the full specialisations list
const CLIENT_GROUPS = ['Teen', 'Adult', 'Couples']

const SPECIALIZATIONS = [
  // Modalities / approaches
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
  // Presenting issues
  'Anxiety',
  'Depression',
  'Stress & burnout',
  'Trauma / PTSD',
  'Grief & loss',
  'Relationships',
  'Family conflicts',
  'Self-esteem & identity',
  'Life transitions',
  'OCD',
  'Addiction / substance use',
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
  'English',
  'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi',
  'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Portuguese',
  'Italian',
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
    avatarUrl: string | null
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
    tagline: string
    education: string
    licenseCountry: string
    sessionExpectations: string
    pronouns: string
    previousExperience: string
    linkedinUrl: string
    timezone: string
  }
}

const initialState: TherapistProfileState = {}

export function TherapistAccountForm({ initialData }: Props) {
  const [state, formAction, isPending] = useActionState(updateTherapistProfile, initialState)

  const [fullName, setFullName] = useState(initialData.fullName)
  const [bio, setBio] = useState(initialData.bio)
  const [approach, setApproach] = useState(initialData.approach)
  const [tagline, setTagline] = useState(initialData.tagline)
  const [education, setEducation] = useState(initialData.education)
  const [licenseCountry, setLicenseCountry] = useState(initialData.licenseCountry)
  const [sessionExpectations, setSessionExpectations] = useState(initialData.sessionExpectations)
  const [pronouns, setPronouns] = useState(initialData.pronouns)
  const [previousExperience, setPreviousExperience] = useState(initialData.previousExperience)
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl)
  const [timezone, setTimezone] = useState(initialData.timezone)
  const [yearsExp, setYearsExp] = useState(String(initialData.yearsExperience))
  const [capacity, setCapacity] = useState(String(initialData.weeklyCapacity))
  // Strip any "free text" values not in the predefined list back into the Other field
  // Client groups + presenting issues / modalities are all stored as
  // specializations strings, so we accept both as known values when matching
  // against the saved profile.
  const knownSpecs = new Set([...CLIENT_GROUPS, ...SPECIALIZATIONS])
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

  // ── Avatar state ──────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarPending, startAvatarTransition] = useTransition()

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)

    if (file.size > MAX_PHOTO_BYTES) {
      setAvatarError('Photo must be under 5 MB.')
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      return
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setAvatarError('Photo must be JPG, PNG, or WebP.')
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      return
    }

    startAvatarTransition(async () => {
      // Upload straight to Supabase Storage from the browser so the file never
      // passes through the Server Action (which caps request bodies at 1 MB).
      // We write under our own folder (therapists/<uid>/...) and then hand the
      // resulting path to the server action, which records its public URL.
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAvatarError('Your session expired. Please sign in again.')
        return
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `therapists/${user.id}/avatar-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (uploadErr) {
        setAvatarError(`Upload failed: ${uploadErr.message}`)
        if (avatarInputRef.current) avatarInputRef.current.value = ''
        return
      }

      const result = await saveTherapistAvatar(path)
      if (result.error) {
        setAvatarError(result.error)
      } else {
        setAvatarUrl(result.avatarUrl ?? null)
      }
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    })
  }

  function handleAvatarDelete() {
    setAvatarError(null)
    startAvatarTransition(async () => {
      const result = await deleteTherapistAvatar()
      if (result.error) {
        setAvatarError(result.error)
      } else {
        setAvatarUrl(null)
      }
    })
  }

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
        <div>
          <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest mb-3">Profile photo</p>
          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-[#3D8A80] text-2xl font-black"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {fullName[0]?.toUpperCase() ?? 'T'}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={avatarPending}
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-[#233551] text-white text-xs font-bold hover:bg-[#2d4568] transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {avatarPending ? 'Working…' : avatarUrl ? 'Replace photo' : 'Upload photo'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    disabled={avatarPending}
                    onClick={handleAvatarDelete}
                    className="px-4 py-2 rounded-full border-2 border-slate-200 text-[#E8926A] text-xs font-bold hover:border-[#E8926A]/40 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#233551]/40">JPG, PNG, or WebP — max 5 MB</p>
              {avatarError && <p className="text-xs text-[#E8926A]">{avatarError}</p>}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
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

        <Field label="Tagline" hint="One line shown on your client card">
          <input
            name="tagline"
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Helping you find calm in the chaos"
            maxLength={120}
            className={inputCls}
          />
        </Field>

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

        <Field label="What clients can expect" hint="How your sessions work">
          <textarea
            name="sessionExpectations"
            rows={3}
            value={sessionExpectations}
            onChange={e => setSessionExpectations(e.target.value)}
            placeholder="What a typical session with you looks like..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
          />
        </Field>

        <Field label="Your timezone" required hint="Your availability times are set and shown to clients based on this">
          <select
            name="timezone"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className={inputCls}
          >
            {!timezone && <option value="" disabled>Select your timezone…</option>}
            {TIMEZONE_OPTIONS.map(tz => (
              <option key={tz.label} value={tz.value} disabled={tz.value === ''}>
                {tz.label}
              </option>
            ))}
          </select>
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

      {/* Section: Background & Credentials */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Background &amp; Credentials</p>

        <Field label="Education" hint="Degrees, institutions">
          <input
            name="education"
            type="text"
            value={education}
            onChange={e => setEducation(e.target.value)}
            placeholder="e.g. MSc Clinical Psychology, University of Delhi"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Country of license" hint="Where you're licensed to practise">
            <input
              name="licenseCountry"
              type="text"
              value={licenseCountry}
              onChange={e => setLicenseCountry(e.target.value)}
              placeholder="e.g. United Kingdom"
              className={inputCls}
            />
          </Field>
          <Field label="Pronouns">
            <input
              name="pronouns"
              type="text"
              value={pronouns}
              onChange={e => setPronouns(e.target.value)}
              placeholder="e.g. she/her"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Previous experience" hint="Prior roles, settings, populations">
          <textarea
            name="previousExperience"
            rows={3}
            value={previousExperience}
            onChange={e => setPreviousExperience(e.target.value)}
            placeholder="Where you've worked and who you've worked with..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
          />
        </Field>

        <Field label="LinkedIn URL">
          <input
            name="linkedinUrl"
            type="url"
            value={linkedinUrl}
            onChange={e => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-handle"
            className={inputCls}
          />
        </Field>
      </section>

      {/* Section: Specialisations */}
      <section className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Areas of Specialisation</p>

        {/* Client groups — three prominent picks in a row */}
        <div className="grid grid-cols-3 gap-2">
          {CLIENT_GROUPS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpec(s)}
              className={cn(
                'text-sm px-4 py-2.5 rounded-xl border-2 font-bold transition-all',
                specializations.includes(s)
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Rest of the specialisations */}
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
