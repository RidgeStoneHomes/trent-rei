"use client";

import { useState } from "react";
import { properties } from "@/config/site";
import { quoteStay } from "@/lib/pricing";
import { addDays } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

// A fixed Friday, used only so a sample stay includes a weekend; the dates themselves don't matter.
const SAMPLE_FRIDAY = "2027-01-01";

// Interactive "book direct vs. Airbnb" comparison using the real pricing rules.
export function SavingsCalculator() {
  const [slug, setSlug] = useState(properties[0].slug);
  const [nights, setNights] = useState(3);
  const property = properties.find((p) => p.slug === slug)!;
  const q = quoteStay(property, SAMPLE_FRIDAY, addDays(SAMPLE_FRIDAY, nights));
  const saved = Math.max(0, q.otaEstimateCents - q.totalCents);
  const pct = q.otaEstimateCents ? (q.totalCents / q.otaEstimateCents) * 100 : 100;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_30px_80px_-40px_rgba(20,32,43,.45)] ring-1 ring-ink/5 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {properties.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setSlug(p.slug)}
            className={`rounded-full px-4 py-2 text-sm transition ${p.slug === slug ? "bg-ink text-sand" : "bg-sand hover:bg-sand-deep"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="flex items-baseline justify-between text-sm">
          <span className="text-ink-soft">Length of stay</span>
          <span className="font-display text-2xl">{nights} nights</span>
        </span>
        <input type="range" min={property.minNights} max={7} value={nights} onChange={(e) => setNights(Number(e.target.value))} className="mt-2 w-full accent-[#b08d57]" />
      </label>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm"><span className="text-ink-soft">Booking platform (est.)</span><span>{formatMoney(q.otaEstimateCents)}</span></div>
          <div className="mt-1.5 h-3 rounded-full bg-ink/10"><div className="h-full w-full rounded-full bg-ink/30" /></div>
        </div>
        <div>
          <div className="flex justify-between text-sm"><span className="font-medium">Book direct</span><span className="font-medium">{formatMoney(q.totalCents)}</span></div>
          <div className="mt-1.5 h-3 rounded-full bg-ink/10"><div className="h-full rounded-full bg-gradient-to-r from-brass to-ember transition-all duration-700" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-lake-deep px-5 py-4 text-sand">
        <span className="text-sm">You keep</span>
        <span key={saved} className="animate-rise font-display text-4xl text-brass-light">{formatMoney(saved)}</span>
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        Sample stay starting on a Friday, with taxes and cleaning. Platform estimate adds a typical guest service fee.
      </p>
    </div>
  );
}
