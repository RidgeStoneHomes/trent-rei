import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/url";

// Referral link: remembers the friend's code for 60 days, then shows the welcome page
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const ref = await db.referralCode.findUnique({ where: { code } });
  const res = NextResponse.redirect(siteUrl(ref ? `/share?welcome=${encodeURIComponent(ref.ownerName)}` : "/"));
  if (ref) res.cookies.set("ref", code, { maxAge: 60 * 60 * 24 * 60, path: "/", sameSite: "lax" });
  return res;
}
