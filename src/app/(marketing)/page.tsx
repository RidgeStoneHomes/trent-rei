import Link from "next/link";
import { properties, site, vendorCategories } from "@/config/site";
import { faqs } from "@/content/faq";
import { areaGuide, tripStyles } from "@/content/guide";
import { Media } from "@/components/Media";
import { LeadForm } from "@/components/LeadForm";
import { LakeScene } from "@/components/LakeScene";
import { DateSearch } from "@/components/DateSearch";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { HomeJsonLd } from "@/components/JsonLd";
import { CountUp, RotatingWords, TiltCard } from "@/components/motion";
import { activePromo } from "@/components/PromoBar";
import { formatMoney } from "@/lib/money";
import { todayLocal } from "@/lib/dates";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

const reasons = [
  { title: "No platform fees", body: `Guests typically save around ${Math.round(site.otaGuestFeeRate * 100)}% compared with booking the same home on Airbnb.` },
  { title: "A real local host", body: `Text ${site.hostName} directly, whether it's a dinner tip or an extra bundle of firewood.` },
  { title: "Book now, decide later", body: `Full refund up to ${site.policies.refundWindowDays} days before arrival.` },
];

const journey = [
  { title: "Pick your home", body: "Live availability and the full price up front." },
  { title: "Sign online", body: "A short digital rental agreement. Nothing to print." },
  { title: "Unlock perks", body: "Your Insider Portal opens with partner offers." },
  { title: "Arrive & exhale", body: "Door code and Wi-Fi land a few days before." },
];

