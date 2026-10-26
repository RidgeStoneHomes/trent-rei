import Link from "next/link";
import { requireGuest } from "@/lib/guest";
import { tripTimeline } from "@/lib/trip";
import { qrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/url";
import { formatRange } from "@/lib/dates";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guest Pass" };

export default async function PassPage() {
  const { booking, property } = await requireGuest();
  const t = tripTimeline(booking.checkIn, booking.checkOut);
  const svg = await qrSvg(siteUrl(`/verify/${booking.guestPassToken}`));
  return (
    <section className="grid min-h-[85vh] place-items-center bg-ink px-4 py-10 text-sand">
      <div className="w-full max-w-sm rounded-3xl bg-sand p-8 text-center text-ink">
        <p className="eyebrow">{site.brand} · Guest Pass</p>
        <div className={`mx-auto mt-6 w-64 ${t.guestPassActive ? "" : "opacity-30 grayscale"}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-6 font-display text-3xl">{booking.firstName} {booking.lastName}</p>
        <p className="text-sm text-ink-soft">{property.name}</p>
        <p className="text-sm text-ink-soft">{formatRange(booking.checkIn, booking.checkOut)}</p>
        <p className={`mt-4 rounded-full py-2 text-sm font-medium ${t.guestPassActive ? "bg-green-100 text-green-800" : "bg-ink/5 text-ink-soft"}`}>
          {t.guestPassActive ? "● Active guest" : "Not active today"}
        </p>
        <p className="mt-4 text-xs text-ink-soft">Partners: scan to verify this guest's stay.</p>
      </div>
      <Link href="/trip" className="mt-6 text-sm underline">Back to my trip</Link>
    </section>
  );
}
