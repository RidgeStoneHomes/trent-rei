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
