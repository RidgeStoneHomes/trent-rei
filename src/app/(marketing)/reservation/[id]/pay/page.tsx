import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { loadReservation, bookingLines } from "@/lib/reservation";
import { startPayment } from "@/app/actions/booking";
import { ActionForm, SubmitButton } from "@/components/forms";
import { StaySummary, Steps } from "@/components/StaySummary";
import { paymentsAvailable, stripeEnabled } from "@/lib/stripe";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment" };

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { booking, property } = await loadReservation((await params).id);
  if (booking.status === "CONFIRMED") redirect(`/reservation/${booking.id}/confirmed`);
  if (booking.status === "PENDING_AGREEMENT") redirect(`/reservation/${booking.id}/agreement`);

  return (
    <section className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_24rem]">
      <div>
        <Steps current={3} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Secure your stay.</h1>
        <p className="mt-3 text-ink-soft">
          Agreement signed by <span className="font-display text-lg italic">{booking.agreement?.signedName}</span>. One last step.
        </p>
        <div className="card mt-8 !bg-white">
          <p className="font-medium">Pay in full · {formatMoney(booking.totalCents, { cents: true })}</p>
          <p className="mt-2 text-sm text-ink-soft">
            Fully refundable until {site.policies.refundWindowDays} days before check-in. Payments are processed securely by Stripe — we never see your card number.
          </p>
          {paymentsAvailable ? (
            <ActionForm action={startPayment} className="mt-6">
              <input type="hidden" name="bookingId" value={booking.id} />
              <SubmitButton pendingText="Opening secure checkout…">
                {stripeEnabled ? "Continue to secure payment" : "Complete booking (demo mode — no charge)"}
              </SubmitButton>
            </ActionForm>
          ) : (
            <p className="mt-6 rounded-lg bg-sand px-4 py-3 text-sm">
              Online payment opens soon. To lock in these dates now, email {site.email} or text {site.phone} with code {booking.code}.
            </p>
          )}
          {!stripeEnabled && paymentsAvailable && (
            <p className="mt-3 text-xs text-amber-700">Demo mode: add STRIPE_SECRET_KEY to accept real payments.</p>
          )}
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <StaySummary property={property} checkIn={booking.checkIn} checkOut={booking.checkOut} guests={booking.guests} lines={bookingLines(booking)} totalCents={booking.totalCents} />
      </aside>
    </section>
  );
}
