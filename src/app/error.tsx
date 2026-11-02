"use client";

import Link from "next/link";

// Friendly fallback for any page that fails (for example, before the database is connected)
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-sand px-4 text-center">
      <div className="max-w-md">
        <p className="eyebrow">Something went sideways</p>
        <h1 className="mt-3 text-5xl">This page is taking a breather.</h1>
        <p className="mt-4 text-ink-soft">Please try again in a moment. If you're the host, the setup checklist shows what's missing.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-ghost">Home</Link>
          <Link href="/status" className="btn-ghost">Setup checklist</Link>
        </div>
      </div>
    </main>
  );
}
