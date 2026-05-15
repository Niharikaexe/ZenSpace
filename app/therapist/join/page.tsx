import Link from 'next/link'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Practice with us — MindCanopy',
  description:
    "Freelance through MindCanopy, not for us. No clinic rent, no exclusivity, weekly payouts. We're building the therapist marketplace India actually needs.",
}

export const revalidate = 3600

// ─── Small section helpers ────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px w-10 bg-[#7EC0B7]" />
      <span className="text-[#3D8A80] text-xs font-black uppercase tracking-[0.2em]">
        {children}
      </span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl md:text-3xl font-black text-[#233551] leading-tight"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {children}
    </h2>
  )
}

function PointCard({
  title, body,
}: { title: string; body: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6">
      <h3
        className="text-[#233551] font-black text-base md:text-lg mb-2"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        {title}
      </h3>
      <p className="text-[#233551]/65 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TherapistJoinPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* ── Hero / Pitch ────────────────────────────────────────────────── */}
        <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>For therapists</Eyebrow>
            <h1
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-8"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Practice without<br />the practice overhead.
            </h1>
            <div className="space-y-5 text-[#233551]/65 text-base md:text-lg leading-relaxed">
              <p>
                India has roughly <span className="font-bold text-[#233551]">0.75 mental health professionals per 100,000 people</span>. The WHO recommends ten times that. Around 150 million Indians need mental health care. Less than 10% will ever get it.
              </p>
              <p>
                The math doesn&apos;t work. There aren&apos;t enough of you. There won&apos;t be — not for a long time. Online therapy is changing that, fast. The category is growing double digits a year. But most platforms either underpay their therapists or trap them in contracts they didn&apos;t read.
              </p>
              <p>
                MindCanopy is built differently. You freelance <span className="italic">through</span> us, not <span className="italic">for</span> us. No commute. No clinic rent. No scheduling staff. No exclusivity contracts. No clients pulled in from cold ads you&apos;ll never see the cost of.
              </p>
              <p>
                You set your weekly availability. Clients book a 50-minute video session into your slots. You hold the session on our platform, write a note, and we pay you weekly.
              </p>
              <p>
                We&apos;re equally open to internationally trained therapists. A lot of our clients specifically want someone outside their family&apos;s cultural orbit, and we make sure that&apos;s an option.
              </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/therapist/apply"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold transition-colors shadow-lg shadow-[#233551]/20"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Apply now →
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border-2 border-slate-200 text-[#233551] text-sm font-bold hover:border-[#233551]/40 transition-colors"
              >
                See what&apos;s involved
              </a>
            </div>
          </div>
        </section>

        {/* ── Your role ───────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Your role</Eyebrow>
            <SectionHeading>What you actually do.</SectionHeading>
            <p className="text-[#233551]/65 text-base mt-4 mb-8 leading-relaxed">
              A few things are flexible. A few aren&apos;t. Read both lists before applying.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PointCard
                title="You set when you're available."
                body={
                  <>
                    Your weekly schedule lives in your dashboard. Block the hours you&apos;re free, edit them anytime.
                  </>
                }
              />
              <PointCard
                title="Clients book into your slots."
                body={
                  <>
                    Each subscribed client has one <span className="font-semibold text-[#233551]">50-minute</span> video session per week, booked into a slot you&apos;ve opened.
                  </>
                }
              />
              <PointCard
                title="Active chat presence (within 48 hours)."
                body={
                  <>
                    Between sessions, your subscribed clients can message you on the platform. You&apos;re <span className="font-semibold text-[#233551]">contractually required to respond within 48 hours</span>. This is a core promise we make to clients and one of the few things you don&apos;t get to opt out of.
                  </>
                }
              />
              <PointCard
                title="Intro chat with newly matched clients."
                body={
                  <>
                    When a client is matched to you, you have <span className="font-semibold text-[#233551]">one day</span> and a <span className="font-semibold text-[#233551]">small message cap</span> to engage them in a short text exchange before they decide whether to subscribe. Think of this as your client acquisition move. Play it smart.
                  </>
                }
              />
            </div>
          </div>
        </section>

        {/* ── Eligibility ─────────────────────────────────────────────────── */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Eligibility</Eyebrow>
            <SectionHeading>Who we&apos;re looking for.</SectionHeading>
            <div className="mt-6 space-y-5 text-[#233551]/65 leading-relaxed">
              <p>
                To be listed on MindCanopy, you need a recognised qualification in psychology, psychotherapy, counselling, social work, or a related mental health field — from an accredited institution. <span className="font-semibold text-[#233551]">Minimum: a Master&apos;s degree or equivalent</span> in a relevant discipline.
              </p>
              <p className="font-semibold text-[#233551] pt-2">During verification, we&apos;ll ask for:</p>
              <ul className="space-y-2.5 pl-1">
                {[
                  'Proof of your degree(s) and qualifications',
                  'Professional registration or licence certificate, where applicable in your country',
                  'A government-issued photo ID',
                  'A professional reference',
                ].map(line => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="text-[#7EC0B7] mt-2 w-1.5 h-1.5 rounded-full bg-[#7EC0B7] flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#233551]/50 pt-3">
                We reserve the right to reject an application — or terminate an agreement — if any document is found to be false or misrepresented at any time.
              </p>
            </div>
          </div>
        </section>

        {/* ── Commission & Payments ───────────────────────────────────────── */}
        <section className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>How you get paid</Eyebrow>
            <SectionHeading>75% to you. 25% to us. That&apos;s it.</SectionHeading>
            <div className="mt-6 space-y-5 text-[#233551]/65 leading-relaxed">
              <p>
                MindCanopy runs on a transparent commission model. For each client subscription attributed to you, we retain <span className="font-bold text-[#233551]">25%</span> as the platform fee. The remaining <span className="font-bold text-[#233551]">75% is yours</span>.
              </p>
              <p>
                No setup fee. No monthly platform charge. No subscription you pay us. The 25% covers our infrastructure, support, marketing, and the team running the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center">
                <p className="text-[#3D8A80] text-xs font-bold uppercase tracking-widest mb-2">Your share</p>
                <p className="text-3xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>75%</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center">
                <p className="text-[#3D8A80] text-xs font-bold uppercase tracking-widest mb-2">Payout cycle</p>
                <p className="text-3xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>Weekly</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center">
                <p className="text-[#3D8A80] text-xs font-bold uppercase tracking-widest mb-2">Released in</p>
                <p className="text-3xl font-black text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>3 days</p>
              </div>
            </div>

            <p className="text-[#233551]/65 leading-relaxed mt-8">
              Earnings are calculated weekly and released within <span className="font-semibold text-[#233551]">3 business days</span> of the end of each cycle. Payments go to your nominated account via Wise, direct bank transfer, or an agreed alternative for international therapists. You get a payment statement every cycle.
            </p>
            <p className="text-sm text-[#233551]/50 mt-3">
              Commission may be revised with 30 days&apos; written notice. We&apos;ll always tell you before we change anything.
            </p>
          </div>
        </section>

        {/* ── Platform conduct ─────────────────────────────────────────────── */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Where we draw the line</Eyebrow>
            <SectionHeading>What you can&apos;t do.</SectionHeading>
            <p className="text-[#233551]/65 mt-4 mb-8 leading-relaxed">
              Most of our therapists never come close to these. We list them anyway so there&apos;s no ambiguity. Violation is grounds for immediate termination and, where relevant, legal action.
            </p>
            <ul className="space-y-3">
              {[
                'Share personal contact details (phone, personal email, social media) with any client.',
                'Solicit clients to move sessions off-platform, or continue a therapeutic relationship with a MindCanopy client outside the platform.',
                'Record or capture any session without the prior written consent of the client AND MindCanopy.',
                'Discuss or disclose client information with any third party, except where mandatory reporting law applies.',
                'Engage in any romantic, sexual, or inappropriate personal relationship with a client.',
                'Provide a psychiatric diagnosis, prescribe medication, or offer medical advice outside your scope of qualification.',
              ].map(rule => (
                <li
                  key={rule}
                  className="flex items-start gap-3 bg-[#FFF5F2] border border-[#E8926A]/20 rounded-xl px-4 py-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#E8926A] flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm text-[#233551] leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Term & Termination ──────────────────────────────────────────── */}
        <section className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Term &amp; termination</Eyebrow>
            <SectionHeading>30 days either way.</SectionHeading>
            <div className="mt-6 space-y-5 text-[#233551]/65 leading-relaxed">
              <p>
                Our agreement starts when your profile goes live, and continues until either side ends it.
              </p>
              <p>
                <span className="font-semibold text-[#233551]">You can leave anytime with 30 days&apos; written notice</span> to partners@mindcanopy.com. During the notice period, please honour your existing client sessions and provide reasonable transition support — abandoning a client mid-care isn&apos;t something we&apos;d ever ask you to do, and we don&apos;t allow it either.
              </p>
              <p>
                <span className="font-semibold text-[#233551]">We can end the agreement with 30 days&apos; notice</span> without cause, or immediately in cases of: breach of the conduct rules above, misrepresentation of credentials, an upheld complaint involving serious professional misconduct, or revocation of your professional licence.
              </p>
            </div>
          </div>
        </section>

        {/* ── Confidentiality note ────────────────────────────────────────── */}
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-2xl px-6 py-5 flex items-start gap-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#3D8A80] flex-shrink-0 mt-0.5">
                <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-[#233551] leading-relaxed">
                <span className="font-semibold">A note on confidentiality.</span> You&apos;ll be bound to strict client confidentiality in perpetuity — including compliance with India&apos;s DPDP Act 2023. Exceptions apply only where mandatory reporting law requires disclosure. The full clause sits in the agreement you&apos;ll sign at onboarding.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <section className="bg-white pb-20 md:pb-28">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="bg-[#233551] rounded-3xl px-6 py-10 md:px-12 md:py-14 text-center">
              <h2
                className="text-3xl md:text-4xl font-black text-white leading-tight mb-4"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Ready when you are.
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
                Applications are reviewed personally. If we think it&apos;s a fit, we&apos;ll set up a short intro call within 3–5 working days.
              </p>
              <Link
                href="/therapist/apply"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-[#233551] text-sm font-bold hover:bg-[#FFF5F2] transition-colors shadow-lg"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Apply now →
              </Link>
              <p className="text-xs text-white/40 mt-6">
                By submitting an application, you agree that the full Therapist Agreement — including the clauses summarised above — will be reviewed and signed during onboarding before your profile goes live.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
