"use server";

import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getProperty, site } from "@/config/site";
import { db } from "@/lib/db";
import { validateStay } from "@/lib/availability";
import { quoteStay } from "@/lib/pricing";
import { confirmBooking, referralDiscount, uniqueBookingCode } from "@/lib/booking";
import { AGREEMENT_VERSION, agreementPlainText, renderAgreement } from "@/content/agreement";
import { demoPaymentsAllowed, stripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/url";
import { formatRange } from "@/lib/dates";

export type FormState = { error: string } | null;

const guestSchema = z.object({
  slug: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.coerce.number().int(),
  pets: z.coerce.number().int().min(0).max(2).default(0),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(7, "Please enter a phone number").max(30),
  occasion: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  referral: z.string().trim().max(20).optional(),
});

export async function createBooking(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = guestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const g = parsed.data;
  const property = getProperty(g.slug);
  if (!property) return { error: "Unknown home." };
  const pets = property.petFeeCents === null ? 0 : g.pets;

  const check = await validateStay(property, g.checkIn, g.checkOut, g.guests);
  if (!check.ok) return { error: check.error };

  const email = g.email.toLowerCase();
  const nights = quoteStay(property, g.checkIn, g.checkOut).nights;
  const referralInput = g.referral || (await cookies()).get("ref")?.value;
  const ref = await referralDiscount(referralInput, email, nights);
  const quote = quoteStay(property, g.checkIn, g.checkOut, { pets, discountCents: ref.cents });

  const booking = await db.booking.create({
    data: {
      code: await uniqueBookingCode(),
      propertySlug: property.slug,
      checkIn: g.checkIn,
      checkOut: g.checkOut,
      guests: g.guests,
      pets,
      firstName: g.firstName,
      lastName: g.lastName,
      email,
      phone: g.phone,
      occasion: g.occasion || null,
      notes: g.notes || null,
      nightlyCents: quote.nightlyCents,
      cleaningCents: quote.cleaningCents,
      petCents: quote.petCents,
      taxCents: quote.taxCents,
      discountCents: quote.discountCents,
      totalCents: quote.totalCents,
      referralCode: ref.code,
    },
  });
  redirect(`/reservation/${booking.id}/agreement`);
}

// Re-checks the dates (the hold may have lapsed) and refreshes the hold timer.
async function keepHold(bookingId: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Reservation not found." } as const;
  const property = getProperty(booking.propertySlug)!;
  const check = await validateStay(property, booking.checkIn, booking.checkOut, booking.guests, booking.id);
  if (!check.ok) return { error: check.error } as const;
  await db.booking.update({ where: { id: booking.id }, data: { createdAt: new Date() } });
  return { booking, property } as const;
}

export async function signAgreement(_prev: FormState, form: FormData): Promise<FormState> {
  const bookingId = String(form.get("bookingId"));
  const signedName = String(form.get("signedName") ?? "").trim();
  const initials = String(form.get("initials") ?? "").trim();
  if (form.get("agree") !== "on") return { error: "Please confirm you've read and agree to the rental agreement." };
  if (form.get("agreeCancel") !== "on") return { error: "Please acknowledge the cancellation policy." };
  if (initials.length < 2) return { error: "Please add your initials." };

  const held = await keepHold(bookingId);
  if ("error" in held) return { error: held.error! };
  const { booking, property } = held;
  if (booking.status !== "PENDING_AGREEMENT") redirect(`/reservation/${booking.id}/pay`);

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  if (!norm(signedName).includes(norm(booking.lastName)) || signedName.split(/\s+/).length < 2) {
    return { error: `Please type your full legal name (e.g. ${booking.firstName} ${booking.lastName}).` };
  }

  const doc = renderAgreement({
    property,
    guestName: `${booking.firstName} ${booking.lastName}`,
    email: booking.email,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    pets: booking.pets,
    totalCents: booking.totalCents,
  });
  const content = agreementPlainText(doc);
  const h = await headers();

  await db.$transaction([
    db.agreement.create({
      data: {
        bookingId: booking.id,
        version: AGREEMENT_VERSION,
        signedName,
        initials,
        content,
        contentHash: createHash("sha256").update(content).digest("hex"),
        ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
        userAgent: h.get("user-agent"),
      },
    }),
    db.booking.update({ where: { id: booking.id }, data: { status: "PENDING_PAYMENT" } }),
  ]);
  redirect(`/reservation/${booking.id}/pay`);
}

export async function startPayment(_prev: FormState, form: FormData): Promise<FormState> {
  const held = await keepHold(String(form.get("bookingId")));
  if ("error" in held) return { error: held.error! };
  const { booking, property } = held;
  if (booking.status === "CONFIRMED") redirect(`/reservation/${booking.id}/confirmed`);
  if (booking.status !== "PENDING_PAYMENT") redirect(`/reservation/${booking.id}/agreement`);

  if (!stripeEnabled) {
    if (!demoPaymentsAllowed) return { error: "Online payment isn't available yet. Please contact us to book." };
    // DEMO MODE — no Stripe key configured; simulate a successful payment.
    await confirmBooking(booking.id);
    redirect(`/reservation/${booking.id}/confirmed`);
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    client_reference_id: booking.id,
    metadata: { bookingId: booking.id, code: booking.code },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: site.currency,
          unit_amount: booking.totalCents,
          product_data: {
            name: `${property.name} — ${formatRange(booking.checkIn, booking.checkOut)}`,
            description: `${booking.guests} guests · confirmation ${booking.code} · includes cleaning & taxes`,
          },
        },
      },
    ],
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    success_url: siteUrl(`/reservation/${booking.id}/confirmed?session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: siteUrl(`/reservation/${booking.id}/pay`),
  });
  redirect(session.url!);
}
