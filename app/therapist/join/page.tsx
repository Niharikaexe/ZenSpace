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
        {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
        <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-[3.6rem] italic font-black text-[#233551] leading-[1.15] mb-8"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Peace isn&apos;t a destination —<br />it&apos;s a practice.
            </h1>
            <p className="text-[#233551]/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
              We give you a platform to reach quality clients. Every person who comes to us completes an assessment first — and we route them to the therapist whose approach actually fits theirs.
            </p>
            <p className="italic text-[#3D8A80] text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              A space built carefully, for both sides of the room.
            </p>
            <Link
              href="/therapist/apply"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold transition-colors shadow-lg shadow-[#233551]/20"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Apply to join →
            </Link>
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

        {/* ── Section 3: Steps to join ───────────────────────────────────── */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div>
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
                    d: 'We read every application ourselves. No bots, no auto-rejections.',
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
                    d: 'Our admin matches every client based on their needs and your strengths. No algorithm.',
                  },
                  {
                    n: '6',
                    t: 'Intro chat, then sessions begin.',
                    d: 'Every new client gets a 15-minute intro chat with you. After that, sessions get booked into your slots — by you or by them.',
                  },
                ].map(({ n, t, d }, i) => (
                  <li
                    key={n}
                    className={`flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 md:p-6 md:w-[calc(50%+1rem)] ${
                      i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                    }`}
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

        {/* ── Section 4+5: Therapist terms + Gentle note (side-by-side) ───── */}
        <section className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">

              {/* Left: Therapist terms */}
              <div>
                <Eyebrow>Therapist terms</Eyebrow>
                <SectionHeading>Simple, fair, and easy to work with.</SectionHeading>
                <ul className="mt-8 space-y-3">
                  {[
                    {
                      t: 'No setup fee.',
                      d: 'Joining MindCanopy costs you nothing. No platform charge, no subscription, no hidden onboarding fee.',
                    },
                    {
                      t: 'No clinic, no hard contracts.',
                      d: "You don't pay clinic rent. You're not locked in. Practise alongside your other work if you'd like.",
                    },
                    {
                      t: 'Weekly payouts.',
                      d: "We pay you every week, based on the clients you've seen. The more clients you onboard with us, the more you earn.",
                    },
                    {
                      t: 'A short intro chat with every match.',
                      d: "When a new client is matched to you, you'll offer them a 15-minute intro chat so they can decide if you're their person.",
                    },
                    {
                      t: 'Active on chat within 48 hours.',
                      d: "Subscribed clients can message you between sessions. We ask you to reply within 48 hours — it's the one promise we make to them.",
                    },
                  ].map(({ t, d }) => (
                    <li
                      key={t}
                      className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5"
                    >
                      <p
                        className="text-[#233551] font-black text-sm md:text-base"
                        style={{ fontFamily: 'var(--font-lato)' }}
                      >
                        {t}
                      </p>
                      <p className="text-[#233551]/65 text-sm leading-relaxed mt-1">{d}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Gentle note + Support */}
              <div className="md:border-l md:border-[#233551]/10 md:pl-12">
                <Eyebrow>A gentle note</Eyebrow>
                <SectionHeading>A few things to keep in mind.</SectionHeading>
                <p className="text-[#233551]/65 mt-4 mb-6 leading-relaxed">
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
                      className="flex items-start gap-3 bg-white border border-[#E8926A]/20 rounded-xl px-4 py-3"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8926A] flex-shrink-0 mt-2.5" />
                      <span className="text-sm text-[#233551] leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>

                {/* Support box */}
                <div className="mt-8 bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-2xl px-5 py-5 md:px-6 md:py-6">
                  <p
                    className="text-[#233551] font-black text-base md:text-lg mb-2"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Still have questions?
                  </p>
                  <p className="text-[#233551]/65 text-sm leading-relaxed">
                    We&apos;re happy to walk you through anything before you apply. Write to us at{' '}
                    <a
                      href="mailto:admin@mindcanopy.in"
                      className="font-semibold text-[#3D8A80] hover:text-[#233551] underline underline-offset-2"
                    >
                      admin@mindcanopy.in
                    </a>{' '}
                    and we&apos;ll get back to you soon.
                  </p>
                </div>
              </div>

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
