"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DateSearch } from "./DateSearch";

// A small floating "Check availability" button that opens the date search in a sheet,
// so the homepage photos get the whole screen.
export function AvailabilityPill({ today, maxGuests }: { today: string; maxGuests: number }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Rendered into <body> so page animations (transforms) can't shift the fixed button
  if (!mounted) return null;
  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-sand/95 px-5 py-3 text-sm font-medium text-ink shadow-[0_15px_40px_-12px_rgba(0,0,0,.6)] ring-1 ring-white/40 backdrop-blur transition hover:-translate-y-0.5 hover:bg-sand"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
        Check availability
      </button>

      <div
        className={`fixed inset-0 z-[60] transition ${open ? "visible" : "invisible"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Check availability"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 mx-auto max-w-3xl rounded-t-3xl bg-sand p-5 pb-8 shadow-2xl transition-transform duration-500 ease-out sm:bottom-8 sm:rounded-3xl ${
            open ? "translate-y-0" : "translate-y-[110%] sm:translate-y-[130%]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-2xl text-ink">When are you coming?</p>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-sand-deep/50" aria-label="Close">✕</button>
          </div>
          {open && <DateSearch today={today} maxGuests={maxGuests} />}
        </div>
      </div>
    </>,
    document.body,
  );
}
