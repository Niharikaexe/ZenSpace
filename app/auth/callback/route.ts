import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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
    .single() as { data: { role: string } | null; error: unknown }

  if (profileError) {
    logger.error('auth/callback', 'Failed to fetch profile after code exchange', profileError, {
      userId: user.id,
    })
  }

  const role = profile?.role ?? 'client'
  const destination =
    role === 'admin' ? '/admin' :
    role === 'therapist' ? '/therapist/dashboard' :
    next

  logger.info('auth/callback', 'Auth callback successful', { userId: user.id, role, destination })
  return NextResponse.redirect(`${origin}${destination}`)
}
