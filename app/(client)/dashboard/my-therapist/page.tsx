import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClientNav from '@/components/client/ClientNav'
import type { TherapistPanelData } from '@/components/client/TherapistSidePanel'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// Alternating teal / coral chips — same as the match-selection card.
function Chip({ label, i }: { label: string; i: number }) {
  const styles = i % 2 === 0 ? 'bg-[#7EC0B7]/15 text-[#3D8A80]' : 'bg-[#E8926A]/15 text-[#C56A42]'
  return <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${styles}`}>{label}</span>
}

export default async function MyTherapistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string; role: string } | null; error: unknown }

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  const { data: match } = await supabase
    .from('matches')
    .select('id, therapist_id, created_at')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string; created_at: string } | null; error: unknown }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <ClientNav userName={profile.full_name} isMatched={false} />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#3D8A80]">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
            Not matched yet
          </h1>
          <p className="text-sm text-[#233551]/50 mb-6">
            We&apos;re finding the right therapist for you. Check back in 24–48 hours.
          </p>
          <Link href="/dashboard" className="text-sm text-[#3D8A80] hover:underline">← Back to dashboard</Link>
        </main>
      </div>
    )
  }

  const admin = createAdminClient()
  const [tProfileResult, tUserResult] = await Promise.all([
    (admin as any).from('therapist_profiles').select('specializations, bio, approach, years_experience, languages, is_verified, tagline, education, license_country, session_expectations, pronouns, previous_experience').eq('user_id', match.therapist_id).maybeSingle(),
    (admin as any).from('profiles').select('full_name, avatar_url').eq('id', match.therapist_id).maybeSingle(),
  ])

  const tProfile = tProfileResult.data
  const tUser = tUserResult.data

  const therapist: TherapistPanelData | null = tUser && tProfile ? {
    fullName: tUser.full_name ?? 'Your Therapist',
    avatarUrl: tUser.avatar_url ?? null,
    tagline: tProfile.tagline ?? null,
    specializations: tProfile.specializations ?? [],
    bio: tProfile.bio ?? null,
    approach: tProfile.approach ?? null,
    education: tProfile.education ?? null,
    licenseCountry: tProfile.license_country ?? null,
    sessionExpectations: tProfile.session_expectations ?? null,
    pronouns: tProfile.pronouns ?? null,
    previousExperience: tProfile.previous_experience ?? null,
    yearsExperience: tProfile.years_experience ?? 0,
    languages: tProfile.languages ?? ['English'],
    isVerified: tProfile.is_verified ?? false,
  } : null

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ClientNav userName={profile.full_name} isMatched={true} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#233551]/45 hover:text-[#233551] transition-colors mb-6">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-black text-[#233551] mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          My Therapist
        </h1>

        {therapist && (() => {
          const tFirst = therapist.fullName.split(' ')[0]
          const credentials = [
            therapist.education,
            therapist.licenseCountry ? `Licensed · ${therapist.licenseCountry}` : null,
          ].filter(Boolean) as string[]

          return (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              {/* Top accent bar — same design as the match-selection card */}
              <div className="h-1.5 bg-gradient-to-r from-[#7EC0B7] via-[#7EC0B7] to-[#E8926A]" />

              <div className="p-6 md:p-7">
                {/* Hero */}
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Photo */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-32 h-32 rounded-3xl bg-[#FFF5F2] border border-[#E8926A]/15 p-1.5">
                      {therapist.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={therapist.avatarUrl} alt={therapist.fullName} className="w-full h-full rounded-[1.1rem] object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-[1.1rem] bg-[#233551] text-white font-black text-4xl flex items-center justify-center" style={{ fontFamily: 'var(--font-lato)' }}>
                          {initials(therapist.fullName)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    {therapist.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D8A80]">
                        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                          <circle cx="8" cy="8" r="7" fill="#7EC0B7" fillOpacity="0.2" />
                          <path d="M5 8l2 2 4-4" stroke="#3D8A80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified
                      </span>
                    )}

                    <h2 className="text-2xl md:text-3xl font-black text-[#233551] mt-1 leading-tight" style={{ fontFamily: 'var(--font-lato)' }}>
                      {therapist.fullName}
                    </h2>

                    {credentials.length > 0 && (
                      <p className="text-sm text-[#233551]/50 mt-1">{credentials.join(' · ')}</p>
                    )}
                    {(therapist.yearsExperience > 0 || therapist.pronouns) && (
                      <p className="text-xs text-[#233551]/40 mt-0.5">
                        {[
                          therapist.yearsExperience > 0 ? `${therapist.yearsExperience} years of experience` : null,
                          therapist.pronouns,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-[#233551]/40 mt-0.5">Matched since {formatDate(match.created_at)}</p>

                    {/* Tagline quote */}
                    {therapist.tagline && (
                      <div className="mt-3 pl-3 border-l-2 border-[#7EC0B7]">
                        <p className="text-base italic text-[#233551]/75 leading-snug" style={{ fontFamily: 'var(--font-lato)' }}>
                          &ldquo;{therapist.tagline}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                {therapist.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
                    {therapist.specializations.map((s, i) => (
                      <Chip key={s} label={s} i={i} />
                    ))}
                  </div>
                )}

                {therapist.approach && (
                  <p className="text-xs text-[#233551]/45 mt-3 text-center sm:text-left">
                    <span className="font-semibold text-[#233551]/55">Approach:</span> {therapist.approach}
                  </p>
                )}

                {/* About */}
                {therapist.bio && (
                  <section className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">About {tFirst}</h3>
                    <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.bio}</p>
                  </section>
                )}

                {/* What sessions look like */}
                {therapist.sessionExpectations && (
                  <section className="mt-5">
                    <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">What sessions look like</h3>
                    <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.sessionExpectations}</p>
                  </section>
                )}

                {/* Experience */}
                {therapist.previousExperience && (
                  <section className="mt-5">
                    <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Experience</h3>
                    <p className="text-sm text-[#233551]/70 leading-relaxed whitespace-pre-wrap">{therapist.previousExperience}</p>
                  </section>
                )}

                {/* Languages */}
                {therapist.languages.length > 0 && (
                  <section className="mt-5">
                    <h3 className="text-xs font-bold text-[#233551]/40 uppercase tracking-wider mb-2">Speaks</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {therapist.languages.map(l => (
                        <span key={l} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-[#233551]/60 font-medium">{l}</span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Actions */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
                  <Link href="/dashboard/chat" className="flex-1 text-center bg-[#233551] text-white text-sm font-bold py-2.5 rounded-full hover:bg-[#2d4568] transition-colors" style={{ fontFamily: 'var(--font-lato)' }}>
                    Message
                  </Link>
                  <Link href="/dashboard/change-therapist" className="flex-1 text-center border-2 border-slate-200 text-[#233551] text-sm font-semibold py-2.5 rounded-full hover:border-[#233551]/30 transition-colors">
                    Change therapist
                  </Link>
                </div>
              </div>
            </div>
          )
        })()}
      </main>
    </div>
  )
}
