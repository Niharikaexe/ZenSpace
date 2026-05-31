'use client'

import { useState, useRef, useEffect, useActionState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { submitTherapistOnboarding, lookupInvite, type OnboardState } from './actions'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const STEPS = ['Invite Code', 'Your Account', 'Credentials', 'Verification', 'Photo', 'Your Profile']
const ACCEPT_DOC = '.pdf,.png,.jpg,.jpeg'

// Country list — India at top, then alphabetical (UN member states + key territories)
const COUNTRIES = [
  'India',
  '──────────',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
]

// Common timezone abbreviations — IST pinned at top, then ordered roughly west-to-east.
const TIMEZONES = [
  'IST (India)',
  '──────────',
  'HST (Hawaii)',
  'AKST (Alaska)',
  'PST (US Pacific)',
  'MST (US Mountain)',
  'CST (US Central)',
  'EST (US Eastern)',
  'AST (Atlantic)',
  'BRT (Brazil)',
  'UTC',
  'GMT (UK / Ireland)',
  'WET (Western Europe)',
  'CET (Central Europe)',
  'EET (Eastern Europe)',
  'MSK (Moscow)',
  'GST (Gulf / UAE)',
  'PKT (Pakistan)',
  'BST (Bangladesh)',
  'ICT (Indochina / Thailand)',
  'WIB (Western Indonesia)',
  'CST (China)',
  'HKT (Hong Kong)',
  'SGT (Singapore)',
  'JST (Japan / Korea)',
  'AWST (Western Australia)',
  'ACST (Central Australia)',
  'AEST (Eastern Australia)',
  'NZST (New Zealand)',
]

const PRONOUNS_OPTIONS = ['she/her', 'he/him', 'they/them', 'ze/zir', 'xe/xem', 'Other', 'Prefer not to say']

// ─── Shared input + Field helpers ─────────────────────────────────────────────

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30'

const textareaCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none'

function Field({
  label, required, hint, children, className = '',
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
        {label}
        {required && <span className="text-[#E8926A] ml-0.5">*</span>}
        {hint && <span className="text-xs font-normal text-[#233551]/40 ml-1.5">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

type InviteStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'valid'; fullName: string; email: string }
  | { state: 'invalid'; message: string }

function StepInviteCode({
  value, onChange, status,
}: {
  value: string
  onChange: (v: string) => void
  status: InviteStatus
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#7EC0B7]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Enter your invite code
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          Your invite code was shared by the MindCanopy admin.
        </p>
      </div>
      <Field label="Invite Code" required>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          placeholder="MINDCANOPY2026"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base tracking-widest font-mono text-center text-[#233551] focus:outline-none focus:border-[#7EC0B7] uppercase"
          autoFocus
        />
        {status.state === 'checking' && (
          <p className="text-xs text-[#233551]/50 mt-2">Checking your code…</p>
        )}
        {status.state === 'valid' && status.fullName && (
          <p className="text-xs text-[#3D8A80] mt-2">
            Welcome, {status.fullName.split(' ')[0]}. We&apos;ve prefilled your details on the next step.
          </p>
        )}
        {status.state === 'valid' && !status.fullName && (
          <p className="text-xs text-[#3D8A80] mt-2">Code accepted. Continue to set up your account.</p>
        )}
        {status.state === 'invalid' && (
          <p className="text-xs text-[#E8926A] mt-2">{status.message}</p>
        )}
      </Field>
    </div>
  )
}

function StepAccount({
  values, onChange,
}: {
  values: { fullName: string; email: string; password: string; confirmPassword: string }
  onChange: (key: string, value: string) => void
}) {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Create your account
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          This is how you&apos;ll sign in to MindCanopy.
        </p>
      </div>
      <Field label="Full name" required>
        <input
          type="text"
          value={values.fullName}
          onChange={e => onChange('fullName', e.target.value)}
          placeholder="xxxx"
          className={inputCls}
        />
      </Field>
      <Field label="Email address" required>
        <input
          type="email"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="abc@example.com"
          className={inputCls}
        />
      </Field>
      <Field label="Password" required hint="Minimum 8 characters">
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={values.password}
            onChange={e => onChange('password', e.target.value)}
            placeholder="••••••••"
            className={cn(inputCls, 'pr-11')}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#233551]/35 hover:text-[#233551]/70 transition-colors"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      <Field label="Confirm password" required>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={values.confirmPassword}
            onChange={e => onChange('confirmPassword', e.target.value)}
            placeholder="••••••••"
            className={cn(inputCls, 'pr-11', values.confirmPassword && values.confirmPassword !== values.password && 'border-[#E8926A]')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#233551]/35 hover:text-[#233551]/70 transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {values.confirmPassword && values.confirmPassword !== values.password && (
          <p className="text-xs text-[#E8926A] mt-1">Passwords do not match.</p>
        )}
      </Field>
    </div>
  )
}

type CredsValues = {
  licenseState: string
  licenseCountry: string
  pronouns: string
  previousExperience: string
  timezone: string
}

function StepCredentials({
  values, onChange,
}: {
  values: CredsValues
  onChange: (key: keyof CredsValues, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Your credentials
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          A few last things for your public profile.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="State of license issue">
          <input
            type="text"
            value={values.licenseState}
            onChange={e => onChange('licenseState', e.target.value)}
            placeholder="xxxx"
            className={inputCls}
          />
        </Field>
        <Field label="Country of issue" required>
          <select
            value={values.licenseCountry}
            onChange={e => onChange('licenseCountry', e.target.value)}
            className={cn(inputCls, 'appearance-none bg-white pr-10 cursor-pointer', !values.licenseCountry && 'text-[#233551]/40')}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23233551' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '12px 8px',
            }}
          >
            <option value="" disabled>Select country</option>
            {COUNTRIES.map(c => (
              c.startsWith('──') ? (
                <option key={c} value="" disabled>{c}</option>
              ) : (
                <option key={c} value={c}>{c}</option>
              )
            ))}
          </select>
        </Field>
      </div>
      <Field label="Time zone" required hint="used to coordinate your client sessions">
        <select
          value={values.timezone}
          onChange={e => onChange('timezone', e.target.value)}
          className={cn(inputCls, 'appearance-none bg-white pr-10 cursor-pointer', !values.timezone && 'text-[#233551]/40')}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23233551' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '12px 8px',
          }}
        >
          <option value="" disabled>Select your time zone</option>
          {TIMEZONES.map(tz => (
            tz.startsWith('──') ? (
              <option key={tz} value="" disabled>{tz}</option>
            ) : (
              <option key={tz} value={tz}>{tz}</option>
            )
          ))}
        </select>
      </Field>
      <Field label="Pronouns" hint="shown on your profile">
        <div className="flex flex-wrap gap-2 mt-1">
          {PRONOUNS_OPTIONS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChange('pronouns', p)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                values.pronouns === p
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <Field
        label="Previous experience with clients"
        hint="Briefly describe your expertise with clients. This will help us match you with the right clients"
      >
        <textarea
          value={values.previousExperience}
          onChange={e => onChange('previousExperience', e.target.value)}
          placeholder="e.g. 5 years working with adolescents struggling with anxiety, 2 years of couples counselling in private practice..."
          rows={4}
          className={textareaCls}
        />
      </Field>
    </div>
  )
}

