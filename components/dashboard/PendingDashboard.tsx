'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SubscriptionPlans } from './SubscriptionPlans'

const SAMPLE_THERAPISTS = [
  {
    initials: 'DR',
    name: 'Dr. R.',
    specializations: ['Anxiety', 'Depression'],
    experience: '8 years',
    approach: 'Cognitive Behavioural Therapy',
    languages: ['English', 'Hindi'],
  },
  {
    initials: 'PS',
    name: 'Dr. S.',
    specializations: ['Trauma', 'PTSD'],
    experience: '12 years',
    approach: 'EMDR & Somatic Therapy',
    languages: ['English', 'Telugu'],
  },
  {
    initials: 'AM',
    name: 'Dr. M.',
    specializations: ['Relationships', 'Life Transitions'],
    experience: '6 years',
    approach: 'Person-Centred Therapy',
    languages: ['English', 'Marathi'],
  },
  {
    initials: 'RK',
    name: 'Dr. K.',
    specializations: ['Stress', 'Self-esteem'],
    experience: '10 years',
    approach: 'Mindfulness-Based Therapy',
    languages: ['English', 'Tamil'],
  },
]

const COMPARISON_ROWS = [
  { feature: 'Qualified, licensed therapist', zenspace: true, traditional: true },
  { feature: 'No clinic visits required', zenspace: true, traditional: false },
  { feature: 'Async text messaging anytime', zenspace: true, traditional: false },
  { feature: 'Weekly video sessions', zenspace: true, traditional: true },
  { feature: 'Switch therapist anytime', zenspace: true, traditional: false },
  { feature: 'Complete privacy — no one in your network knows', zenspace: true, traditional: false },
  { feature: 'Available across India', zenspace: true, traditional: false },
]

type QuestionnairePrefs = {
  type: 'individual' | 'couples' | 'teen'
  concerns: string[]
  therapistGender: string | null
} | null

interface Props {
  userName: string
  userEmail: string
  hasActiveSubscription: boolean
  hasQuestionnaire: boolean
  questionnairePrefs: QuestionnairePrefs
}

