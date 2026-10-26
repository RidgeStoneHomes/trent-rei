import Link from "next/link";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { loadReservation } from "@/lib/reservation";
import { confirmBooking } from "@/lib/booking";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { Steps } from "@/components/StaySummary";
import { Media } from "@/components/Media";
import { formatRange } from "@/lib/dates";
import { tripTimeline } from "@/lib/trip";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { siteUrl } from "@/lib/url";

export const dynamic = "force-dynamic";
export const metadata = { title: "You're booked" };

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const id = (await params).id;
  const { session_id } = await searchParams;

  // Returning from Stripe: confirm right away (the webhook does the same, idempotently)
  if (session_id && stripeEnabled) {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid" && session.metadata?.bookingId === id) await confirmBooking(id, session.id);
  }

  const { booking, property } = await loadReservation(id);
  if (booking.status !== "CONFIRMED") redirect(`/reservation/${booking.id}/pay`);
  const t = tripTimeline(booking.checkIn, booking.checkOut);
  const ref = await db.referralCode.findUnique({ where: { ownerEmail: booking.email } });

  return (
    <section className="container-x py-14">
      <Steps current={4} />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">Confirmation {booking.code}</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">Pack light, {booking.firstName}.<br /><em className="text-brass">The lake is waiting.</em></h1>
          <p className="mt-6 text-lg text-ink-soft">
            {property.name} is yours for {formatRange(booking.checkIn, booking.checkOut)}. A confirmation is on its way to {booking.email}.
          </p>
          <div className="card mt-8">
            <p className="font-medium">Your Insider Portal</p>
            <p className="mt-2 text-sm text-ink-soft">
              {t.insiderUnlocked
                ? "It's open now — explore partner perks, plan your days, and get your Guest Pass."
                : `Opens ${t.daysUntilUnlock} days from now, once your stay is locked in. That's when partner perks, curated itineraries, and your Guest Pass appear.`}
            </p>
            <p className="mt-3 text-sm">Sign in anytime with <strong>{booking.email}</strong> and code <strong className="tracking-widest">{booking.code}</strong>.</p>
            <Link href={`/trip/login?email=${encodeURIComponent(booking.email)}`} className="btn-primary mt-5">Go to my trip</Link>
          </div>
        </div>
        <Media property={property} className="aspect-[4/5] w-full rounded-3xl" />
      </div>
      {ref && (
        <div className="mt-14 rounded-3xl bg-ink p-8 text-sand sm:p-12">
          <p className="eyebrow !text-brass-light">Share the Lake</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Bring your favorite people next time.</h2>
          <p className="mt-3 max-w-xl text-sand/80">
            Friends get {formatMoney(site.referral.friendDiscountCents)} off their first stay with your link. You get {formatMoney(site.referral.referrerCreditCents)} toward your next visit — every time.
          </p>
          <p className="mt-6 inline-block rounded-full bg-sand/10 px-5 py-3 font-mono text-sm">{siteUrl(`/r/${ref.code}`)}</p>
        </div>
      )}
    </section>
  );
}
