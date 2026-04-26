'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initialState = { error: undefined, success: false }

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(requestPasswordReset, initialState)

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col w-[40%] flex-shrink-0 bg-[#233551] sticky top-0 h-screen overflow-y-auto p-10 xl:p-12">
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

        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#7EC0B7]/20 flex items-center justify-center">
              <span className="text-[#7EC0B7] text-xl">✉</span>
            </div>
            <h2 className="text-white font-black text-xl" style={{ fontFamily: 'var(--font-lato)' }}>
              It happens to everyone.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              Enter your email and we&apos;ll send you a link to get back in.
              Takes about 30 seconds.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-white/40 text-sm">
            Remembered it?{' '}
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
                  We&apos;ve sent a password reset link. Click it to set a new password.
                  The link expires in 1 hour.
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
                    Forgot your password?
                  </h1>
                  <p className="text-sm text-[#233551]/55 mt-1">
                    No problem. We&apos;ll email you a reset link.
                  </p>
                </div>

                {state.error && (
                  <Alert variant="destructive" className="mb-5">
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <form action={action} className="space-y-4">
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

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#7EC0B7] hover:bg-[#3D8A80] text-white font-bold text-sm transition-colors mt-2"
                    disabled={isPending}
                  >
                    {isPending ? 'Sending...' : 'Send reset link'}
                  </Button>

                  <p className="text-center">
                    <Link href="/login" className="text-sm text-[#233551]/50 hover:text-[#3D8A80]">
                      Back to sign in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
