/**
 * Server-side helper that pulls marketing attribution out of a submitted
 * FormData and returns a plain object whose keys match the DB column
 * names. Spread the result into the .insert() / .update() payload.
 *
 * Defensively typed: every field is optional. The client only appends
 * keys that have values, and organic visitors won't append any of them.
 */

const ATTRIBUTION_FIELDS = [
  'first_utm_source',
  'first_utm_medium',
  'first_utm_campaign',
  'first_utm_term',
  'first_utm_content',
  'last_utm_source',
  'last_utm_medium',
  'last_utm_campaign',
  'last_utm_term',
  'last_utm_content',
  'referrer',
  'landing_page',
  'first_seen_at',
  'device_type',
  'device_browser',
  'device_os',
] as const

type JourneyStep = { p: string; t: string }

export type AttributionRow = {
  [K in (typeof ATTRIBUTION_FIELDS)[number]]?: string
} & {
  /** Stored as JSONB. Any non-standard query params on the first touch. */
  extra_params?: Record<string, string>
  /** Stored as JSONB. Ordered on-site page sequence before conversion. */
  journey?: JourneyStep[]
}

const MAX_LEN = 512 // cap to keep junk-tagged URLs from bloating rows

function clean(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, MAX_LEN)
}

export function extractAttribution(formData: FormData): AttributionRow {
  const row: AttributionRow = {}
  for (const field of ATTRIBUTION_FIELDS) {
    const value = clean(formData.get(field))
    if (value !== undefined) row[field] = value
  }

  // extra_params arrives as a JSON string; parse to an object for the
  // JSONB column. Defensive: ignore anything that isn't a flat object.
  const rawExtra = formData.get('extra_params')
  if (typeof rawExtra === 'string' && rawExtra.trim()) {
    try {
      const parsed = JSON.parse(rawExtra)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const clean: Record<string, string> = {}
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') clean[k.slice(0, 64)] = v.slice(0, 256)
        }
        if (Object.keys(clean).length > 0) row.extra_params = clean
      }
    } catch {
      // Malformed JSON — skip, never block the submission.
    }
  }

  // journey arrives as a JSON string array of { p, t }. Parse defensively
  // and cap to keep the JSONB small.
  const rawJourney = formData.get('journey')
  if (typeof rawJourney === 'string' && rawJourney.trim()) {
    try {
      const parsed = JSON.parse(rawJourney)
      if (Array.isArray(parsed)) {
        const steps: JourneyStep[] = []
        for (const item of parsed.slice(0, 50)) {
          if (item && typeof item.p === 'string' && typeof item.t === 'string') {
            steps.push({ p: item.p.slice(0, 256), t: item.t.slice(0, 40) })
          }
        }
        if (steps.length > 0) row.journey = steps
      }
    } catch {
      // Malformed — skip, never block the submission.
    }
  }

  return row
}
