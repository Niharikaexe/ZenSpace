import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Single edge entry point: refreshes the Supabase session cookie and enforces
// auth/role gating once per request (see lib/supabase/middleware.ts), instead
// of every page doing it independently.
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
