import Link from "next/link";
import { site, vendorCategories } from "@/config/site";
import { requireGuest } from "@/lib/guest";
import { tripTimeline } from "@/lib/trip";
import { db } from "@/lib/db";
import { formatDate, formatRange } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { qrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/url";
import { ensureReferralCode } from "@/lib/booking";
import { guestLogout } from "@/app/actions/guest";
import { Media } from "@/components/Media";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Trip" };

export default async function TripPage() {
  const { booking, property } = await requireGuest();
  const t = tripTimeline(booking.checkIn, booking.checkOut);
  const vendors = t.insiderUnlocked
    ? await db.vendor.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }] })
    : [];
  const referral = await ensureReferralCode(booking.email, booking.firstName);
  const referralUrl = siteUrl(`/r/${referral.code}`);
  const passSvg = await qrSvg(siteUrl(`/verify/${booking.guestPassToken}`));

  const headline =
    t.stage === "staying"
      ? `Welcome to ${property.name}, ${booking.firstName}.`
      : t.stage === "departed"
        ? `Thank you for staying with us, ${booking.firstName}.`
        : `${t.daysUntilCheckIn} day${t.daysUntilCheckIn === 1 ? "" : "s"} until ${property.name}.`;

  const milestones = [
    { label: "Reserved & paid", date: booking.paidAt ? booking.paidAt.toISOString().slice(0, 10) : null, done: true },
    { label: "Agreement signed", date: booking.agreement?.signedAt.toISOString().slice(0, 10) ?? null, done: Boolean(booking.agreement) },
    { label: "Insider Portal opens", date: t.unlockDate, done: t.insiderUnlocked },
    { label: "Arrival details", date: t.arrivalDate, done: t.arrivalDetailsVisible || t.stage === "departed" },
    { label: "Check-in", date: booking.checkIn, done: t.stage === "staying" || t.stage === "departed" },
  ];

  const byCategory = new Map<string, typeof vendors>();
  for (const v of vendors) byCategory.set(v.category, [...(byCategory.get(v.category) ?? []), v]);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-sand">
        <Media property={property} className="absolute inset-0 -z-10 h-full w-full opacity-50" />
        <div className="container-x py-16">
          <p className="eyebrow !text-brass-light">Confirmation {booking.code} · {formatRange(booking.checkIn, booking.checkOut)}</p>
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-6xl">{headline}</h1>
          <ol className="mt-10 grid gap-3 sm:grid-cols-5">
            {milestones.map((m) => (
              <li key={m.label} className={`rounded-xl border px-4 py-3 text-sm ${m.done ? "border-brass-light/60 bg-brass/20" : "border-sand/15 bg-sand/5 text-sand/60"}`}>
                <p>{m.done ? "✓ " : ""}{m.label}</p>
                {m.date && <p className="mt-1 text-xs opacity-70">{formatDate(m.date, { weekday: undefined })}</p>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-12">
          {/* Locked state — still inside the refund window */}
          {!t.insiderUnlocked && (
            <section className="rounded-3xl bg-lake-deep p-8 text-sand sm:p-10">
              <p className="eyebrow !text-brass-light">The Insider Collection</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">Unlocks in {t.daysUntilUnlock} days</h2>
              <p className="mt-4 max-w-xl text-sand/80">
                Your stay is fully refundable until {formatDate(t.unlockDate)}. Once it's locked in, this portal opens
                with private partner perks, reserved experiences, and your digital Guest Pass.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(vendorCategories).slice(0, 4).map(([k, c]) => (
                  <div key={k} className="rounded-2xl border border-sand/10 bg-sand/5 p-4">
                    <p className="text-2xl">{c.icon}</p>
                    <p className="mt-2 text-sm">{c.label}</p>
                    <p className="mt-2 select-none text-xs text-sand/40 blur-[3px]">20% off · code ••••••</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-sand/70">
                Need to change plans? <a className="underline" href={`mailto:${site.email}?subject=Reservation ${booking.code}`}>Contact {site.hostName}</a> before {formatDate(t.unlockDate)} for a full refund.
              </p>
            </section>
          )}

          {/* Arrival details */}
          {t.insiderUnlocked && t.stage !== "departed" && (
            <section className="card !bg-white">
              <p className="eyebrow">Arrival</p>
              {t.arrivalDetailsVisible ? (
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div><p className="label">Address</p><p>{property.arrival.address}</p></div>
                  <div><p className="label">Door code</p><p className="font-mono text-lg">{property.arrival.doorCode}</p></div>
                  <div><p className="label">Wi-Fi</p><p>{property.arrival.wifiName} · <span className="font-mono">{property.arrival.wifiPassword}</span></p></div>
                  <div><p className="label">Check-in / out</p><p>{site.policies.checkInTime} / {site.policies.checkOutTime}</p></div>
                  <div className="sm:col-span-2"><p className="label">Parking</p><p className="text-sm text-ink-soft">{property.arrival.parking}</p></div>
                  {property.arrival.notes.length > 0 && (
                    <ul className="list-disc pl-5 text-sm text-ink-soft sm:col-span-2">{property.arrival.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-ink-soft">
                  Your address, door code, and Wi-Fi appear here on {formatDate(t.arrivalDate)} — {site.policies.arrivalDetailsDays} days before arrival.
                </p>
              )}
            </section>
          )}

          {/* Partner perks */}
          {t.insiderUnlocked && (
            <section id="perks">
              <p className="eyebrow">The Insider Collection</p>
              <h2 className="mt-3 text-4xl">Perks reserved for our guests</h2>
              <p className="mt-3 max-w-2xl text-ink-soft">
                Book through the links below or mention your code, then show your Guest Pass on arrival. Offers are
                updated regularly — check back during your stay.
              </p>
              {vendors.length === 0 && <p className="mt-6 text-ink-soft">New partner offers are on the way.</p>}
              {[...byCategory.entries()].map(([cat, list]) => (
                <div key={cat} className="mt-10">
                  <h3 className="text-2xl">{vendorCategories[cat]?.icon} {vendorCategories[cat]?.label ?? cat}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {list.map((v) => (
                      <article key={v.id} id={v.slug} className={`card flex flex-col !bg-white ${v.featured ? "ring-2 ring-brass/50" : ""}`}>
                        {v.featured && <p className="eyebrow mb-2">Host favorite</p>}
                        <p className="font-display text-2xl">{v.name}</p>
                        {v.distance && <p className="text-xs text-ink-soft">{v.distance}</p>}
                        <p className="mt-3 rounded-lg bg-brass/15 px-3 py-2 text-sm font-medium text-brass-dark">{v.perk}</p>
                        <p className="mt-3 flex-1 text-sm text-ink-soft">{v.description}</p>
                        {v.perkDetails && <p className="mt-3 text-xs text-ink-soft">{v.perkDetails}</p>}
                        {v.promoCode && (
                          <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-ink/20 px-3 py-2">
                            <span className="font-mono tracking-widest">{v.promoCode}</span>
                            <CopyButton text={v.promoCode} />
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {v.bookingUrl && <a href={`/go/${v.slug}`} target="_blank" rel="noopener" className="btn-primary !px-4 !py-2">Book with guest perk</a>}
                          {v.phone && <a href={`tel:${v.phone.replace(/[^\d+]/g, "")}`} className="btn-ghost !px-4 !py-2">Call</a>}
                          {v.address && <a href={`https://maps.google.com/?q=${encodeURIComponent(v.address)}`} target="_blank" rel="noopener" className="btn-ghost !px-4 !py-2">Directions</a>}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="card !bg-white text-center">
            <p className="eyebrow">Guest Pass</p>
            <div className={`mx-auto mt-4 w-48 ${t.guestPassActive ? "" : "opacity-30 grayscale"}`} dangerouslySetInnerHTML={{ __html: passSvg }} />
            <p className="mt-3 font-display text-xl">{booking.firstName} {booking.lastName}</p>
            <p className="text-xs text-ink-soft">{property.name} · {formatRange(booking.checkIn, booking.checkOut)}</p>
            <p className={`mt-3 text-sm ${t.guestPassActive ? "text-green-700" : "text-ink-soft"}`}>
              {t.guestPassActive ? "● Active — show this at partner venues" : t.stage === "departed" ? "Expired" : `Activates on check-in day, ${formatDate(booking.checkIn, { weekday: undefined })}`}
            </p>
            {t.guestPassActive && <Link href="/trip/pass" className="btn-primary mt-4 w-full">Show full screen</Link>}
          </div>

          <div className="card !bg-ink text-sand">
            <p className="eyebrow !text-brass-light">Share the Lake</p>
            <p className="mt-2 font-display text-2xl">Give {formatMoney(site.referral.friendDiscountCents)}, get {formatMoney(site.referral.referrerCreditCents)}</p>
            <p className="mt-2 text-sm text-sand/70">Friends save on their first stay. You earn credit toward your next one.</p>
            <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-sand/10 px-3 py-2">
              <span className="truncate font-mono text-xs">{referralUrl}</span>
              <CopyButton text={referralUrl} light />
            </div>
            <p className="mt-3 text-xs text-sand/60">
              {referral.uses} friend{referral.uses === 1 ? "" : "s"} booked · {formatMoney(referral.creditCents)} credit earned
            </p>
          </div>

          <div className="card !bg-white text-sm">
            <p className="eyebrow">Your reservation</p>
            <p className="mt-3">{booking.guests} guests{booking.pets ? ` · ${booking.pets} dog${booking.pets > 1 ? "s" : ""}` : ""}</p>
            <p>Total paid {formatMoney(booking.totalCents, { cents: true })}</p>
            <p className="mt-2 text-ink-soft">{t.refundable ? `Fully refundable until ${formatDate(t.unlockDate)}` : "Non-refundable"}</p>
            <Link href="/trip/agreement" className="mt-3 block underline">View signed rental agreement</Link>
            <a href={`sms:${site.phone.replace(/[^\d+]/g, "")}`} className="mt-1 block underline">Text {site.hostName}</a>
            <form action={guestLogout} className="mt-4"><button className="text-xs text-ink-soft underline">Sign out</button></form>
          </div>
        </aside>
      </div>
    </div>
  );
}
