import { notFound } from "next/navigation";
import { getProperty } from "@/config/site";
import { db } from "./db";

export async function loadReservation(id: string) {
  const booking = await db.booking.findUnique({ where: { id }, include: { agreement: true } });
  if (!booking) notFound();
  const property = getProperty(booking.propertySlug);
  if (!property) notFound();
  return { booking, property };
}

export function bookingLines(b: {
  nightlyCents: number;
  cleaningCents: number;
  petCents: number;
  discountCents: number;
  taxCents: number;
  checkIn: string;
  checkOut: string;
}) {
  const lines = [
    { label: "Nightly rate", cents: b.nightlyCents },
    { label: "Cleaning & turndown", cents: b.cleaningCents },
  ];
  if (b.petCents) lines.push({ label: "Pet fee", cents: b.petCents });
  if (b.discountCents) lines.push({ label: "Referral savings", cents: -b.discountCents });
  lines.push({ label: "Occupancy taxes", cents: b.taxCents });
  return lines;
}
