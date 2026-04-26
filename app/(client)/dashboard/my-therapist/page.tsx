import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
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
        <DashboardNav userName={profile.full_name} isMatched={false} />
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
    (admin as any).from('therapist_profiles').select('specializations, bio, approach, years_experience, languages').eq('user_id', match.therapist_id).maybeSingle(),
    (admin as any).from('profiles').select('full_name, avatar_url').eq('id', match.therapist_id).maybeSingle(),
  ])

  const tProfile = tProfileResult.data
  const tUser = tUserResult.data

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav userName={profile.full_name} isMatched={true} />

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

        {tUser && tProfile && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
              {tUser.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tUser.avatar_url} alt={tUser.full_name} className="w-24 h-24 rounded-full object-cover border-4 border-[#7EC0B7]/20 mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#233551] text-white font-black text-3xl flex items-center justify-center border-4 border-[#7EC0B7]/20 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
                  {initials(tUser.full_name)}
                </div>
              )}
              <h2 className="text-lg font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>{tUser.full_name}</h2>
              {tProfile.approach && <p className="text-sm text-[#233551]/50 mt-0.5">{tProfile.approach}</p>}
              <p className="text-xs text-[#233551]/35 mt-0.5">{tProfile.years_experience} years experience</p>
              <p className="text-xs text-[#233551]/35 mt-2">Matched since {formatDate(match.created_at)}</p>
            </div>

            {tProfile.bio && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-[#233551]/40 uppercase tracking-wider mb-2">About</p>
                <p className="text-sm text-[#233551]/65 leading-relaxed">{tProfile.bio}</p>
              </div>
            )}

            {tProfile.specializations?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-[#233551]/40 uppercase tracking-wider mb-2">Specializes in</p>
                <div className="flex flex-wrap gap-2">
                  {tProfile.specializations.map((s: string) => (
                    <span key={s} className="text-xs bg-[#7EC0B7]/15 text-[#3D8A80] px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-[#233551]/50">
              <p><span className="font-medium text-[#233551]/65">Languages:</span> {tProfile.languages?.join(', ')}</p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
              <Link href="/dashboard/chat" className="flex-1 text-center bg-[#233551] text-white text-sm font-bold py-2.5 rounded-full hover:bg-[#2d4568] transition-colors" style={{ fontFamily: 'var(--font-lato)' }}>
                Message
              </Link>
              <Link href="/dashboard/change-therapist" className="flex-1 text-center border-2 border-slate-200 text-[#233551] text-sm font-semibold py-2.5 rounded-full hover:border-[#233551]/30 transition-colors">
                Change therapist
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
