"use client"

import { useActionState, useEffect, useState } from "react"
import { signIn, type AuthState } from "@/app/actions/auth"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { BrandLogo } from "@/components/shared/BrandLogo"

const initialState: AuthState = {}

export default function TherapistLoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [blurred, setBlurred] = useState({ email: false, password: false })
  const [serverError, setServerError] = useState<string | undefined>()

  useEffect(() => { setServerError(state.error) }, [state.error])

  function markBlurred(field: keyof typeof blurred) {
    setBlurred(prev => ({ ...prev, [field]: true }))
  }

  function clearServerError() { setServerError(undefined) }

  const emailError = blurred.email && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? "Enter a valid email address" : ""
  const passwordError = blurred.password && password.length > 0 && password.length < 8
    ? "Password must be at least 8 characters" : ""

  return (
    <div className="min-h-screen bg-[#FFF5F2] flex flex-col">
      {/* Top nav strip */}
      <div className="flex items-center justify-between px-6 py-4">
        <BrandLogo variant="teal" owlSize={22} />
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
              {serverError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {serverError}
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
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearServerError() }}
                  onBlur={() => markBlurred("email")}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-[#233551] placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-slate-200 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7]"
                  }`}
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#233551]/60 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearServerError() }}
                    onBlur={() => markBlurred("password")}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm text-[#233551] placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                      passwordError
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-slate-200 focus:ring-[#7EC0B7]/40 focus:border-[#7EC0B7]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#233551]/35 hover:text-[#233551]/70 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
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
