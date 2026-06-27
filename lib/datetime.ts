// Single source of truth for date/time handling across MindCanopy.
//
// DECISION: the whole product runs on IST. We do NOT do per-user timezone
// conversion anymore — every wall-clock time the user picks or sees is IST.
// Timestamps are still STORED as UTC in Postgres (timestamptz), but they are
// always INTERPRETED and DISPLAYED in IST. This kills the class of bugs where
// the same instant rendered as 3 PM in one place (UTC) and 8:30 PM in another
// (IST).

export const IST_TZ = 'Asia/Kolkata'

// IST is a fixed offset (UTC+5:30) with no DST, so we can convert without Intl.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

/**
 * Interpret a wall-clock time as IST and return the corresponding UTC Date.
 * e.g. istWallClockToUTC(2026, 5, 27, 20, 30) → the Date for 8:30 PM IST that day
 * (which is 15:00 UTC). `month` is 0-based, matching Date semantics.
 */
export function istWallClockToUTC(
  year: number, month: number, day: number, hour: number, minute: number,
): Date {
  // The UTC instant whose IST wall-clock is the given fields = the naive UTC of
  // those fields minus the IST offset.
  return new Date(Date.UTC(year, month, day, hour, minute, 0) - IST_OFFSET_MS)
}

/** Format an instant as an IST date+time string, e.g. "Sat, 27 Jun 2026, 08:30 PM". */
export function formatIST(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  },
): string {
  return new Date(iso).toLocaleString('en-IN', { ...opts, timeZone: IST_TZ })
}

/** Format only the time portion in IST, e.g. "08:30 PM". */
export function formatISTTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: IST_TZ,
  })
}

/** Format only the date portion in IST, e.g. "27 Jun 2026". */
export function formatISTDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: IST_TZ,
  })
}

/**
 * The IST calendar date `daysFromToday` days from now, as plain fields plus its
 * day-of-week (0=Sun…6=Sat). Because IST is a fixed offset we read the fields
 * off a UTC-shifted Date — no Intl/timezone-DB needed.
 */
export function istCalendarDate(daysFromToday = 0): {
  year: number; month: number; day: number; dow: number
} {
  const istNow = new Date(Date.now() + IST_OFFSET_MS)
  const base = new Date(Date.UTC(
    istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + daysFromToday,
  ))
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth(), // 0-based
    day: base.getUTCDate(),
    dow: base.getUTCDay(),
  }
}
