'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import { Mail, MapPin, Phone, Instagram, Linkedin } from 'lucide-react'
import { sendContactEmail, type ContactState } from '@/app/actions/contact'

const initialState: ContactState = {}

export default function ContactPage() {
  const [state, action, isPending] = useActionState(sendContactEmail, initialState)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-5xl mx-auto px-4 md:px-6">

            {/* Header */}
            <div className="max-w-xl mb-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-[#7EC0B7]" />
                <span className="text-[#3D8A80] text-xs font-black uppercase tracking-[0.2em]">Contact</span>
              </div>
              <h1
                className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-4"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Say hello.
              </h1>
              <p className="text-[#233551]/55 text-base leading-relaxed">
                Drop us a note about anything — questions, feedback, or just to say hi. We&apos;ll write back.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

              {/* Left: Contact info */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-[#3D8A80]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-1">Email</p>
                      <a
                        href="mailto:admin@mindcanopy.in"
                        className="text-sm font-semibold text-[#233551] hover:text-[#3D8A80] transition-colors"
                      >
                        admin@mindcanopy.in
                      </a>
                      <p className="text-xs text-[#233551]/40 mt-0.5">For clients, therapists, and general enquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-[#3D8A80]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-1">Phone</p>
                      <a
                        href="tel:+919036018541"
                        className="text-sm font-semibold text-[#233551] hover:text-[#3D8A80] transition-colors"
                      >
                        +91 90360 18541
                      </a>
                      <p className="text-xs text-[#233551]/40 mt-0.5">Mon–Fri, 10am–6pm IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7EC0B7]/15 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[#3D8A80]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-1">Office</p>
                      <p className="text-sm font-semibold text-[#233551]">Bengaluru, Karnataka</p>
                      <p className="text-xs text-[#233551]/40 mt-0.5">India — we operate fully online</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <p className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-3">Follow us</p>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://instagram.com/mindcanopy.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#233551]/5 hover:bg-[#7EC0B7]/15 flex items-center justify-center transition-colors"
                    >
                      <Instagram size={18} className="text-[#233551]/60 hover:text-[#3D8A80]" />
                    </a>
                    <a
                      href="https://linkedin.com/company/mindcanopy-in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#233551]/5 hover:bg-[#7EC0B7]/15 flex items-center justify-center transition-colors"
                    >
                      <Linkedin size={18} className="text-[#233551]/60 hover:text-[#3D8A80]" />
                    </a>
                  </div>
                </div>

                {/* Therapist application nudge */}
                <div className="bg-[#FFF5F2] border border-[#E8926A]/20 rounded-2xl p-5">
                  <p className="text-sm font-black text-[#233551] mb-1" style={{ fontFamily: 'var(--font-lato)' }}>
                    Are you a therapist?
                  </p>
                  <p className="text-xs text-[#233551]/55 mb-3 leading-relaxed">
                    See what practising through MindCanopy looks like — how the matching works, what we ask of you, and what we don&apos;t.
                  </p>
                  <Link
                    href="/therapist/join"
                    className="text-xs font-bold text-[#E8926A] hover:text-[#C8683A] transition-colors"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>

              {/* Right: Message form */}
              <div>
                {state.success ? (
                  <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-3xl p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#7EC0B7]/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
                      Sent.
                    </h3>
                    <p className="text-sm text-[#233551]/55 leading-relaxed">
                      We'll get back to you within one business day.
                    </p>
                  </div>
                ) : (
                  <form action={action} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
                    {state.error && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {state.error}
                      </p>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
                        Your name <span className="text-[#E8926A]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Priya Sharma"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
                        Email address <span className="text-[#E8926A]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="priya@example.com"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#233551] mb-1.5">
                        Message <span className="text-[#E8926A]">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="What's on your mind?"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#233551] focus:outline-none focus:border-[#7EC0B7] transition-colors placeholder:text-[#233551]/30 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-[#233551] text-white text-sm font-bold py-3.5 rounded-full hover:bg-[#2d4568] transition-colors disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {isPending ? 'Sending...' : 'Send message →'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
