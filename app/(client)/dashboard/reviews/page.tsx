import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export const dynamic = 'force-dynamic'

const REVIEWS = [
  {
    name: 'Priya M.',
    location: 'Mumbai',
    rating: 5,
    text: 'I was skeptical at first, but my therapist completely changed the way I approach conflict at home. The async messaging between sessions is what really made the difference — I don\'t have to wait a whole week to process something.',
    type: 'Individual',
  },
  {
    name: 'Arjun & Sneha',
    location: 'Bangalore',
    rating: 5,
    text: 'We\'d tried couples therapy before and it felt too clinical. ZenSpace was different — our therapist actually understood the specific pressures of an Indian family setup without us having to over-explain everything.',
    type: 'Couples',
  },
  {
    name: 'Kavya R.',
    location: 'Chennai',
    rating: 5,
    text: 'I was 19 and I didn\'t want my parents knowing. The privacy here is real. My therapist helped me get through my board exam anxiety without anyone in my family knowing I was struggling.',
    type: 'Teen',
  },
  {
    name: 'Rohit S.',
    location: 'Delhi',
    rating: 5,
    text: 'The fact that I could switch therapists without drama was huge for me. First one wasn\'t a great fit — I was nervous to say anything but the team made it completely frictionless.',
    type: 'Individual',
  },
]

export default async function ReviewsPage() {
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
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav userName={profile.full_name} isMatched={!!match} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#233551]/45 hover:text-[#233551] transition-colors mb-6">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          What people are saying
        </h1>
        <p className="text-sm text-[#233551]/50 mb-8">Real experiences from ZenSpace clients.</p>

        <div className="space-y-4">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#233551] text-white font-black text-sm flex items-center justify-center flex-shrink-0" style={{ fontFamily: 'var(--font-lato)' }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#233551]">{r.name}</p>
                    <p className="text-xs text-[#233551]/40">{r.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-[#7EC0B7]/15 text-[#3D8A80] px-2.5 py-0.5 rounded-full font-medium">
                    {r.type}
                  </span>
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <svg key={j} viewBox="0 0 12 12" fill="#E8926A" className="w-3 h-3">
                        <path d="M6 0l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8 3 9.5l.5-3.5L1 3.5 4.5 3z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#233551]/65 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
