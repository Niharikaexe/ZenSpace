'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initialState = { error: undefined, success: false }

const usps = [
  {
    title: "Free intro chat",
    body: "Talk to your potential therapist before you pay a thing.",
  },
  {
    title: "Switch anytime, no questions",
    body: "If the fit isn't right, you change. No guilt, no explanation.",
  },
  {
    title: "Text between sessions",
    body: "A week is a long time. Message your therapist when it matters.",
  },
  {
    title: "Globally trained therapists",
    body: "No cultural stake in your choices. No judgment.",
  },
  {
    title: "Complete privacy",
    body: "No one in your office, family, or building will know you're here.",
  },
]

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, initialState)
  const [questionnaireData, setQuestionnaireData] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('zenspace_questionnaire')
    if (stored) setQuestionnaireData(stored)
  }, [])

  useEffect(() => {
    if (state.success) {
      sessionStorage.removeItem('zenspace_questionnaire')
    }
  }, [state.success])

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col w-[40%] flex-shrink-0 bg-[#233551] sticky top-0 h-screen overflow-y-auto p-10 xl:p-12">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/">
            <span
              className="font-black text-2xl tracking-tight text-white"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              ZenSpace
            </span>
          </Link>
          <p className="text-sm text-[#7EC0B7] mt-1">Therapy that treats you like an adult.</p>
        </div>

        {/* USPs */}
        <div className="space-y-6 flex-1">
          {usps.map(usp => (
            <div key={usp.title} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#7EC0B7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#7EC0B7] text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{usp.title}</p>
                <p className="text-white/55 text-sm mt-0.5 leading-relaxed">{usp.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-10">
          <div className="bg-[#E8926A]/15 border border-[#E8926A]/25 rounded-2xl px-5 py-4">
            <p className="text-white/90 text-sm leading-relaxed italic">
              "Changed how I handle anxiety at work."
            </p>
            <p className="text-[#E8926A] text-xs font-semibold mt-2">— Priya, 28, Mumbai</p>
          </div>
        </div>

        {/* Bottom sign-in link */}
        <div className="mt-8">
          <p className="text-white/40 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7EC0B7] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 sticky top-0 h-screen overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-10">

          {/* Mobile logo */}
          <div className="md:hidden w-full max-w-md mb-8 text-center">
            <Link href="/">
              <span
                className="font-black text-2xl tracking-tight text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                ZenSpace
              </span>
            </Link>
            <p className="text-sm text-[#3D8A80] mt-1">Therapy that treats you like an adult.</p>
          </div>

          <div className="w-full max-w-md">
            {state.success ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-5xl mb-4">📬</div>
                <h2
                  className="text-2xl font-black text-[#233551]"
                  style={{ fontFamily: 'var(--font-lato)' }}
                >
                  Check your email
                </h2>
                <p className="text-[#233551]/60 text-sm leading-relaxed">
                  We've sent a confirmation link to your email. Click it to activate your account.
                </p>
                <Link
                  href="/login"
                  className="inline-block text-sm text-[#3D8A80] hover:underline mt-2"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1
                    className="text-2xl font-black text-[#233551]"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Create your account
                  </h1>
                  <p className="text-sm text-[#233551]/55 mt-1">
                    {questionnaireData
                      ? 'Almost there — just a few details to get started'
                      : 'Start talking to a real therapist, on your terms.'}
                  </p>
                </div>

                {state.error && (
                  <Alert variant="destructive" className="mb-5">
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <form action={action} className="space-y-4">
                  <input type="hidden" name="role" value="client" />
                  <input type="hidden" name="questionnaireData" value={questionnaireData} />

                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-[#233551] font-medium text-sm">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Jane Doe"
                      required
                      autoComplete="name"
                      className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[#233551] font-medium text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[#233551] font-medium text-sm">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      required
                      autoComplete="new-password"
                      className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#7EC0B7] hover:bg-[#3D8A80] text-white font-bold text-sm transition-colors mt-2"
                    disabled={isPending}
                  >
                    {isPending ? 'Creating account...' : 'Create account'}
                  </Button>

                  <p className="text-xs text-center text-[#233551]/40">
                    By signing up you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-[#3D8A80]">Terms</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline hover:text-[#3D8A80]">Privacy Policy</Link>
                  </p>
                </form>

                {/* Mobile sign-in link */}
                <p className="md:hidden text-center text-sm text-[#233551]/50 mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#3D8A80] font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
