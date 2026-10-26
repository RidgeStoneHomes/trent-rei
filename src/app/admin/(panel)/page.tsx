import { getProperty } from "@/config/site";
import { db } from "@/lib/db";
import { formatRange, todayLocal } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { tripTimeline } from "@/lib/trip";
import { cancelBooking } from "@/app/actions/admin";

const stageLabel = { refundable: "Refundable", insider: "Portal open", arrival: "Arriving soon", staying: "In house", departed: "Departed" };

export default async function AdminHome() {
  const today = todayLocal();
  const [upcoming, pending, revenue, leads, clicks] = await Promise.all([
    db.booking.findMany({ where: { status: "CONFIRMED", checkOut: { gte: today } }, orderBy: { checkIn: "asc" }, include: { agreement: true } }),
    db.booking.count({ where: { status: { in: ["PENDING_AGREEMENT", "PENDING_PAYMENT"] } } }),
    db.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalCents: true }, _count: true }),
    db.lead.count(),
    db.click.count(),
  ]);

  const stats = [
    { label: "Confirmed bookings", value: String(revenue._count) },
    { label: "Direct revenue", value: formatMoney(revenue._sum.totalCents ?? 0) },
    { label: "Leads captured", value: String(leads) },
    { label: "Partner clicks & scans", value: String(clicks) },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card !bg-white">
            <p className="text-xs uppercase tracking-wider text-ink-soft">{s.label}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
      {pending > 0 && <p className="mt-4 text-sm text-ink-soft">{pending} checkout(s) in progress or abandoned (holds release after 30 minutes).</p>}

      <h1 className="mt-10 text-3xl">Upcoming & current stays</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-sand-deep/50 text-xs uppercase tracking-wider text-ink-soft">
            <tr><th className="p-3">Guest</th><th className="p-3">Home</th><th className="p-3">Dates</th><th className="p-3">Guests</th><th className="p-3">Total</th><th className="p-3">Stage</th><th className="p-3">Agreement</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {upcoming.length === 0 && <tr><td className="p-6 text-ink-soft" colSpan={8}>No upcoming stays yet.</td></tr>}
            {upcoming.map((b) => (
              <tr key={b.id} className="border-t border-ink/5 align-top">
                <td className="p-3">
                  <p className="font-medium">{b.firstName} {b.lastName}</p>
                  <p className="text-xs text-ink-soft">{b.email} · {b.phone}</p>
                  <p className="text-xs text-ink-soft">Code {b.code}{b.occasion ? ` · ${b.occasion}` : ""}{b.referralCode ? ` · ref ${b.referralCode}` : ""}</p>
                  {b.notes && <p className="mt-1 max-w-xs text-xs italic text-ink-soft">“{b.notes}”</p>}
                </td>
                <td className="p-3">{getProperty(b.propertySlug)?.name}</td>
                <td className="p-3">{formatRange(b.checkIn, b.checkOut)}</td>
                <td className="p-3">{b.guests}{b.pets ? ` + ${b.pets} dog` : ""}</td>
                <td className="p-3">{formatMoney(b.totalCents, { cents: true })}</td>
                <td className="p-3">{stageLabel[tripTimeline(b.checkIn, b.checkOut).stage]}</td>
                <td className="p-3 text-xs">{b.agreement ? `✓ ${b.agreement.signedName}` : "—"}</td>
                <td className="p-3">
                  <form action={cancelBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="text-xs text-red-700 underline" title="Marks cancelled and frees the dates. Issue any refund in Stripe.">Cancel</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-soft">Cancelling here frees the dates; issue refunds from your Stripe dashboard.</p>
    </div>
  );
}
