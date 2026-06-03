'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updateProfile, sendPasswordReset, type ProfileActionState } from '@/app/actions/profile'
import { signOut } from '@/app/actions/auth'
import { deleteAccount } from '@/app/actions/delete-account'
import ClientNav from '@/components/client/ClientNav'

const initialState: ProfileActionState = {}

interface Props {
  userName: string
  userEmail: string
  isMatched: boolean
}

export function AccountForm({ userName, userEmail, isMatched }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState)
  const [resetState, setResetState] = useState<ProfileActionState>({})
  const [resetPending, setResetPending] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  async function handlePasswordReset() {
    setResetPending(true)
    const result = await sendPasswordReset()
    setResetState(result)
    setResetPending(false)
  }

  async function handleDeleteAccount() {
    setDeletePending(true)
    setDeleteError(null)
    const result = await deleteAccount()
    setDeletePending(false)
    if (result?.error) setDeleteError(result.error)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ClientNav userName={userName} isMatched={isMatched} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#233551]/45 hover:text-[#233551] transition-colors mb-6"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-black text-[#233551] mb-8" style={{ fontFamily: 'var(--font-lato)' }}>
          My Account
        </h1>

        {/* Profile */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-5">
            Profile
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full bg-[#233551] text-white font-black text-2xl flex items-center justify-center flex-shrink-0"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#233551]">{userName}</p>
              <p className="text-xs text-[#233551]/35 mt-0.5">Profile photo upload coming soon</p>
            </div>
          </div>

          <form action={profileAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#233551]/50 uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <input
                name="fullName"
                defaultValue={userName}
                required
                className="w-full border-2 border-slate-200 focus:border-[#7EC0B7] rounded-xl px-4 py-2.5 text-sm text-[#233551] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#233551]/50 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                value={userEmail}
                disabled
                readOnly
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm text-[#233551]/40 bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-[#233551]/30 mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>

            {profileState.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{profileState.error}</p>
            )}
            {profileState.success && (
              <p className="text-sm text-[#3D8A80] bg-[#7EC0B7]/10 rounded-xl px-4 py-2.5">{profileState.success}</p>
            )}

            <button
              type="submit"
              disabled={profilePending}
              className="bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {profilePending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-2">
            Password
          </h2>
          <p className="text-sm text-[#233551]/50 mb-4 leading-relaxed">
            We&apos;ll send a password reset link to{' '}
            <span className="font-medium text-[#233551]/70">{userEmail}</span>.
          </p>

          {resetState.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{resetState.error}</p>
          )}
          {resetState.success && (
            <p className="text-sm text-[#3D8A80] bg-[#7EC0B7]/10 rounded-xl px-4 py-2.5 mb-3">{resetState.success}</p>
          )}

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetPending}
            className="border-2 border-slate-200 hover:border-[#233551]/30 text-[#233551] text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            {resetPending ? 'Sending...' : 'Send reset email'}
          </button>
        </section>

        {/* Billing */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-black text-[#233551]/40 uppercase tracking-widest mb-2">
            Billing
          </h2>
          <p className="text-sm text-[#233551]/50 mb-4 leading-relaxed">
            No subscription, no commitment. You pay per session when you book one — securely via
            Razorpay. Sessions are non-refundable.
          </p>
          {isMatched && (
            <Link
              href="/dashboard/sessions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D8A80] hover:underline"
            >
              Book a session →
            </Link>
          )}
        </section>

        {/* Sign out */}
        <section className="bg-white border border-red-100 rounded-3xl p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">
            Sign out
          </h2>
          <p className="text-sm text-[#233551]/50 mb-4">
            Sign out of your MindCanopy account on this device.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Sign out
            </button>
          </form>
        </section>

        {/* Delete account */}
        <section className="bg-white border border-red-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">
            Delete account
          </h2>
          <p className="text-sm text-[#233551]/50 mb-4 leading-relaxed">
            This permanently deletes your account, messages, and all personal data. This cannot be undone.
          </p>

          {deleteError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{deleteError}</p>
          )}

          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="border-2 border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletePending}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                {deletePending ? 'Deleting...' : 'Yes, delete permanently'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="text-sm text-[#233551]/50 hover:text-[#233551] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
