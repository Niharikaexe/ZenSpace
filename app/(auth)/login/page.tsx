'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
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

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, initialState)

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

        <div className="mt-10">
          <div className="bg-[#E8926A]/15 border border-[#E8926A]/25 rounded-2xl px-5 py-4">
            <p className="text-white/90 text-sm leading-relaxed italic">
              &quot;Changed how I handle anxiety at work.&quot;
            </p>
            <p className="text-[#E8926A] text-xs font-semibold mt-2">— Priya, 28, Mumbai</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#7EC0B7] hover:underline font-medium">
              Get started
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
            <div className="mb-8">
              <h1
                className="text-2xl font-black text-[#233551]"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Welcome back
              </h1>
              <p className="text-sm text-[#233551]/55 mt-1">
                Sign in to continue your therapy journey.
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#233551] font-medium text-sm">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-[#3D8A80] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-full bg-[#7EC0B7] hover:bg-[#3D8A80] text-white font-bold text-sm transition-colors mt-2"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="md:hidden text-center text-sm text-[#233551]/50 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#3D8A80] font-medium hover:underline">
                Get started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
