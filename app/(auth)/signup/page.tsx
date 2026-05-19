'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { signUp, type AuthState } from '@/app/actions/auth'
import RotatingTestimonial from '@/components/auth/RotatingTestimonial'
import { OwlLogo } from '@/components/home/OwlLogo'
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

// Client-side debug wrapper around the server action so we can see in
// browser DevTools exactly what FormData is sent and what came back.
async function signUpWithLogging(prev: AuthState, fd: FormData): Promise<AuthState> {
  // eslint-disable-next-line no-console
  console.log('[signup] submit →', {
    fullName: fd.get('fullName'),
    email: fd.get('email'),
    password: typeof fd.get('password') === 'string' ? `(${(fd.get('password') as string).length} chars)` : null,
    role: fd.get('role'),
    hasQuestionnaire: !!fd.get('questionnaireData'),
  })
  try {
    const result = await signUp(prev, fd)
    // eslint-disable-next-line no-console
    console.log('[signup] action returned →', result)
    return result
  } catch (err) {
    // Server-side redirect() throws a NEXT_REDIRECT — that's expected,
    // it's how Next.js short-circuits out of a server action. We re-throw
    // so the redirect actually happens.
    if (err && typeof err === 'object' && 'digest' in err && String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) {
      // eslint-disable-next-line no-console
      console.log('[signup] action ended in redirect (success)')
      throw err
    }
    // eslint-disable-next-line no-console
    console.error('[signup] action threw unexpectedly →', err)
    return { error: err instanceof Error ? err.message : 'Unexpected error (see DevTools console).' }
  }
}

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUpWithLogging, initialState)
  const [questionnaireData, setQuestionnaireData] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  useEffect(() => {
    const stored = sessionStorage.getItem('mindcanopy_questionnaire')
    if (stored) setQuestionnaireData(stored)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[signup] state changed →', state)
  }, [state])

  useEffect(() => {
    if (state.success) {
      sessionStorage.removeItem('mindcanopy_questionnaire')
    }
  }, [state.success])

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col w-[40%] flex-shrink-0 bg-[#233551] sticky top-0 h-screen overflow-hidden p-10 xl:p-12">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/">
            <span
              className="font-black text-2xl tracking-tight text-white"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              MindCanopy
            </span>
          </Link>
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
          <RotatingTestimonial />
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
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <OwlLogo size={28} />
              <span
                className="font-black text-2xl tracking-tight text-[#3D8A80]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                MindCanopy
              </span>
            </Link>
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
                    className="text-3xl font-black text-[#233551]"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    Create your account
                  </h1>
                  <p className="text-sm text-[#233551]/55 mt-1">
                    {questionnaireData
                      ? 'Almost there — just a few details to get started'
                      : 'Start talking to a real therapist.'}
                  </p>
                </div>

                {state.error && (
                  <Alert variant="destructive" className="mb-5">
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <form
                  action={action}
                  onSubmit={(e) => {
                    if (password !== confirmPassword) {
                      e.preventDefault()
                    }
                  }}
                  className="space-y-4"
                >
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
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#233551]/35 hover:text-[#233551]/70 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[#233551] font-medium text-sm">
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`rounded-xl h-11 focus:ring-[#7EC0B7]/20 ${
                        passwordMismatch
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 focus:border-[#7EC0B7]'
                      }`}
                    />
                    {passwordMismatch && (
                      <p className="text-xs text-red-500">Passwords don't match.</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#7EC0B7] hover:bg-[#3D8A80] text-white font-bold text-sm transition-colors mt-2 disabled:opacity-60"
                    disabled={isPending || passwordMismatch || password.length === 0}
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
