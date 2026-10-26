import { redirect } from "next/navigation";
import { getProperty } from "@/config/site";
import { db } from "./db";
import { guestBookingId } from "./session";

export async function requireGuest() {
  const id = await guestBookingId();
  const booking = id ? await db.booking.findUnique({ where: { id }, include: { agreement: true } }) : null;
  if (!booking || booking.status !== "CONFIRMED") redirect("/trip/login");
  return { booking, property: getProperty(booking.propertySlug)! };
}
