"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/config/site";

// "Show all photos" grid plus a full-screen viewer with arrow-key and swipe navigation.
// Both overlays render into <body> so animated (transformed) parents can't clip them.
export function Gallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const step = useCallback(
    (d: number) => setCurrent((c) => (c === null ? c : (c + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") current !== null ? setCurrent(null) : setOpen(false);
      if (current !== null && e.key === "ArrowRight") step(1);
      if (current !== null && e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, current, step]);

  if (photos.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-ink shadow-md transition hover:bg-white"
      >
        ▦ Show all {photos.length} photos
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-sand" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-sand/95 px-4 py-3 backdrop-blur sm:px-8">
            <p className="font-display text-2xl">{name}</p>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost !px-4 !py-2">Close ✕</button>
          </div>
          <div className="mx-auto grid max-w-6xl gap-2 p-4 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            {photos.map((p, i) => (
              <button key={p.src} type="button" onClick={() => setCurrent(i)} className={`group overflow-hidden rounded-xl ${i % 7 === 0 ? "sm:col-span-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.sm ?? p.src} alt={p.alt} loading="lazy" decoding="async" className="aspect-[3/2] h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}

      {open && current !== null && createPortal(
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink text-sand"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm sm:px-8">
            <span>{current + 1} / {photos.length}</span>
            <button type="button" onClick={() => setCurrent(null)} className="rounded-full px-3 py-1 hover:bg-sand/10">Close ✕</button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 pb-4 sm:px-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[current].src} alt={photos[current].alt} className="max-h-full max-w-full rounded-lg object-contain" />
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-sand/10 px-4 py-3 text-2xl hover:bg-sand/20 sm:left-4">‹</button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sand/10 px-4 py-3 text-2xl hover:bg-sand/20 sm:right-4">›</button>
          </div>
          <p className="pb-6 text-center text-sm text-sand/80">{photos[current].alt}</p>
        </div>,
        document.body,
      )}
    </>
  );
}
