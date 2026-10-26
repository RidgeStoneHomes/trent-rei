// Minimal iCalendar import/export so direct bookings and Airbnb/VRBO stay in sync.

export type Range = { start: string; end: string; source: string };

function icalDate(value: string): string | null {
  const m = value.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseIcal(text: string, source: string): Range[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const ranges: Range[] = [];
  for (const block of unfolded.split("BEGIN:VEVENT").slice(1)) {
    const start = block.match(/\nDTSTART[^:]*:([^\r\n]+)/);
    const end = block.match(/\nDTEND[^:]*:([^\r\n]+)/);
    const s = start && icalDate(start[1]);
    const e = end && icalDate(end[1]);
    if (s && e && e > s) ranges.push({ start: s, end: e, source });
  }
  return ranges;
}

const cache = new Map<string, { at: number; ranges: Range[] }>();
const TTL_MS = 10 * 60 * 1000;

export function importEnvKey(slug: string) {
  return "ICAL_IMPORT_" + slug.toUpperCase().replace(/-/g, "_");
}

// Comma-separated calendar feeds per home: OwnerRez, VRBO, Airbnb, Furnished Finder, etc.
export function importUrlsFor(slug: string): string[] {
  return (process.env[importEnvKey(slug)] ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export async function externalBlocks(slug: string): Promise<Range[]> {
  const lists = await Promise.all(importUrlsFor(slug).map(fetchFeed));
  return lists.flat();
}

async function fetchFeed(url: string): Promise<Range[]> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ranges;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ranges = parseIcal(await res.text(), "external");
    cache.set(url, { at: Date.now(), ranges });
    return ranges;
  } catch (err) {
    console.error(`[ical] failed to import calendar ${url}:`, err);
    return hit?.ranges ?? [];
  }
}

function fmt(date: string) {
  return date.replace(/-/g, "");
}

export function buildIcal(name: string, events: { uid: string; start: string; end: string; summary: string }[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Direct Booking//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${name}`,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${fmt(e.start)}`,
      `DTEND;VALUE=DATE:${fmt(e.end)}`,
      `SUMMARY:${e.summary}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
