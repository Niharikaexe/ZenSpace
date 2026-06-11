// Therapist profile side panel — shown on both Chat and Sessions pages.
// Styled to mirror the Standard/Professional therapist match-selection card
// (TherapistMatchSelection): accent bar, rounded photo, large name, verified
// badge, alternating teal/coral chips, and a divided "About" section.

export type TherapistPanelData = {
  fullName: string
  avatarUrl: string | null
  tagline: string | null
  specializations: string[]
  bio: string | null
  approach: string | null
  education: string | null
  licenseCountry: string | null
  sessionExpectations: string | null
  pronouns: string | null
  previousExperience: string | null
  yearsExperience: number
  languages: string[]
  isVerified: boolean
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Chip({ label, i }: { label: string; i: number }) {
  // Alternate teal / coral tints, like the match-selection card.
  const styles = i % 2 === 0
    ? 'bg-[#7EC0B7]/15 text-[#3D8A80]'
    : 'bg-[#E8926A]/15 text-[#C56A42]'
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${styles}`}>
      {label}
    </span>
  )
}

export default function TherapistSidePanel({ therapist }: { therapist: TherapistPanelData }) {
  const firstName = therapist.fullName.split(' ')[0]
  const credentials = [
    therapist.education,
    therapist.licenseCountry ? `Licensed · ${therapist.licenseCountry}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col h-full">
      {/* Top accent bar — matches the match-selection card */}
      <div className="h-1.5 bg-gradient-to-r from-[#7EC0B7] via-[#7EC0B7] to-[#E8926A]" />

      {/* Hero: photo + name */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <div className="flex flex-col items-center text-center">
          {/* Photo */}
          <div className="w-24 h-24 rounded-3xl bg-[#FFF5F2] border border-[#E8926A]/15 p-1.5">
            {therapist.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={therapist.avatarUrl}
                alt={therapist.fullName}
                className="w-full h-full rounded-[1.1rem] object-cover"
              />
            ) : (
              <div
                className="w-full h-full rounded-[1.1rem] bg-[#233551] text-white font-black text-2xl flex items-center justify-center"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {initials(therapist.fullName)}
              </div>
            )}
          </div>

          {/* "Your therapist" pill */}
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#3D8A80] bg-[#7EC0B7]/15 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
            Your therapist
          </span>

          {/* Name */}
          <h2
            className="text-xl font-black text-[#233551] mt-2 leading-tight"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {therapist.fullName}
          </h2>

          {/* Verified + experience */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            {therapist.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D8A80]">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <circle cx="8" cy="8" r="7" fill="#7EC0B7" fillOpacity="0.2" />
                  <path d="M5 8l2 2 4-4" stroke="#3D8A80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            )}
            {therapist.yearsExperience > 0 && (
              <span className="text-xs text-[#233551]/40">{therapist.yearsExperience} years of experience</span>
            )}
            {therapist.pronouns && (
              <span className="text-xs text-[#233551]/40">· {therapist.pronouns}</span>
            )}
          </div>

          {credentials.length > 0 && (
            <p className="text-xs text-[#233551]/50 mt-1">{credentials.join(' · ')}</p>
          )}

          {/* Tagline quote */}
          {therapist.tagline && (
            <div className="mt-3 pl-3 border-l-2 border-[#7EC0B7] text-left self-stretch">
              <p className="text-sm italic text-[#233551]/75 leading-snug" style={{ fontFamily: 'var(--font-lato)' }}>
                &ldquo;{therapist.tagline}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto mc-scroll">
        {therapist.specializations.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Specialises in</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.specializations.map((s, i) => (
                <Chip key={s} label={s} i={i} />
              ))}
            </div>
          </div>
        )}

        {therapist.approach && (
          <p className="text-xs text-[#233551]/45">
            <span className="font-semibold text-[#233551]/55">Approach:</span> {therapist.approach}
          </p>
        )}

        {therapist.bio && (
          <section className="pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">About {firstName}</h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.bio}</p>
          </section>
        )}

        {therapist.sessionExpectations && (
          <section>
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">What sessions look like</h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.sessionExpectations}</p>
          </section>
        )}

        {therapist.previousExperience && (
          <section>
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Experience</h3>
            <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.previousExperience}</p>
          </section>
        )}

        {therapist.languages.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Speaks</h3>
            <div className="flex flex-wrap gap-1.5">
              {therapist.languages.map(l => (
                <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-[#233551]/60 font-medium">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
