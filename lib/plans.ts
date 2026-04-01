// Central plan configuration for ZenSpace subscriptions.
// Each plan maps to one Razorpay plan (created in Razorpay dashboard).
// Razorpay plan IDs are set in Vercel env vars.

export const PLANS = {
  // ── Individual plans ────────────────────────────────────────────────────────
  basic_weekly: {
    name: 'Basic',
    cadence: 'weekly' as const,
    category: 'individual' as const,
    tagline: 'Everything you need to start',
    price: '₹1,799',
    per: 'week',
    amountPaise: 179900,
    features: [
      '1 video session per week (50 min)',
      'Unlimited async text messaging',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Complete privacy',
    ],
    highlight: false,
    planIdEnvVar: 'RAZORPAY_PLAN_BASIC_WEEKLY',
  },
  basic_monthly: {
    name: 'Basic',
    cadence: 'monthly' as const,
    category: 'individual' as const,
    tagline: 'Everything you need to start',
    price: '₹6,499',
    per: 'month',
    amountPaise: 649900,
    features: [
      '4 video sessions per month (50 min each)',
      'Unlimited async text messaging',
      'Switch therapist anytime',
      'Session notes (read-only)',
      'Complete privacy',
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
    features: [
      '1 video session per week (50 min)',
      'Unlimited async text messaging',
      'Priority message response',
      'Foreign therapist access',
      'Switch therapist anytime',
      'Session notes (read-only)',
    ],
    highlight: true,
    planIdEnvVar: 'RAZORPAY_PLAN_PREMIUM_WEEKLY',
  },
  premium_monthly: {
    name: 'Premium',
    cadence: 'monthly' as const,
    category: 'individual' as const,
    tagline: 'Priority access and global therapists',
    price: '₹16,499',
    per: 'month',
    amountPaise: 1649900,
    features: [
      '4 video sessions per month (50 min each)',
      'Unlimited async text messaging',
      'Priority message response',
      'Foreign therapist access',
      'Switch therapist anytime',
      'Session notes (read-only)',
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
    price: '₹3,200',
    per: 'week',
    amountPaise: 320000,
    features: [
      '1 couples session per week (60 min)',
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
    price: '₹11,699',
    per: 'month',
    amountPaise: 1169900,
    features: [
      '4 couples sessions per month (60 min each)',
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
    price: '₹7,499',
    per: 'week',
    amountPaise: 749900,
    features: [
      '1 couples session per week (60 min)',
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
    price: '₹25,000',
    per: 'month',
    amountPaise: 2500000,
    features: [
      '4 couples sessions per month (60 min each)',
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