type VerificationValues = {
  idDocumentUrl: string
  idDocumentFilename: string
  paypalEmail: string
  bankAccountName: string
  bankAccountNumber: string
  bankIfsc: string
}

function StepVerification({
  values,
  onChange,
  onIdUploaded,
  onIdRemoved,
}: {
  values: VerificationValues
  onChange: (key: Exclude<keyof VerificationValues, 'idDocumentUrl' | 'idDocumentFilename'>, value: string) => void
  onIdUploaded: (url: string, filename: string) => void
  onIdRemoved: () => void
}) {
  const idInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleIdSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'bin'
    const path = `id-documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage
      .from('therapist-documents')
      .upload(path, file, { contentType: file.type, upsert: false })
    setUploading(false)
    if (error) {
      setUploadError(error.message)
    } else {
      onIdUploaded(path, file.name)
    }
    if (idInputRef.current) idInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Verification &amp; payment
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          Used for identity verification and to send your payouts. These details are not shown publicly.
        </p>
      </div>

      {/* Proof of ID */}
      <Field label="Proof of identification" required hint="Aadhaar, Passport, or Driving Licence — PDF or image">
        {values.idDocumentFilename ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-[#233551] truncate">{values.idDocumentFilename}</span>
            </div>
            <button type="button" onClick={onIdRemoved} className="text-xs font-semibold text-[#E8926A] hover:text-[#233551] transition-colors flex-shrink-0 ml-3">
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => idInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-[#3D8A80] hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5 transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : '+ Upload ID document'}
          </button>
        )}
        <input
          ref={idInputRef}
          type="file"
          accept={ACCEPT_DOC}
          onChange={handleIdSelect}
          className="hidden"
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-2">{uploadError}</p>
        )}
      </Field>

      {/* Payment info */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest mb-3">Payment information</p>
        <p className="text-xs text-[#233551]/50 mb-3">
          We pay therapists weekly. Provide either bank details or PayPal (for international therapists). This can be changed in your account page as well.
        </p>
        <div className="space-y-4">
          <Field label="Bank account holder name">
            <input
              type="text"
              value={values.bankAccountName}
              onChange={e => onChange('bankAccountName', e.target.value)}
              placeholder="xxxx"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account number">
              <input
                type="text"
                value={values.bankAccountNumber}
                onChange={e => onChange('bankAccountNumber', e.target.value)}
                placeholder="xxxxxxxxxxxx"
                className={inputCls}
              />
            </Field>
            <Field label="IFSC code">
              <input
                type="text"
                value={values.bankIfsc}
                onChange={e => onChange('bankIfsc', e.target.value.toUpperCase())}
                placeholder="xxxx"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="PayPal email" hint="for international therapists">
            <input
              type="email"
              value={values.paypalEmail}
              onChange={e => onChange('paypalEmail', e.target.value)}
              placeholder="abc@example.com"
              className={inputCls}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

function StepPhoto({
  previewUrl, fileName, error, onClickUpload, onClear,
}: {
  previewUrl: string | null
  fileName: string | null
  error: string | null
  onClickUpload: () => void
  onClear: () => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Profile photo
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          Clients see this before they choose to work with you. JPG, PNG, or WebP — max 5 MB.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        <button
          type="button"
          onClick={onClickUpload}
          className="px-6 py-2.5 rounded-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold transition-colors"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {previewUrl ? 'Replace photo' : 'Upload photo'}
        </button>

        {fileName && (
          <div className="flex items-center gap-2 text-xs text-[#233551]/50">
            <span className="truncate max-w-[200px]">{fileName}</span>
            <button
              type="button"
              onClick={onClear}
              className="text-[#E8926A] hover:text-[#233551] font-semibold"
            >
              Remove
            </button>
          </div>
        )}

        {error && <p className="text-xs text-[#E8926A]">{error}</p>}
      </div>
    </div>
  )
}

type ProfileValues = {
  bio: string
  tagline: string
  sessionExpectations: string
  weeklyCapacity: string
}

function StepProfile({
  values, onChange,
}: {
  values: ProfileValues
  onChange: (key: keyof ProfileValues, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          Your profile
        </h2>
        <p className="text-sm text-[#233551]/50 mt-1">
          A short intro shown to clients before they match with you.
        </p>
      </div>

      <Field label="One-line philosophy" hint="optional — shown on your profile card">
        <input
          type="text"
          value={values.tagline}
          onChange={e => onChange('tagline', e.target.value)}
          placeholder="e.g. I help high-functioning adults find what's underneath the busy."
          maxLength={140}
          className={inputCls}
        />
        <p className="text-xs text-[#233551]/40 mt-1">{values.tagline.length}/140</p>
      </Field>

      <Field label="About you (bio)" required hint="2–4 sentences shown to matched clients">
        <textarea
          value={values.bio}
          onChange={e => onChange('bio', e.target.value)}
          placeholder="Tell clients about your background, approach, and what to expect from working with you..."
          rows={5}
          className={textareaCls}
        />
      </Field>

      <Field label="What clients can expect from your sessions" hint="optional — sets expectations for the first session">
        <textarea
          value={values.sessionExpectations}
          onChange={e => onChange('sessionExpectations', e.target.value)}
          placeholder="e.g. I begin every session with a brief check-in, then we focus on what's most pressing for you that week..."
          rows={4}
          className={textareaCls}
        />
      </Field>

      <Field label="Weekly client capacity" hint="max number of active clients you can handle">
        <input
          type="number"
          min={1}
          max={50}
          value={values.weeklyCapacity}
          onChange={e => onChange('weeklyCapacity', e.target.value)}
          className={cn(inputCls, 'w-28')}
        />
      </Field>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const initialState: OnboardState = {}

export default function TherapistOnboardPage() {
  const [step, setStep] = useState(0)
  const [state, formAction, isPending] = useActionState(submitTherapistOnboarding, initialState)

  // Form state
  const [inviteCode, setInviteCode] = useState('')
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>({ state: 'idle' })
  const [account, setAccount] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [creds, setCreds] = useState<CredsValues>({
    licenseState: '', licenseCountry: '', pronouns: '', previousExperience: '', timezone: '',
  })
  const [verification, setVerification] = useState<VerificationValues>({
    idDocumentUrl: '', idDocumentFilename: '',
    paypalEmail: '', bankAccountName: '', bankAccountNumber: '', bankIfsc: '',
  })
  const [profile, setProfile] = useState<ProfileValues>({
    bio: '', tagline: '', sessionExpectations: '', weeklyCapacity: '10',
  })

  const photoRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // Debounced invite code validation + prefill
  useEffect(() => {
    const code = inviteCode.trim().toUpperCase()
    if (!code || code.length < 6) {
      setInviteStatus({ state: 'idle' })
      return
    }
    let cancelled = false
    setInviteStatus({ state: 'checking' })
    const t = setTimeout(async () => {
      const result = await lookupInvite(code)
      if (cancelled) return
      if (result.valid) {
        setInviteStatus({ state: 'valid', fullName: result.fullName, email: result.email })
        if (result.fullName && !account.fullName) setAccount(prev => ({ ...prev, fullName: result.fullName }))
        if (result.email && !account.email) setAccount(prev => ({ ...prev, email: result.email }))
      } else {
        setInviteStatus({ state: 'invalid', message: result.error })
      }
    }, 450)
    return () => { cancelled = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode])

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(null)
      setPhotoFileName(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo must be under 5 MB.')
      if (photoRef.current) photoRef.current.value = ''
      setPhotoFile(null)
      setPhotoPreview(null)
      setPhotoFileName(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Photo must be JPG, PNG, or WebP.')
      if (photoRef.current) photoRef.current.value = ''
      setPhotoFile(null)
      setPhotoPreview(null)
      setPhotoFileName(null)
      return
    }
    setPhotoError(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoFileName(file.name)
  }

  function clearPhoto() {
    if (photoRef.current) photoRef.current.value = ''
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoFileName(null)
    setPhotoError(null)
  }

  const updateAccount = (key: string, value: string) =>
    setAccount(prev => ({ ...prev, [key]: value }))
  const updateCreds = (key: keyof CredsValues, value: string) =>
    setCreds(prev => ({ ...prev, [key]: value }))
  const updateVerification = (key: Exclude<keyof VerificationValues, 'idDocumentUrl' | 'idDocumentFilename'>, value: string) =>
    setVerification(prev => ({ ...prev, [key]: value }))
  const onIdUploaded = (url: string, filename: string) =>
    setVerification(prev => ({ ...prev, idDocumentUrl: url, idDocumentFilename: filename }))
  const onIdRemoved = () =>
    setVerification(prev => ({ ...prev, idDocumentUrl: '', idDocumentFilename: '' }))
  const updateProfile = (key: keyof ProfileValues, value: string) =>
    setProfile(prev => ({ ...prev, [key]: value }))

  function canAdvance(): boolean {
    if (step === 0) return inviteStatus.state === 'valid'
    if (step === 1) {
      return (
        account.fullName.trim().length >= 2 &&
        account.email.includes('@') &&
        account.password.length >= 8 &&
        account.password === account.confirmPassword
      )
    }
    if (step === 2) return creds.licenseCountry.trim().length > 0 && creds.timezone.trim().length > 0
    if (step === 3) {
      // Only the ID document is required at onboarding. Payment details and
      // address can be added later from the account page.
      return verification.idDocumentUrl.length > 0
    }
    if (step === 4) return !!photoPreview
    if (step === 5) return profile.bio.trim().length >= 10
    return false
  }

  const isLastStep = step === STEPS.length - 1
  const progressPercent = Math.round((step / STEPS.length) * 100)

  // The browser clears <input type="file"> after a failed form submission, so
  // we keep the selected File in React state and inject it into FormData
  // manually here. This makes retries work without re-selecting the photo.
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!photoFile) {
      e.preventDefault()
      setPhotoError('Profile photo is required.')
      return
    }
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('profilePhoto', photoFile, photoFile.name)
    formAction(fd)
  }

  return (
    <div className="min-h-screen bg-[#FFF5F2]">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <BrandLogo />
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
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">Therapist Onboarding</p>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
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

        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleFormSubmit}>
            <input type="hidden" name="inviteCode" value={inviteCode} />
            <input type="hidden" name="fullName" value={account.fullName} />
            <input type="hidden" name="email" value={account.email} />
            <input type="hidden" name="password" value={account.password} />
            <input type="hidden" name="licenseState" value={creds.licenseState} />
            <input type="hidden" name="licenseCountry" value={creds.licenseCountry} />
            <input type="hidden" name="pronouns" value={creds.pronouns} />
            <input type="hidden" name="previousExperience" value={creds.previousExperience} />
            <input type="hidden" name="timezone" value={creds.timezone} />
            <input type="hidden" name="idDocumentUrl" value={verification.idDocumentUrl} />
            <input type="hidden" name="paypalEmail" value={verification.paypalEmail} />
            <input type="hidden" name="bankAccountName" value={verification.bankAccountName} />
            <input type="hidden" name="bankAccountNumber" value={verification.bankAccountNumber} />
            <input type="hidden" name="bankIfsc" value={verification.bankIfsc} />
            <input type="hidden" name="bio" value={profile.bio} />
            <input type="hidden" name="tagline" value={profile.tagline} />
            <input type="hidden" name="sessionExpectations" value={profile.sessionExpectations} />
            <input type="hidden" name="weeklyCapacity" value={profile.weeklyCapacity} />

            <input
              ref={photoRef}
              type="file"
              name="profilePhoto"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {step === 0 && (
              <StepInviteCode value={inviteCode} onChange={setInviteCode} status={inviteStatus} />
            )}
            {step === 1 && <StepAccount values={account} onChange={updateAccount} />}
            {step === 2 && <StepCredentials values={creds} onChange={updateCreds} />}
            {step === 3 && (
              <StepVerification
                values={verification}
                onChange={updateVerification}
                onIdUploaded={onIdUploaded}
                onIdRemoved={onIdRemoved}
              />
            )}
            {step === 4 && (
              <StepPhoto
                previewUrl={photoPreview}
                fileName={photoFileName}
                error={photoError}
                onClickUpload={() => photoRef.current?.click()}
                onClear={clearPhoto}
              />
            )}
            {step === 5 && <StepProfile values={profile} onChange={updateProfile} />}

            {state?.error && isLastStep && (
              <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {state.error}
              </div>
            )}

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
                  {isPending ? 'Creating account…' : 'Complete setup →'}
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

        <p className="text-center text-xs text-[#233551]/35 mt-5">
          Already have an account?{' '}
          <a href="/login" className="text-[#3D8A80] hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
