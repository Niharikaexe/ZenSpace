import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // Two verification paths:
  //  1. token_hash + type → verifyOtp. This is the robust path used by the email
  //     confirmation + recovery templates. It does NOT need the PKCE code-verifier
  //     cookie, so it both confirms the email AND sets the session even when the
  //     link is opened on a different device/browser than signup. This is the
  //     path the email templates should use (see the token_hash template).
  //  2. code → exchangeCodeForSession (PKCE). Kept for OAuth and older links, but
  //     it fails when the code-verifier cookie is absent (link opened elsewhere).
  let verifyError: { message?: string } | null = null

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    verifyError = error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    verifyError = error
  }
  // No verifiable params is not an immediate failure: the user may already have a
  // session (e.g. they clicked the link a second time). Fall through to the
  // getUser() check below.

  // Whether or not the verify call above succeeded, check for an actual session.
  // This is the key robustness fix: when the single-use token has already been
  // consumed — Supabase's /auth/v1/verify endpoint confirmed the email
  // server-side, an email scanner prefetched the link, or the user clicked twice
  // — verifyOtp/exchangeCodeForSession return an error, but the user may already
  // be signed in. If a session exists, honor it instead of showing a scary error.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.error('auth/callback', 'No session after callback', verifyError ?? null, {
      hasCode: !!code,
      hasTokenHash: !!tokenHash,
      type,
      message: verifyError?.message,
    })
    // Distinguish an expired link so the user knows to request a fresh one.
    const reason = (verifyError?.message ?? '').toLowerCase().includes('expired')
      ? 'auth_link_expired'
      : 'auth_callback_failed'
    return NextResponse.redirect(`${origin}/login?error=${reason}`)
  }

  if (verifyError) {
    // We have a session despite the verify error — proceed (don't block the user).
    logger.warn('auth/callback', 'Verify call errored but a valid session exists — proceeding', {
      type,
      message: verifyError.message,
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null; error: unknown }

  if (profileError) {
    logger.error('auth/callback', 'Failed to fetch profile after verification', profileError, {
      userId: user.id,
    })
  }

  // Safety net: profile missing — create it from auth metadata
  if (!profile) {
    logger.warn('auth/callback', 'Profile row missing — creating via admin client', { userId: user.id })
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    const { error: upsertErr } = await (admin as any).from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? 'User',
      role: (user.user_metadata?.role as string) ?? 'client',
    })
    if (upsertErr) {
      logger.error('auth/callback', 'Failed to upsert missing profile', upsertErr, { userId: user.id })
    } else {
      logger.info('auth/callback', 'Missing profile created', { userId: user.id })
    }
  }

  const role = profile?.role ?? (user.user_metadata?.role as string) ?? 'client'

  // A password-recovery link must land on the reset-password page, never the
  // dashboard — and must not trigger the welcome email.
  const isRecovery = type === 'recovery' || next === '/auth/reset-password'

  // No separate welcome email is sent here anymore. The single combined
  // "welcome + you've been matched" email (client_match_made) is dispatched by
  // autoMatchClient — at signup for new clients, or here as a fallback if the
  // signup-time match didn't run. autoMatchClient is idempotent, so a client
  // already matched at signup gets no second email.
  if (role === 'client' && !isRecovery) {
    const { autoMatchClient } = await import('@/lib/auto-match')
    await autoMatchClient(user.id)
  }

  // The session is now set on the response cookies, so the user lands already
  // signed in. Route by role; recovery always goes to the reset page.
  const destination =
    isRecovery ? '/auth/reset-password' :
    role === 'admin' ? '/admin' :
    role === 'therapist' ? '/therapist/dashboard' :
    next

  logger.info('auth/callback', 'Auth callback successful', { userId: user.id, role, destination })
  return NextResponse.redirect(`${origin}${destination}`)
}
