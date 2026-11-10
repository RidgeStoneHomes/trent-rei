import Link from "next/link";
import { properties, site, vendorCategories } from "@/config/site";
import { faqs } from "@/content/faq";
import { areaGuide, tripStyles } from "@/content/guide";
import { Media } from "@/components/Media";
import { LeadForm } from "@/components/LeadForm";
import { LakeScene } from "@/components/LakeScene";
import { DateSearch } from "@/components/DateSearch";
import { HomeJsonLd } from "@/components/JsonLd";
import { CountUp, TiltCard } from "@/components/motion";
import { activePromo } from "@/components/PromoBar";
import { formatMoney } from "@/lib/money";
import { lowestRate } from "@/lib/pricing";
import { todayLocal } from "@/lib/dates";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

const reasons = [
  { title: "Our best rate, direct", body: "Booking here always gets you our lowest price, plus private perks with our local partners." },
  { title: "A real local host", body: `Call or text ${site.contactName} directly, whether it's a dinner tip or an extra bundle of firewood.` },
  { title: "Flexible cancellation", body: `Full refund up to ${site.policies.refundWindowDays} days before arrival.` },
];

const journey = [
  { title: "Pick your home", body: "Live availability and the full price up front." },
  { title: "Sign online", body: "A short digital rental agreement. Nothing to print." },
  { title: "Unlock perks", body: "Your Insider Portal opens with partner offers." },
  { title: "Arrive", body: "Arrival details arrive in your trip page before check-in." },
];

