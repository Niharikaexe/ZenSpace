import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscriptionView from './SubscriptionView'
import { cashfreeConfigured } from '@/lib/cashfree'
import {
  sessionPriceInr,
  monthlyBundleInr,
  MONTHLY_BUNDLE_SESSIONS,
  MONTHLY_BUNDLE_DISCOUNT,
  type SessionCategory,
  type ProposalTier,
} from '@/lib/plans'

export const dynamic = 'force-dynamic'

function normalizeCategory(raw: unknown): SessionCategory {
  return raw === 'couples' || raw === 'teen' ? raw : 'individual'
}

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'client') redirect('/dashboard')

  const admin = createAdminClient()
  const { data: match } = await (admin as any)
    .from('matches')
    .select('id, therapist_id, tier')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string; therapist_id: string; tier: string | null } | null; error: unknown }

  // No active match yet → can't price a bundle. Show the "get matched first" state.
  if (!match) {
    return (
      <SubscriptionView
        userName={profile?.full_name ?? ''}
        isMatched={false}
        therapistName={null}
        perSessionInr={0}
        bundleInr={0}
        bundleSessions={MONTHLY_BUNDLE_SESSIONS}
        discountPct={Math.round(MONTHLY_BUNDLE_DISCOUNT * 100)}
        activeCreditsRemaining={null}
        activeCreditsTotal={null}
        paymentsEnabled={cashfreeConfigured()}
      />
    )
  }

  const tier: ProposalTier = match.tier === 'professional' ? 'professional' : 'standard'

  const { data: questionnaire } = await (admin as any)
    .from('questionnaire_responses')
    .select('responses')
    .eq('client_id', user.id)
    .maybeSingle() as { data: { responses: Record<string, unknown> } | null; error: unknown }
  const category = normalizeCategory(questionnaire?.responses?.type)

  const perSessionInr = sessionPriceInr(category, tier)
  const bundleInr = monthlyBundleInr(perSessionInr)

  const [tUserResult, bundleResult] = await Promise.all([
    (admin as any).from('profiles').select('full_name').eq('id', match.therapist_id).single(),
    (admin as any)
      .from('session_bundles')
      .select('credits_remaining, credits_total')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  const therapistName = (tUserResult.data?.full_name as string | undefined) ?? 'your therapist'
  const activeBundle = bundleResult.data as { credits_remaining: number; credits_total: number } | null

  return (
    <SubscriptionView
      userName={profile?.full_name ?? ''}
      isMatched={true}
      therapistName={therapistName}
      perSessionInr={perSessionInr}
      bundleInr={bundleInr}
      bundleSessions={MONTHLY_BUNDLE_SESSIONS}
      discountPct={Math.round(MONTHLY_BUNDLE_DISCOUNT * 100)}
      activeCreditsRemaining={activeBundle?.credits_remaining ?? null}
      activeCreditsTotal={activeBundle?.credits_total ?? null}
      paymentsEnabled={cashfreeConfigured()}
    />
  )
}
