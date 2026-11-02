"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";

const nav = [
  { href: "/stays", label: "The Homes" },
  { href: "/experiences", label: "Insider Perks" },
  { href: "/#guide", label: "Area Guide" },
  { href: "/share", label: "Share the Lake" },
  { href: "/#faq", label: "FAQ" },
];

// On the homepage the header floats clear over the hero, then turns solid once you scroll.
export function Header({ promo }: { promo?: React.ReactNode }) {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const clear = overHero && !scrolled && !open;
  return (
    <>
    <div className="no-print fixed inset-x-0 top-0 z-50">
    {promo}
    <header
      className={`transition-all duration-500 ${
        clear ? "bg-transparent text-sand" : "border-b border-ink/5 bg-sand/90 text-ink shadow-[0_8px_30px_-20px_rgba(20,32,43,.5)] backdrop-blur-md"
      }`}
    >
      <div className={`container-x flex items-center justify-between gap-4 transition-all duration-500 ${clear ? "h-20" : "h-16"}`}>
        <Link href="/" className="group flex items-baseline gap-2 font-display text-xl tracking-wide sm:text-2xl">
          <span>{site.brand}</span>
          <span className={`hidden text-[10px] font-sans uppercase tracking-luxe sm:inline ${clear ? "text-brass-light" : "text-brass-dark"}`}>Lake Texoma</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="link-draw pb-0.5">{n.label}</Link>
          ))}
          <Link href="/trip" className={`link-draw pb-0.5 ${clear ? "text-sand/70" : "text-ink-soft"}`}>Guest Login</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/stays" className={`btn-sheen !px-5 !py-2 ${clear ? "btn-brass" : "btn-primary"}`}>Book Direct</Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-0.5 w-5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden bg-sand transition-[max-height] duration-500 lg:hidden ${open ? "max-h-[80vh]" : "max-h-0"}`}>
        <nav className="container-x flex flex-col py-4">
          {[...nav, { href: "/trip", label: "Guest Login" }].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`border-b border-ink/5 py-4 font-display text-3xl transition duration-500 ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              {n.label}
            </Link>
          ))}
          <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="mt-6 text-sm text-ink-soft">Call or text {site.phone}</a>
        </nav>
      </div>
    </header>
    </div>
    {/* Inner pages start below the fixed bar; the homepage hero runs underneath it */}
    {!overHero && <div aria-hidden className={`no-print ${promo ? "h-[6.25rem]" : "h-16"}`} />}
    </>
  );
}
