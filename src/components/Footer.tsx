import Link from "next/link";
import { site, properties } from "@/config/site";
import { LeadForm } from "./LeadForm";

export function Footer() {
  return (
    <footer className="no-print relative overflow-hidden bg-ink text-sand/80">
      {/* Gentle wave along the top edge */}
      <svg className="absolute inset-x-0 top-0 h-10 w-[200%] animate-drift-slow text-sand" viewBox="0 0 1600 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0H1600V14C1500 30 1400 30 1300 14S1100 -2 1000 14 800 30 700 14 500 -2 400 14 200 30 100 14 0 -2 0 14Z" fill="currentColor" />
      </svg>

      <div className="container-x grid gap-12 pb-12 pt-24 lg:grid-cols-[1.2fr_1fr]">
        <div data-reveal>
          <p className="font-display text-4xl text-sand sm:text-5xl">Save a spot on the lake.</p>
          <p className="mt-3 max-w-md text-sm">Last-minute openings, seasonal rates and new perks, sent a few times a season. Never spam.</p>
        </div>
        <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties} className="rounded-2xl bg-sand p-5 text-ink sm:p-6">
          <LeadForm source="footer" compact />
        </div>
      </div>

      <div className="container-x grid gap-10 border-t border-sand/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-sand">{site.brand}</p>
          <p className="mt-2 text-sm">{site.tagline}. Owned and hosted locally by {site.hostName}.</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">The Homes</p>
          {properties.map((p) => (
            <Link key={p.slug} href={`/stays/${p.slug}`} className="link-draw block w-fit py-1 hover:text-sand">{p.name}</Link>
          ))}
          <Link href="/stays" className="link-draw block w-fit py-1 hover:text-sand">Check availability</Link>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">Guests</p>
          <Link href="/trip" className="link-draw block w-fit py-1 hover:text-sand">Guest Login</Link>
          <Link href="/experiences" className="link-draw block w-fit py-1 hover:text-sand">Insider Perks</Link>
          <Link href="/#guide" className="link-draw block w-fit py-1 hover:text-sand">Area Guide</Link>
          <Link href="/share" className="link-draw block w-fit py-1 hover:text-sand">Share the Lake</Link>
          <Link href="/#faq" className="link-draw block w-fit py-1 hover:text-sand">FAQ</Link>
          <Link href="/policies" className="link-draw block w-fit py-1 hover:text-sand">Policies</Link>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">Contact</p>
          <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="link-draw block w-fit py-1 hover:text-sand">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="link-draw block w-fit break-all py-1 hover:text-sand">{site.email}</a>
          <p className="py-1">{site.region}</p>
          {site.instagram && <a href={site.instagram} className="link-draw block w-fit py-1 hover:text-sand">Instagram</a>}
        </div>
      </div>
      <div className="border-t border-sand/10 py-6 text-center text-xs text-sand/50">
        © {new Date().getFullYear()} {site.brand}. Book direct, with no platform fees.
      </div>
    </footer>
  );
}
