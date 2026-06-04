'use client'

import { useMemo, useState, useTransition } from 'react'
import { chooseTherapist } from '@/app/actions/choose-therapist'
import {
  sessionPriceInr,
  monthlyBundleInr,
  formatInr,
  MONTHLY_BUNDLE_DISCOUNT,
  TIER_LABELS,
  type ProposalTier,
  type SessionCategory,
} from '@/lib/plans'

const BUNDLE_DISCOUNT_PCT = Math.round(MONTHLY_BUNDLE_DISCOUNT * 100)

export type ProposalView = {
  matchId: string
  tier: ProposalTier
  adminSummary: string | null
  therapist: {
    fullName: string
    avatarUrl: string | null
    tagline: string | null
    bio: string | null
    specializations: string[]
    approach: string | null
    education: string | null
    yearsExperience: number
    languages: string[]
    licenseNumber: string | null
    licenseCountry: string | null
    sessionExpectations: string | null
    previousExperience: string | null
    pronouns: string | null
    isVerified: boolean
  }
}

interface Props {
  clientName: string
  category: SessionCategory
  proposals: ProposalView[]
}

const TIER_ORDER: ProposalTier[] = ['standard', 'professional']

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function TherapistMatchSelection({ clientName, category, proposals }: Props) {
  const firstName = clientName.split(' ')[0]

  // Standard first, Professional second.
  const ordered = useMemo(
    () => [...proposals].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)),
    [proposals],
  )

  const [activeTier, setActiveTier] = useState<ProposalTier>(ordered[0]?.tier ?? 'standard')
  const active = ordered.find((p) => p.tier === activeTier) ?? ordered[0]

  const [isPending, startTransition] = useTransition()
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!active) return null

  const single = ordered.length === 1

  function handleChoose(matchId: string) {
    setError(null)
    setPendingMatchId(matchId)
    startTransition(async () => {
      const res = await chooseTherapist(matchId)
      // Success path redirects server-side; only errors return here.
      if (res?.error) {
        setError(res.error)
        setPendingMatchId(null)
      }
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7 text-center">
        <p className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest mb-2">
          {single ? 'Your match is ready' : 'Your matches are ready'}
        </p>
        <h1
          className="text-2xl md:text-3xl font-black text-[#233551] leading-tight"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {firstName}, meet your therapist{single ? '' : 's'}.
        </h1>
        <p className="text-sm text-[#233551]/60 mt-2 max-w-xl mx-auto leading-relaxed">
          {single
            ? <>We&apos;ve hand-picked a therapist for you. Read through their profile, then start a free chat — there&apos;s no payment until you book a session.</>
            : <>We&apos;ve hand-picked two therapists for you. Read through both, then start a free chat with whoever feels right — there&apos;s no payment until you book a session.</>}
        </p>
      </div>

      {/* Tabs — only when there's more than one therapist to choose between */}
      {!single && (
      <div className="grid grid-cols-2 gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 mb-6 shadow-sm">
        {ordered.map((p) => {
          const isActive = p.tier === activeTier
          return (
            <button
              key={p.tier}
              onClick={() => setActiveTier(p.tier)}
              className={`rounded-xl py-2.5 px-3 text-center transition-all ${
                isActive
                  ? 'bg-[#233551] text-white shadow-sm'
                  : 'text-[#233551]/55 hover:bg-slate-50'
              }`}
            >
              <span
                className="block text-sm font-black"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {TIER_LABELS[p.tier]}
              </span>
              <span className={`block text-xs mt-0.5 truncate ${isActive ? 'text-white/70' : 'text-[#233551]/40'}`}>
                {p.therapist.fullName.split(' ')[0]} · {formatInr(sessionPriceInr(category, p.tier))}/session
              </span>
            </button>
          )
        })}
      </div>
      )}

      {/* Profile card */}
      <ProfileCard
        key={active.matchId}
        category={category}
        proposal={active}
        isPending={isPending && pendingMatchId === active.matchId}
        disabled={isPending}
        onChoose={() => handleChoose(active.matchId)}
      />

      {error && (
        <p className="text-sm text-red-600 text-center mt-4">{error}</p>
      )}

      <p className="text-xs text-[#233551]/35 text-center mt-6 leading-relaxed">
        Starting a chat simply connects you with this therapist. You can change therapists later by
        contacting support.
      </p>
    </div>
  )
}

function Chip({ label, i }: { label: string; i: number }) {
  // Alternate teal / coral tints, like the reference card.
  const styles = i % 2 === 0
    ? 'bg-[#7EC0B7]/15 text-[#3D8A80]'
    : 'bg-[#E8926A]/15 text-[#C56A42]'
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${styles}`}>
      {label}
    </span>
  )
}

function ProfileCard({
  category,
  proposal,
  isPending,
  disabled,
  onChoose,
}: {
  category: SessionCategory
  proposal: ProposalView
  isPending: boolean
  disabled: boolean
  onChoose: () => void
}) {
  const t = proposal.therapist
  const tFirst = t.fullName.split(' ')[0]
  const perSession = sessionPriceInr(category, proposal.tier)
  const bundle = monthlyBundleInr(perSession)

  const credentials = [
    t.education,
    t.licenseNumber ? `Licensed${t.licenseCountry ? ` · ${t.licenseCountry}` : ''}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#7EC0B7] via-[#7EC0B7] to-[#E8926A]" />

      <div className="p-6 md:p-7">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Photo */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-32 h-32 rounded-3xl bg-[#FFF5F2] border border-[#E8926A]/15 p-1.5">
              {t.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.avatarUrl}
                  alt={t.fullName}
                  className="w-full h-full rounded-[1.1rem] object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-[1.1rem] bg-[#233551] text-white font-black text-4xl flex items-center justify-center"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  {initials(t.fullName)}
                </div>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  proposal.tier === 'professional'
                    ? 'bg-[#E8926A]/15 text-[#C56A42]'
                    : 'bg-[#7EC0B7]/15 text-[#3D8A80]'
                }`}
              >
                {TIER_LABELS[proposal.tier]}
              </span>
              {t.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D8A80]">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <circle cx="8" cy="8" r="7" fill="#7EC0B7" fillOpacity="0.2" />
                    <path d="M5 8l2 2 4-4" stroke="#3D8A80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            <h2
              className="text-2xl md:text-3xl font-black text-[#233551] mt-2 leading-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {t.fullName}
            </h2>

            {credentials.length > 0 && (
              <p className="text-sm text-[#233551]/50 mt-1">{credentials.join(' · ')}</p>
            )}
            {(t.yearsExperience > 0 || t.pronouns) && (
              <p className="text-xs text-[#233551]/40 mt-0.5">
                {[
                  t.yearsExperience > 0 ? `${t.yearsExperience} years of experience` : null,
                  t.pronouns,
                ].filter(Boolean).join(' · ')}
              </p>
            )}

            {/* Tagline quote */}
            {t.tagline && (
              <div className="mt-3 pl-3 border-l-2 border-[#7EC0B7]">
                <p className="text-base italic text-[#233551]/75 leading-snug" style={{ fontFamily: 'var(--font-lato)' }}>
                  &ldquo;{t.tagline}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specializations */}
        {t.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
            {t.specializations.map((s, i) => (
              <Chip key={s} label={s} i={i} />
            ))}
          </div>
        )}

        {t.approach && (
          <p className="text-xs text-[#233551]/45 mt-3 text-center sm:text-left">
            <span className="font-semibold text-[#233551]/55">Approach:</span> {t.approach}
          </p>
        )}

        {/* About */}
        {t.bio && (
          <section className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">
              About {tFirst}
            </h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{t.bio}</p>
          </section>
        )}

        {/* What to expect */}
        {t.sessionExpectations && (
          <section className="mt-5">
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">
              What sessions look like
            </h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{t.sessionExpectations}</p>
          </section>
        )}

        {/* Experience */}
        {t.previousExperience && (
          <section className="mt-5">
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">
              Experience
            </h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{t.previousExperience}</p>
          </section>
        )}

        {/* Why we matched you — admin's interview summary */}
        {proposal.adminSummary && (
          <section className="mt-6 bg-[#FFF5F2] border border-[#E8926A]/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[#C56A42] uppercase tracking-wider mb-1.5">
              Why we think you&apos;ll click
            </h3>
            <p className="text-sm text-[#233551]/75 leading-relaxed whitespace-pre-wrap">{proposal.adminSummary}</p>
          </section>
        )}

        {/* Languages */}
        {t.languages.length > 0 && (
          <p className="text-sm text-[#233551]/55 mt-5">
            <span className="font-semibold text-[#233551]/65">Speaks:</span> {t.languages.join(', ')}
          </p>
        )}

        {/* How it works */}
        <section className="mt-6 bg-[#7EC0B7]/10 border border-[#7EC0B7]/20 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-[#3D8A80] uppercase tracking-wider mb-2.5">
            How sessions work
          </h3>
          <ul className="space-y-2">
            {[
              `Book sessions around ${tFirst}'s availability — you're always in control of when you meet.`,
              'Pay as you go, one session at a time.',
              `Or take a monthly bundle of 4 sessions and save ${BUNDLE_DISCOUNT_PCT}%.`,
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-[#233551]/70 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7] mt-1.5 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing */}
        <section className="mt-5 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-stretch divide-x divide-slate-200">
            <div className="flex-1 p-4">
              <p className="text-xs text-[#233551]/45 font-semibold uppercase tracking-wider">Per session</p>
              <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
                {formatInr(perSession)}
              </p>
              <p className="text-xs text-[#233551]/40 mt-0.5">Pay as you go</p>
            </div>
            <div className="flex-1 p-4 bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#233551]/45 font-semibold uppercase tracking-wider">Monthly bundle</p>
                <span className="text-[10px] font-bold text-white bg-[#E8926A] px-1.5 py-0.5 rounded-full">
                  Save {BUNDLE_DISCOUNT_PCT}%
                </span>
              </div>
              <p className="text-2xl font-black text-[#233551] mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
                {formatInr(bundle)}
              </p>
              <p className="text-xs text-[#233551]/40 mt-0.5">4 sessions / month</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={onChoose}
          disabled={disabled}
          className="mt-6 w-full bg-[#233551] text-white text-sm font-bold py-3.5 rounded-full hover:bg-[#2d4568] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {isPending ? 'Starting your chat…' : `Start a free chat with ${tFirst}`}
        </button>
        <p className="text-xs text-[#233551]/35 text-center mt-2.5">
          Free to start · no payment yet
        </p>
        {proposal.tier === 'standard' && (
          <p className="text-xs text-[#233551]/50 text-center mt-3 leading-relaxed">
            Not sure yet? Start here — you can always switch to a Professional therapist later.
          </p>
        )}
      </div>
    </div>
  )
}
