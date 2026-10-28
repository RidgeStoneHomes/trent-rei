import Link from "next/link";
import { properties, type Property } from "@/config/site";
import { PropertyCard } from "@/components/PropertyCard";
import { DateSearch } from "@/components/DateSearch";
import { validateStay } from "@/lib/availability";
import { quoteStay } from "@/lib/pricing";
import { isIsoDate, todayLocal } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export const metadata = {
  title: "The Homes · Check Availability",
  description: "Compare both Reynolds Retreats homes near Lake Texoma, check live availability, and see the full price for your dates.",
};

type Result = { property: Property; ok: true; totalCents: number; savedCents: number; nights: number } | { property: Property; ok: false; reason: string };

export default async function StaysPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const guests = Math.max(1, Number(q.guests) || 2);
  const searching = isIsoDate(q.checkIn) && isIsoDate(q.checkOut);
  const maxGuests = Math.max(...properties.map((p) => p.maxGuests));

  const results: Result[] | null = searching
    ? await Promise.all(
        properties.map(async (property): Promise<Result> => {
          const check = await validateStay(property, q.checkIn, q.checkOut, guests);
          if (!check.ok) return { property, ok: false, reason: check.error };
          const quote = quoteStay(property, q.checkIn!, q.checkOut!);
          return { property, ok: true, totalCents: quote.totalCents, savedCents: Math.max(0, quote.otaEstimateCents - quote.totalCents), nights: quote.nights };
        }),
      )
    : null;
  const stayQuery = searching ? `?${new URLSearchParams({ checkIn: q.checkIn!, checkOut: q.checkOut!, guests: String(guests) })}` : "";

  return (
    <>
      <section className="relative overflow-hidden bg-lake-deep text-sand">
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 animate-glow rounded-full bg-ember/25 blur-3xl" />
        <div className="container-x relative py-16 sm:py-20">
          <p className="eyebrow animate-rise !text-brass-light">The Homes</p>
          <h1 className="mt-3 animate-rise text-5xl [animation-delay:100ms] sm:text-6xl">Choose your retreat</h1>
          <p className="mt-4 max-w-xl animate-rise text-sand/80 [animation-delay:200ms]">
            Both homes include the Insider Portal, partner perks and a personal host, at the best rate you'll find anywhere.
          </p>
          <div className="mt-8 animate-rise text-ink [animation-delay:300ms]">
            <DateSearch today={todayLocal()} maxGuests={maxGuests} variant="bar" initial={{ checkIn: q.checkIn, checkOut: q.checkOut, guests }} />
          </div>
        </div>
      </section>

      {results && (
        <section id="results" className="container-x scroll-mt-28 pt-14">
          <p className="eyebrow">Your dates</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {results.map((r, i) => (
              <div
                key={r.property.slug}
                data-reveal
                style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 ring-1 ${r.ok ? "bg-white ring-brass/40" : "bg-white/50 ring-ink/5"}`}
              >
                <div>
                  <p className="font-display text-2xl">{r.property.name}</p>
                  {r.ok ? (
                    <p className="text-sm text-ink-soft">
                      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500 align-middle" />
                      Available · {r.nights} nights · <strong className="text-ink">{formatMoney(r.totalCents)}</strong> total
                      {r.savedCents > 0 && <span className="text-lake"> · save ~{formatMoney(r.savedCents)}</span>}
                    </p>
                  ) : (
                    <p className="text-sm text-ink-soft">{r.reason}</p>
                  )}
                </div>
                {r.ok ? (
                  <Link href={`/book/${r.property.slug}${stayQuery}`} className="btn-primary btn-sheen !py-2.5">Reserve</Link>
                ) : (
                  <Link href={`/stays/${r.property.slug}`} className="btn-ghost !py-2.5">See open dates</Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-14 md:grid-cols-2">
          {properties.map((p, i) => (
            <div key={p.slug} data-reveal style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}>
              <PropertyCard property={p} query={stayQuery} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
