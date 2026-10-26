import { site } from "@/config/site";

export const metadata = { title: "Policies" };

export default function PoliciesPage() {
  const p = site.policies;
  return (
    <section className="container-x max-w-3xl py-20">
      <p className="eyebrow">Policies</p>
      <h1 className="mt-3 text-5xl">Simple, fair, and upfront.</h1>
      <div className="prose-luxe mt-10 space-y-8">
        <div><h2 className="text-2xl">Cancellation</h2><p>Full refund if you cancel at least {p.refundWindowDays} days before check-in. After that, reservations are non-refundable. We recommend travel insurance.</p></div>
        <div><h2 className="text-2xl">Payment</h2><p>Payment is due in full at booking and processed securely by Stripe. Pricing includes cleaning and occupancy taxes — no surprise fees.</p></div>
        <div><h2 className="text-2xl">Check-in & check-out</h2><p>Check-in after {p.checkInTime}; check-out by {p.checkOutTime}. Self check-in details are shared in your Insider Portal {p.arrivalDetailsDays} days before arrival.</p></div>
        <div><h2 className="text-2xl">Rental agreement</h2><p>Every reservation includes a short digital rental agreement covering house rules, occupancy, and safety. You'll sign it online before payment.</p></div>
        <div><h2 className="text-2xl">Partner perks</h2><p>Partner offers are provided by independent local businesses, valid during your stay, and subject to change.</p></div>
        <div><h2 className="text-2xl">Questions</h2><p>Email {site.email} or text {site.phone}.</p></div>
      </div>
    </section>
  );
}
