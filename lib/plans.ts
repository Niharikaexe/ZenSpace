// Central plan configuration for MindCanopy subscriptions.
// Each plan maps to one Razorpay plan (created in Razorpay dashboard).
// Razorpay plan IDs are set in Vercel env vars.

export const PLANS = {
  // ── Individual plans ────────────────────────────────────────────────────────
  basic_weekly: {
    name: 'Basic',
    cadence: 'weekly' as const,
    category: 'individual' as const,
    tagline: 'Everything you need to start',
    price: '₹1,499',
    per: 'week',
    amountPaise: 149900,
    sessionsPerWeek: 1,
    features: [
      'Skilled Therapists',
      'A licensed therapist tailored just for you',
      '1 video session per week (50 min)',
      'Unlimited chat with your therapist',
      'Switch therapist anytime',
    ],
    highlight: false,
    planIdEnvVar: 'RAZORPAY_PLAN_BASIC_WEEKLY',
  },
  basic_monthly: {
    name: 'Basic',
    cadence: 'monthly' as const,
    category: 'individual' as const,
    tagline: 'Everything you need to start',
    price: '₹5,299',
    per: 'month',
    amountPaise: 529900,
    sessionsPerWeek: 1,
    features: [
      'Skilled Therapists',
      'A licensed therapist tailored just for you',
      '4 video sessions per month (50 min each)',
      'Unlimited chat with your therapist',
      'Switch therapist anytime',
    ],
    highlight: false,
    planIdEnvVar: 'RAZORPAY_PLAN_BASIC_MONTHLY',
  },
  premium_weekly: {
    name: 'Premium',
    cadence: 'weekly' as const,
    category: 'individual' as const,
    tagline: 'Priority access and global therapists',
    price: '₹4,499',
    per: 'week',
    amountPaise: 449900,
    sessionsPerWeek: 1,
    features: [
      '10+ years of experience therapists',
      'A licensed international therapist just for you',
      '1 video session per week (50 min)',
      'Unlimited priority chat with your therapist',
      'Switch therapist anytime',
      'Community benefits and more',
    ],
    highlight: true,
    planIdEnvVar: 'RAZORPAY_PLAN_PREMIUM_WEEKLY',
  },
  premium_monthly: {
    name: 'Premium',
    cadence: 'monthly' as const,
    category: 'individual' as const,
    tagline: 'Priority access and global therapists',
    price: '₹15,699',
    per: 'month',
    amountPaise: 1569900,
    sessionsPerWeek: 1,
    features: [
      '10+ years of experience therapists',
      'A licensed international therapist just for you',
      '4 video sessions per month (50 min each)',
      'Unlimited priority chat with your therapist',
      'Switch therapist anytime',
      'Community benefits and more',
    ],
    highlight: true,
    planIdEnvVar: 'RAZORPAY_PLAN_PREMIUM_MONTHLY',
  },

  // ── Couples plans ────────────────────────────────────────────────────────────
  couples_basic_weekly: {
    name: 'Couples Basic',
    cadence: 'weekly' as const,
    category: 'couples' as const,
    tagline: 'Work through it together',
    price: '₹2,299',
    per: 'week',
    amountPaise: 229900,
    sessionsPerWeek: 1,
    features: [
      '1 couples session per week (50 min)',
      'Unlimited async text for both partners',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Complete privacy',
    ],
    highlight: false,
    planIdEnvVar: 'RAZORPAY_PLAN_COUPLES_BASIC_WEEKLY',
  },
  couples_basic_monthly: {
    name: 'Couples Basic',
    cadence: 'monthly' as const,
    category: 'couples' as const,
    tagline: 'Work through it together',
    price: '₹7,999',
    per: 'month',
    amountPaise: 799900,
    sessionsPerWeek: 1,
    features: [
      '4 couples sessions per month (50 min each)',
      'Unlimited async text for both partners',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Complete privacy',
    ],
    highlight: false,
    planIdEnvVar: 'RAZORPAY_PLAN_COUPLES_BASIC_MONTHLY',
  },
  couples_premium_weekly: {
    name: 'Couples Premium',
    cadence: 'weekly' as const,
    category: 'couples' as const,
    tagline: 'Priority care for both of you',
    price: '₹5,499',
    per: 'week',
    amountPaise: 549900,
    sessionsPerWeek: 1,
    features: [
      '1 couples session per week (50 min)',
      'Unlimited async text for both partners',
      'Priority message response',
      'Foreign therapist access',
      'Switch therapist anytime',
      'Session notes (read-only)',
    ],
    highlight: true,
    planIdEnvVar: 'RAZORPAY_PLAN_COUPLES_PREMIUM_WEEKLY',
  },
  couples_premium_monthly: {
    name: 'Couples Premium',
    cadence: 'monthly' as const,
    category: 'couples' as const,
    tagline: 'Priority care for both of you',
    price: '₹19,499',
    per: 'month',
    amountPaise: 1949900,
    sessionsPerWeek: 1,
    features: [
      '4 couples sessions per month (50 min each)',
      'Unlimited async text for both partners',
      'Priority message response',
      'Foreign therapist access',
      'Switch therapist anytime',
      'Session notes (read-only)',
    ],
    highlight: true,
    planIdEnvVar: 'RAZORPAY_PLAN_COUPLES_PREMIUM_MONTHLY',
  },
} as const

