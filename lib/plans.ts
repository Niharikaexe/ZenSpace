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
