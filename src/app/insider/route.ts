import { NextResponse } from "next/server";
import { guestBookingId } from "@/lib/session";
import { siteUrl } from "@/lib/url";

// Target of the framed QR card inside each home: "Scan for this week's Insider offers".
// Offers are edited live in /admin, so the printed card never goes out of date.
export async function GET() {
  const signedIn = await guestBookingId();
  return NextResponse.redirect(siteUrl(signedIn ? "/trip#perks" : "/trip/login?from=qr"));
}
