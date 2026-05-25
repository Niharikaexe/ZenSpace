'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initialState = { error: undefined, success: false }

export default function ResetPasswordPage() {
  const [state, action, isPending] = useActionState(updatePassword, initialState)
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="font-black text-2xl tracking-tight text-[#233551]"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              MindCanopy
            </span>
          </Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          <div className="mb-7">
            <h1
              className="text-2xl font-black text-[#233551]"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Set a new password
            </h1>
            <p className="text-sm text-[#233551]/55 mt-1">
              Choose something you won&apos;t forget this time.
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#233551] font-medium text-sm">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  className="rounded-xl border-slate-200 focus:border-[#7EC0B7] focus:ring-[#7EC0B7]/20 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#233551]/35 hover:text-[#233551]/70 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-[#7EC0B7] hover:bg-[#3D8A80] text-white font-bold text-sm transition-colors mt-2"
              disabled={isPending}
            >
              {isPending ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
