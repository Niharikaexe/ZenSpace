'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveQuestionnaire } from '@/app/actions/questionnaire'

type SharedAnswers = {
  q1: string   // How long together
  q2: string   // Relationship status
  q3: string[] // What brought you here (multi-select)
  q4: string   // How long has it been an issue
  q9: string   // Therapist gender preference
  q10: string  // Prior therapy
  q11: string  // Success definition
}

type PartnerAnswers = {
  q5: string  // How do you feel about the relationship
  q6: string  // Do you feel heard
  q7: string  // Something unsaid (textarea)
  q8: string  // Anything else for therapist (textarea)
}

const initialShared: SharedAnswers = { q1: '', q2: '', q3: [], q4: '', q9: '', q10: '', q11: '' }
const initialPartner: PartnerAnswers = { q5: '', q6: '', q7: '', q8: '' }

function OptionButton({
  selected, onClick, children, className,
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl text-sm font-medium border-2 transition-all px-4 py-3 text-left',
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

function sectionLabel(phase: string, privateQ: number, current: number) {
  if (phase === 'shared-a') return 'Section A — About Your Relationship'
  if (phase === 'partner1-private' || phase === 'partner2-private') return 'Section B — Your Perspective (Private)'
  return 'Section C — Preferences'
}

type Phase = 'shared-a' | 'partner1-private' | 'handover' | 'partner2-private' | 'shared-c'

export default function CouplesQuestionnairePage() {
  const router = useRouter()
  const [attendingAlone, setAttendingAlone] = useState<boolean | null>(null)
  const [shared, setShared] = useState<SharedAnswers>(initialShared)
  const [partner1, setPartner1] = useState<PartnerAnswers>(initialPartner)
  const [partner2, setPartner2] = useState<PartnerAnswers>(initialPartner)
  const [current, setCurrent] = useState(1)
  const [phase, setPhase] = useState<Phase>('shared-a')
  const [privateQ, setPrivateQ] = useState(5)
  const [currentPartner, setCurrentPartner] = useState<1 | 2>(1)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })
  }, [])

  function updateShared<K extends keyof SharedAnswers>(key: K, value: SharedAnswers[K]) {
    setShared(prev => ({ ...prev, [key]: value }))
  }

  function toggleMultiShared(value: string) {
    setShared(prev => ({
      ...prev,
      q3: prev.q3.includes(value) ? prev.q3.filter(v => v !== value) : [...prev.q3, value],
    }))
  }

  function updatePartner(partner: 1 | 2, key: keyof PartnerAnswers, value: string) {
    if (partner === 1) setPartner1(prev => ({ ...prev, [key]: value }))
    else setPartner2(prev => ({ ...prev, [key]: value }))
  }

  const partnerAnswers = currentPartner === 1 ? partner1 : partner2
  const isPrivate = phase === 'partner1-private' || phase === 'partner2-private'

  function canProceed(): boolean {
    if (phase === 'shared-a') {
      if (current === 1) return !!shared.q1
      if (current === 2) return !!shared.q2
      if (current === 3) return shared.q3.length > 0
      if (current === 4) return !!shared.q4
    }
    if (isPrivate) {
      if (privateQ === 5) return !!partnerAnswers.q5
      if (privateQ === 6) return !!partnerAnswers.q6
      return true // Q7 & Q8 textarea — optional
    }
    if (phase === 'shared-c') {
      if (current === 9) return !!shared.q9
      if (current === 10) return !!shared.q10
      if (current === 11) return !!shared.q11
    }
    return true
  }

  async function handleNext() {
    if (phase === 'shared-a') {
      if (current < 4) { setCurrent(c => c + 1); return }
      if (attendingAlone) { setPhase('shared-c'); setCurrent(9); return }
      setPhase('partner1-private'); setPrivateQ(5); setCurrentPartner(1); setCurrent(5); return
    }
    if (isPrivate) {
      if (privateQ < 8) { setPrivateQ(q => q + 1); setCurrent(c => c + 1); return }
      if (phase === 'partner1-private') { setPhase('handover'); return }
      setPhase('shared-c'); setCurrent(9); return
    }
    if (phase === 'handover') {
      setPhase('partner2-private'); setPrivateQ(5); setCurrentPartner(2); setCurrent(5); return
    }
    if (phase === 'shared-c') {
      if (current < 11) { setCurrent(c => c + 1); return }
      const data = {
        type: 'couples',
        attendingAlone,
        shared,
        partner1,
        ...(attendingAlone ? {} : { partner2 }),
      }
      if (isAuthenticated) {
        setSubmitting(true)
        setSaveError(null)
        const result = await saveQuestionnaire(data)
        setSubmitting(false)
        if (result.error) { setSaveError(result.error); return }
        router.push('/dashboard')
      } else {
        sessionStorage.setItem('zenspace_questionnaire', JSON.stringify(data))
        router.push('/signup')
      }
    }
  }

  function handleBack() {
    if (phase === 'shared-a' && current > 1) { setCurrent(c => c - 1); return }
    if (isPrivate) {
      if (privateQ > 5) { setPrivateQ(q => q - 1); setCurrent(c => c - 1); return }
      if (phase === 'partner1-private') { setPhase('shared-a'); setCurrent(4) }
    }
    if (phase === 'shared-c' && current > 9) { setCurrent(c => c - 1) }
  }

  function progressPercent(): number {
    const total = attendingAlone ? 11 : 15
    let done = 0
    if (phase === 'shared-a') done = current - 1
    else if (phase === 'partner1-private') done = 4 + (privateQ - 5)
    else if (phase === 'handover') done = 8
    else if (phase === 'partner2-private') done = 8 + (privateQ - 5)
    else if (phase === 'shared-c') done = (attendingAlone ? 8 : 12) + (current - 9)
    return Math.round((done / total) * 100)
  }

  // ── Gate: attending alone? ─────────────────────────────────────────────────
  if (attendingAlone === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/">
              <span className="font-black text-2xl tracking-tight text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>ZenSpace</span>
            </Link>
            <p className="text-sm text-[#3D8A80] mt-1">Couples therapy assessment</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
              Before we start
            </h2>
            <p className="text-sm text-[#233551]/60 mb-8 leading-relaxed">
              Each partner fills in this questionnaire separately. Private answers are not shared with each other — only with your therapist.
            </p>
            <div className="space-y-3">
              {[
                { label: "Both partners are here", sub: "Each of you will answer the private section separately", alone: false },
                { label: "I'm attending alone", sub: "Only your answers will be collected", alone: true },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setAttendingAlone(opt.alone)}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-[#233551] text-sm" style={{ fontFamily: 'var(--font-lato)' }}>{opt.label}</p>
                    <p className="text-xs text-[#233551]/50 mt-0.5">{opt.sub}</p>
                  </div>
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#7EC0B7] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Handover screen ────────────────────────────────────────────────────────
  if (phase === 'handover') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 text-[#3D8A80]">
              <path d="M16 4a12 12 0 110 24A12 12 0 0116 4z" stroke="currentColor" strokeWidth="2"/>
              <path d="M11 16l3.5 3.5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
            Partner 1 is done.
          </h2>
          <p className="text-sm text-[#233551]/60 leading-relaxed mb-8 max-w-sm mx-auto">
            Hand the device to Partner 2. Their answers are private — Partner 1 won&apos;t see them. Only your therapist reads both.
          </p>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#2d4568] transition-colors shadow-lg shadow-[#233551]/20"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Partner 2, start here →
          </button>
        </div>
      </div>
    )
  }

  // ── Main questionnaire ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Top progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-black text-lg text-[#233551] flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
            ZenSpace
          </Link>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7EC0B7] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent()}%` }}
            />
          </div>
          <span className="text-xs text-[#233551]/40 flex-shrink-0">{progressPercent()}%</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">
            {sectionLabel(phase, privateQ, current)}
          </span>
          {isPrivate && (
            <span className="text-xs font-bold text-white bg-[#E8926A] px-3 py-1 rounded-full">
              Partner {currentPartner} · Private
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">

          {/* Section A */}
          {phase === 'shared-a' && current === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>How long have you been together?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Less than 1 year', '1–3 years', '3–7 years', '7–15 years', 'More than 15 years'].map(opt => (
                  <OptionButton key={opt} selected={shared.q1 === opt} onClick={() => updateShared('q1', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'shared-a' && current === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Are you married, engaged, or in a long-term relationship?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Married', 'Engaged', 'Long-term relationship (not married)', "We're figuring that out too"].map(opt => (
                  <OptionButton key={opt} selected={shared.q2 === opt} onClick={() => updateShared('q2', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'shared-a' && current === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>What has brought you to couples therapy right now?</h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Communication — we can't seem to talk without it turning into a fight",
                  "Distance — we've grown apart emotionally",
                  "A specific event or betrayal",
                  "Recurring conflict we can't resolve",
                  "Intimacy or physical connection",
                  "Family pressure (in-laws, parents, extended family)",
                  "Financial disagreements",
                  "Different life goals or values",
                  "We're generally okay but want to get better at this",
                  "Something else",
                ].map(opt => (
                  <OptionButton key={opt} selected={shared.q3.includes(opt)} onClick={() => toggleMultiShared(opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'shared-a' && current === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>How long has this been an issue?</h2>
              <div className="grid grid-cols-1 gap-2">
                {["It's recent — a few weeks or months", "Around 6 months to 1 year", "1–3 years", "Honestly, it's been there a long time"].map(opt => (
                  <OptionButton key={opt} selected={shared.q4 === opt} onClick={() => updateShared('q4', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Private questions */}
          {isPrivate && privateQ === 5 && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>How do you feel about the relationship right now?</h2>
              <div className="grid grid-cols-1 gap-2">
                {["I'm committed and want this to work", "I want it to work but I'm not sure it can", "I'm on the fence — I'm here to figure that out", "I need support navigating what comes next"].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.q5 === opt} onClick={() => updatePartner(currentPartner, 'q5', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateQ === 6 && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Do you feel heard by your partner?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Usually yes', 'Sometimes', 'Rarely', "I don't feel heard at all"].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.q6 === opt} onClick={() => updatePartner(currentPartner, 'q6', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateQ === 7 && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Is there something you&apos;ve wanted to say but haven&apos;t been able to?</h2>
              <p className="text-sm text-[#233551]/50">Optional.</p>
              <textarea
                value={partnerAnswers.q7}
                onChange={e => updatePartner(currentPartner, 'q7', e.target.value)}
                placeholder="You can be honest here. Your partner won't see this."
                className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {isPrivate && privateQ === 8 && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Is there anything you want your therapist to know about you before you begin?</h2>
              <p className="text-sm text-[#233551]/50">Optional.</p>
              <textarea
                value={partnerAnswers.q8}
                onChange={e => updatePartner(currentPartner, 'q8', e.target.value)}
                placeholder="Anything at all — background, concerns, things that help."
                className="w-full min-h-[120px] resize-none rounded-xl border-2 border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {/* Section C */}
          {phase === 'shared-c' && current === 9 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Do you have a preference for your therapist&apos;s gender?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Female therapist', 'Male therapist', 'No preference'].map(opt => (
                  <OptionButton key={opt} selected={shared.q9 === opt} onClick={() => updateShared('q9', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'shared-c' && current === 10 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Have either of you been in individual therapy before?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['Yes — I have', 'Yes — my partner has', 'Yes — both of us', 'No — this is new for both of us'].map(opt => (
                  <OptionButton key={opt} selected={shared.q10 === opt} onClick={() => updateShared('q10', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'shared-c' && current === 11 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>What does a successful couples therapy experience look like for you?</h2>
              <div className="grid grid-cols-1 gap-2">
                {['We communicate better', 'We resolve a specific conflict', 'We decide what we want with clarity', 'We feel like partners again', "I'm not sure yet"].map(opt => (
                  <OptionButton key={opt} selected={shared.q11 === opt} onClick={() => updateShared('q11', opt)}>{opt}</OptionButton>
                ))}
              </div>
              <p className="text-xs text-[#233551]/40 pt-2">
                Your partner does not see your private answers. Each person&apos;s responses are visible only to your therapist.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6 mt-2">
            {!(phase === 'partner2-private') && !(phase === 'shared-a' && current === 1) && (
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
              {submitting ? 'Saving...' : phase === 'shared-c' && current === 11 ? 'Find our therapist →' : 'Continue'}
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
    </div>
  )
}
