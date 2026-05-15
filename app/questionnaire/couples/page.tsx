'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveQuestionnaire } from '@/app/actions/questionnaire'
import Footer from '@/components/home/Footer'

type CommonStepId =
  | 'c1' | 'c2' | 'c3'
  | 'c4' | 'c5' | 'c6'
  | 'c7' | 'c8'
  | 'c9' | 'c10' | 'c10a'
  | 'c11' | 'c12'

type CommonAnswers = {
  c1: string     // Relationship feels (single)
  c2: string     // Close/distant (single)
  c3: string     // Conflict pattern (single)
  c4: string     // Relationship status (single)
  c5: string     // Duration of difficulties (single)
  c6: string[]   // Areas of conflict (multi)
  c7: number     // Communication satisfaction 1-10 (0 = unset)
  c8: string     // Trust level (single)
  c9: string[]   // Goals (multi)
  c10: string    // Past couples counseling (single)
  c10a: string   // Style preference (single, conditional on c10)
  c11: string    // Gender preference (single)
  c12: string[]  // Identity/experience preferences (multi)
}

type PartnerAnswers = {
  p1: string   // Main problem (text)
  p2: string   // Motivation (single)
  p3: string   // Willingness to change (single)
  p4: string   // Emotional closeness (single)
  p5: string   // Sexual intimacy (single)
  p6: string   // Mental health (single)
}

const initialCommon: CommonAnswers = {
  c1: '', c2: '', c3: '',
  c4: '', c5: '', c6: [],
  c7: 0, c8: '',
  c9: [], c10: '', c10a: '',
  c11: '', c12: [],
}

const initialPartner: PartnerAnswers = {
  p1: '', p2: '', p3: '', p4: '', p5: '', p6: '',
}