function CategoryPopup({ onClose }: { onClose: () => void }) {
  const categories = [
    { label: 'Individual therapy', sub: 'Just for you', href: '/questionnaire/individual', color: '#7EC0B7' },
    { label: 'Couples therapy', sub: 'For both partners', href: '/questionnaire/couples', color: '#E8926A' },
    { label: 'Teen therapy', sub: 'Ages 14–20', href: '/questionnaire/teen', color: '#F97B5A' },
  ]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
              Which type of therapy?
            </h3>
            <p className="text-xs text-[#233551]/50 mt-0.5">Pick the right questionnaire for you.</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {categories.map(c => (
            <Link
              key={c.label}
              href={c.href}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5 transition-all group"
            >
              <div>
                <p className="text-sm font-semibold text-[#233551]">{c.label}</p>
                <p className="text-xs text-[#233551]/45 mt-0.5">{c.sub}</p>
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#7EC0B7] group-hover:translate-x-0.5 transition-transform">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ ok }: { ok: boolean }) {
  if (ok) return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7EC0B7]/20">
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#3D8A80]">
        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-red-400">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function PendingDashboard({
  userName,
  userEmail,
  hasActiveSubscription,
  hasQuestionnaire,
  questionnairePrefs,
}: Props) {
  const [showCategoryPopup, setShowCategoryPopup] = useState(false)
  const firstName = userName.split(' ')[0]

  function buildPreferencesList(): string[] {
    if (!questionnairePrefs) return []
    const lines: string[] = []
    if (questionnairePrefs.type === 'couples') {
      lines.push('A therapist experienced in couples and relationship dynamics')
    } else if (questionnairePrefs.type === 'teen') {
      lines.push('A therapist experienced in working with young adults (14–20)')
    }
    if (questionnairePrefs.concerns.length > 0) {
      lines.push(`A therapist experienced in: ${questionnairePrefs.concerns.slice(0, 3).join(', ')}`)
    }
    if (questionnairePrefs.therapistGender && questionnairePrefs.therapistGender !== 'No preference') {
      lines.push(`Preferred therapist gender: ${questionnairePrefs.therapistGender}`)
    }
    return lines
  }

  const preferencesList = buildPreferencesList()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
          {firstName}, your therapist is on their way.
        </h1>
      </div>

      {/* Status banner */}
      <div className="bg-[#7EC0B7]/12 border border-[#7EC0B7]/25 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
        <div className="flex gap-1 mt-0.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] animate-bounce" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#233551]">We&apos;re finding your match</p>
          <p className="text-sm text-[#233551]/60 mt-0.5 leading-relaxed">
            Thank you for sharing your preferences. Our team is personally reviewing your responses to find the right therapist for you. This usually takes 24–48 hours.
          </p>
          {hasActiveSubscription && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-[#3D8A80] text-white text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Subscription active
            </div>
          )}
        </div>
      </div>

      {/* Questionnaire prompt — shown if user signed up without answering */}
      {!hasQuestionnaire && (
        <div className="bg-[#FFF5F2] border border-[#E8926A]/30 rounded-2xl px-5 py-4 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Help us find the right therapist for you
              </p>
              <p className="text-sm text-[#233551]/55 mt-1 leading-relaxed">
                You haven&apos;t answered the intake questionnaire yet. It takes about 5 minutes and helps us match you accurately.
              </p>
            </div>
            <button
              onClick={() => setShowCategoryPopup(true)}
              className="flex-shrink-0 bg-[#E8926A] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#d4784f] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Answer now →
            </button>
          </div>
        </div>
      )}

      {/* Subscribe prompt — shown if no active subscription */}
      {!hasActiveSubscription && (
        <div className="bg-[#233551] text-white rounded-2xl px-5 py-4 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black" style={{ fontFamily: 'var(--font-lato)' }}>
                Ready when your therapist is
              </p>
              <p className="text-sm text-white/60 mt-1">
                Subscribe now so your first session starts the moment you&apos;re matched.
              </p>
            </div>
            <Link
              href="/dashboard/subscribe"
              className="flex-shrink-0 bg-[#7EC0B7] text-[#233551] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#6db0a7] transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              See plans →
            </Link>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 mb-8" />

      {/* What happens next */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
          What happens next?
        </h2>
        <ul className="space-y-3">
          {[
            'You will receive a personalized match to a qualified, globally trained therapist.',
            'Your therapist will thoughtfully review what you shared and find an approach that fits you.',
            'You will begin communicating with your therapist online — and your therapy process begins.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#233551]/70 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Who will be my therapist */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          Who will be your therapist?
        </h2>
        <p className="text-sm text-[#233551]/60 mb-4 leading-relaxed">
          We&apos;ll find a personalized therapist match based on your preferences
          {questionnairePrefs ? ':' : '. Once you answer the questionnaire, you\'ll see your preferences here.'}
        </p>
        {preferencesList.length > 0 ? (
          <ul className="space-y-2">
            {preferencesList.map((pref, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#233551]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                {pref}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {[
              'A licensed, experienced therapist matched to your concerns and goals',
              'Someone with no cultural stake in your choices — they\'re here for you, not your family',
              'A therapist whose availability works with your schedule',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#233551]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* How do I talk to my therapist */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          How do you talk to your therapist?
        </h2>
        <p className="text-sm text-[#233551]/60 leading-relaxed">
          You have two ways to connect. You can send text messages to your therapist at any time — between sessions, on a Tuesday evening, whenever something comes up. You can also schedule weekly video sessions (50 minutes) to work through things face to face, without leaving your room.
        </p>
      </section>

      {/* What if I don't like my therapist */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          What if the therapist isn&apos;t the right fit?
        </h2>
        <p className="text-sm text-[#233551]/60 leading-relaxed">
          You can ask to be matched with a different therapist. No explanation needed — if it&apos;s not working, we&apos;ll find someone else. Just reach out to us from the{' '}
          <Link href="/dashboard/change-therapist" className="text-[#3D8A80] hover:underline">
            Change Therapist
          </Link>{' '}
          page.
        </p>
      </section>

      {/* How much does it cost */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          How much does it cost?
        </h2>
        <p className="text-sm text-[#233551]/60 mb-5 leading-relaxed">
          ZenSpace offers two plans — Essentials and Premium — available weekly or monthly.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { tier: 'Essentials', weekly: '₹2,999/week', monthly: '₹9,999/month', note: '1 video session (50 min) + unlimited async text' },
            { tier: 'Premium', weekly: '₹4,499/week', monthly: '₹14,999/month', note: '1 session + priority text + foreign therapist access' },
          ].map(plan => (
            <div key={plan.tier} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-wider mb-1">{plan.tier}</p>
              <p className="text-base font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>{plan.weekly}</p>
              <p className="text-xs text-[#233551]/40 mb-1">or {plan.monthly}</p>
              <p className="text-xs text-[#233551]/55 leading-relaxed">{plan.note}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#233551]/40">
          Subscriptions are non-refundable.{' '}
          <Link href="/dashboard/subscribe" className="text-[#3D8A80] hover:underline">View full plan details →</Link>
        </p>
      </section>

      {/* ZenSpace vs Traditional comparison */}
      <section className="mb-10">
        <h2 className="text-lg font-black text-[#233551] mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
          ZenSpace vs traditional in-office therapy
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[#233551]/50 font-medium text-xs" />
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-black text-white bg-[#233551] px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-lato)' }}>
                    ZenSpace
                  </span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#233551]/50">In-office</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.feature} className={cn('border-b border-slate-100 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                  <td className="px-4 py-3 text-xs text-[#233551]/70">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><CheckIcon ok={row.zenspace} /></td>
                  <td className="px-4 py-3 text-center"><CheckIcon ok={row.traditional} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sample therapist cards */}
      <section className="mb-10">
        <p className="text-xs font-bold text-[#233551]/30 uppercase tracking-widest mb-3">
          Some of our therapists
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_THERAPISTS.map(t => (
            <div key={t.initials} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-sm flex items-center justify-center flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#233551]">{t.name}</p>
                <p className="text-xs text-[#233551]/50 mt-0.5">{t.approach}</p>
                <p className="text-xs text-[#233551]/40 mt-0.5">{t.experience} experience</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.specializations.map(s => (
                    <span key={s} className="text-xs bg-[#7EC0B7]/15 text-[#3D8A80] px-2 py-0.5 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#233551]/35 mt-1.5">{t.languages.join(' · ')}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#233551]/30 text-center mt-3">
          Profiles are anonymised for privacy. Your matched therapist will be revealed once assigned.
        </p>
      </section>

      {/* Subscription plans — if not subscribed */}
      {!hasActiveSubscription && (
        <section className="mb-10">
          <div className="border-t border-slate-100 mb-8" />
          <h2 className="text-lg font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
            Choose your plan
          </h2>
          <p className="text-sm text-[#233551]/55 mb-5">
            Subscribe now so you&apos;re ready the moment you&apos;re matched.
          </p>
          <SubscriptionPlans userName={userName} userEmail={userEmail} />
        </section>
      )}

      {showCategoryPopup && <CategoryPopup onClose={() => setShowCategoryPopup(false)} />}
    </div>
  )
}
