"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endGuestSession, startGuestSession } from "@/lib/session";

export async function guestLogin(_prev: { error: string } | null, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const code = String(form.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!email || !code) return { error: "Enter the email you booked with and your confirmation code." };
  const booking = await db.booking.findFirst({ where: { email, code, status: "CONFIRMED" } });
  if (!booking) return { error: "We couldn't find a confirmed stay with that email and code." };
  await startGuestSession(booking.id);
  redirect("/trip");
}

export async function guestLogout() {
  await endGuestSession();
  redirect("/trip/login");
}
