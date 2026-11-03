import type { Property } from "@/config/site";
import { site } from "@/config/site";
import { db } from "./db";
import { formatLocalTime, localDateTime } from "./dates";

// Choices for the "show door code" dropdown in /admin → Arrival Info
export const codeRevealOptions: { value: string; label: string }[] = [
  { value: "manual", label: "Hold until I release it" },
  { value: "48", label: "48 hours before check-in" },
  { value: "24", label: "24 hours before check-in" },
  { value: "12", label: "12 hours before check-in" },
  { value: "5", label: "5 hours before check-in" },
  { value: "2", label: "2 hours before check-in" },
  { value: "0", label: "At check-in time" },
];

export type CodeRelease = { visible: boolean; at: Date | null; mode: "released" | "scheduled" | "held" };

// Whether this booking's guest can see the door code right now, and when they will
export function codeRelease(
  booking: { checkIn: string; checkOut: string; codeReleasedAt: Date | null },
  revealHours: number | null,
  now = new Date(),
): CodeRelease {
  const checkOutAt = localDateTime(booking.checkOut, site.policies.checkOutTime);
  if (now >= checkOutAt) return { visible: false, at: null, mode: "held" };
  if (booking.codeReleasedAt) return { visible: true, at: booking.codeReleasedAt, mode: "released" };
  if (revealHours === null) return { visible: false, at: null, mode: "held" };
  const at = new Date(localDateTime(booking.checkIn, site.policies.checkInTime).getTime() - revealHours * 3_600_000);
  return { visible: now >= at, at, mode: "scheduled" };
}

export { formatLocalTime };

export async function revealHoursFor(slug: string): Promise<number | null> {
  const row = await db.propertyArrival.findUnique({ where: { propertySlug: slug }, select: { codeRevealHours: true } });
  return row ? row.codeRevealHours : 24;
}

export type Arrival = {
  address: string | null;
  checkInMethod: string | null;
  doorCode: string | null;
  codeRevealHours: number | null;
  wifiName: string | null;
  wifiPassword: string | null;
  parking: string;
  notes: string[];
};

// Private details come from the database (entered in /admin → Arrival Info);
// parking and notes fall back to the defaults in site config.
export async function getArrival(property: Property): Promise<Arrival> {
  const row = await db.propertyArrival.findUnique({ where: { propertySlug: property.slug } });
  const notes = row?.notes
    ? row.notes.split("\n").map((n) => n.trim()).filter(Boolean)
    : property.arrival.notes;
  return {
    address: row?.address || null,
    checkInMethod: row?.checkInMethod || null,
    doorCode: row?.doorCode || null,
    codeRevealHours: row ? row.codeRevealHours : 24,
    wifiName: row?.wifiName || null,
    wifiPassword: row?.wifiPassword || null,
    parking: row?.parking || property.arrival.parking,
    notes,
  };
}