export default function HomePage() {
  const totalGuests = properties.reduce((n, p) => n + p.maxGuests, 0);
  const maxGuests = Math.max(...properties.map((p) => p.maxGuests));
  const promo = activePromo();

  return (
    <>
      <HomeJsonLd />

      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden text-sand">
        <LakeScene photo={properties.find((p) => p.heroPhoto)?.heroPhoto?.src} video={properties.find((p) => p.heroVideo)?.heroVideo} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-transparent to-ink/40" />
        <div className={`container-x flex flex-1 flex-col items-center justify-center pb-16 text-center ${promo ? "pt-40" : "pt-32"}`}>
          <p className="eyebrow animate-rise !text-brass-light">Lake Texoma · Pottsboro, Texas</p>
          <h1 className="mt-5 max-w-4xl animate-rise text-5xl font-light leading-[1.05] tracking-wide [animation-delay:120ms] sm:text-7xl lg:text-8xl">
            Private luxury estates
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-rise text-base tracking-wide text-sand/85 [animation-delay:240ms] sm:text-lg">
            Ironwood Acres and The Fog Line: two private homes near Highport Marina, thoughtfully designed for gathering.
          </p>
          <p className="mt-5 animate-rise text-sm tracking-wide text-brass-light [animation-delay:300ms]">Owned and hosted by {site.hostName}</p>
          <div className="mt-8 w-full max-w-3xl animate-rise text-left [animation-delay:360ms]">
            <DateSearch today={todayLocal()} maxGuests={maxGuests} />
          </div>
        </div>
        <a href="#homes" className="mx-auto mb-8 flex flex-col items-center gap-2 text-[10px] uppercase tracking-luxe text-sand/70 hover:text-sand">
          Explore
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-sand/80 to-transparent" />
        </a>
      </section>

      {/* NUMBERS */}
      <section className="border-b border-ink/5 bg-sand">
        <div className="container-x grid grid-cols-2 gap-y-8 py-12 text-center lg:grid-cols-4">
          {[
            { value: <CountUp to={properties.length} />, label: "Private homes" },
            { value: <CountUp to={totalGuests} />, label: "Guests across both" },
            { value: <CountUp to={site.policies.refundWindowDays} />, label: "Days of free cancellation" },
            { value: <CountUp to={1} />, label: "Private acre" },
          ].map((s, i) => (
            <div key={s.label} data-reveal style={delay(i * 90)}>
              <p className="font-display text-5xl text-ink sm:text-6xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE HOMES */}
      <section id="homes" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="text-center" data-reveal>
          <p className="eyebrow">The Homes</p>
          <h2 className="mt-3 text-4xl sm:text-6xl">The estates</h2>
        </div>
        <div className="mt-16 space-y-24 sm:space-y-32">
          {properties.map((p, i) => (
            <article key={p.slug} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div data-reveal={i % 2 ? "right" : "left"} className={i % 2 ? "lg:order-2" : ""}>
                <TiltCard className="rounded-3xl">
                  <Link href={`/stays/${p.slug}`} className="relative block overflow-hidden rounded-3xl">
                    <Media property={p} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" label={p.location} />
                    <span className="absolute right-4 top-4 rounded-full bg-sand/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
                      {p.comingSoon ? "Opening soon" : <>from {formatMoney(lowestRate(p))}/night</>}
                    </span>
                  </Link>
                </TiltCard>
              </div>
              <div data-reveal style={delay(150)}>
                <p className="eyebrow">0{i + 1} · {p.location}</p>
                <h3 className="mt-3 text-4xl sm:text-5xl">{p.name}</h3>
                <p className="mt-4 text-lg text-ink-soft">{p.headline}</p>
                <p className="mt-4 text-xs uppercase tracking-wider text-ink-soft/80">
                  {p.bedrooms} bedrooms · {p.baths} baths · sleeps {p.maxGuests}
                </p>
                <ul className="mt-6 space-y-2">
                  {p.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-3 text-sm"><span className="text-ember">✦</span>{h}</li>
                  ))}
                </ul>
                <Link href={`/stays/${p.slug}`} className="btn-primary btn-sheen mt-8">Explore {p.name} →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FIND YOUR KIND OF WEEKEND */}
      <section className="bg-white/60">
        <div className="container-x py-24">
          <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <p className="eyebrow">Occasions</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Designed for gathering</h2>
            </div>
            <Link href="/stays" className="btn-ghost">See all dates</Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripStyles.map((t, i) => (
              <Link
                key={t.title}
                href={t.href}
                data-reveal="zoom"
                style={delay(i * 70)}
                className={`group relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${t.tone} p-6 text-sand transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_50px_-20px_rgba(20,32,43,.6)]`}
              >
                <span className="absolute right-5 top-5 text-4xl transition duration-500 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-125" aria-hidden>{t.icon}</span>
                <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 transition duration-700 group-hover:scale-150" aria-hidden />
                <h3 className="text-3xl">{t.title}</h3>
                <p className="mt-1 text-sm text-sand/80">{t.blurb}</p>
                <span className="mt-4 text-xs uppercase tracking-wider text-brass-light transition group-hover:translate-x-1">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BOOK DIRECT */}
      <section className="container-x grid gap-14 py-24 sm:py-32 lg:grid-cols-2 lg:items-center">
        <div data-reveal="left">
          <p className="eyebrow">Book direct</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">The direct booking advantage</h2>
          <div className="mt-10 space-y-7">
            {reasons.map((r, i) => (
              <div key={r.title} className="flex gap-5" data-reveal style={delay(100 + i * 100)}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass/15 font-display text-lg text-brass-dark">{i + 1}</span>
                <div>
                  <p className="font-display text-2xl">{r.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div data-reveal="right" className="overflow-hidden rounded-3xl">
          <Media property={properties[0]} index={1} className="aspect-[4/5] w-full" />
        </div>
      </section>

      {/* INSIDER COLLECTION */}
      <section className="relative overflow-hidden bg-lake-deep text-sand">
        <div aria-hidden className="absolute -left-40 top-10 h-96 w-96 animate-glow rounded-full bg-ember/20 blur-3xl" />
        <div aria-hidden className="absolute -right-32 bottom-0 h-96 w-96 animate-glow rounded-full bg-brass/20 blur-3xl [animation-delay:3s]" />
        <div className="container-x relative grid gap-14 py-24 sm:py-32 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <p className="eyebrow !text-brass-light">The Insider Collection</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Exclusive privileges with our local partners</h2>
            <p className="mt-6 max-w-lg text-sand/80">
              We've partnered with the best guides, vineyards, kitchens and stables around the lake. As our guest, you
              unlock private discounts and extras, like an hour on the water, a reserved table or a tasting flight on
              the house, all from your personal Insider Portal.
            </p>
            <Link href="/experiences" className="btn-brass btn-sheen mt-8">Preview the perks</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(vendorCategories).map(([key, c], i) => (
              <div
                key={key}
                data-reveal="zoom"
                style={delay(i * 70)}
                className="group rounded-2xl border border-sand/10 bg-sand/5 p-5 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-brass-light/40 hover:bg-sand/10"
              >
                <p className="text-3xl transition duration-500 group-hover:scale-110">{c.icon}</p>
                <p className="mt-3 text-sm">{c.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-luxe text-brass-light">🔒 Guests only</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHARE THE LAKE */}
      <section className="container-x py-24 text-center sm:py-32">
        <div data-reveal>
          <p className="eyebrow">Referrals</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-4xl sm:text-5xl">Share Reynolds Retreats</h2>
          <p className="mx-auto mt-5 max-w-xl text-ink-soft">
            Every guest receives a personal referral link. Friends save {formatMoney(site.referral.friendDiscountCents)} on
            their first stay, and you receive {formatMoney(site.referral.referrerCreditCents)} toward your next one.
          </p>
          <Link href="/share" className="btn-primary btn-sheen mt-8">How it works</Link>
        </div>
      </section>
    </>
  );
}
