import { getProperty, site } from "@/config/site";
import { db } from "@/lib/db";
import { tripTimeline } from "@/lib/trip";
import { formatRange } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify Guest", robots: { index: false } };

// Partners scan a guest's pass QR and land here to confirm the guest is currently staying.
export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const booking = await db.booking.findUnique({ where: { guestPassToken: (await params).token } });
  const active = booking?.status === "CONFIRMED" && tripTimeline(booking.checkIn, booking.checkOut).guestPassActive;
  const property = booking && getProperty(booking.propertySlug);

  return (
    <main className={`grid min-h-screen place-items-center px-4 ${active ? "bg-green-700" : "bg-ink"} text-sand`}>
      <div className="w-full max-w-sm text-center">
        <p className="eyebrow !text-sand/70">{site.brand} · Partner Verification</p>
        <p className="mt-8 text-8xl">{active ? "✓" : "✕"}</p>
        <h1 className="mt-4 text-4xl">{active ? "Verified guest" : "Not an active stay"}</h1>
        {booking && property && (
          <div className="mt-6 rounded-2xl bg-sand/10 p-5">
            <p className="font-display text-2xl">{booking.firstName} {booking.lastName.charAt(0)}.</p>
            <p className="text-sm opacity-80">{property.name}</p>
            <p className="text-sm opacity-80">{formatRange(booking.checkIn, booking.checkOut)}</p>
          </div>
        )}
        <p className="mt-6 text-sm opacity-80">
          {active ? "Please apply the guest partner offer. Thank you for hosting our guests!" : `This pass is only valid during the guest's stay. Questions? Call ${site.phone}.`}
        </p>
      </div>
    </main>
  );
}
