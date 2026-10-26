import Link from "next/link";
import { site, properties } from "@/config/site";

export function Footer() {
  return (
    <footer className="no-print bg-ink text-sand/80">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-sand">{site.brand}</p>
          <p className="mt-2 text-sm">{site.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">The Homes</p>
          {properties.map((p) => (
            <Link key={p.slug} href={`/stays/${p.slug}`} className="block py-1 hover:text-sand">{p.name}</Link>
          ))}
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">Guests</p>
          <Link href="/trip" className="block py-1 hover:text-sand">Guest Login</Link>
          <Link href="/experiences" className="block py-1 hover:text-sand">Insider Perks</Link>
          <Link href="/share" className="block py-1 hover:text-sand">Share the Lake</Link>
          <Link href="/policies" className="block py-1 hover:text-sand">Policies</Link>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 !text-brass-light">Contact</p>
          <p className="py-1">{site.email}</p>
          <p className="py-1">{site.phone}</p>
          <a href={site.instagram} className="block py-1 hover:text-sand">Instagram</a>
        </div>
      </div>
      <div className="border-t border-sand/10 py-6 text-center text-xs text-sand/50">
        © {new Date().getFullYear()} {site.brand}. Book direct — no platform fees.
      </div>
    </footer>
  );
}
