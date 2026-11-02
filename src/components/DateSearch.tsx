"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function plusDays(s: string, n: number) {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Dates + guests search. Sends guests to /stays, which shows each home's
// availability and total price for those exact dates.
export function DateSearch({
  today,
  maxGuests,
  initial,
  variant = "hero",
}: {
  today: string;
  maxGuests: number;
  initial?: { checkIn?: string; checkOut?: string; guests?: number };
  variant?: "hero" | "bar";
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? "");
  const [guests, setGuests] = useState(initial?.guests ?? 2);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams({ guests: String(guests) });
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    router.push(`/stays?${qs}#results`);
  }

  const hero = variant === "hero";
  const field = hero ? "block rounded-xl px-4 py-2.5 transition hover:bg-sand-deep/40 focus-within:bg-sand-deep/40" : "block";
  const input = "w-full bg-transparent text-sm font-medium text-ink outline-none";
  return (
    <form
      onSubmit={submit}
      className={
        hero
          ? "grid grid-cols-2 gap-1 rounded-2xl bg-sand/95 p-2 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,.7)] ring-1 ring-white/30 backdrop-blur sm:grid-cols-[1fr_1fr_0.8fr_auto] sm:rounded-full"
          : "grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 sm:grid-cols-[1fr_1fr_0.8fr_auto] sm:items-end"
      }
    >
      <label className={field}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Check in</span>
        <input
          type="date"
          className={input}
          min={today}
          value={checkIn}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (e.target.value && (!checkOut || checkOut <= e.target.value)) setCheckOut(plusDays(e.target.value, 2));
          }}
        />
      </label>
      <label className={field}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Check out</span>
        <input type="date" className={input} min={checkIn ? plusDays(checkIn, 1) : today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </label>
      <label className={`${field} col-span-2 sm:col-span-1`}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Guests</span>
        <select className={input} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
          ))}
        </select>
      </label>
      <button className="btn-primary btn-sheen col-span-2 h-full min-h-12 !px-7 sm:col-span-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        Check availability
      </button>
    </form>
  );
}