export type PlanKey = keyof typeof PLANS
export type PlanCadence = 'weekly' | 'monthly'
export type PlanCategory = 'individual' | 'couples'

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[]

// ── Per-session pricing (dual-therapist proposal flow) ────────────────────────
// Shown at the bottom of each therapist's profile card when a client chooses
// between their matched Standard and Professional therapists. Clients pay as
// they go per session, or take a monthly bundle (4 sessions) for 15% off.
//
// Per-session client pricing (INR) depends on the client's category
// (Adult/Individual, Teen, Couples) and the therapist's tier.
export type ProposalTier = 'standard' | 'professional'
export type SessionCategory = 'individual' | 'teen' | 'couples'

export const TIER_LABELS: Record<ProposalTier, string> = {
  standard: 'Standard',
  professional: 'Professional',
}

export const SESSION_PRICING: Record<SessionCategory, Record<ProposalTier, number>> = {
  individual: { standard: 1300, professional: 3200 },
  teen: { standard: 1800, professional: 4000 },
  couples: { standard: 2400, professional: 5000 },
}

/** Per-session price (INR) for a given category + tier. */
export function sessionPriceInr(category: SessionCategory, tier: ProposalTier): number {
  return SESSION_PRICING[category][tier]
}

/** Sessions billed in a monthly bundle. */
export const MONTHLY_BUNDLE_SESSIONS = 4
/** Discount applied to the monthly bundle vs paying per session. */
export const MONTHLY_BUNDLE_DISCOUNT = 0.15

/** Monthly bundle price (4 sessions, 15% off), rounded to the nearest rupee. */
export function monthlyBundleInr(perSessionInr: number): number {
  return Math.round(perSessionInr * MONTHLY_BUNDLE_SESSIONS * (1 - MONTHLY_BUNDLE_DISCOUNT))
}

/** Format an INR amount as e.g. "₹1,300". */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

// ── Therapist payout (pay-as-you-go) ──────────────────────────────────────────
// The therapist's earning per completed session, frozen onto the session row at
// booking time so later price/experience edits don't rewrite payout history.
//
// Payout depends on the client's category, the therapist's proposal tier, and —
// for Standard therapists — their years of experience band:
//   • Standard 3–5 yrs  → `lo`
//   • Standard 5–8 yrs  → `hi`   (years_experience >= 5)
//   • Professional      → flat   (8+ yrs or foreign therapists)
export const THERAPIST_PAYOUT: Record<
  SessionCategory,
  { standard: { lo: number; hi: number }; professional: number }
> = {
  individual: { standard: { lo: 800, hi: 1000 }, professional: 2500 },
  teen: { standard: { lo: 1200, hi: 1400 }, professional: 3200 },
  couples: { standard: { lo: 1400, hi: 1800 }, professional: 3500 },
}

/**
 * Therapist payout (INR) for one completed session.
 * Standard tier splits on the 3–5 vs 5–8 years-of-experience band; Professional
 * tier is a flat amount regardless of experience.
 */
export function therapistSessionPayoutInr(
  category: SessionCategory,
  tier: ProposalTier,
  yearsExperience: number,
): number {
  const band = THERAPIST_PAYOUT[category]
  if (tier === 'professional') return band.professional
  return yearsExperience >= 5 ? band.standard.hi : band.standard.lo
}

/**
 * Therapist's default revenue share per completed session — 75% of the
 * per-session value of the client's subscription plan, in rupees.
 *
 * Weekly plans bill for 1 session/week, so per-session value = full weekly
 * charge. Monthly plans bill for 4 sessions/month, so per-session value =
 * monthly charge ÷ 4.
 *
 * Example: client on premium_monthly (₹15,699/mo) → ₹3,925 per session →
 * therapist gets ₹2,944 per completed session.
 */
export const DEFAULT_THERAPIST_SHARE_RATE = 0.75

export function therapistSessionPayout(planKey: PlanKey, shareRate: number = DEFAULT_THERAPIST_SHARE_RATE): number {
  const plan = PLANS[planKey]
  const sessionsInPeriod = plan.cadence === 'monthly' ? 4 : 1
  const perSessionRupees = (plan.amountPaise / 100) / sessionsInPeriod
  return Math.round(perSessionRupees * shareRate)
}

/** Returns the Razorpay plan ID from env, or null if not configured. */
export function getRazorpayPlanId(planKey: PlanKey): string | null {
  const envVar = PLANS[planKey].planIdEnvVar
  return process.env[envVar] ?? null
}

/** Get the plan key for a given category + cadence + tier. */
export function getPlanKey(category: PlanCategory, tier: 'basic' | 'premium', cadence: PlanCadence): PlanKey {
  if (category === 'couples') {
    return cadence === 'weekly'
      ? (tier === 'basic' ? 'couples_basic_weekly' : 'couples_premium_weekly')
      : (tier === 'basic' ? 'couples_basic_monthly' : 'couples_premium_monthly')
  }
  return cadence === 'weekly'
    ? (tier === 'basic' ? 'basic_weekly' : 'premium_weekly')
    : (tier === 'basic' ? 'basic_monthly' : 'premium_monthly')
}
