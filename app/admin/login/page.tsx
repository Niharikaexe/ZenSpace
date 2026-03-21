"use client"

import { useActionState } from "react"
import { signIn, type AuthState } from "@/app/actions/auth"
import Link from "next/link"

const initialState: AuthState = {}

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState)

  return (
    <div className="min-h-screen bg-[#233551] flex flex-col">
      {/* Top nav strip */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-[#7EC0B7] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#7EC0B7]" />
          </div>
          <span className="font-black text-base text-white" style={{ fontFamily: 'var(--font-lato)' }}>
            ZenSpace
          </span>
        </Link>
        <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7EC0B7]" />
              Admin Access
            </div>
            <h1
              className="text-3xl font-black text-white leading-tight"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Admin dashboard
            </h1>
            <p className="text-sm text-white/40 mt-2">
              Restricted access — authorised personnel only
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#1d2d47] rounded-3xl p-8 border border-white/10 shadow-2xl">
            <form action={action} className="space-y-5">
              {/* Error */}
              {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                  {state.error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@zenspace.in"
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7]/50 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7]/50 transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-[#7EC0B7] hover:bg-[#6AADA4] text-[#233551] font-black py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#7EC0B7]/20 hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                {pending ? "Signing in…" : "Access dashboard"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-white/20 mt-6">
            If you&apos;re a therapist,{" "}
            <Link href="/therapist/login" className="text-[#7EC0B7]/70 hover:text-[#7EC0B7] font-semibold transition-colors">
              sign in here instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
