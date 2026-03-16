import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { PendingDashboard } from '@/components/dashboard/PendingDashboard'
import { MatchedDashboard } from '@/components/dashboard/MatchedDashboard'

// Always render fresh — subscription and match status must never be stale
export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.warn('dashboard/client', 'No authenticated user — redirecting to login')
    redirect('/login')
  }

  // Use maybeSingle() — never throws on 0 rows, returns null instead
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profileError) {
    logger.error('dashboard/client', 'Failed to fetch profile', profileError, { userId: user.id })
  }

  // Safety net: profile row missing (user existed before schema was applied) — create it
  if (!profile) {
    logger.warn('dashboard/client', 'Profile row missing — creating via admin client', { userId: user.id })
    const admin = createAdminClient()
    const { error: upsertErr } = await (admin as any).from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? 'User',
      role: (user.user_metadata?.role as string) ?? 'client',
    })
    if (upsertErr) {
      logger.error('dashboard/client', 'Failed to upsert missing profile', upsertErr, { userId: user.id })
      redirect('/login')
    }
    logger.info('dashboard/client', 'Missing profile created — reloading', { userId: user.id })
    redirect('/dashboard')
  }

  if (profile.role !== 'client') {
    logger.warn('dashboard/client', 'Wrong role for client dashboard', { userId: user.id, role: profile.role })
    redirect(profile.role === 'admin' ? '/admin' : '/therapist/dashboard')
  }

  // Fetch active match — safe, returns null if none
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, status, therapist_id, created_at')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as {
      data: { id: string; status: string; therapist_id: string; created_at: string } | null
      error: unknown
    }

  if (matchError) {
    logger.error('dashboard/client', 'Failed to fetch match — defaulting to unmatched', matchError, {
      userId: user.id,
    })
  }

  // Fetch latest active subscription — safe, returns null if none
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, plan, status, current_period_end')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as {
      data: { id: string; plan: string; status: string; current_period_end: string | null } | null
      error: unknown
    }

  if (subError) {
    logger.error('dashboard/client', 'Failed to fetch subscription — defaulting to no subscription', subError, {
      userId: user.id,
    })
  }

  const isMatched = !!match
  const hasActiveSubscription = !!subscription

  // If matched, fetch therapist details via admin client (RLS on profiles only allows self-read)
  let therapistData: {
    fullName: string
    avatarUrl: string | null
    specializations: string[]
    bio: string | null
    approach: string | null
    yearsExperience: number
    languages: string[]
  } | null = null

  if (match) {
    const admin = createAdminClient()

    const [tProfileResult, tUserResult] = await Promise.all([
      (admin as any)
        .from('therapist_profiles')
        .select('specializations, bio, approach, years_experience, languages')
        .eq('user_id', match.therapist_id)
        .maybeSingle(),
      (admin as any)
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', match.therapist_id)
        .maybeSingle(),
    ])

    if (tProfileResult.error) {
      logger.error('dashboard/client', 'Failed to fetch therapist_profiles', tProfileResult.error, {
        userId: user.id,
        therapistId: match.therapist_id,
      })
    }
    if (tUserResult.error) {
      logger.error('dashboard/client', 'Failed to fetch therapist profile row', tUserResult.error, {
        userId: user.id,
        therapistId: match.therapist_id,
      })
    }

    const tProfile = tProfileResult.data
    const tUser = tUserResult.data

    if (tProfile && tUser) {
      therapistData = {
        fullName: tUser.full_name,
        avatarUrl: tUser.avatar_url ?? null,
        specializations: tProfile.specializations ?? [],
        bio: tProfile.bio ?? null,
        approach: tProfile.approach ?? null,
        yearsExperience: tProfile.years_experience ?? 0,
        languages: tProfile.languages ?? ['English'],
      }
    } else {
      logger.warn('dashboard/client', 'Therapist data incomplete — showing pending view as fallback', {
        userId: user.id,
        therapistId: match.therapist_id,
        hasTherapistProfile: !!tProfile,
        hasTherapistUser: !!tUser,
      })
    }
  }

  logger.info('dashboard/client', 'Dashboard rendered', {
    userId: user.id,
    isMatched,
    hasActiveSubscription,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-teal-700">ZenSpace</span>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back, {profile.full_name}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit" size="sm">Sign out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isMatched && therapistData ? (
          <MatchedDashboard
            userName={profile.full_name}
            userEmail={user.email ?? ''}
            therapist={therapistData}
            matchedSince={match!.created_at}
            subscription={
              subscription
                ? { plan: subscription.plan, periodEnd: subscription.current_period_end }
                : null
            }
          />
        ) : (
          <PendingDashboard
            userName={profile.full_name}
            userEmail={user.email ?? ''}
            hasActiveSubscription={hasActiveSubscription}
          />
        )}
      </main>
    </div>
  )
}
