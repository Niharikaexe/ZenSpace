import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export const dynamic = 'force-dynamic'

const FAQS = [
  {
    q: 'How long does it take to get matched with a therapist?',
    a: 'Our team manually reviews your questionnaire and usually assigns a therapist within 24–48 hours of signing up.',
  },
  {
    q: 'Can I switch my therapist?',
    a: 'Yes, anytime. No explanation needed. Just visit the Change Therapist page and we\'ll find someone new for you.',
  },
  {
    q: 'What if I miss a session?',
    a: 'Sessions are scheduled directly with your therapist. If you need to reschedule, message them in the chat and they\'ll work something out with you.',
  },
  {
    q: 'Is my information private?',
    a: 'Completely. Your data is encrypted, your therapist has no connection to your social or professional network, and we never share your information with third parties.',
  },
  {
    q: 'Does ZenSpace prescribe medication?',
    a: 'No. ZenSpace is a talk therapy and counselling platform only. We do not provide diagnoses or prescriptions.',
  },
  {
    q: 'Can my parents see my answers (for teen users)?',
    a: 'No. Your questionnaire responses and session content are private and visible only to your matched therapist.',
  },
  {
    q: 'Is my subscription refundable?',
    a: 'Subscriptions are non-refundable. You can cancel anytime and your access will continue until the end of the billing period.',
  },
  {
    q: 'How do video sessions work?',
    a: 'Once you\'re matched and subscribed, you can schedule a 50-minute video session directly with your therapist through the platform. Sessions happen entirely in-browser — no app needed.',
  },
]

export default async function FAQPage() {
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
          Frequently asked questions
        </h1>
        <p className="text-sm text-[#233551]/50 mb-8">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link href="/dashboard/contact" className="text-[#3D8A80] hover:underline">Contact us</Link>
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
                {faq.q}
              </p>
              <p className="text-sm text-[#233551]/60 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
