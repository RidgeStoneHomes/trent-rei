import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { loadReservation, bookingLines } from "@/lib/reservation";
import { renderAgreement } from "@/content/agreement";
import { signAgreement } from "@/app/actions/booking";
import { ActionForm, SubmitButton } from "@/components/forms";
import { StaySummary, Steps } from "@/components/StaySummary";
import { addDays, formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rental Agreement" };

export default async function AgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { booking, property } = await loadReservation((await params).id);
  if (booking.status === "CONFIRMED") redirect(`/reservation/${booking.id}/confirmed`);
  if (booking.status === "PENDING_PAYMENT") redirect(`/reservation/${booking.id}/pay`);

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

  return (
    <section className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_24rem]">
      <div>
        <Steps current={2} />
        <h1 className="mt-6 text-4xl sm:text-5xl">The fine print, made simple.</h1>
        <p className="mt-3 text-ink-soft">Please review and sign your rental agreement. A signed copy will always be available in your guest portal.</p>

        <article className="mt-8 max-h-[32rem] overflow-y-auto rounded-2xl border border-ink/10 bg-white p-6 text-sm leading-relaxed sm:p-8">
          <h2 className="text-2xl">{doc.title}</h2>
          {doc.sections.map((s) => (
            <div key={s.heading} className="mt-5">
              <h3 className="font-sans text-sm font-semibold">{s.heading}</h3>
              {s.body.map((p, i) => <p key={i} className="mt-2 text-ink-soft">{p}</p>)}
            </div>
          ))}
        </article>

        <ActionForm action={signAgreement} className="mt-8 grid gap-4">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="agreeCancel" className="mt-1" />
            <span>
              I understand my reservation is fully refundable until{" "}
              <strong>{formatDate(addDays(booking.checkIn, -site.policies.refundWindowDays))}</strong> and non-refundable after that date.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="agree" className="mt-1" />
            <span>I have read and agree to the Short-Term Rental Agreement above, including the assumption of risk and house rules.</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <label>
              <span className="label">Type your full legal name to sign</span>
              <input name="signedName" required className="input font-display text-xl italic" placeholder={`${booking.firstName} ${booking.lastName}`} />
            </label>
            <label>
              <span className="label">Initials</span>
              <input name="initials" required maxLength={4} className="input uppercase" />
            </label>
          </div>
          <SubmitButton pendingText="Signing…">Sign & continue to payment</SubmitButton>
          <p className="text-xs text-ink-soft">Your signature, the time, and your IP address are recorded with a tamper-evident fingerprint of this agreement.</p>
        </ActionForm>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <StaySummary property={property} checkIn={booking.checkIn} checkOut={booking.checkOut} guests={booking.guests} lines={bookingLines(booking)} totalCents={booking.totalCents} />
      </aside>
    </section>
  );
}
