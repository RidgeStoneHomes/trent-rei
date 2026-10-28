import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty, properties, site } from "@/config/site";
import { Media } from "@/components/Media";
import { BookingWidget } from "@/components/BookingWidget";
import { bookedNights } from "@/lib/availability";
import { isIsoDate, todayLocal } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProperty((await params).slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const property = getProperty((await params).slug);
  const q = await searchParams;
  const initial = isIsoDate(q.checkIn) && isIsoDate(q.checkOut) ? { checkIn: q.checkIn, checkOut: q.checkOut, guests: Number(q.guests) || 2 } : undefined;
  if (!property) notFound();
  const booked = await bookedNights(property.slug);
  const other = properties.find((p) => p.slug !== property.slug);

  return (
    <>
      <section className="container-x pt-10">
        <p className="eyebrow animate-rise">{property.location}</p>
        <h1 className="mt-3 animate-rise text-5xl [animation-delay:100ms] sm:text-6xl">{property.name}</h1>
        <p className="mt-3 animate-rise text-lg text-ink-soft [animation-delay:200ms]">{property.headline}</p>
        <div className="mt-8 grid h-[28rem] animate-rise grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl [animation-delay:300ms]">
          <div className="col-span-4 row-span-2 overflow-hidden sm:col-span-2">
            <Media property={property} index={0} className="h-full w-full transition duration-700 hover:scale-105" label="Photo coming soon" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hidden overflow-hidden sm:block">
              <Media property={property} index={i} className="h-full w-full transition duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-sm uppercase tracking-wider text-ink-soft">
            {property.bedrooms} bedrooms · {property.beds} beds · {property.baths} baths · sleeps {property.maxGuests}
          </p>
          <p className="mt-6 font-display text-2xl leading-snug">{property.summary}</p>
          <div className="prose-luxe mt-6">{property.story.map((s, i) => <p key={i}>{s}</p>)}</div>

          <h2 className="mt-12 text-3xl">Highlights</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {property.highlights.map((h) => (
              <li key={h} data-reveal className="card !p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-ember">✦</span> {h}</li>
            ))}
          </ul>

          {property.rooms && (
            <>
              <h2 className="mt-12 text-3xl">Where you'll sleep</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {property.rooms.map((r) => (
                  <div key={r.name} data-reveal className="card !bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="font-display text-2xl">{r.name}</p>
                    <p className="text-xs uppercase tracking-wider text-brass-dark">{r.beds}</p>
                    <p className="mt-2 text-sm text-ink-soft">{r.detail}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {property.spaces ? (
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              {property.spaces.map((sp) => (
                <div key={sp.title}>
                  <h2 className="text-3xl">{sp.title}</h2>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {sp.items.map((i) => <li key={i}>· {i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h2 className="mt-12 text-3xl">Amenities</h2>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-soft sm:grid-cols-3">
                {property.amenities.map((a) => <li key={a}>· {a}</li>)}
              </ul>
            </>
          )}

          {property.nearby && (
            <>
              <h2 className="mt-12 text-3xl">Getting around</h2>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {property.nearby.map((n) => (
                  <div key={n.place} className="card !p-4 text-center">
                    <p className="font-display text-2xl">{n.distance}</p>
                    <p className="text-xs uppercase tracking-wider text-ink-soft">{n.place}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div data-reveal className="relative mt-12 overflow-hidden rounded-2xl bg-lake-deep p-8 text-sand">
            <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 animate-glow rounded-full bg-ember/25 blur-3xl" />
            <p className="eyebrow !text-brass-light">Included with every direct stay</p>
            <h3 className="mt-2 text-3xl">The Insider Portal</h3>
            <p className="mt-3 text-sand/80">
              Exclusive guest pricing with our local partners — fishing guides, vineyards, horseback rides, restaurants,
              and the casino — plus curated itineraries and your digital Guest Pass.
            </p>
            <Link href="/experiences" className="btn-brass mt-6">Preview perks</Link>
          </div>

          <h2 className="mt-12 text-3xl">Good to know</h2>
          <div className="mt-5 grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium">Check-in / out</p>
              <p className="mt-1 text-ink-soft">After {site.policies.checkInTime} · Before {site.policies.checkOutTime}</p>
            </div>
            <div>
              <p className="font-medium">Cancellation</p>
              <p className="mt-1 text-ink-soft">Full refund up to {site.policies.refundWindowDays} days before check-in.</p>
            </div>
            <div>
              <p className="font-medium">House rules</p>
              <ul className="mt-1 text-ink-soft">{property.houseRules.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
            {property.cameraDisclosure && (
              <div className="sm:col-span-3">
                <p className="font-medium">Security cameras</p>
                <p className="mt-1 text-ink-soft">{property.cameraDisclosure}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            slug={property.slug}
            today={todayLocal()}
            booked={booked}
            maxGuests={property.maxGuests}
            minNights={property.minNights}
            allowsPets={property.petFeeCents !== null}
            baseRateCents={property.baseRateCents}
            initial={initial}
          />
          <p className="mt-3 text-center text-xs text-ink-soft">
            Weekend nights {formatMoney(property.weekendRateCents)} · Cleaning {formatMoney(property.cleaningFeeCents)}
          </p>
        </aside>
      </section>

      {other && (
        <section className="border-t border-ink/5">
          <div className="container-x flex flex-wrap items-center justify-between gap-6 py-12">
            <div>
              <p className="eyebrow">Also consider</p>
              <p className="mt-2 font-display text-3xl">{other.name}</p>
              <p className="text-sm text-ink-soft">{other.headline}</p>
            </div>
            <Link href={`/stays/${other.slug}`} className="btn-ghost">View {other.name}</Link>
          </div>
        </section>
      )}

      {/* Mobile: keep the price and a jump to the calendar in reach */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink/10 bg-sand/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-sm">
          from <span className="font-display text-2xl">{formatMoney(property.baseRateCents)}</span> / night
        </p>
        <a href="#book" className="btn-primary !py-2.5">Check dates</a>
      </div>
      <div aria-hidden className="h-16 lg:hidden" />
    </>
  );
}
