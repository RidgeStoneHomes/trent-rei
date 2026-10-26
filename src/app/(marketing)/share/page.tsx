import Link from "next/link";
import { site } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { LeadForm } from "@/components/LeadForm";

export const metadata = { title: "Share the Lake" };

export default async function SharePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const give = formatMoney(site.referral.friendDiscountCents);
  const get = formatMoney(site.referral.referrerCreditCents);
  return (
    <>
      <section className="bg-ink text-sand">
        <div className="container-x py-24 text-center">
          {welcome ? (
            <>
              <p className="eyebrow !text-brass-light">A gift from {welcome}</p>
              <h1 className="mx-auto mt-3 max-w-3xl text-5xl sm:text-6xl">{welcome} saved you {give} on your first stay.</h1>
              <p className="mx-auto mt-6 max-w-xl text-sand/80">Your savings are already applied — just choose your home and dates.</p>
              <Link href="/stays" className="btn-brass mt-8">Choose your home</Link>
            </>
          ) : (
            <>
              <p className="eyebrow !text-brass-light">Share the Lake</p>
              <h1 className="mx-auto mt-3 max-w-3xl text-5xl sm:text-6xl">Give {give}. Get {get}. Every time.</h1>
              <p className="mx-auto mt-6 max-w-xl text-sand/80">The best guests come from the best guests. Here's our thank-you.</p>
            </>
          )}
        </div>
      </section>
      <section className="container-x grid gap-6 py-20 md:grid-cols-3">
        <div className="card"><p className="font-display text-3xl text-brass">01</p><p className="mt-3 font-medium">Get your link</p><p className="mt-2 text-sm text-ink-soft">Every confirmed guest receives a personal referral link in their confirmation email and Insider Portal.</p></div>
        <div className="card"><p className="font-display text-3xl text-brass">02</p><p className="mt-3 font-medium">Friends save {give}</p><p className="mt-2 text-sm text-ink-soft">They get {give} off their first stay of {site.referral.minNightsForReferral}+ nights, applied automatically.</p></div>
        <div className="card"><p className="font-display text-3xl text-brass">03</p><p className="mt-3 font-medium">You earn {get}</p><p className="mt-2 text-sm text-ink-soft">For every friend who stays, {get} in credit goes toward your next visit. No cap.</p></div>
      </section>
      <section className="container-x pb-24">
        <div className="mx-auto max-w-xl card">
          <p className="font-display text-2xl">Not ready to book yet?</p>
          <p className="mt-2 text-sm text-ink-soft">Join the Founding Guest list for first access to dates.</p>
          <div className="mt-5"><LeadForm source="share-page" /></div>
        </div>
      </section>
    </>
  );
}
