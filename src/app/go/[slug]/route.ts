import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestBookingId } from "@/lib/session";
import { siteUrl } from "@/lib/url";

// Tracked outbound link to a partner (affiliate link). ?src=qr marks scans of printed QR codes.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await db.vendor.findUnique({ where: { slug } });
  if (!vendor || !vendor.active) return NextResponse.redirect(siteUrl("/trip"));
  const source = new URL(req.url).searchParams.get("src") === "qr" ? "qr" : "link";
  const bookingId = await guestBookingId();
  await db.click.create({ data: { vendorId: vendor.id, bookingId: bookingId ?? null, source } });

  if (!vendor.bookingUrl) return NextResponse.redirect(siteUrl(`/trip#${vendor.slug}`));
  const dest = new URL(vendor.bookingUrl);
  if (!dest.searchParams.has("utm_source")) {
    dest.searchParams.set("utm_source", "direct-stay");
    dest.searchParams.set("utm_medium", source);
  }
  return NextResponse.redirect(dest.toString());
}
