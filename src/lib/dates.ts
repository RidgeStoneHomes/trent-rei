import { site } from "@/config/site";

// All stay dates are plain "YYYY-MM-DD" strings in the property's local time zone,
// which keeps comparisons simple and avoids off-by-one time zone bugs.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && ISO_DATE.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));
}

export function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: site.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000);
}

export function eachNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) nights.push(d);
  return nights;
}

export function dayOfWeek(date: string): number {
  return new Date(date + "T00:00:00Z").getUTCDay();
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  });
}

export function formatRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn, { year: undefined })} – ${formatDate(checkOut)}`;
}

// Offset (ms) between a time zone's wall clock and UTC at the given instant
function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - utcMs;
}

// The exact moment of a local date + "4:00 PM"-style time in the site's time zone
export function localDateTime(date: string, time12: string, timeZone: string = site.timeZone): Date {
  const m = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hour = m ? Number(m[1]) % 12 : 0;
  if (m && m[3].toUpperCase() === "PM") hour += 12;
  const [y, mo, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, mo - 1, d, hour, m ? Number(m[2]) : 0);
  return new Date(guess - zoneOffsetMs(guess, timeZone));
}

export function formatLocalTime(at: Date): string {
  return at.toLocaleString("en-US", { timeZone: site.timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
