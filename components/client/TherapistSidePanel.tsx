// Therapist profile side panel — shown on both Chat and Sessions pages.

export type TherapistPanelData = {
  fullName: string
  avatarUrl: string | null
  specializations: string[]
  bio: string | null
  approach: string | null
  yearsExperience: number
  languages: string[]
  availabilityText: string | null
  isVerified: boolean
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function TherapistSidePanel({ therapist }: { therapist: TherapistPanelData }) {
  return (
    <div className="flex flex-col h-full">
      {/* Avatar + name */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#7EC0B7]/20 text-[#3D8A80] font-black text-lg flex items-center justify-center flex-shrink-0">
            {initials(therapist.fullName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-black text-[#233551] text-base leading-tight">{therapist.fullName}</p>
              {therapist.isVerified && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#3D8A80] bg-[#7EC0B7]/15 px-1.5 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
              <p className="text-xs text-[#3D8A80] font-medium">Your therapist</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-2">
          {therapist.yearsExperience > 0 && (
            <div className="flex-1 text-center py-2 bg-slate-50 rounded-xl">
              <p className="text-base font-black text-[#233551]">{therapist.yearsExperience}</p>
              <p className="text-[10px] text-[#233551]/40 font-medium">Yrs exp</p>
            </div>
          )}
          {therapist.specializations.length > 0 && (
            <div className="flex-1 text-center py-2 bg-slate-50 rounded-xl">
              <p className="text-base font-black text-[#233551]">{therapist.specializations.length}</p>
              <p className="text-[10px] text-[#233551]/40 font-medium">Specialisms</p>
            </div>
          )}
          {therapist.languages.length > 0 && (
            <div className="flex-1 text-center py-2 bg-slate-50 rounded-xl">
              <p className="text-base font-black text-[#233551]">{therapist.languages.length}</p>
              <p className="text-[10px] text-[#233551]/40 font-medium">Languages</p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto">
        {therapist.specializations.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mb-2">Specialises in</p>
            <div className="flex flex-wrap gap-1.5">
              {therapist.specializations.map(s => (
                <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-[#7EC0B7]/12 text-[#3D8A80] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {therapist.approach && (
          <div>
            <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mb-1.5">Approach</p>
            <p className="text-sm text-[#233551]/70 leading-relaxed">{therapist.approach}</p>
          </div>
        )}

        {therapist.bio && (
          <div>
            <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mb-1.5">About</p>
            <p className="text-sm text-[#233551]/70 leading-relaxed">{therapist.bio}</p>
          </div>
        )}

        {therapist.languages.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mb-1.5">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {therapist.languages.map(l => (
                <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-[#233551]/60 font-medium">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {therapist.availabilityText && (
          <div>
            <p className="text-[10px] font-black text-[#233551]/35 uppercase tracking-widest mb-1.5">General availability</p>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-line">{therapist.availabilityText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
