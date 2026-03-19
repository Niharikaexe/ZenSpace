'use client'

import { useState, useTransition } from 'react'
import { createMatch } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import type { UnmatchedClient, TherapistWithProfile } from './AdminDashboard'

interface Props {
  client: UnmatchedClient
  therapists: TherapistWithProfile[]
  onClose: () => void
}

export default function MatchModal({ client, therapists, onClose }: Props) {
  const [selectedTherapistUserId, setSelectedTherapistUserId] = useState('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!selectedTherapistUserId) {
      setError('Please select a therapist.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await createMatch(client.id, selectedTherapistUserId, notes)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Match a Therapist</h2>
            <p className="text-sm text-slate-500 mt-0.5">for {client.full_name}</p>
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
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Client Profile</p>
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
            {client.clientProfile?.therapy_goals && (
              <div className="mt-3">
                <p className="text-xs text-slate-400">Therapy goals</p>
                <p className="text-sm text-slate-700 mt-1 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed">
                  {client.clientProfile.therapy_goals}
                </p>
              </div>
            )}
          </div>

          {/* Therapist Selection */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select Therapist
              <span className="ml-2 text-slate-500 normal-case font-normal">
                ({therapists.length} verified & available)
              </span>
            </p>

            {therapists.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-medium text-slate-600">No verified therapists available</p>
                <p className="text-sm mt-1">Go to the Therapists tab to verify a therapist first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {therapists.map(therapist => {
                  const isSelected = selectedTherapistUserId === therapist.user_id
                  const atCapacity = therapist.activeMatchCount >= therapist.weekly_capacity
                  return (
                    <label
                      key={therapist.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        atCapacity
                          ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50'
                          : isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="therapist"
                        value={therapist.user_id}
                        checked={isSelected}
                        disabled={atCapacity}
                        onChange={() => setSelectedTherapistUserId(therapist.user_id)}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900">
                            {therapist.profile?.full_name}
                          </span>
                          <span className="text-xs text-slate-500">{therapist.years_experience}y exp</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            atCapacity
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {therapist.activeMatchCount}/{therapist.weekly_capacity} clients
                            {atCapacity && ' — full'}
                          </span>
                        </div>
                        {therapist.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {therapist.specializations.slice(0, 4).map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                                {s}
                              </span>
                            ))}
                            {therapist.specializations.length > 4 && (
                              <span className="text-xs text-slate-400">+{therapist.specializations.length - 4}</span>
                            )}
                          </div>
                        )}
                        {therapist.bio && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{therapist.bio}</p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="px-6 pb-6">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Match Notes <span className="font-normal text-slate-400 normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Why is this therapist a good fit for this client?"
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
            />
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
              disabled={isPending || !selectedTherapistUserId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isPending ? 'Matching...' : 'Confirm Match'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
