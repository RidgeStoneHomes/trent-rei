import Link from "next/link";
import { site } from "@/config/site";
import { todayLocal } from "@/lib/dates";

// Slim offer bar. Returns nothing once the promo's end date has passed.
export function activePromo() {
  const p = site.promo;
  return p && todayLocal() <= p.endsOn ? p : null;
}

export function PromoBar() {
  const p = activePromo();
  if (!p) return null;
  return (
    <Link href={p.href} className="group flex h-9 items-center justify-center gap-3 overflow-hidden bg-ink px-4 text-xs text-sand">
      <span className="shrink-0 rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">{p.label}</span>
      <span className="truncate">{p.text}</span>
      <span className="hidden shrink-0 text-brass-light transition group-hover:translate-x-1 sm:inline">Learn more →</span>
    </Link>
  );
}
