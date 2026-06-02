// Single source of truth for the timezone picker.
//
// `value` is a valid IANA timezone (what Intl.DateTimeFormat expects); `label`
// is the friendly text shown in the dropdown. IST is pinned at the top, then
// roughly west-to-east. A divider entry (value: '') separates India from the
// rest of the list.

export type TimezoneOption = { label: string; value: string }

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'IST (India)', value: 'Asia/Kolkata' },
  { label: '──────────', value: '' },
  { label: 'HST (Hawaii)', value: 'Pacific/Honolulu' },
  { label: 'AKST (Alaska)', value: 'America/Anchorage' },
  { label: 'PST (US Pacific)', value: 'America/Los_Angeles' },
  { label: 'MST (US Mountain)', value: 'America/Denver' },
  { label: 'CST (US Central)', value: 'America/Chicago' },
  { label: 'EST (US Eastern)', value: 'America/New_York' },
  { label: 'AST (Atlantic)', value: 'America/Halifax' },
  { label: 'BRT (Brazil)', value: 'America/Sao_Paulo' },
  { label: 'UTC', value: 'UTC' },
  { label: 'GMT (UK / Ireland)', value: 'Europe/London' },
  { label: 'WET (Western Europe)', value: 'Europe/Lisbon' },
  { label: 'CET (Central Europe)', value: 'Europe/Paris' },
  { label: 'EET (Eastern Europe)', value: 'Europe/Bucharest' },
  { label: 'MSK (Moscow)', value: 'Europe/Moscow' },
  { label: 'GST (Gulf / UAE)', value: 'Asia/Dubai' },
  { label: 'PKT (Pakistan)', value: 'Asia/Karachi' },
  { label: 'BST (Bangladesh)', value: 'Asia/Dhaka' },
  { label: 'ICT (Indochina / Thailand)', value: 'Asia/Bangkok' },
  { label: 'WIB (Western Indonesia)', value: 'Asia/Jakarta' },
  { label: 'CST (China)', value: 'Asia/Shanghai' },
  { label: 'HKT (Hong Kong)', value: 'Asia/Hong_Kong' },
  { label: 'SGT (Singapore)', value: 'Asia/Singapore' },
  { label: 'JST (Japan / Korea)', value: 'Asia/Tokyo' },
  { label: 'AWST (Western Australia)', value: 'Australia/Perth' },
  { label: 'ACST (Central Australia)', value: 'Australia/Adelaide' },
  { label: 'AEST (Eastern Australia)', value: 'Australia/Sydney' },
  { label: 'NZST (New Zealand)', value: 'Pacific/Auckland' },
]

// Maps the friendly labels we used to STORE (e.g. "IST (India)") back to a
// valid IANA zone, so older profiles created before we stored IANA values
// don't crash Intl.DateTimeFormat.
const LABEL_TO_IANA: Record<string, string> = Object.fromEntries(
  TIMEZONE_OPTIONS.filter((o) => o.value).map((o) => [o.label, o.value]),
)

const IANA_TO_LABEL: Record<string, string> = Object.fromEntries(
  TIMEZONE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
)

/**
 * Friendly label for a stored timezone, for display. Accepts either an IANA
 * zone or a legacy label; returns the friendly label when known, otherwise the
 * value unchanged.
 */
export function timezoneLabel(stored: string | null | undefined): string {
  if (!stored) return ''
  return IANA_TO_LABEL[stored] ?? stored
}

/**
 * Normalize a stored timezone into something Intl.DateTimeFormat accepts.
 * Handles three cases:
 *   1. A legacy friendly label ("IST (India)") → its IANA zone.
 *   2. An already-valid IANA zone ("Asia/Kolkata") → returned as-is.
 *   3. Anything unrecognized → undefined, so callers fall back to the runtime's
 *      local zone instead of throwing a RangeError.
 */
export function toIanaTimeZone(stored: string | null | undefined): string | undefined {
  if (!stored) return undefined
  const mapped = LABEL_TO_IANA[stored]
  if (mapped) return mapped
  try {
    // Throws RangeError for invalid zones.
    new Intl.DateTimeFormat('en-US', { timeZone: stored })
    return stored
  } catch {
    return undefined
  }
}