type Phase = 'common' | 'partner1-private' | 'handover' | 'partner2-private'
const PRIVATE_STEPS: (keyof PartnerAnswers)[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']

function buildCommonSteps(a: CommonAnswers): CommonStepId[] {
  const steps: CommonStepId[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']
  if (a.c10 && a.c10 !== 'No') steps.push('c10a')
  steps.push('c11', 'c12')
  return steps
}

function commonSectionLabel(step: CommonStepId): string {
  if (step === 'c1' || step === 'c2' || step === 'c3') return 'Section A — Where the relationship is right now'
  if (step === 'c4' || step === 'c5' || step === 'c6') return 'Section B — The basics'
  if (step === 'c7' || step === 'c8') return "Section C — How it's working"
  if (step === 'c9' || step === 'c10' || step === 'c10a') return 'Section D — Goals & past therapy'
  return 'Section E — Your therapist'
}

function OptionButton({
  selected, onClick, children, className,
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl text-sm font-medium border-2 transition-all px-4 py-3 min-h-[48px] text-left',
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

export default function CouplesQuestionnairePage() {
  const router = useRouter()
  const [attendingAlone, setAttendingAlone] = useState<boolean | null>(null)
  const [common, setCommon] = useState<CommonAnswers>(initialCommon)
  const [partner1, setPartner1] = useState<PartnerAnswers>(initialPartner)
  const [partner2, setPartner2] = useState<PartnerAnswers>(initialPartner)
  const [phase, setPhase] = useState<Phase>('common')
  const [commonStepIndex, setCommonStepIndex] = useState(0)
  const [privateStepIndex, setPrivateStepIndex] = useState(0)
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

  const commonSteps = useMemo(() => buildCommonSteps(common), [common])
  const commonStep = commonSteps[commonStepIndex]
  const privateStep = PRIVATE_STEPS[privateStepIndex]
  const partnerAnswers = currentPartner === 1 ? partner1 : partner2
  const isPrivate = phase === 'partner1-private' || phase === 'partner2-private'

  function setCommonField<K extends keyof CommonAnswers>(key: K, value: CommonAnswers[K]) {
    setCommon(prev => ({ ...prev, [key]: value }))
  }

  function toggleCommonMulti(key: 'c6' | 'c9' | 'c12', value: string) {
    setCommon(prev => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function setPartnerField(partner: 1 | 2, key: keyof PartnerAnswers, value: string) {
    if (partner === 1) setPartner1(prev => ({ ...prev, [key]: value }))
    else setPartner2(prev => ({ ...prev, [key]: value }))
  }

  function canProceed(): boolean {
    if (phase === 'common') {
      switch (commonStep) {
        case 'c1': return !!common.c1
        case 'c2': return !!common.c2
        case 'c3': return !!common.c3
        case 'c4': return !!common.c4
        case 'c5': return !!common.c5
        case 'c6': return common.c6.length > 0
        case 'c7': return common.c7 > 0
        case 'c8': return !!common.c8
        case 'c9': return common.c9.length > 0
        case 'c10': return !!common.c10
        case 'c10a': return !!common.c10a
        case 'c11': return !!common.c11
        case 'c12': return true // optional
      }
    }
    if (isPrivate) {
      switch (privateStep) {
        case 'p1': return true // text optional
        case 'p2': return !!partnerAnswers.p2
        case 'p3': return !!partnerAnswers.p3
        case 'p4': return !!partnerAnswers.p4
        case 'p5': return !!partnerAnswers.p5
        case 'p6': return !!partnerAnswers.p6
      }
    }
    return true
  }

  async function submitAll() {
    const data = {
      type: 'couples',
      attendingAlone,
      common,
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
      sessionStorage.setItem('mindcanopy_questionnaire', JSON.stringify(data))
      router.push('/signup')
    }
  }

  async function handleNext() {
    if (phase === 'common') {
      if (commonStepIndex < commonSteps.length - 1) {
        setCommonStepIndex(i => i + 1)
        return
      }
      setPhase('partner1-private')
      setPrivateStepIndex(0)
      setCurrentPartner(1)
      return
    }
    if (isPrivate) {
      if (privateStepIndex < PRIVATE_STEPS.length - 1) {
        setPrivateStepIndex(i => i + 1)
        return
      }
      if (phase === 'partner1-private') {
        if (attendingAlone) {
          await submitAll()
          return
        }
        setPhase('handover')
        return
      }
      // partner2-private done → submit
      await submitAll()
      return
    }
  }

  function handleBack() {
    if (phase === 'common' && commonStepIndex > 0) {
      setCommonStepIndex(i => i - 1)
      return
    }
    if (isPrivate) {
      if (privateStepIndex > 0) {
        setPrivateStepIndex(i => i - 1)
        return
      }
      if (phase === 'partner1-private') {
        setPhase('common')
        setCommonStepIndex(commonSteps.length - 1)
      }
    }
  }

  function progressPercent(): number {
    const commonLen = commonSteps.length
    const total = attendingAlone
      ? commonLen + PRIVATE_STEPS.length
      : commonLen + PRIVATE_STEPS.length * 2 + 1 // +1 for handover
    let done = 0
    if (phase === 'common') done = commonStepIndex
    else if (phase === 'partner1-private') done = commonLen + privateStepIndex
    else if (phase === 'handover') done = commonLen + PRIVATE_STEPS.length
    else if (phase === 'partner2-private') done = commonLen + PRIVATE_STEPS.length + 1 + privateStepIndex
    return Math.round((done / total) * 100)
  }

  // ── Gate: attending alone? ───────────────────────────────────────────────────
  if (attendingAlone === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/">
              <span className="font-black text-2xl tracking-tight text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>MindCanopy</span>
            </Link>
            <p className="text-sm text-[#3D8A80] mt-1">Couples therapy assessment</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm">
            <h2 className="text-2xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
              Before we start
            </h2>
            <p className="text-sm text-[#233551]/60 mb-8 leading-relaxed">
              You&apos;ll answer some questions about your relationship together, then each partner answers a few private questions separately. Private answers are only seen by your therapist — not by each other.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Both partners are here', sub: 'Each of you will answer the private section separately', alone: false },
                { label: "I'm attending alone", sub: 'Only your answers will be collected', alone: true },
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

  // ── Handover screen ──────────────────────────────────────────────────────────
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
            onClick={() => {
              setPhase('partner2-private')
              setPrivateStepIndex(0)
              setCurrentPartner(2)
            }}
            className="inline-flex items-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-4 rounded-full hover:bg-[#2d4568] transition-colors shadow-lg shadow-[#233551]/20"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Partner 2, start here →
          </button>
        </div>
      </div>
    )
  }

  // ── Main questionnaire ───────────────────────────────────────────────────────
  const isLastStep =
    (phase === 'partner1-private' && attendingAlone && privateStepIndex === PRIVATE_STEPS.length - 1) ||
    (phase === 'partner2-private' && privateStepIndex === PRIVATE_STEPS.length - 1)

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-black text-lg text-[#233551] flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
            MindCanopy
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

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#3D8A80] uppercase tracking-widest">
            {phase === 'common'
              ? commonSectionLabel(commonStep)
              : 'Private — your partner does not see this'}
          </span>
          {isPrivate && (
            <span className="text-xs font-bold text-white bg-[#E8926A] px-3 py-1 rounded-full">
              Partner {currentPartner} · Private
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm">

          {/* ─── Common Section A ─────────────────────────────────────────── */}
          {phase === 'common' && commonStep === 'c1' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Many couples seek help when they feel stuck in patterns they can&apos;t shift alone. Which best describes how your relationship feels right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly good',
                  'Generally okay with some repeating issues',
                  'Often tense',
                  'Very strained — unsure what the future looks like',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c1 === opt} onClick={() => setCommonField('c1', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c2' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                When you think about your relationship lately, which statement feels closest?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'I usually feel supported and close',
                  'I feel close sometimes and distant at other times',
                  'I often feel distant, lonely, or misunderstood',
                  'I feel mostly disconnected or hurt',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c2 === opt} onClick={() => setCommonField('c2', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c3' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Which statement best describes how conflict feels in your relationship?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'We talk things through calmly',
                  'We argue but usually repair',
                  'Conflicts often escalate or stay unresolved',
                  'We avoid difficult topics because they feel too risky',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c3 === opt} onClick={() => setCommonField('c3', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* ─── Common Section B ─────────────────────────────────────────── */}
          {phase === 'common' && commonStep === 'c4' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you best describe your relationship status?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Dating less than 1 year',
                  'Dating more than 1 year',
                  'Living together',
                  'Married / long-term committed',
                  'Separated but in contact',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c4 === opt} onClick={() => setCommonField('c4', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c5' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How long have the current difficulties been a serious problem?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Less than 3 months', '3–12 months', '1–3 years', 'More than 3 years'].map(opt => (
                  <OptionButton key={opt} selected={common.c5 === opt} onClick={() => setCommonField('c5', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c6' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What are the main areas of conflict or concern?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Communication or feeling unheard',
                  'Trust, jealousy, or infidelity',
                  'Parenting or step-families',
                  'Sex and intimacy',
                  'Money or finances',
                  'Household responsibilities',
                  'Extended family or in-laws',
                  'Life goals, values, or cultural differences',
                  'Something else',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c6.includes(opt)} onClick={() => toggleCommonMulti('c6', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* ─── Common Section C ─────────────────────────────────────────── */}
          {phase === 'common' && commonStep === 'c7' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How satisfied are you with communication in your relationship?
              </h2>
              <p className="text-sm text-[#233551]/50">1 = very unsatisfied · 10 = very satisfied</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCommonField('c7', n)}
                    className={cn(
                      'rounded-xl border-2 transition-all py-4 text-center font-black text-base',
                      common.c7 === n
                        ? 'bg-[#233551] text-white border-[#233551]'
                        : 'bg-white text-[#233551] border-slate-200 hover:border-[#7EC0B7] hover:bg-[#7EC0B7]/5'
                    )}
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c8' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you describe the level of trust in the relationship right now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Strong', 'Mixed', 'Seriously damaged', 'Hard to trust at all'].map(opt => (
                  <OptionButton key={opt} selected={common.c8 === opt} onClick={() => setCommonField('c8', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* ─── Common Section D ─────────────────────────────────────────── */}
          {phase === 'common' && commonStep === 'c9' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                What are your main goals for couples therapy?
              </h2>
              <p className="text-sm text-[#233551]/50">Select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Improve communication',
                  'Rebuild trust',
                  'Reduce conflict and arguments',
                  'Improve emotional closeness',
                  'Improve sexual intimacy',
                  'Decide whether to stay together or separate',
                  'Learn to co-parent more effectively',
                  'Something else',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c9.includes(opt)} onClick={() => toggleCommonMulti('c9', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c10' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Have you and your partner had couples counseling before?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['No', 'Yes, once', 'Yes, multiple times', "I'm not sure"].map(opt => (
                  <OptionButton key={opt} selected={common.c10 === opt} onClick={() => setCommonField('c10', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c10a' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Thinking about what worked or didn&apos;t in past therapy, what kind of therapist style suits you both best now?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Mostly listening and supportive',
                  'Balanced listening and gentle challenge',
                  'Structured and practical — tools and homework',
                  'Very direct and honest',
                  'Not sure yet — open',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c10a === opt} onClick={() => setCommonField('c10a', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* ─── Common Section E ─────────────────────────────────────────── */}
          {phase === 'common' && commonStep === 'c11' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you have a preference about your therapist&apos;s gender?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "I'd prefer a female therapist",
                  "I'd prefer a male therapist",
                  "I'd prefer a non-binary or gender-diverse therapist",
                  'No strong preference',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c11 === opt} onClick={() => setCommonField('c11', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {phase === 'common' && commonStep === 'c12' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Are there any specific experiences or identities you&apos;d like your therapist to be familiar with?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — select all that apply.</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Infidelity or affair recovery',
                  'Sexless or low-desire relationships',
                  'Non-monogamy, polyamory, or open relationships',
                  'Intercultural or interreligious couples',
                  'LGBTQ+ affirming',
                  'Same-sex / queer relationships',
                  'Trauma (within or outside the relationship)',
                  'Addiction or substance use in the relationship',
                  'Neurodiversity (ADHD or autism in one or both partners)',
                  'Familiar with our cultural or religious background',
                  'No specific preferences',
                ].map(opt => (
                  <OptionButton key={opt} selected={common.c12.includes(opt)} onClick={() => toggleCommonMulti('c12', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* ─── Private Section ──────────────────────────────────────────── */}
          {isPrivate && privateStep === 'p1' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                In your own words, what is the main problem or concern bringing you to couples therapy?
              </h2>
              <p className="text-sm text-[#233551]/50">Optional — your partner won&apos;t see this.</p>
              <textarea
                value={partnerAnswers.p1}
                onChange={e => setPartnerField(currentPartner, 'p1', e.target.value)}
                placeholder="You can be honest here. Only your therapist reads this."
                className="w-full min-h-[140px] resize-none rounded-xl border border-slate-200 focus:border-[#7EC0B7] focus:outline-none px-4 py-3 text-sm text-[#233551] leading-relaxed"
              />
            </div>
          )}

          {isPrivate && privateStep === 'p2' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Right now, how motivated do you feel personally to work on this relationship?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Very motivated',
                  'Somewhat motivated',
                  'Unsure',
                  'Not very motivated, but willing to explore in therapy',
                  'Prefer not to say',
                ].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.p2 === opt} onClick={() => setPartnerField(currentPartner, 'p2', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateStep === 'p3' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How willing are you to make changes in your own behavior for the relationship?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {['Very willing', 'Somewhat willing', 'Unsure', 'Not very willing right now'].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.p3 === opt} onClick={() => setPartnerField(currentPartner, 'p3', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateStep === 'p4' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How emotionally close do you feel to your partner most of the time?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Very close and connected',
                  'Somewhat close',
                  'Often distant or disconnected',
                  'Mostly emotionally disconnected',
                ].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.p4 === opt} onClick={() => setPartnerField(currentPartner, 'p4', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateStep === 'p5' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                How would you describe your satisfaction with physical and sexual intimacy in this relationship?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Satisfied',
                  'Mixed — up and down',
                  'Often unsatisfied',
                  'Very unsatisfied or mostly absent',
                  'Prefer not to say',
                ].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.p5 === opt} onClick={() => setPartnerField(currentPartner, 'p5', opt)}>{opt}</OptionButton>
                ))}
              </div>
            </div>
          )}

          {isPrivate && privateStep === 'p6' && (
            <div className="space-y-5">
              <p className="text-xs font-bold text-[#E8926A] uppercase tracking-wider">Only you and your therapist see this</p>
              <h2 className="text-xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
                Do you currently experience mental health challenges (depression, anxiety, trauma) that affect the relationship?
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'No',
                  "Yes, but I'm managing",
                  "Yes, and it's significantly affecting things",
                  "I'm currently in treatment / working on it",
                  'Prefer not to say',
                ].map(opt => (
                  <OptionButton key={opt} selected={partnerAnswers.p6 === opt} onClick={() => setPartnerField(currentPartner, 'p6', opt)}>{opt}</OptionButton>
                ))}
              </div>
              <p className="text-xs text-[#233551]/40 pt-2">
                Each partner&apos;s private answers are visible only to your therapist.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6 mt-2">
            {!(phase === 'common' && commonStepIndex === 0) && !(phase === 'partner2-private') && (
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
              {submitting ? 'Saving...' : isLastStep ? 'Find our therapist →' : 'Continue'}
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
      <Footer />
    </div>
  )
}