const moments = [
  "Anniversaries with a view",
  "Wine-trail weekends",
  "Striper fishing with the crew",
  "Putting-green golf trips",
  "Family reunions by the fire",
  "Golden-hour proposals",
  "Remote work with a lake breeze",
  "Hot tub under the stars",
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
        <LakeScene photo={properties[0].images[0]} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-transparent to-ink/40" />
        <div className={`container-x flex flex-1 flex-col items-center justify-center pb-16 text-center ${promo ? "pt-40" : "pt-32"}`}>
          <p className="eyebrow animate-rise !text-brass-light">{site.region} · Book direct</p>
          <h1 className="mt-5 max-w-4xl animate-rise text-5xl leading-[1.02] [animation-delay:120ms] sm:text-7xl lg:text-8xl">
            Where the lake
            <br />
            <em className="text-brass-light">
              <RotatingWords words={["slows you down.", "brings everyone in.", "turns to gold.", "feels like yours."]} />
            </em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-rise text-base text-sand/85 [animation-delay:240ms] sm:text-lg">
            Two private luxury homes near Lake Texoma, with no platform fees, a host who picks up, and perks from the best
            guides, vineyards and kitchens around the lake.
          </p>
          <div className="mt-10 w-full max-w-3xl animate-rise text-left [animation-delay:360ms]">
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
            { value: "$0", label: "Platform fees" },
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
          <h2 className="mt-3 text-4xl sm:text-6xl">Two retreats, one lake.</h2>
        </div>
        <div className="mt-16 space-y-24 sm:space-y-32">
          {properties.map((p, i) => (
            <article key={p.slug} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div data-reveal={i % 2 ? "right" : "left"} className={i % 2 ? "lg:order-2" : ""}>
                <TiltCard className="rounded-3xl">
                  <Link href={`/stays/${p.slug}`} className="relative block overflow-hidden rounded-3xl">
                    <Media property={p} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" label={p.location} />
                    <span className="absolute right-4 top-4 rounded-full bg-sand/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
                      from {formatMoney(p.baseRateCents)}/night
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
              <p className="eyebrow">Plan by occasion</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Find your kind of weekend</h2>
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
          <p className="eyebrow">Why book direct</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Same home. <em className="text-ember">Better stay.</em> Less money.</h2>
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
        <div data-reveal="right">
          <SavingsCalculator />
        </div>
      </section>

      {/* INSIDER COLLECTION */}
      <section className="relative overflow-hidden bg-lake-deep text-sand">
        <div aria-hidden className="absolute -left-40 top-10 h-96 w-96 animate-glow rounded-full bg-ember/20 blur-3xl" />
        <div aria-hidden className="absolute -right-32 bottom-0 h-96 w-96 animate-glow rounded-full bg-brass/20 blur-3xl [animation-delay:3s]" />
        <div className="container-x relative grid gap-14 py-24 sm:py-32 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <p className="eyebrow !text-brass-light">The Insider Collection</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Your stay comes with friends in town.</h2>
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

      {/* MOMENTS MARQUEE */}
      <section aria-label="Made for" className="overflow-hidden border-y border-ink/5 bg-sand py-8">
        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
          {[...moments, ...moments].map((m, i) => (
            <span key={i} aria-hidden={i >= moments.length} className="flex items-center gap-4 whitespace-nowrap font-display text-3xl italic text-ink/80 sm:text-4xl">
              {m}<span className="text-xl not-italic text-ember">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* AREA GUIDE */}
      <section id="guide" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Area guide</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">Your weekend, mapped out.</h2>
          <p className="mt-4 text-ink-soft">
            Our favorite ways to spend a day around Lake Texoma. Guests get the full list, with partner perks and our
            personal picks, in the Insider Portal.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {areaGuide.map((g, i) => (
            <div key={g.place} data-reveal style={delay(i * 70)} className="group bg-sand p-7 transition duration-500 hover:bg-white">
              <p className="text-[10px] uppercase tracking-luxe text-ember">{g.category}</p>
              <p className="mt-3 font-display text-2xl transition group-hover:translate-x-1">{g.place}</p>
              <p className="mt-2 text-sm text-ink-soft">{g.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink text-sand">
        <div className="container-x py-24">
          <p className="eyebrow text-center !text-brass-light" data-reveal>How it works</p>
          <h2 className="mt-3 text-center text-4xl sm:text-5xl" data-reveal>From daydream to dock</h2>
          <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent md:block" />
            {journey.map((j, i) => (
              <li key={j.title} className="relative text-center" data-reveal style={delay(i * 140)}>
                <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full border border-brass/60 bg-ink font-display text-xl text-brass-light">{i + 1}</span>
                <p className="mt-5 font-display text-2xl">{j.title}</p>
                <p className="mt-2 text-sm text-sand/70">{j.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* REVIEWS — only real ones, shown once added in site config */}
      {site.reviews.length > 0 && (
        <section className="container-x py-24">
          <p className="eyebrow text-center" data-reveal>Guest notes</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {site.reviews.map((r, i) => (
              <figure key={i} className="card !bg-white" data-reveal style={delay(i * 100)}>
                <p className="text-brass">★★★★★</p>
                <blockquote className="mt-3 font-display text-xl leading-snug">“{r.quote}”</blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-wider text-ink-soft">{r.name} · {r.home}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Questions, answered.</h2>
            <p className="mt-4 text-ink-soft">Anything else? Call or text {site.hostName} at <a className="underline" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>{site.phone}</a>.</p>
          </div>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f, i) => (
              <details key={f.q} className="group" data-reveal style={delay(i * 50)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-xl transition hover:text-lake sm:text-2xl">
                  {f.q}
                  <span className="faq-icon grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-lg transition duration-300">+</span>
                </summary>
                <p className="pb-6 pr-12 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDING GUEST */}
      <section id="founding" className="relative scroll-mt-24 overflow-hidden bg-ink text-sand">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_120%,rgba(217,119,75,.35),transparent_55%)]" />
        <div className="container-x relative grid gap-10 py-24 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <p className="eyebrow !text-brass-light">Now opening</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{site.foundingGuest.headline}</h2>
            <p className="mt-6 max-w-lg text-sand/80">{site.foundingGuest.offer}</p>
          </div>
          <div className="rounded-2xl bg-sand p-6 text-ink sm:p-8" data-reveal style={delay(120)}>
            <LeadForm />
            <p className="mt-4 text-xs text-ink-soft">First access to dates and seasonal rates. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* SHARE THE LAKE */}
      <section className="container-x py-24 text-center sm:py-32">
        <div data-reveal>
          <p className="eyebrow">Share the Lake</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-4xl sm:text-5xl">
            Give {formatMoney(site.referral.friendDiscountCents)}. Get {formatMoney(site.referral.referrerCreditCents)}.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-ink-soft">
            Every guest gets a personal link. Friends save on their first stay, and you earn credit toward your next one.
          </p>
          <Link href="/share" className="btn-primary btn-sheen mt-8">How it works</Link>
        </div>
      </section>
    </>
  );
}
