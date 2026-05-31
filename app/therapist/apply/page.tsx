'use client'

import { useState, useActionState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { submitTherapistApplication, type ApplyState } from './actions'

// ─── Constants ────────────────────────────────────────────────────────────────

// Therapeutic specialisations: a blend of presenting issues and modalities/approaches
// so therapists can flag both what they treat and how they work.
// Client groups — shown prominently at the top of the specialisation picker.
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

const STEPS = ['Personal', 'Credentials', 'Practice']

const ACCEPT_DOC = '.pdf,.doc,.docx,.png,.jpg,.jpeg'

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Other', 'Prefer not to say']

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

// Multi-region ethnicity options based on common international demographic surveys
const ETHNICITY_OPTIONS = [
  'South Asian',
  'East Asian',
  'Southeast Asian',
  'Middle Eastern / North African',
  'Black / African / Caribbean',
  'White / European',
  'Hispanic / Latino',
  'Native American / Indigenous',
  'Pacific Islander',
  'Mixed / Multiple ethnicities',
  'Other',
  'Prefer not to say',
]

// Country dial codes for the phone input. ISO E.164 prefixes, India first then alphabetical.
const COUNTRY_CODES: { name: string; dial: string }[] = [
  { name: 'India', dial: '+91' },
  { name: 'Afghanistan', dial: '+93' },
  { name: 'Albania', dial: '+355' },
  { name: 'Algeria', dial: '+213' },
  { name: 'Andorra', dial: '+376' },
  { name: 'Angola', dial: '+244' },
  { name: 'Argentina', dial: '+54' },
  { name: 'Armenia', dial: '+374' },
  { name: 'Australia', dial: '+61' },
  { name: 'Austria', dial: '+43' },
  { name: 'Azerbaijan', dial: '+994' },
  { name: 'Bahamas', dial: '+1' },
  { name: 'Bahrain', dial: '+973' },
  { name: 'Bangladesh', dial: '+880' },
  { name: 'Barbados', dial: '+1' },
  { name: 'Belarus', dial: '+375' },
  { name: 'Belgium', dial: '+32' },
  { name: 'Belize', dial: '+501' },
  { name: 'Benin', dial: '+229' },
  { name: 'Bhutan', dial: '+975' },
  { name: 'Bolivia', dial: '+591' },
  { name: 'Bosnia and Herzegovina', dial: '+387' },
  { name: 'Botswana', dial: '+267' },
  { name: 'Brazil', dial: '+55' },
  { name: 'Brunei', dial: '+673' },
  { name: 'Bulgaria', dial: '+359' },
  { name: 'Burkina Faso', dial: '+226' },
  { name: 'Burundi', dial: '+257' },
  { name: 'Cambodia', dial: '+855' },
  { name: 'Cameroon', dial: '+237' },
  { name: 'Canada', dial: '+1' },
  { name: 'Cape Verde', dial: '+238' },
  { name: 'Central African Republic', dial: '+236' },
  { name: 'Chad', dial: '+235' },
  { name: 'Chile', dial: '+56' },
  { name: 'China', dial: '+86' },
  { name: 'Colombia', dial: '+57' },
  { name: 'Comoros', dial: '+269' },
  { name: 'Congo', dial: '+242' },
  { name: 'Costa Rica', dial: '+506' },
  { name: 'Croatia', dial: '+385' },
  { name: 'Cuba', dial: '+53' },
  { name: 'Cyprus', dial: '+357' },
  { name: 'Czech Republic', dial: '+420' },
  { name: 'Denmark', dial: '+45' },
  { name: 'Djibouti', dial: '+253' },
  { name: 'Dominica', dial: '+1' },
  { name: 'Dominican Republic', dial: '+1' },
  { name: 'East Timor', dial: '+670' },
  { name: 'Ecuador', dial: '+593' },
  { name: 'Egypt', dial: '+20' },
  { name: 'El Salvador', dial: '+503' },
  { name: 'Equatorial Guinea', dial: '+240' },
  { name: 'Eritrea', dial: '+291' },
  { name: 'Estonia', dial: '+372' },
  { name: 'Eswatini', dial: '+268' },
  { name: 'Ethiopia', dial: '+251' },
  { name: 'Fiji', dial: '+679' },
  { name: 'Finland', dial: '+358' },
  { name: 'France', dial: '+33' },
  { name: 'Gabon', dial: '+241' },
  { name: 'Gambia', dial: '+220' },
  { name: 'Georgia', dial: '+995' },
  { name: 'Germany', dial: '+49' },
  { name: 'Ghana', dial: '+233' },
  { name: 'Greece', dial: '+30' },
  { name: 'Grenada', dial: '+1' },
  { name: 'Guatemala', dial: '+502' },
  { name: 'Guinea', dial: '+224' },
  { name: 'Guinea-Bissau', dial: '+245' },
  { name: 'Guyana', dial: '+592' },
  { name: 'Haiti', dial: '+509' },
  { name: 'Honduras', dial: '+504' },
  { name: 'Hong Kong', dial: '+852' },
  { name: 'Hungary', dial: '+36' },
  { name: 'Iceland', dial: '+354' },
  { name: 'Indonesia', dial: '+62' },
  { name: 'Iran', dial: '+98' },
  { name: 'Iraq', dial: '+964' },
  { name: 'Ireland', dial: '+353' },
  { name: 'Israel', dial: '+972' },
  { name: 'Italy', dial: '+39' },
  { name: 'Ivory Coast', dial: '+225' },
  { name: 'Jamaica', dial: '+1' },
  { name: 'Japan', dial: '+81' },
  { name: 'Jordan', dial: '+962' },
  { name: 'Kazakhstan', dial: '+7' },
  { name: 'Kenya', dial: '+254' },
  { name: 'Kiribati', dial: '+686' },
  { name: 'Kuwait', dial: '+965' },
  { name: 'Kyrgyzstan', dial: '+996' },
  { name: 'Laos', dial: '+856' },
  { name: 'Latvia', dial: '+371' },
  { name: 'Lebanon', dial: '+961' },
  { name: 'Lesotho', dial: '+266' },
  { name: 'Liberia', dial: '+231' },
  { name: 'Libya', dial: '+218' },
  { name: 'Liechtenstein', dial: '+423' },
  { name: 'Lithuania', dial: '+370' },
  { name: 'Luxembourg', dial: '+352' },
  { name: 'Madagascar', dial: '+261' },
  { name: 'Malawi', dial: '+265' },
  { name: 'Malaysia', dial: '+60' },
  { name: 'Maldives', dial: '+960' },
  { name: 'Mali', dial: '+223' },
  { name: 'Malta', dial: '+356' },
  { name: 'Marshall Islands', dial: '+692' },
  { name: 'Mauritania', dial: '+222' },
  { name: 'Mauritius', dial: '+230' },
  { name: 'Mexico', dial: '+52' },
  { name: 'Micronesia', dial: '+691' },
  { name: 'Moldova', dial: '+373' },
  { name: 'Monaco', dial: '+377' },
  { name: 'Mongolia', dial: '+976' },
  { name: 'Montenegro', dial: '+382' },
  { name: 'Morocco', dial: '+212' },
  { name: 'Mozambique', dial: '+258' },
  { name: 'Myanmar', dial: '+95' },
  { name: 'Namibia', dial: '+264' },
  { name: 'Nauru', dial: '+674' },
  { name: 'Nepal', dial: '+977' },
  { name: 'Netherlands', dial: '+31' },
  { name: 'New Zealand', dial: '+64' },
  { name: 'Nicaragua', dial: '+505' },
  { name: 'Niger', dial: '+227' },
  { name: 'Nigeria', dial: '+234' },
  { name: 'North Korea', dial: '+850' },
  { name: 'North Macedonia', dial: '+389' },
  { name: 'Norway', dial: '+47' },
  { name: 'Oman', dial: '+968' },
  { name: 'Pakistan', dial: '+92' },
  { name: 'Palau', dial: '+680' },
  { name: 'Palestine', dial: '+970' },
  { name: 'Panama', dial: '+507' },
  { name: 'Papua New Guinea', dial: '+675' },
  { name: 'Paraguay', dial: '+595' },
  { name: 'Peru', dial: '+51' },
  { name: 'Philippines', dial: '+63' },
  { name: 'Poland', dial: '+48' },
  { name: 'Portugal', dial: '+351' },
  { name: 'Qatar', dial: '+974' },
  { name: 'Romania', dial: '+40' },
  { name: 'Russia', dial: '+7' },
  { name: 'Rwanda', dial: '+250' },
  { name: 'Saint Kitts and Nevis', dial: '+1' },
  { name: 'Saint Lucia', dial: '+1' },
  { name: 'Saint Vincent and the Grenadines', dial: '+1' },
  { name: 'Samoa', dial: '+685' },
  { name: 'San Marino', dial: '+378' },
  { name: 'Saudi Arabia', dial: '+966' },
  { name: 'Senegal', dial: '+221' },
  { name: 'Serbia', dial: '+381' },
  { name: 'Seychelles', dial: '+248' },
  { name: 'Sierra Leone', dial: '+232' },
  { name: 'Singapore', dial: '+65' },
  { name: 'Slovakia', dial: '+421' },
  { name: 'Slovenia', dial: '+386' },
  { name: 'Solomon Islands', dial: '+677' },
  { name: 'Somalia', dial: '+252' },
  { name: 'South Africa', dial: '+27' },
  { name: 'South Korea', dial: '+82' },
  { name: 'South Sudan', dial: '+211' },
  { name: 'Spain', dial: '+34' },
  { name: 'Sri Lanka', dial: '+94' },
  { name: 'Sudan', dial: '+249' },
  { name: 'Suriname', dial: '+597' },
  { name: 'Sweden', dial: '+46' },
  { name: 'Switzerland', dial: '+41' },
  { name: 'Syria', dial: '+963' },
  { name: 'Taiwan', dial: '+886' },
  { name: 'Tajikistan', dial: '+992' },
  { name: 'Tanzania', dial: '+255' },
  { name: 'Thailand', dial: '+66' },
  { name: 'Togo', dial: '+228' },
  { name: 'Tonga', dial: '+676' },
  { name: 'Trinidad and Tobago', dial: '+1' },
  { name: 'Tunisia', dial: '+216' },
  { name: 'Turkey', dial: '+90' },
  { name: 'Turkmenistan', dial: '+993' },
  { name: 'Tuvalu', dial: '+688' },
  { name: 'Uganda', dial: '+256' },
  { name: 'Ukraine', dial: '+380' },
  { name: 'United Arab Emirates', dial: '+971' },
  { name: 'United Kingdom', dial: '+44' },
  { name: 'United States', dial: '+1' },
  { name: 'Uruguay', dial: '+598' },
  { name: 'Uzbekistan', dial: '+998' },
  { name: 'Vanuatu', dial: '+678' },
  { name: 'Vatican City', dial: '+39' },
  { name: 'Venezuela', dial: '+58' },
  { name: 'Vietnam', dial: '+84' },
  { name: 'Yemen', dial: '+967' },
  { name: 'Zambia', dial: '+260' },
  { name: 'Zimbabwe', dial: '+263' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30'

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

// Date math for the 18+ check on date of birth.
function eighteenYearsAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

function ageFromDob(dob: string): number {
  if (!dob) return 0
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// Splits a stored combined phone string like "+91 9876543210" back into dial code + national number.
function parsePhone(v: string): { dial: string; national: string } {
  if (!v) return { dial: '+91', national: '' }
  const match = v.match(/^(\+\d{1,4})\s+(.*)$/)
  if (match) return { dial: match[1], national: match[2] }
  return { dial: '+91', national: v }
}

// PhoneInput: dial-code selector with search + national number input.
// Bubbles up a single combined string (e.g. "+91 9876543210") to the parent.
function PhoneInput({
  value,
  onChange,
}: {
  value: string
  onChange: (combined: string) => void
}) {
  const initial = parsePhone(value)
  const [dial, setDial] = useState(initial.dial)
  const [national, setNational] = useState(initial.national)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function emit(d: string, n: string) {
    const t = n.trim()
    onChange(t ? `${d} ${t}` : '')
  }

  function pickDial(d: string) {
    setDial(d)
    emit(d, national)
    setOpen(false)
    setSearch('')
  }

  function updateNational(n: string) {
    setNational(n)
    emit(dial, n)
  }

  const filtered = COUNTRY_CODES.filter(c => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.dial.replace('+', '').includes(q)
    )
  })

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-3 border border-slate-200 rounded-xl text-sm font-medium text-[#233551] hover:border-[#7EC0B7] transition-colors min-w-[92px] justify-center',
            open && 'border-[#7EC0B7]',
          )}
        >
          {dial}
          <svg className="w-3 h-3 text-[#233551]/50" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          type="tel"
          inputMode="numeric"
          value={national}
          onChange={e => updateNational(e.target.value)}
          placeholder="9876543210"
          className={cn(inputCls, 'flex-1')}
        />
      </div>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 w-72 max-w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code"
              className="w-full text-sm text-[#233551] focus:outline-none placeholder:text-[#233551]/30"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-[#233551]/40 text-center">No matches</p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => pickDial(c.dial)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex justify-between items-center transition-colors',
                    dial === c.dial && c.name === 'India' && 'bg-[#7EC0B7]/10',
                  )}
                >
                  <span className="text-[#233551] truncate pr-2">{c.name}</span>
                  <span className="text-[#233551]/50 flex-shrink-0">{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

type PersonalValues = {
  fullName: string
  email: string
  phone: string
  city: string
  state: string
  country: string
  dateOfBirth: string
  gender: string
  ethnicity: string
}

function StepPersonal({
  values,
  onChange,
}: {
  values: PersonalValues
  onChange: (key: keyof PersonalValues, value: string) => void
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
          placeholder="xxxx"
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email address" required>
          <input
            type="email"
            value={values.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="abc@example.com"
            className={inputCls}
          />
        </Field>
        <Field label="Phone number" required>
          <PhoneInput value={values.phone} onChange={v => onChange('phone', v)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="City" required>
          <input
            type="text"
            value={values.city}
            onChange={e => onChange('city', e.target.value)}
            placeholder="xxxx"
            className={inputCls}
          />
        </Field>
        <Field label="State" required>
          <input
            type="text"
            value={values.state}
            onChange={e => onChange('state', e.target.value)}
            placeholder="xxxx"
            className={inputCls}
          />
        </Field>
        <Field label="Country" required>
          <select
            value={values.country}
            onChange={e => onChange('country', e.target.value)}
            className={cn(inputCls, 'appearance-none bg-white pr-10 cursor-pointer', !values.country && 'text-[#233551]/40')}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23233551' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '12px 8px',
            }}
          >
            <option value="" disabled>Select your country</option>
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
      <Field label="Date of birth" required hint="must be 18 or older">
        <input
          type="date"
          value={values.dateOfBirth}
          onChange={e => onChange('dateOfBirth', e.target.value)}
          max={eighteenYearsAgo()}
          className={inputCls}
        />
      </Field>
      <Field label="Gender" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {GENDER_OPTIONS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => onChange('gender', g)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                values.gender === g
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Ethnicity" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {ETHNICITY_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => onChange('ethnicity', e)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                values.ethnicity === e
                  ? 'bg-[#233551] text-white border-[#233551]'
                  : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:text-[#3D8A80]',
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

type CredsValues = {
  yearsExperience: string
  education: string
  linkedinUrl: string
  expectedSessionPay: string
  expectedSessionPayCurrency: 'INR' | 'USD'
  cvUrl: string
  cvFilename: string
  certificates: { url: string; filename: string }[]
}

function StepCredentials({
  values,
  onChange,
  onCvUploaded,
  onCvRemoved,
  onCertAdded,
  onCertRemoved,
}: {
  values: CredsValues
  onChange: (
    key: 'yearsExperience' | 'education' | 'linkedinUrl' | 'expectedSessionPay' | 'expectedSessionPayCurrency',
    value: string,
  ) => void
  onCvUploaded: (url: string, filename: string) => void
  onCvRemoved: () => void
  onCertAdded: (url: string, filename: string) => void
  onCertRemoved: (index: number) => void
}) {
  const cvInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [certUploading, setCertUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function uploadFile(file: File, prefix: string): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'bin'
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage
      .from('therapist-documents')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) {
      setUploadError(error.message)
      return null
    }
    return path
  }

  async function handleCvSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setCvUploading(true)
    const path = await uploadFile(file, 'cv')
    setCvUploading(false)
    if (path) onCvUploaded(path, file.name)
    if (cvInputRef.current) cvInputRef.current.value = ''
  }

  async function handleCertSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setCertUploading(true)
    const path = await uploadFile(file, 'certificates')
    setCertUploading(false)
    if (path) onCertAdded(path, file.name)
    if (certInputRef.current) certInputRef.current.value = ''
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Years of experience" required>
          <input
            type="number"
            min={0}
            max={40}
            value={values.yearsExperience}
            onChange={e => onChange('yearsExperience', e.target.value)}
            placeholder="5"
            className={inputCls}
          />
          {values.yearsExperience !== '' && parseInt(values.yearsExperience, 10) > 40 && (
            <p className="text-xs text-[#E8926A] mt-1.5">Please enter 40 or fewer years.</p>
          )}
        </Field>
        <Field label="Highest qualification" required>
          <input
            type="text"
            value={values.education}
            onChange={e => onChange('education', e.target.value)}
            placeholder="xxxx"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Expected session pay" required hint="what you'd like to be paid per 50-minute session">
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            step={100}
            value={values.expectedSessionPay}
            onChange={e => onChange('expectedSessionPay', e.target.value)}
            placeholder="2000"
            className={cn(inputCls, 'flex-1')}
          />
          <div className="flex rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => onChange('expectedSessionPayCurrency', 'INR')}
              className={cn(
                'px-5 text-sm font-bold transition-colors',
                values.expectedSessionPayCurrency === 'INR'
                  ? 'bg-[#233551] text-white'
                  : 'bg-white text-[#233551]/50 hover:bg-slate-50',
              )}
            >
              INR
            </button>
            <button
              type="button"
              onClick={() => onChange('expectedSessionPayCurrency', 'USD')}
              className={cn(
                'px-5 text-sm font-bold transition-colors border-l border-slate-200',
                values.expectedSessionPayCurrency === 'USD'
                  ? 'bg-[#233551] text-white'
                  : 'bg-white text-[#233551]/50 hover:bg-slate-50',
              )}
            >
              USD
            </button>
          </div>
        </div>
      </Field>

      <Field label="LinkedIn profile" hint="optional but recommended">
        <input
          type="url"
          value={values.linkedinUrl}
          onChange={e => onChange('linkedinUrl', e.target.value)}
          placeholder="https://linkedin.com/in/xxxx"
          className={inputCls}
        />
      </Field>

      {/* CV upload */}
      <Field label="CV" required hint="PDF or Word">
        {values.cvFilename ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-[#233551] truncate">{values.cvFilename}</span>
            </div>
            <button type="button" onClick={onCvRemoved} className="text-xs font-semibold text-[#E8926A] hover:text-[#233551] transition-colors flex-shrink-0 ml-3">
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={cvUploading}
            onClick={() => cvInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-[#3D8A80] hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5 transition-all disabled:opacity-50"
          >
            {cvUploading ? 'Uploading...' : '+ Upload CV'}
          </button>
        )}
        <input
          ref={cvInputRef}
          type="file"
          accept={ACCEPT_DOC}
          onChange={handleCvSelect}
          className="hidden"
        />
      </Field>

      {/* Certificates upload (multiple) */}
      <Field label="Certificates" hint="optional — degree, licence, training certificates">
        <div className="space-y-2">
          {values.certificates.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-[#3D8A80] flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm text-[#233551] truncate">{c.filename}</span>
              </div>
              <button type="button" onClick={() => onCertRemoved(i)} className="text-xs font-semibold text-[#E8926A] hover:text-[#233551] transition-colors flex-shrink-0 ml-3">
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={certUploading}
            onClick={() => certInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-[#3D8A80] hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5 transition-all disabled:opacity-50"
          >
            {certUploading ? 'Uploading...' : '+ Add a certificate'}
          </button>
          <input
            ref={certInputRef}
            type="file"
            accept={ACCEPT_DOC}
            onChange={handleCertSelect}
            className="hidden"
          />
        </div>
      </Field>

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{uploadError}</p>
      )}
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
    specializationOther: string
    languages: string[]
    languageOther: string
    whyMindcanopy: string
  }
  onChange: (key: 'specializationOther' | 'languageOther' | 'whyMindcanopy', value: string) => void
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

      <Field label="Areas of specialisation" required hint="modalities and presenting issues — pick all that apply">
        {/* Client groups — three prominent picks in a row */}
        <div className="grid grid-cols-3 gap-2 mt-1 mb-3">
          {CLIENT_GROUPS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialization(s)}
              className={cn(
                'text-sm px-4 py-2.5 rounded-xl border-2 font-bold transition-all',
                values.specializations.includes(s)
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
        <div className="mt-3">
          <input
            type="text"
            value={values.specializationOther}
            onChange={e => onChange('specializationOther', e.target.value)}
            placeholder="Other (please specify)"
            className={inputCls}
          />
        </div>
        {values.specializations.length === 0 && !values.specializationOther && (
          <p className="text-xs text-[#233551]/40 mt-2">Select at least one area or write one in &ldquo;Other&rdquo;.</p>
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
        <div className="mt-3">
          <input
            type="text"
            value={values.languageOther}
            onChange={e => onChange('languageOther', e.target.value)}
            placeholder="Other language (please specify)"
            className={inputCls}
          />
        </div>
        {values.languages.length === 0 && !values.languageOther && (
          <p className="text-xs text-[#233551]/40 mt-2">Select at least one language or write one in &ldquo;Other&rdquo;.</p>
        )}
      </Field>

      <Field label="Why do you want to join MindCanopy?" hint="optional">
        <textarea
          value={values.whyMindcanopy}
          onChange={e => onChange('whyMindcanopy', e.target.value)}
          placeholder="What draws you to online therapy? What kind of clients do you most want to work with?"
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
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
          One last step.
        </h2>
        <p className="text-sm text-[#233551]/60 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent a verification link to your email. Open it, and we&apos;ll start reviewing your application.
          Check spam if it doesn&apos;t show up in a few minutes.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-left space-y-3">
        <p className="text-xs font-bold text-[#233551]/40 uppercase tracking-widest">What happens next</p>
        {[
          { step: '1', text: 'Verify your email' },
          { step: '2', text: 'We review your application and credentials' },
          { step: '3', text: 'If it\'s a fit, we set up a short intro call' },
          { step: '4', text: 'You complete onboarding and join the platform' },
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
        ← Back to MindCanopy
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const initialState: ApplyState = {}

export default function TherapistApplyPage() {
  const [step, setStep] = useState(0)
  const [state, formAction, isPending] = useActionState(submitTherapistApplication, initialState)

  const [personal, setPersonal] = useState<PersonalValues>({
    fullName: '', email: '', phone: '', city: '', state: '', country: '',
    dateOfBirth: '', gender: '', ethnicity: '',
  })
  const [creds, setCreds] = useState<CredsValues>({
    yearsExperience: '',
    education: '',
    linkedinUrl: '',
    expectedSessionPay: '',
    expectedSessionPayCurrency: 'INR',
    cvUrl: '',
    cvFilename: '',
    certificates: [],
  })
  const [practice, setPractice] = useState({
    specializations: [] as string[],
    specializationOther: '',
    languages: ['English'] as string[],
    languageOther: '',
    whyMindcanopy: '',
  })

  const updatePersonal = (key: keyof PersonalValues, value: string) => setPersonal(prev => ({ ...prev, [key]: value }))
  const updateCreds = (
    key: 'yearsExperience' | 'education' | 'linkedinUrl' | 'expectedSessionPay' | 'expectedSessionPayCurrency',
    value: string,
  ) => setCreds(prev => ({ ...prev, [key]: value }))
  const updatePractice = (key: 'specializationOther' | 'languageOther' | 'whyMindcanopy', value: string) =>
    setPractice(prev => ({ ...prev, [key]: value }))

  const onCvUploaded = (url: string, filename: string) =>
    setCreds(prev => ({ ...prev, cvUrl: url, cvFilename: filename }))
  const onCvRemoved = () => setCreds(prev => ({ ...prev, cvUrl: '', cvFilename: '' }))
  const onCertAdded = (url: string, filename: string) =>
    setCreds(prev => ({ ...prev, certificates: [...prev.certificates, { url, filename }] }))
  const onCertRemoved = (idx: number) =>
    setCreds(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }))

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
      return (
        personal.fullName.trim().length >= 2 &&
        personal.email.includes('@') &&
        personal.phone.trim().length > 0 &&
        personal.city.trim().length > 0 &&
        personal.state.trim().length > 0 &&
        personal.country.trim().length > 0 &&
        ageFromDob(personal.dateOfBirth) >= 18 &&
        personal.gender.length > 0 &&
        personal.ethnicity.length > 0
      )
    }
    if (step === 1) {
      const years = parseInt(creds.yearsExperience, 10)
      return (
        creds.yearsExperience !== '' &&
        !isNaN(years) &&
        years >= 0 &&
        years <= 40 &&
        creds.education.trim().length > 0 &&
        creds.expectedSessionPay !== '' &&
        Number(creds.expectedSessionPay) > 0 &&
        creds.cvUrl.trim().length > 0
      )
    }
    if (step === 2) {
      return (
        (practice.specializations.length > 0 || practice.specializationOther.trim().length > 0) &&
        (practice.languages.length > 0 || practice.languageOther.trim().length > 0)
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
            <input type="hidden" name="state" value={personal.state} />
            <input type="hidden" name="country" value={personal.country} />
            <input type="hidden" name="dateOfBirth" value={personal.dateOfBirth} />
            <input type="hidden" name="gender" value={personal.gender} />
            <input type="hidden" name="ethnicity" value={personal.ethnicity} />
            <input type="hidden" name="yearsExperience" value={creds.yearsExperience} />
            <input type="hidden" name="education" value={creds.education} />
            <input type="hidden" name="linkedinUrl" value={creds.linkedinUrl} />
            <input type="hidden" name="expectedSessionPay" value={creds.expectedSessionPay} />
            <input type="hidden" name="expectedSessionPayCurrency" value={creds.expectedSessionPayCurrency} />
            <input type="hidden" name="cvUrl" value={creds.cvUrl} />
            <input type="hidden" name="certificateUrls" value={JSON.stringify(creds.certificates.map(c => c.url))} />
            <input type="hidden" name="specializations" value={JSON.stringify(practice.specializations)} />
            <input type="hidden" name="specializationOther" value={practice.specializationOther} />
            <input type="hidden" name="languages" value={JSON.stringify(practice.languages)} />
            <input type="hidden" name="languageOther" value={practice.languageOther} />
            <input type="hidden" name="whyMindcanopy" value={practice.whyMindcanopy} />

            {/* Step content */}
            {step === 0 && <StepPersonal values={personal} onChange={updatePersonal} />}
            {step === 1 && (
              <StepCredentials
                values={creds}
                onChange={updateCreds}
                onCvUploaded={onCvUploaded}
                onCvRemoved={onCvRemoved}
                onCertAdded={onCertAdded}
                onCertRemoved={onCertRemoved}
              />
            )}
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
