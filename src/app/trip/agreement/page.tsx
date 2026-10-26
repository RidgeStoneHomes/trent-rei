import Link from "next/link";
import { requireGuest } from "@/lib/guest";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signed Agreement" };

export default async function SignedAgreementPage() {
  const { booking } = await requireGuest();
  const a = booking.agreement;
  return (
    <section className="container-x max-w-3xl py-12">
      <div className="no-print mb-6 flex gap-4 text-sm">
        <Link href="/trip" className="underline">← Back to my trip</Link>
      </div>
      {!a ? (
        <p>No signed agreement on file.</p>
      ) : (
        <article className="rounded-2xl bg-white p-8 text-sm leading-relaxed shadow-sm">
          <pre className="whitespace-pre-wrap font-sans">{a.content}</pre>
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="font-display text-3xl italic">{a.signedName}</p>
            <p className="mt-1 text-ink-soft">Initials: {a.initials} · Signed electronically {a.signedAt.toLocaleString("en-US", { timeZone: "America/Chicago" })} CT</p>
            <p className="mt-1 break-all text-xs text-ink-soft">Agreement version {a.version} · SHA-256 {a.contentHash}</p>
          </div>
        </article>
      )}
    </section>
  );
}
