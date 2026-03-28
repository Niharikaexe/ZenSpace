import { TherapistNav } from '@/components/therapist/TherapistNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const FAQS = [
  {
    q: "How does client matching work?",
    a: "The ZenSpace admin manually reviews client questionnaires and matches them based on your specialisations, language, and availability. You'll receive an email notification when a new client is assigned.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts are processed off-platform. Once a session is marked as completed, earnings are calculated at your agreed rate. Contact the ZenSpace admin via the Payment Dashboard to request a cash-out.",
  },
  {
    q: "What happens if a client cancels a session?",
    a: "If the cancellation is less than 24 hours before the scheduled session, the session still counts toward your earnings. Cancellations with more notice are not billed to the client.",
  },
  {
    q: "Can I have multiple clients at once?",
    a: "Yes. Your 'weekly client capacity' setting on your account page tells the admin how many active clients you can handle. Update this anytime to pause or resume receiving new matches.",
  },
  {
    q: "How do I set my availability for sessions?",
    a: "Currently, session scheduling is done directly with your client via chat. You propose a time that works for you, and the admin creates the session record. An integrated scheduling tool is coming soon.",
  },
  {
    q: "What if a client isn't a good fit?",
    a: "Contact the ZenSpace admin directly. Re-matching is possible. You can also message the admin via the Contact Us page.",
  },
  {
    q: "Are my session notes private?",
    a: "Yes. Session notes you write are visible only to you. Clients cannot view them. Admin access is not currently enabled.",
  },
  {
    q: "How do I handle a crisis situation with a client?",
    a: "If you believe a client is at immediate risk, advise them to call iCall (9152987821) or go to their nearest emergency service. Document the conversation in your session notes. Contact ZenSpace support immediately after.",
  },
]

export default async function TherapistFaqPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'therapist') redirect('/login')

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#233551]/45 mt-1">
            For therapists on the ZenSpace platform.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
              <p className="text-sm font-bold text-[#233551]">{q}</p>
              <p className="text-sm text-[#233551]/60 mt-2 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#233551] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-white/70">Didn&apos;t find your answer?</p>
          <a
            href="/therapist/dashboard/contact"
            className="flex-shrink-0 text-xs font-bold px-4 py-2 bg-[#7EC0B7] text-[#233551] rounded-xl hover:bg-[#6db5ac] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </main>
    </div>
  )
}
