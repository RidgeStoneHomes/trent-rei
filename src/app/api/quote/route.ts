import { NextResponse } from "next/server";
import { getProperty } from "@/config/site";
import { validateStay } from "@/lib/availability";
import { quoteStay } from "@/lib/pricing";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const property = getProperty(q.get("slug") ?? "");
  if (!property) return NextResponse.json({ ok: false, error: "Unknown home." }, { status: 404 });
  const checkIn = q.get("checkIn");
  const checkOut = q.get("checkOut");
  const guests = Number(q.get("guests") ?? 1);
  const pets = Number(q.get("pets") ?? 0);
  const check = await validateStay(property, checkIn, checkOut, guests);
  if (!check.ok) return NextResponse.json(check);
  return NextResponse.json({ ok: true, quote: quoteStay(property, checkIn!, checkOut!, { pets }) });
}
