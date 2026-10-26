"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type QuoteResponse =
  | { ok: true; quote: { nights: number; totalCents: number; otaEstimateCents: number; lines: { label: string; cents: number }[] } }
  | { ok: false; error: string };

const money = (c: number) =>
  (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

export function BookingWidget({
  slug,
  today,
  booked,
  maxGuests,
  minNights,
  allowsPets,
  baseRateCents,
}: {
  slug: string;
  today: string;
  booked: string[];
  maxGuests: number;
  minNights: number;
  allowsPets: boolean;
  baseRateCents: number;
}) {
  const router = useRouter();
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [pets, setPets] = useState(0);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  useEffect(() => {
    if (!checkIn || !checkOut) return setQuote(null);
    const ctrl = new AbortController();
    const qs = new URLSearchParams({ slug, checkIn, checkOut, guests: String(guests), pets: String(pets) });
    fetch(`/api/quote?${qs}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setQuote)
      .catch(() => {});
    return () => ctrl.abort();
  }, [slug, checkIn, checkOut, guests, pets]);

  function rangeFree(from: string, to: string) {
    for (let d = from; d < to; d = addDays(d, 1)) if (bookedSet.has(d)) return false;
    return true;
  }

  function pick(day: string) {
    if (!checkIn || checkOut || day <= checkIn) {
      if (bookedSet.has(day)) return;
      setCheckIn(day);
      setCheckOut(null);
      return;
    }
    if (rangeFree(checkIn, day)) setCheckOut(day);
    else {
      setCheckIn(bookedSet.has(day) ? null : day);
      setCheckOut(null);
    }
  }

  const start = new Date(today + "T00:00:00Z");
  const months = [0, 1].map((i) => new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + monthOffset + i, 1)));

  function dayState(day: string) {
    if (day < today) return "past";
    if (checkIn && day === checkIn) return "start";
    if (checkOut && day === checkOut) return "end";
    if (checkIn && checkOut && day > checkIn && day < checkOut) return "in";
    // When choosing a checkout, a booked night can still be a checkout day if the night before is free
    if (bookedSet.has(day)) {
      if (checkIn && !checkOut && day > checkIn && rangeFree(checkIn, day)) return "free";
      return "booked";
    }
    return "free";
  }

  function reserve() {
    if (!checkIn || !checkOut) return;
    const qs = new URLSearchParams({ checkIn, checkOut, guests: String(guests), pets: String(pets) });
    router.push(`/book/${slug}?${qs}`);
  }

  return (
    <div className="card !bg-white">
      <p className="text-sm text-ink-soft">
        from <span className="font-display text-3xl text-ink">{money(baseRateCents)}</span> / night
      </p>

      <div className="mt-5 flex items-center justify-between">
        <button type="button" className="rounded-full px-3 py-1 text-lg hover:bg-sand disabled:opacity-30" disabled={monthOffset === 0} onClick={() => setMonthOffset((m) => m - 1)} aria-label="Previous month">‹</button>
        <p className="text-xs uppercase tracking-wider text-ink-soft">
          {checkIn && !checkOut ? "Select check-out" : "Select check-in"}
        </p>
        <button type="button" className="rounded-full px-3 py-1 text-lg hover:bg-sand disabled:opacity-30" disabled={monthOffset >= 16} onClick={() => setMonthOffset((m) => m + 1)} aria-label="Next month">›</button>
      </div>

      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        {months.map((m) => {
          const first = m.getUTCDay();
          const daysIn = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
          const cells: (string | null)[] = Array(first).fill(null);
          for (let d = 1; d <= daysIn; d++) cells.push(iso(new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), d))));
          return (
            <div key={m.toISOString()}>
              <p className="mb-2 text-center font-display text-lg">
                {m.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
              </p>
              <div className="grid grid-cols-7 text-center text-[10px] uppercase text-ink-soft">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {cells.map((day, i) => {
                  if (!day) return <span key={i} />;
                  const s = dayState(day);
                  const disabled = s === "past" || s === "booked";
                  const cls =
                    s === "start" || s === "end"
                      ? "bg-ink text-sand"
                      : s === "in"
                        ? "bg-brass-light/50"
                        : s === "booked"
                          ? "text-ink/25 line-through"
                          : s === "past"
                            ? "text-ink/20"
                            : "hover:bg-sand";
                  return (
                    <button key={day} type="button" disabled={disabled} onClick={() => pick(day)} className={`mx-auto h-9 w-9 rounded-full ${cls}`}>
                      {Number(day.slice(8))}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label>
          <span className="label">Guests</span>
          <select className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {allowsPets && (
          <label>
            <span className="label">Dogs</span>
            <select className="input" value={pets} onChange={(e) => setPets(Number(e.target.value))}>
              {[0, 1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
      </div>

      {quote && quote.ok && (
        <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
          {quote.quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between"><span className="text-ink-soft">{l.label}</span><span>{money(l.cents)}</span></div>
          ))}
          <div className="flex justify-between border-t border-ink/10 pt-2 font-medium"><span>Total</span><span>{money(quote.quote.totalCents)}</span></div>
          {quote.quote.otaEstimateCents > quote.quote.totalCents && (
            <p className="rounded-lg bg-lake/10 px-3 py-2 text-xs text-lake-deep">
              You save about <strong>{money(quote.quote.otaEstimateCents - quote.quote.totalCents)}</strong> vs. booking on Airbnb.
            </p>
          )}
        </div>
      )}
      {quote && !quote.ok && <p className="mt-4 text-sm text-red-600">{quote.error}</p>}

      <button type="button" className="btn-primary mt-5 w-full" disabled={!quote || !quote.ok} onClick={reserve}>
        {checkIn && checkOut ? "Reserve these dates" : `Choose dates · ${minNights}-night min`}
      </button>
      {(checkIn || checkOut) && (
        <button type="button" className="mt-2 w-full text-xs text-ink-soft underline" onClick={() => { setCheckIn(null); setCheckOut(null); }}>
          Clear dates
        </button>
      )}
      <p className="mt-3 text-center text-xs text-ink-soft">You won't be charged until you sign and check out.</p>
    </div>
  );
}
