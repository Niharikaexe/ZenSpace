import Link from 'next/link'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'About Us — ZenSpace',
  description: 'We built ZenSpace because therapy in India needed to change. Here\'s the honest version of why.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#7EC0B7]" />
              <span className="text-[#3D8A80] text-xs font-black uppercase tracking-[0.2em]">About us</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-6"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              We built this because<br />therapy in India needed<br />to change.
            </h1>
            <p className="text-[#233551]/60 text-lg leading-relaxed">
              Not a startup. Not a wellness brand. Just a platform that takes the idea of talking to someone seriously.
            </p>
          </div>
        </section>

        {/* The honest version */}
        <section className="bg-[#FFF5F2] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 space-y-10">

            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                The honest version.
              </h2>
              <p className="text-[#233551]/65 leading-relaxed">
                Most people in India who need therapy don't go. Not because they don't know it helps. Because the version of therapy that exists here still feels designed for someone else — someone with a lot of time, a tolerant family, and no shame about any of it.
              </p>
              <p className="text-[#233551]/65 leading-relaxed">
                We started ZenSpace to fix the parts we found most broken: the stigma, the geography, the cultural mismatch, and the waiting.
              </p>
            </div>

            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Why international therapists.
              </h2>
              <p className="text-[#233551]/65 leading-relaxed">
                A therapist trained in an environment where mental health is openly discussed brings something different to the room. They don't have a cultural stake in your decisions. They've worked with people from very different backgrounds. They're less likely to tell you to "just meditate" or ask why you don't talk to your parents instead.
              </p>
              <p className="text-[#233551]/65 leading-relaxed">
                That said, they understand India. We make sure of it. We only work with therapists who have experience with Indian clients or the specific pressures of the Indian context — family, career, identity, the specific weight of expectations.
              </p>
            </div>

            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                On privacy.
              </h2>
              <p className="text-[#233551]/65 leading-relaxed">
                We are DPDP Act compliant. Everything you share stays between you and your therapist. We don't sell your data. We don't use it for targeting. We don't ask you to connect your social accounts.
              </p>
              <p className="text-[#233551]/65 leading-relaxed">
                Your sessions, your messages, your notes — they exist inside ZenSpace and nowhere else. Not because we're hiding something. Because it's yours.
              </p>
            </div>

            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                What we are not.
              </h2>
              <p className="text-[#233551]/65 leading-relaxed">
                We are not a crisis line. We are not a diagnostic service. We do not prescribe medication. ZenSpace is a talk therapy platform — which means real, structured conversations with a trained professional, conducted at a pace that works for your life.
              </p>
              <p className="text-[#233551]/65 leading-relaxed">
                If you're in immediate danger, please call iCall at <span className="font-semibold text-[#233551]">9152987821</span> or Vandrevala Foundation at <span className="font-semibold text-[#233551]">1860-2662-345</span>.
              </p>
            </div>

            <div className="space-y-5">
              <h2
                className="text-2xl md:text-3xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Who runs this.
              </h2>
              <p className="text-[#233551]/65 leading-relaxed">
                ZenSpace was founded by Niharika, who spent years watching people she cared about talk themselves out of getting help. The platform is built on the conviction that access to good therapy shouldn't require a particular city, a particular income, or a particular kind of family.
              </p>
              <p className="text-[#233551]/65 leading-relaxed">
                Every therapist on ZenSpace is vetted by our team personally. Every match is made by a human. We're small on purpose.
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2
              className="text-2xl md:text-3xl font-black text-[#233551] mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Still have questions?
            </h2>
            <p className="text-[#233551]/55 mb-8">
              We respond to every message. No bots, no auto-replies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#2d4568] transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Contact us
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#233551]/20 text-[#233551] text-sm font-bold px-8 py-3.5 rounded-full hover:border-[#233551]/50 transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Get started →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
