import { site, getProperty } from "@/config/site";
import { db } from "./db";
import { randomCode } from "./codes";
import { emailLayout, sendEmail } from "./email";
import { formatRange } from "./dates";
import { formatMoney } from "./money";
import { siteUrl } from "./url";
import { tripTimeline } from "./trip";

export async function uniqueBookingCode() {
  for (;;) {
    const code = randomCode(6);
    if (!(await db.booking.findUnique({ where: { code } }))) return code;
  }
}

// Validates a referral code for a new guest. Returns the discount it grants, or 0.
export async function referralDiscount(code: string | undefined | null, email: string, nights: number) {
  if (!code || nights < site.referral.minNightsForReferral) return { code: null, cents: 0 };
  const ref = await db.referralCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!ref || ref.ownerEmail.toLowerCase() === email.toLowerCase()) return { code: null, cents: 0 };
  // Friend discount is for first-time guests only
  const prior = await db.booking.count({ where: { email: email.toLowerCase(), status: "CONFIRMED" } });
  if (prior > 0) return { code: null, cents: 0 };
  return { code: ref.code, cents: site.referral.friendDiscountCents };
}

export async function ensureReferralCode(email: string, firstName: string) {
  const existing = await db.referralCode.findUnique({ where: { ownerEmail: email.toLowerCase() } });
  if (existing) return existing;
  const stem = firstName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "GUEST";
  for (;;) {
    const code = `${stem}${randomCode(3)}`;
    if (!(await db.referralCode.findUnique({ where: { code } }))) {
      return db.referralCode.create({ data: { code, ownerEmail: email.toLowerCase(), ownerName: firstName } });
    }
  }
}

// Called once payment succeeds (Stripe webhook, Stripe return page, or demo mode). Idempotent.
export async function confirmBooking(bookingId: string, stripeSession?: string) {
  const updated = await db.booking.updateMany({
    where: { id: bookingId, status: "PENDING_PAYMENT" },
    data: { status: "CONFIRMED", paidAt: new Date(), ...(stripeSession ? { stripeSession } : {}) },
  });
  if (updated.count === 0) return; // already confirmed (or not payable)

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } });
  const property = getProperty(booking.propertySlug)!;

  if (booking.referralCode) {
    await db.referralCode.update({
      where: { code: booking.referralCode },
      data: { uses: { increment: 1 }, creditCents: { increment: site.referral.referrerCreditCents } },
    });
  }
  const myCode = await ensureReferralCode(booking.email, booking.firstName);
  const timeline = tripTimeline(booking.checkIn, booking.checkOut);

  await sendEmail({
    to: booking.email,
    subject: `You're going to ${property.name} — confirmation ${booking.code}`,
    html: emailLayout(
      site.brand,
      `<h1 style="font-weight:400;font-size:32px;margin:0 0 16px">It's official, ${booking.firstName}.</h1>
      <p>${property.name} is yours for <strong>${formatRange(booking.checkIn, booking.checkOut)}</strong>.</p>
      <p>Confirmation code: <strong style="letter-spacing:.15em">${booking.code}</strong><br/>Total paid: ${formatMoney(booking.totalCents, { cents: true })}</p>
      <p>Your private <strong>Insider Portal</strong> — local partner perks, curated experiences, and arrival details — ${
        timeline.insiderUnlocked ? "is open now" : `opens on ${timeline.unlockDate}`
      }. Sign in at <a href="${siteUrl("/trip")}">${siteUrl("/trip")}</a> with this email and your confirmation code.</p>
      <p>Know someone who'd love it here? Share your link and they'll get ${formatMoney(site.referral.friendDiscountCents)} off — you'll get ${formatMoney(site.referral.referrerCreditCents)} toward your next stay: <a href="${siteUrl(`/r/${myCode.code}`)}">${siteUrl(`/r/${myCode.code}`)}</a></p>
      <p>See you soon,<br/>${site.hostName}</p>`,
    ),
  });

  if (process.env.HOST_NOTIFY_EMAIL) {
    await sendEmail({
      to: process.env.HOST_NOTIFY_EMAIL,
      subject: `New direct booking: ${property.name} ${booking.checkIn} → ${booking.checkOut}`,
      html: emailLayout(
        "New booking",
        `<p>${booking.firstName} ${booking.lastName} (${booking.email}, ${booking.phone}) booked ${property.name} for ${formatRange(booking.checkIn, booking.checkOut)} — ${booking.guests} guests — ${formatMoney(booking.totalCents, { cents: true })}.</p>`,
      ),
    });
  }
}
