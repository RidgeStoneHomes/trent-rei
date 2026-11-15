"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type Slide = { src: string; sm?: string; alt: string; home: string; href: string };

const HOLD_MS = 6500;

// Full-screen photo slideshow: slow zoom on each photo, a soft cross-fade between them,
// and the home's name in the corner. Pauses on hidden tabs; no zoom for reduced motion.
export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(1); // only the first photo loads up front

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % slides.length);
    }, HOLD_MS);
    // Fetch the rest once the page has settled
    const warm = setTimeout(() => setLoaded(slides.length), 1200);
    return () => {
      clearInterval(t);
      clearTimeout(warm);
    };
  }, [slides.length]);

  const current = slides[index];
  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden bg-ink">
        {slides.slice(0, Math.max(loaded, index + 1)).map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            srcSet={s.sm ? `${s.sm} 800w, ${s.src} 1800w` : undefined}
            sizes="100vw"
            alt={i === index ? s.alt : ""}
            aria-hidden={i !== index}
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              animation: i === index ? `heroZoom ${HOLD_MS + 1600}ms ease-out forwards` : undefined,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/10 to-ink/65" />
      </div>

      {/* Which home this is, and progress through the photos */}
      <div className="container-x pointer-events-none absolute inset-x-0 bottom-24 z-10 flex items-end justify-between gap-4 sm:bottom-10">
        <Link
          key={current.src}
          href={current.href}
          className="pointer-events-auto animate-rise text-left text-sand"
        >
          <span className="block text-[10px] uppercase tracking-luxe text-brass-light">{current.alt}</span>
          <span className="mt-1 block font-display text-2xl sm:text-3xl">{current.home} →</span>
        </Link>
        {slides.length > 1 && (
          <div className="pointer-events-auto flex gap-1.5" role="tablist" aria-label="Photos">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1}: ${s.alt}`}
                onClick={() => {
                  setLoaded(slides.length);
                  setIndex(i);
                }}
                className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-sand" : "w-3 bg-sand/40 hover:bg-sand/70"}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
