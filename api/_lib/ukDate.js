// UK (Europe/London) calendar helpers.
//
// "Today" for Scott must be the London calendar day, not the UTC day.
// Between late March and late October the UK is on BST (UTC+1), so a
// naive `new Date().toISOString()` rolls over to tomorrow at 23:00 local.
// Intl with timeZone: 'Europe/London' handles GMT/BST switching for us.

export const UK_TZ = 'Europe/London';

const ISO_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: UK_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Current London calendar date as YYYY-MM-DD. */
export function ukToday(now = new Date()) {
  return ISO_DAY.format(now);
}

/** Human-readable London date/time, e.g. "Tuesday, 25 August 2026 at 02:14 (BST)". */
export function ukNowLabel(now = new Date()) {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  return `${date} at ${time} (${ukTimeZoneAbbr(now)})`;
}

/** "GMT" or "BST" for the given instant. */
export function ukTimeZoneAbbr(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_TZ,
    timeZoneName: 'short',
  }).formatToParts(now);
  return parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT';
}

/**
 * Calendar arithmetic on a YYYY-MM-DD string.
 * Done in UTC on a date-only value so a DST transition can never shift the
 * result by a day.
 */
export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Day of week for a YYYY-MM-DD string, 0 = Sunday. Midday avoids edge cases. */
export function isoWeekday(isoDate) {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

/** Monday–Sunday range containing the given London date. */
export function ukWeekRange(isoDate) {
  const dow = isoWeekday(isoDate);
  const backToMonday = (dow + 6) % 7; // Sunday(0) -> 6, Monday(1) -> 0
  const start = addDays(isoDate, -backToMonday);
  return { start, end: addDays(start, 6) };
}
