import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const metadata = {
  title: 'Email verified — MindCanopy',
  description: 'Your email has been verified for your therapist application.',
}

export const dynamic = 'force-dynamic'

type Status = 'verified' | 'already-verified' | 'invalid' | 'missing-token'

async function consumeVerificationToken(token: string): Promise<Status> {
  const admin = createAdminClient()

  const { data: app, error: lookupErr } = await (admin as any)
    .from('therapist_applications')
    .select('id, email_verified_at')
    .eq('email_verification_token', token)
    .maybeSingle()

  if (lookupErr) {
    logger.error('therapist/verify-email', 'Lookup failed', lookupErr)
    return 'invalid'
  }
  if (!app) return 'invalid'

  if (app.email_verified_at) {
    return 'already-verified'
  }

  const { error: updateErr } = await (admin as any)
    .from('therapist_applications')
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', app.id)

  if (updateErr) {
    logger.error('therapist/verify-email', 'Failed to mark verified', updateErr, { applicationId: app.id })
    return 'invalid'
  }

  logger.info('therapist/verify-email', 'Application email verified', { applicationId: app.id })
  return 'verified'
}

export default async function TherapistVerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  let status: Status
  if (!token) {
    status = 'missing-token'
  } else {
    status = await consumeVerificationToken(token)
  }

  const isSuccess = status === 'verified' || status === 'already-verified'

  const heading =
    status === 'verified' ? 'Your email id is successfully verified.' :
    status === 'already-verified' ? 'Your email is already verified.' :
    status === 'missing-token' ? 'Verification link is missing a token.' :
    'This verification link isn\'t valid.'

  const subtext =
    status === 'verified'
      ? 'Thanks for confirming. We\'re reviewing your application and will be in touch within 3–5 working days about the next steps.'
      : status === 'already-verified'
      ? 'Looks like you\'ve already confirmed this email. We\'re reviewing your application — we\'ll be in touch soon.'
      : status === 'missing-token'
      ? 'Open the verify-email link from the confirmation email we sent you, or write to us if it isn\'t arriving.'
      : 'The link may have expired or already been used. If you think this is a mistake, write to us.'

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

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm px-8 py-10 text-center">

          {/* Icon */}
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-[#7EC0B7]/15' : 'bg-[#E8926A]/15'
            }`}
          >
            {isSuccess ? (
              <svg
                className="w-8 h-8 text-[#3D8A80]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-[#E8926A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.34 16a2 2 0 001.73 3z"
                />
              </svg>
            )}
          </div>

          <h1
            className="text-2xl md:text-3xl font-black text-[#233551] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {heading}
          </h1>
          <p className="text-[#233551]/55 text-sm leading-relaxed mb-8">
            {subtext}
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-8 py-3.5 rounded-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold transition-colors"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Back to MindCanopy →
          </Link>

          {!isSuccess && (
            <p className="text-xs text-[#233551]/40 mt-5">
              Need help? Email{' '}
              <a
                href="mailto:admin@mindcanopy.in"
                className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2"
              >
                admin@mindcanopy.in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
