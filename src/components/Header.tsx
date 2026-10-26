import Link from "next/link";
import { site } from "@/config/site";

export function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`no-print sticky top-0 z-40 border-b backdrop-blur ${dark ? "border-sand/10 bg-ink/90 text-sand" : "border-ink/5 bg-sand/85"}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl tracking-wide">
          {site.brand}
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link href="/stays" className="hover:text-brass">The Homes</Link>
          <Link href="/experiences" className="hover:text-brass">Experiences</Link>
          <Link href="/share" className="hover:text-brass">Share the Lake</Link>
          <Link href="/trip" className="hover:text-brass">Guest Login</Link>
        </nav>
        <Link href="/stays" className="btn-primary !px-5 !py-2">Book Direct</Link>
      </div>
    </header>
  );
}
