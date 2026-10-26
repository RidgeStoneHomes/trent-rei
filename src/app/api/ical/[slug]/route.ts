import { getProperty, site } from "@/config/site";
import { db } from "@/lib/db";
import { buildIcal } from "@/lib/ical";
import { todayLocal } from "@/lib/dates";

// Paste this URL into Airbnb/VRBO "Import calendar" so direct bookings block those platforms.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug.replace(/\.ics$/, ""));
  if (!property) return new Response("Not found", { status: 404 });
  const [bookings, blocks] = await Promise.all([
    db.booking.findMany({ where: { propertySlug: property.slug, status: "CONFIRMED", checkOut: { gte: todayLocal() } } }),
    db.blockedRange.findMany({ where: { propertySlug: property.slug, end: { gte: todayLocal() } } }),
  ]);
  const ics = buildIcal(`${site.brand} — ${property.name}`, [
    ...bookings.map((b) => ({ uid: `${b.id}@direct`, start: b.checkIn, end: b.checkOut, summary: "Reserved (direct)" })),
    ...blocks.map((b) => ({ uid: `${b.id}@block`, start: b.start, end: b.end, summary: "Blocked" })),
  ]);
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
}
