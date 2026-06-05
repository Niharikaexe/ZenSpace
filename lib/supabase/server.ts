import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — cookies can be read but not set
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Returns the signed-in user's id + email from the JWT for READ render paths.
 *
 * Prefer this over `supabase.auth.getUser()` in Server Components: `getClaims()`
 * verifies the access token **locally** (no Auth-server round trip) once the
 * project uses asymmetric JWT signing keys (Settings → JWT Keys → migrate to
 * ES256/RS256). Until then it transparently falls back to a network call, so
 * this is always correct and becomes free once asymmetric keys are enabled.
 *
 * Auth gating/redirects already happen in middleware; this is just for reading
 * the user id to scope queries. For sensitive MUTATIONS (Server Actions / route
 * handlers) keep using `getUser()`, which re-validates against the Auth server.
 *
 * Returns null when there is no valid session.
 */
export async function getAuthClaims(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ id: string; email: string | null } | null> {
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims as { sub?: string; email?: string } | undefined
  if (error || !claims?.sub) return null
  return { id: claims.sub, email: claims.email ?? null }
}
