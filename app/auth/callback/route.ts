import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendNotificationEmail } from '@/lib/email'
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
  //     cookie, so it works even when the link is opened on a different device/
  //     browser than signup — which is why links were failing with
  //     auth_callback_failed before.
  //  2. code → exchangeCodeForSession (PKCE). Kept for OAuth and any older links.
  let verifyError: { message?: string } | null = null

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    verifyError = error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    verifyError = error
  } else {
    logger.warn('auth/callback', 'No code or token_hash in callback URL', { next })
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  if (verifyError) {
    logger.error('auth/callback', 'Email verification failed', verifyError, {
      hasCode: !!code,
      hasTokenHash: !!tokenHash,
      type,
      message: verifyError.message,
    })
    // Likely an expired/already-used link (e.g. prefetched by an email scanner)
    // — surface a distinct message so the user knows to request a fresh one.
    const reason = (verifyError.message ?? '').toLowerCase().includes('expired')
      ? 'auth_link_expired'
      : 'auth_callback_failed'
    return NextResponse.redirect(`${origin}/login?error=${reason}`)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    logger.error('auth/callback', 'Failed to get user after verification', userError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
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

  // Send the client welcome email here — i.e. once the user has actually
  // confirmed their email — rather than during signup. The confirmation token
  // is single-use, so this fires once per account. Skipped for recovery links.
  if (role === 'client' && !isRecovery && user.email) {
    const firstName = ((user.user_metadata?.full_name as string | undefined) ?? '').split(' ')[0] || 'there'
    await sendNotificationEmail({ to: user.email, name: firstName, type: 'client_welcome', meta: {} })
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
