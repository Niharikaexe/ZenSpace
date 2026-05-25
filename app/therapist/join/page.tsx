import Link from 'next/link'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Practice with us — MindCanopy',
  description:
    "Practice through MindCanopy. No clinic rent, no hard contracts, weekly payouts. We bring you clients — you do the work you trained for.",
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
        {/* ── Section 1: Hero / Pitch ─────────────────────────────────────── */}
        <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>For counsellors</Eyebrow>
            <h1
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-8"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Practice without<br />the practice overhead.
            </h1>
            <div className="space-y-5 text-[#233551]/65 text-base md:text-lg leading-relaxed">
              <p>
                MindCanopy brings the clients to you. We handle the matching, the bookings, the chat, the video room, and the payments. You hold the session and write the note.
              </p>
              <p>
                <span className="font-semibold text-[#233551]">No clinic rent. No commute. No hard contracts. No exclusivity.</span> Set your weekly availability, take the sessions that fit, get paid weekly.
              </p>
              <p>
                We onboard counsellors trained both in India and abroad — many of our clients specifically want to work with someone outside their immediate cultural orbit, and we make sure that&apos;s an option.
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

        {/* ── Section 2: Your role ────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Your role</Eyebrow>
            <SectionHeading>What you actually do.</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <PointCard
                title="Set the hours you want."
                body={
                  <>
                    Your weekly availability lives in your dashboard. Open the slots that suit you, change them anytime.
                  </>
                }
              />
              <PointCard
                title="Take 50-minute video sessions."
                body={
                  <>
                    Each subscribed client books one <span className="font-semibold text-[#233551]">50-minute</span> video session a week — straight into a slot you&apos;ve opened.
                  </>
                }
              />
              <PointCard
                title="Stay reachable on chat."
                body={
                  <>
                    Clients can message you between sessions. We ask you to reply within <span className="font-semibold text-[#233551]">48 hours</span> — that&apos;s the promise we make to them.
                  </>
                }
              />
              <PointCard
                title="Say hi to new matches."
                body={
                  <>
                    When a new client lands with you, a short <span className="font-semibold text-[#233551]">15-minute intro chat</span> helps them decide if you&apos;re the right fit. Think of it as your warm handshake.
                  </>
                }
              />
            </div>
          </div>
        </section>

        {/* ── Section 3: Eligibility + Steps to join ──────────────────────── */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Who can join</Eyebrow>
            <SectionHeading>The basics we ask for.</SectionHeading>
            <div className="mt-6 space-y-5 text-[#233551]/65 leading-relaxed">
              <p>
                MindCanopy is a platform for <span className="font-semibold text-[#233551]">counsellors</span> — practitioners trained in counselling, counselling psychology, psychotherapy, or social work. We don&apos;t take on psychiatrists or anyone offering medical or prescription-based care.
              </p>
              <p className="font-semibold text-[#233551] pt-2">To apply, you&apos;ll share:</p>
              <ul className="space-y-2.5 pl-1">
                {[
                  'A Master\'s degree (or equivalent) in counselling, counselling psychology, psychotherapy, or social work',
                  'Your CV',
                  'Years of experience and your areas of specialisation',
                  'Certificates of training or registration, where applicable (optional)',
                  'LinkedIn, if you have one (optional)',
                ].map(line => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="text-[#7EC0B7] mt-2 w-1.5 h-1.5 rounded-full bg-[#7EC0B7] flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps to join */}
            <div className="mt-12">
              <Eyebrow>How it goes</Eyebrow>
              <SectionHeading>Six steps to your first client.</SectionHeading>
              <ol className="mt-8 space-y-4">
                {[
                  {
                    n: '1',
                    t: 'Apply.',
                    d: 'Fill in the application form — takes about five minutes.',
                  },
                  {
                    n: '2',
                    t: 'We screen your education and CV.',
                    d: 'A real person reviews every application. No bots, no auto-rejections.',
                  },
                  {
                    n: '3',
                    t: 'Intro call and onboarding.',
                    d: 'A short call to meet you, followed by a guided onboarding to set up your profile.',
                  },
                  {
                    n: '4',
                    t: 'Log your availability.',
                    d: 'Pick the hours you can hold sessions. Our clients live in IST — we hope you can find some overlap.',
                  },
                  {
                    n: '5',
                    t: 'We match you with the most aligned client.',
                    d: 'Our admin hand-matches every client based on their needs and your strengths. No algorithm.',
                  },
                  {
                    n: '6',
                    t: 'Intro chat, then sessions begin.',
                    d: 'Every new client gets a 15-minute intro chat with you. After that, sessions get booked into your slots — by you or by them.',
                  },
                ].map(({ n, t, d }) => (
                  <li
                    key={n}
                    className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 md:p-6"
                  >
                    <span className="w-9 h-9 rounded-full bg-[#7EC0B7]/15 text-[#3D8A80] text-sm font-black flex items-center justify-center flex-shrink-0">
                      {n}
                    </span>
                    <div className="flex-1">
                      <p
                        className="text-[#233551] font-black text-base md:text-lg"
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {t}
                      </p>
                      <p className="text-[#233551]/65 text-sm leading-relaxed mt-1">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Section 4: Therapist Terms ──────────────────────────────────── */}
        <section className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>Therapist terms</Eyebrow>
            <SectionHeading>Simple, fair, and easy to work with.</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <PointCard
                title="No setup fee."
                body="Joining MindCanopy costs you nothing. No platform charge, no subscription, no hidden onboarding fee."
              />
              <PointCard
                title="No clinic, no hard contracts."
                body="You don't pay clinic rent. You're not locked in. Practise alongside your other work if you'd like."
              />
              <PointCard
                title="Weekly payouts."
                body={
                  <>
                    We pay you every week, based on the clients you&apos;ve seen. The more clients you onboard with us, the more you earn.
                  </>
                }
              />
              <PointCard
                title="A short intro chat with every match."
                body="When a new client is matched to you, you'll offer them a 15-minute intro chat so they can decide if you're their person."
              />
              <PointCard
                title="Active on chat within 48 hours."
                body="Subscribed clients can message you between sessions. We ask you to reply within 48 hours — it's the one promise we make to them."
              />
              <PointCard
                title="Leave whenever you need to."
                body="No exclusivity. No lock-in. If MindCanopy stops working for you, you can step away — we just ask you to see your active clients through their current week."
              />
            </div>
          </div>
        </section>

        {/* ── Section 5: Where we draw the line + Support ─────────────────── */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <Eyebrow>A gentle note</Eyebrow>
            <SectionHeading>A few things to keep in mind.</SectionHeading>
            <p className="text-[#233551]/65 mt-4 mb-8 leading-relaxed">
              These aren&apos;t rules so much as the spirit we work in. Most of our therapists already practise this way.
            </p>
            <ul className="space-y-3">
              {[
                'Stay within your scope of training — we\'re a counselling platform, not a medical one.',
                'Keep client conversations on the MindCanopy platform.',
                'Respect client confidentiality, always.',
                'Sessions stay private — no recording without written consent from both sides.',
              ].map(rule => (
                <li
                  key={rule}
                  className="flex items-start gap-3 bg-[#FFF5F2] border border-[#E8926A]/20 rounded-xl px-4 py-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8926A] flex-shrink-0 mt-2.5" />
                  <span className="text-sm text-[#233551] leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>

            {/* Support box */}
            <div className="mt-12 bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-2xl px-6 py-6 md:px-8 md:py-7">
              <p
                className="text-[#233551] font-black text-lg md:text-xl mb-2"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Still have questions?
              </p>
              <p className="text-[#233551]/65 text-sm md:text-base leading-relaxed">
                We&apos;re happy to walk you through anything before you apply. Write to us at{' '}
                <a
                  href="mailto:admin@mindcanopy.in"
                  className="font-semibold text-[#3D8A80] hover:text-[#233551] underline underline-offset-2"
                >
                  admin@mindcanopy.in
                </a>{' '}
                and a real person will get back to you.
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
