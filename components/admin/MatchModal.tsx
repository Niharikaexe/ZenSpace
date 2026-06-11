'use client'

import { useState, useTransition } from 'react'
import { createMatchProposals } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import type { UnmatchedClient, TherapistWithProfile } from './AdminDashboard'
import QuestionnaireDetails from './QuestionnaireDetails'

interface Props {
  client: UnmatchedClient
  therapists: TherapistWithProfile[]
  onClose: () => void
}

type Tier = 'standard' | 'professional'

const TIER_META: Record<Tier, { label: string; blurb: string; accent: string; ring: string; bg: string }> = {
  standard: {
    label: 'Standard',
    blurb: 'Basic-tier therapist — the more affordable per-session option.',
    accent: 'text-teal-700',
    ring: 'border-teal-500 bg-teal-50',
    bg: 'bg-teal-100 text-teal-700',
  },
  professional: {
    label: 'Professional',
    blurb: 'Premium-tier therapist — more experience, higher per-session price. Optional.',
    accent: 'text-amber-700',
    ring: 'border-amber-500 bg-amber-50',
    bg: 'bg-amber-100 text-amber-700',
  },
}

export default function MatchModal({ client, therapists, onClose }: Props) {
  const [selected, setSelected] = useState<Record<Tier, string>>({ standard: '', professional: '' })
  const [summaries, setSummaries] = useState<Record<Tier, string>>({ standard: '', professional: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const pickedCount = (selected.standard ? 1 : 0) + (selected.professional ? 1 : 0)

  const handleSubmit = () => {
    const picked: { tier: Tier; therapistId: string; summary: string }[] = []
    if (selected.standard) picked.push({ tier: 'standard', therapistId: selected.standard, summary: summaries.standard })
    if (selected.professional) picked.push({ tier: 'professional', therapistId: selected.professional, summary: summaries.professional })

    if (picked.length === 0) {
      setError('Pick at least one therapist.')
      return
    }
    if (picked.length === 2 && selected.standard === selected.professional) {
      setError('The two therapists must be different people.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await createMatchProposals(client.id, picked)
        onClose()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[admin/match-modal-throw]', {
          clientId: client.id,
          selected,
          err: e instanceof Error ? e.message : String(e),
        })
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // NOTE: this is a render *function* called inline ({renderTier('standard')}),
  // NOT a nested <Component/>. Declaring a component inside MatchModal would give
  // it a new identity on every render, remounting the section and making the
  // textarea/radios lose focus after each keystroke.
  const renderTier = (tier: Tier) => {
    const meta = TIER_META[tier]
    const otherTier: Tier = tier === 'standard' ? 'professional' : 'standard'
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg}`}>{meta.label}</span>
          <p className="text-xs text-slate-500">{meta.blurb}</p>
        </div>

        {therapists.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-medium text-slate-600">No verified therapists available</p>
            <p className="text-sm mt-1">Verify a therapist in the Therapists tab first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {therapists.map((therapist) => {
              const isSelected = selected[tier] === therapist.user_id
              const takenByOther = selected[otherTier] === therapist.user_id
              const atCapacity = therapist.activeMatchCount >= therapist.weekly_capacity
              const disabled = atCapacity || takenByOther
              return (
                <label
                  key={therapist.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50'
                      : isSelected
                      ? meta.ring
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name={`therapist-${tier}`}
                    value={therapist.user_id}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => setSelected((s) => ({ ...s, [tier]: therapist.user_id }))}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900">{therapist.profile?.full_name}</span>
                      <span className="text-xs text-slate-500">{therapist.years_experience}y exp</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        atCapacity ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {therapist.activeMatchCount}/{therapist.weekly_capacity} clients{atCapacity && ' — full'}
                      </span>
                      {takenByOther && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-slate-200 text-slate-500">
                          Picked for {TIER_META[otherTier].label}
                        </span>
                      )}
                    </div>
                    {therapist.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {therapist.specializations.slice(0, 4).map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                            {s}
                          </span>
                        ))}
                        {therapist.specializations.length > 4 && (
                          <span className="text-xs text-slate-400">+{therapist.specializations.length - 4}</span>
                        )}
                      </div>
                    )}
                    {therapist.bio && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{therapist.bio}</p>}
                  </div>
                </label>
              )
            })}
          </div>
        )}

        <textarea
          value={summaries[tier]}
          onChange={(e) => setSummaries((s) => ({ ...s, [tier]: e.target.value }))}
          placeholder={`Summary from your interview with this therapist (optional) — the client sees this on the ${meta.label} card.`}
          rows={2}
          className="mt-2.5 w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Match therapist(s)</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              for {client.full_name} —{' '}
              {pickedCount > 1
                ? 'two therapists: the client picks one'
                : 'one therapist matches them immediately; add a second to let them choose'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Client Summary */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick summary</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {client.clientProfile?.primary_concern && (
                  <div>
                    <p className="text-xs text-slate-400">Primary concern</p>
                    <p className="text-sm text-slate-700 capitalize font-medium mt-0.5">
                      {client.clientProfile.primary_concern.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
                {client.clientProfile?.gender && (
                  <div>
                    <p className="text-xs text-slate-400">Gender</p>
                    <p className="text-sm text-slate-700 capitalize font-medium mt-0.5">
                      {client.clientProfile.gender}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400">Therapist preference</p>
                  <p className="text-sm text-slate-700 capitalize font-medium mt-0.5">
                    {client.clientProfile?.preferred_therapist_gender || 'No preference'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Session type</p>
                  <p className="text-sm text-slate-700 capitalize font-medium mt-0.5">
                    {client.clientProfile?.preferred_session_type || 'Any'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Previous therapy</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">
                    {client.clientProfile?.previous_therapy ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            <QuestionnaireDetails
              responses={client.questionnaire?.responses ?? null}
              submittedAt={client.questionnaire?.submitted_at ?? null}
            />
          </div>

          {/* Dual therapist selection */}
          <div className="px-6 py-5 space-y-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select therapists
              <span className="ml-2 text-slate-500 normal-case font-normal">
                ({therapists.length} verified &amp; available)
              </span>
            </p>
            {renderTier('standard')}
            {renderTier('professional')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || pickedCount === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
            >
              {isPending
                ? (pickedCount > 1 ? 'Sending…' : 'Matching…')
                : pickedCount > 1 ? 'Send both proposals' : 'Match now'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
