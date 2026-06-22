import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// One-time login from an email button. Our notification emails to clients embed
// a Supabase magic-link token (generated server-side via admin.generateLink);
// the button points here. We verify the token, which sets the session cookies,
// then forward the user to their destination already logged in.
//
// Mirrors /auth/callback (same SSR client + redirect pattern) but uses
// verifyOtp(token_hash) instead of exchangeCodeForSession, because admin-
// generated links carry no PKCE code_verifier.
//
// Fail-safe: if the token is missing, expired, already used, or otherwise
// invalid, we fall through to /login?next=… — i.e. the normal login screen,
// which is exactly the pre-existing behaviour. No worse than before, never an
// error page.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'magiclink') as EmailOtpType
  const rawNext = searchParams.get('next') ?? '/dashboard'

  // Only allow same-site relative paths (block open-redirect via //evil.com).
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
  const loginUrl = `${origin}/login?next=${encodeURIComponent(next)}`

  if (!tokenHash) {
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    // Expired / already-used / wrong-type — send them to log in normally.
    logger.info('auth/confirm', 'verifyOtp failed; routing to login', { err: error.message, next })
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
