import { site, type Property } from "@/config/site";
import { db } from "./db";
import { externalBlocks, type Range } from "./ical";
import { addDays, daysBetween, isIsoDate, todayLocal } from "./dates";

// Bookings that currently hold dates: confirmed ones, plus unpaid holds that are still fresh
function activeHoldWhere(slug: string) {
  const holdCutoff = new Date(Date.now() - site.policies.holdMinutes * 60_000);
  return {
    propertySlug: slug,
    OR: [
      { status: "CONFIRMED" },
      { status: { in: ["PENDING_AGREEMENT", "PENDING_PAYMENT"] }, createdAt: { gte: holdCutoff } },
    ],
  };
}

export async function unavailableRanges(slug: string, excludeBookingId?: string): Promise<Range[]> {
  const [bookings, blocks, external] = await Promise.all([
    db.booking.findMany({
      where: { ...activeHoldWhere(slug), checkOut: { gte: todayLocal() }, NOT: excludeBookingId ? { id: excludeBookingId } : undefined },
      select: { checkIn: true, checkOut: true },
    }),
    db.blockedRange.findMany({ where: { propertySlug: slug, end: { gte: todayLocal() } } }),
    externalBlocks(slug),
  ]);
  return [
    ...bookings.map((b) => ({ start: b.checkIn, end: b.checkOut, source: "booking" })),
    ...blocks.map((b) => ({ start: b.start, end: b.end, source: "block" })),
    ...external,
  ];
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export type StayCheck = { ok: true } | { ok: false; error: string };

export async function validateStay(
  property: Property,
  checkIn: unknown,
  checkOut: unknown,
  guests: number,
  excludeBookingId?: string,
): Promise<StayCheck> {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return { ok: false, error: "Please choose your dates." };
  if (checkIn < todayLocal()) return { ok: false, error: "Check-in can't be in the past." };
  const nights = daysBetween(checkIn, checkOut);
  if (nights < property.minNights) return { ok: false, error: `This home has a ${property.minNights}-night minimum.` };
  if (nights > 30) return { ok: false, error: "For stays over 30 nights, please contact us directly." };
  if (checkIn > addDays(todayLocal(), 540)) return { ok: false, error: "We take reservations up to 18 months out." };
  if (!Number.isInteger(guests) || guests < 1 || guests > property.maxGuests)
    return { ok: false, error: `This home sleeps up to ${property.maxGuests} guests.` };

  const taken = await unavailableRanges(property.slug, excludeBookingId);
  if (taken.some((r) => overlaps(checkIn, checkOut, r.start, r.end)))
    return { ok: false, error: "Those dates were just taken — please try different dates." };
  return { ok: true };
}

// Nights (YYYY-MM-DD) that can't be booked, for the calendar UI
export async function bookedNights(slug: string): Promise<string[]> {
  const ranges = await unavailableRanges(slug);
  const nights = new Set<string>();
  for (const r of ranges) for (let d = r.start; d < r.end; d = addDays(d, 1)) nights.add(d);
  return [...nights].sort();
}
