import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendNotificationEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    logger.warn('auth/callback', 'No code in callback URL', { next })
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    logger.error('auth/callback', 'Code exchange failed', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    logger.error('auth/callback', 'Failed to get user after code exchange', userError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null; error: unknown }

  if (profileError) {
    logger.error('auth/callback', 'Failed to fetch profile after code exchange', profileError, {
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

  // Send the client welcome email here — i.e. once the user has actually
  // confirmed their email — rather than during signup. Skip password-reset
  // callbacks (they set next=/auth/reset-password). The confirmation code is
  // single-use, so this fires once per account. (If magic-link login is added
  // later, revisit this guard so returning users don't get re-welcomed.)
  if (role === 'client' && next !== '/auth/reset-password' && user.email) {
    const firstName = ((user.user_metadata?.full_name as string | undefined) ?? '').split(' ')[0] || 'there'
    await sendNotificationEmail({ to: user.email, name: firstName, type: 'client_welcome', meta: {} })
  }

  // Always honour explicit `next` params that require specific landing pages (e.g. password reset)
  const destination =
    next === '/auth/reset-password' ? next :
    role === 'admin' ? '/admin' :
    role === 'therapist' ? '/therapist/dashboard' :
    next

  logger.info('auth/callback', 'Auth callback successful', { userId: user.id, role, destination })
  return NextResponse.redirect(`${origin}${destination}`)
}
