import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

type ProfileRow = { role: string }

async function getRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle() as { data: ProfileRow | null; error: unknown }

  if (error) {
    logger.error('middleware/getRole', 'Failed to fetch role', error, { userId })
  }

  return data?.role ?? 'client'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // AuthSessionMissingError is normal for unauthenticated visitors — not a real error
  if (authError && authError.name !== 'AuthSessionMissingError') {
    logger.error('middleware', 'supabase.auth.getUser() failed', authError, {
      path: request.nextUrl.pathname,
    })
  }

  const pathname = request.nextUrl.pathname

  // Public routes — no auth required
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/therapist/login' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/questionnaire') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/market-reports') ||
    pathname.startsWith('/help') ||
    pathname === '/therapist/onboard' ||        // invite-based onboarding (no account yet)
    pathname.startsWith('/for') ||              // audience landing pages (public marketing)
    pathname.startsWith('/api/payment/webhook') // webhook must be unauthenticated

  if (!user && !isPublic) {
    logger.info('middleware', 'Unauthenticated access — redirecting to login', { path: pathname })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/therapist/login' ||
    pathname === '/admin/login'

  if (user && isAuthPage) {
    const role = await getRole(supabase, user.id)
    const url = request.nextUrl.clone()
    url.pathname = role === 'admin' ? '/admin' : role === 'therapist' ? '/therapist/dashboard' : '/dashboard'
    logger.info('middleware', 'Authenticated user on auth page — redirecting', {
      userId: user.id,
      role,
      destination: url.pathname,
    })
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/admin')) {
    const role = await getRole(supabase, user.id)
    if (role !== 'admin') {
      logger.warn('middleware', 'Non-admin accessing /admin — blocked', { userId: user.id, role })
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (user && pathname.startsWith('/therapist')) {
    const role = await getRole(supabase, user.id)
    if (role !== 'therapist' && role !== 'admin') {
      logger.warn('middleware', 'Non-therapist accessing /therapist — blocked', { userId: user.id, role })
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
