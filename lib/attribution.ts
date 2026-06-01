/**
 * Marketing attribution capture.
 *
 * On first visit we record the UTM tags, the HTTP referrer, and the landing
 * page in localStorage as "first-touch". On every subsequent visit we
 * overwrite a second slot ("last-touch") so we can see both the campaign
 * that introduced the lead and whatever brought them back to convert.
 *
 * Sign-up and apply forms read this on submit and pass it to the server
 * action as hidden inputs. The server inserts it onto the row.
 *
 * This is first-party data, stored in localStorage (not a tracking cookie),
 * so no DPDP consent banner is required for the capture itself. The values
 * land in our own database alongside the user record they describe.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

export type UtmKey = (typeof UTM_KEYS)[number]

export interface AttributionTouch {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  referrer: string | null
  landing_page: string | null
  /** Any non-standard query params (gclid, fbclid, utm_id, custom tags). */
  extra: Record<string, string>
  seen_at: string // ISO 8601
}

export interface Attribution {
  first: AttributionTouch | null
  last: AttributionTouch | null
}

const STORAGE_KEY = 'mc_attribution'

function readUrlTouch(): AttributionTouch | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const utms = Object.fromEntries(
    UTM_KEYS.map((k) => [k, params.get(k)?.trim() || null]),
  ) as Record<UtmKey, string | null>

  // Collect any query param that ISN'T one of the 5 standard UTMs.
  // Captures click IDs (gclid, fbclid, msclkid), platform tags
  // (gad_source, utm_id), and any custom params you append to a link.
  // Capped to keep junk-stuffed URLs from bloating the row.
  const MAX_EXTRA = 25
  const MAX_VAL = 256
  const extra: Record<string, string> = {}
  const utmSet = new Set<string>(UTM_KEYS)
  let count = 0
  for (const [key, value] of params.entries()) {
    if (utmSet.has(key)) continue
    const v = value.trim()
    if (!v) continue
    if (count >= MAX_EXTRA) break
    extra[key.slice(0, 64)] = v.slice(0, MAX_VAL)
    count++
  }

  const referrer = (() => {
    try {
      const ref = document.referrer
      if (!ref) return null
      const refUrl = new URL(ref)
      // Strip same-origin referrers; we only want external referrers.
      if (refUrl.host === window.location.host) return null
      return refUrl.host + refUrl.pathname
    } catch {
      return null
    }
  })()

  const hasAny = Object.values(utms).some(Boolean) || referrer || Object.keys(extra).length > 0
  if (!hasAny) return null

  return {
    ...utms,
    referrer,
    landing_page: window.location.pathname + window.location.search,
    extra,
    seen_at: new Date().toISOString(),
  }
}

function load(): Attribution {
  if (typeof window === 'undefined') return { first: null, last: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { first: null, last: null }
    const parsed = JSON.parse(raw)
    return {
      first: parsed.first ?? null,
      last: parsed.last ?? null,
    }
  } catch {
    return { first: null, last: null }
  }
}

function save(attribution: Attribution): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // localStorage can throw in private mode or when full. Fail silent;
    // attribution is operational, not critical to the user's flow.
  }
}

/**
 * Capture attribution from the current URL. Idempotent: first-touch is set
 * only once (preserves the original campaign), last-touch updates on every
 * tagged visit. Call this from a useEffect on mount.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  const touch = readUrlTouch()
  if (!touch) return // organic visit with no referrer — nothing to record

  const current = load()
  const next: Attribution = {
    first: current.first ?? touch,
    last: touch,
  }
  save(next)
}

/**
 * Return stored attribution. Used by signup and apply forms on submit.
 */
export function getAttribution(): Attribution {
  return load()
}

/**
 * Flatten attribution into the field names the server actions expect.
 * Pass the result to FormData.append in the order it returns.
 */
export function attributionFields(): Record<string, string> {
  const { first, last } = load()
  const fields: Record<string, string> = {}

  if (first) {
    if (first.utm_source) fields.first_utm_source = first.utm_source
    if (first.utm_medium) fields.first_utm_medium = first.utm_medium
    if (first.utm_campaign) fields.first_utm_campaign = first.utm_campaign
    if (first.utm_term) fields.first_utm_term = first.utm_term
    if (first.utm_content) fields.first_utm_content = first.utm_content
    if (first.referrer) fields.referrer = first.referrer
    if (first.landing_page) fields.landing_page = first.landing_page
    if (first.seen_at) fields.first_seen_at = first.seen_at
    if (first.extra && Object.keys(first.extra).length > 0) {
      fields.extra_params = JSON.stringify(first.extra)
    }
  }
  if (last) {
    if (last.utm_source) fields.last_utm_source = last.utm_source
    if (last.utm_medium) fields.last_utm_medium = last.utm_medium
    if (last.utm_campaign) fields.last_utm_campaign = last.utm_campaign
    if (last.utm_term) fields.last_utm_term = last.utm_term
    if (last.utm_content) fields.last_utm_content = last.utm_content
  }

  return fields
}
