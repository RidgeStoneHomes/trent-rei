"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function plusDays(s: string, n: number) {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
const short = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="shrink-0 text-ink-soft">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

// Month grid for picking a stay. Same look on every browser (native date inputs differ, and
// Safari shows no calendar icon on an empty one).
function RangeCalendar({
  today,
  checkIn,
  checkOut,
  onPick,
}: {
  today: string;
  checkIn: string;
  checkOut: string;
  onPick: (day: string) => void;
}) {
  // Anchor on the month that was showing when the calendar opened, so picking a day doesn't move it
  const [anchor] = useState(() => (checkIn || today) + "T00:00:00Z");
  const start = new Date(anchor);
  const [offset, setOffset] = useState(0);
  const base = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1));
  const minOffsetReached = base.getUTCFullYear() * 12 + base.getUTCMonth() <= Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1;
  const months = [0, 1].map((i) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + i, 1)));

  return (
    <div ref={(el) => el?.scrollIntoView({ block: "nearest", behavior: "smooth" })} className="rounded-2xl bg-white p-3 ring-1 ring-ink/10">
      <div className="flex items-center justify-between px-1">
        <button type="button" className="rounded-full px-3 py-1 text-lg hover:bg-sand disabled:opacity-30" disabled={minOffsetReached} onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">‹</button>
        <p className="text-xs text-ink-soft">{checkIn && !checkOut ? "Now choose your check-out date" : "Choose your check-in date"}</p>
        <button type="button" className="rounded-full px-3 py-1 text-lg hover:bg-sand" onClick={() => setOffset((o) => o + 1)} aria-label="Next month">›</button>
      </div>
      <div className="mt-2 grid gap-6 sm:grid-cols-2">
        {months.map((m, mi) => {
          const y = m.getUTCFullYear();
          const mo = m.getUTCMonth();
          const days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
          const lead = m.getUTCDay();
          return (
            <div key={mi} className={mi === 1 ? "hidden sm:block" : ""}>
              <p className="text-center text-sm font-medium">{m.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
              <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-ink-soft">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
                {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const day = iso(y, mo, i + 1);
                  const past = day < today;
                  const edge = day === checkIn || day === checkOut;
                  const inRange = checkIn && checkOut && day > checkIn && day < checkOut;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={past}
                      onClick={() => onPick(day)}
                      className={`mx-auto h-9 w-9 rounded-full transition ${
                        edge ? "bg-ink text-sand" : inRange ? "bg-sand-deep" : past ? "text-ink/25 line-through" : "hover:bg-sand-deep/60"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const [open, setOpen] = useState(false);

  function pick(day: string) {
    // First click (or a day before check-in) sets check-in; the next sets check-out
    if (!checkIn || checkOut || day <= checkIn) {
      setCheckIn(day);
      setCheckOut("");
    } else {
      setCheckOut(day);
      setOpen(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checkIn && !checkOut) return setOpen(true);
    const qs = new URLSearchParams({ guests: String(guests) });
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    router.push(`/stays?${qs}#results`);
  }

  const hero = variant === "hero";
  const field = hero ? "block rounded-xl px-4 py-2.5 text-left transition hover:bg-sand-deep/40" : "block text-left";
  const value = "mt-0.5 flex items-center justify-between gap-2 text-sm font-medium text-ink";
  const label = "text-[10px] font-semibold uppercase tracking-wider text-ink-soft";
  return (
    <form
      onSubmit={submit}
      className={
        hero
          ? `grid grid-cols-2 gap-1 rounded-2xl bg-sand/95 p-2 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,.7)] ring-1 ring-white/30 backdrop-blur sm:grid-cols-[1fr_1fr_0.8fr_auto] ${open ? "" : "sm:rounded-full"}`
          : "grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 sm:grid-cols-[1fr_1fr_0.8fr_auto] sm:items-end"
      }
    >
      <button type="button" className={field} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={label}>Check in</span>
        <span className={value}><span className={checkIn ? "" : "text-ink-soft/70"}>{checkIn ? short(checkIn) : "Add date"}</span><CalendarIcon /></span>
      </button>
      <button type="button" className={field} onClick={() => setOpen(true)} aria-expanded={open}>
        <span className={label}>Check out</span>
        <span className={value}><span className={checkOut ? "" : "text-ink-soft/70"}>{checkOut ? short(checkOut) : "Add date"}</span><CalendarIcon /></span>
      </button>
      <label className={`${field} col-span-2 sm:col-span-1`}>
        <span className={label}>Guests</span>
        <select className="mt-0.5 w-full bg-transparent text-sm font-medium text-ink outline-none" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
          ))}
        </select>
      </label>
      <button className="btn-primary btn-sheen col-span-2 h-full min-h-12 !px-7 sm:col-span-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        Check availability
      </button>
      {open && (
        <div className="col-span-2 sm:col-span-4">
          <RangeCalendar today={today} checkIn={checkIn} checkOut={checkOut} onPick={pick} />
        </div>
      )}
    </form>
  );
}
