"use client"

import { useActionState } from "react"
import { signIn, type AuthState } from "@/app/actions/auth"
import Link from "next/link"

const initialState: AuthState = {}

export default function TherapistLoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState)

  return (
    <div className="min-h-screen bg-[#FFF5F2] flex flex-col">
      {/* Top nav strip */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-[#7EC0B7] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#7EC0B7]" />
          </div>
          <span className="font-black text-base text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            ZenSpace
          </span>
        </Link>
        <Link href="/" className="text-sm text-[#233551]/50 hover:text-[#233551] transition-colors">
          ← Back to home
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#7EC0B7]/15 text-[#3D8A80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
              Therapist Portal
            </div>
            <h1
              className="text-3xl font-black text-[#233551] leading-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-[#233551]/50 mt-2">
              Sign in to your therapist dashboard
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#233551]/8 border border-slate-100">
            <form action={action} className="space-y-5">
              {/* Error */}
              {state.error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {state.error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#233551]/60 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#233551] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7] transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#233551]/60 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#233551] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7] transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-[#7EC0B7] hover:bg-[#6AADA4] text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#7EC0B7]/25 hover:shadow-xl hover:shadow-[#7EC0B7]/30 hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {pending ? "Signing in…" : "Sign in to portal"}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[#233551]/35 mt-6">
            Not yet onboarded?{" "}
            <Link href="/therapist/onboard" className="text-[#3D8A80] font-semibold hover:underline">
              Use your invite code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
