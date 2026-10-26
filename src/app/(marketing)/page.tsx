import Link from "next/link";
import { properties, site, vendorCategories } from "@/config/site";
import { Media } from "@/components/Media";
import { PropertyCard } from "@/components/PropertyCard";
import { LeadForm } from "@/components/LeadForm";
import { formatMoney } from "@/lib/money";

const reasons = [
  { title: "Best rate, guaranteed", body: `No platform service fees — guests typically save ${Math.round(site.otaGuestFeeRate * 100)}% versus booking on Airbnb.` },
  { title: "The Insider Portal", body: "Private perks with our hand-picked local partners: charters, tastings, trail rides, tables, and more." },
  { title: "A real host", body: `Text ${site.hostName} directly — from restaurant tips to an extra bundle of firewood.` },
  { title: "Flexible planning", body: `Full refund up to ${site.policies.refundWindowDays} days before arrival. Book now, decide later.` },
];

const journey = [
  { step: "01", title: "Choose your escape", body: "Lake-view glass house or farmhouse in the vines." },
  { step: "02", title: "Reserve in minutes", body: "Live availability, transparent pricing, secure checkout." },
  { step: "03", title: "Sign & settle in", body: "A simple digital rental agreement — no printing, no fuss." },
  { step: "04", title: "Unlock the Insider Portal", body: "Partner perks, curated itineraries, and arrival details." },
  { step: "05", title: "Arrive & exhale", body: "Show your Guest Pass at partners for exclusive guest pricing." },
];

const moments = [
  "Anniversaries that deserve a view",
  "Girls' trips & wine-trail weekends",
  "Striper fishing with the crew",
  "Family reunions around the fire",
  "Proposals at golden hour",
  "Remote work with a lake breeze",
];

export default function HomePage() {
  const hero = properties[0];
  return (
    <>
      {/* HERO — interest */}
      <section className="relative isolate overflow-hidden bg-ink text-sand">
        <Media property={hero} className="absolute inset-0 -z-10 h-full w-full opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="container-x flex min-h-[86vh] flex-col justify-end pb-20 pt-32">
          <p className="eyebrow !text-brass-light">{site.region}</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
            Where the lake <em className="text-brass-light">slows you down.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sand/80">
            Two private luxury homes on Lake Texoma. Book direct for the best rate, a private Insider Portal, and
            local experiences you won't find on any app.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/stays" className="btn-brass">Check Availability</Link>
            <Link href="/experiences" className="btn-light">See the Insider Perks</Link>
          </div>
        </div>
      </section>

      {/* WHY BOOK DIRECT */}
      <section className="border-b border-ink/5 bg-sand-deep/40">
        <div className="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title}>
              <p className="font-display text-xl">{r.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE HOMES */}
      <section className="container-x py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The Homes</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Two retreats. One unforgettable lake.</h2>
          </div>
          <Link href="/stays" className="btn-ghost">Compare homes</Link>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {properties.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </div>
      </section>

      {/* INSIDER COLLECTION — excitement */}
      <section className="bg-lake-deep text-sand">
        <div className="container-x grid gap-12 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow !text-brass-light">The Insider Collection</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Your stay comes with friends in town.</h2>
            <p className="mt-6 max-w-lg text-sand/80">
              We've partnered with the best guides, vineyards, kitchens, and stables around the lake. As our guest,
              you unlock private discounts and extras — a free hour on the water, a reserved table, a tasting flight
              on the house — all from your personal Insider Portal.
            </p>
            <Link href="/experiences" className="btn-brass mt-8">Preview the perks</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(vendorCategories).map(([key, c]) => (
              <div key={key} className="rounded-2xl border border-sand/10 bg-sand/5 p-5">
                <p className="text-3xl">{c.icon}</p>
                <p className="mt-3 text-sm">{c.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-luxe text-brass-light">Guests only</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="container-x py-24">
        <p className="eyebrow text-center">How it works</p>
        <h2 className="mt-3 text-center text-4xl sm:text-5xl">From daydream to dock in five steps</h2>
        <ol className="mt-14 grid gap-6 md:grid-cols-5">
          {journey.map((j) => (
            <li key={j.step} className="card">
              <p className="font-display text-3xl text-brass">{j.step}</p>
              <p className="mt-3 font-medium">{j.title}</p>
              <p className="mt-2 text-sm text-ink-soft">{j.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* MOMENTS */}
      <section className="bg-white/60">
        <div className="container-x py-20">
          <p className="eyebrow">Made for</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {moments.map((m) => (
              <span key={m} className="rounded-full border border-ink/10 bg-sand px-5 py-2.5 font-display text-lg">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDING GUEST — capture interest */}
      <section id="founding" className="bg-ink text-sand">
        <div className="container-x grid gap-10 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow !text-brass-light">Now opening</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{site.foundingGuest.headline}</h2>
            <p className="mt-6 max-w-lg text-sand/80">{site.foundingGuest.offer}</p>
          </div>
          <div className="rounded-2xl bg-sand p-6 text-ink sm:p-8">
            <LeadForm />
            <p className="mt-4 text-xs text-ink-soft">First access to dates and seasonal rates. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* SHARE THE LAKE */}
      <section className="container-x py-24 text-center">
        <p className="eyebrow">Share the Lake</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-4xl sm:text-5xl">Give {formatMoney(site.referral.friendDiscountCents)}. Get {formatMoney(site.referral.referrerCreditCents)}.</h2>
        <p className="mx-auto mt-5 max-w-xl text-ink-soft">
          Every guest gets a personal link. Friends save on their first stay, and you earn credit toward your next one.
          The best trips are the ones people can't stop talking about.
        </p>
        <Link href="/share" className="btn-primary mt-8">How it works</Link>
      </section>
    </>
  );
}
