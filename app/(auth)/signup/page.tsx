'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const initialState = { error: undefined, success: false }

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, initialState)

  if (state.success) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="pt-8 pb-8 text-center space-y-3">
          <div className="text-4xl">📬</div>
          <h2 className="text-xl font-semibold text-teal-700">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to your email. Click it to activate your account.
          </p>
          <Link href="/login" className="text-sm text-teal-600 hover:underline block">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
        <CardDescription className="text-center">
          Start your journey to better mental wellness
        </CardDescription>
      </CardHeader>

      <CardContent>
        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={action} className="space-y-4">
          {/* Role is always client for self-signup */}
          <input type="hidden" name="role" value="client" />

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isPending}
          >
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing up you agree to our{' '}
            <Link href="/terms" className="underline hover:text-teal-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-teal-600">Privacy Policy</Link>
          </p>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
