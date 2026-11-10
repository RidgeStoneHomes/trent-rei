import Link from "next/link";
import { site, vendorCategories } from "@/config/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experiences & Insider Perks" };

export default async function ExperiencesPage() {
  let vendors: { slug: string; category: string; name: string; blurb: string; perk: string }[] = [];
  try {
    vendors = await db.vendor.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }] });
  } catch (err) {
    console.error("[experiences] database unavailable:", err);
  }
  const hasPartners = vendors.length > 0;

  return (
    <>
      <section className="bg-lake-deep text-sand">
        <div className="container-x py-24">
          <p className="eyebrow !text-brass-light">The Insider Collection</p>
          <h1 className="mt-3 max-w-3xl text-5xl sm:text-6xl">Private privileges around the lake, reserved for our guests.</h1>
          <p className="mt-6 max-w-xl text-sand/80">
            {hasPartners
              ? "Every partner below is chosen by us. Stay with us and you'll receive private pricing and extras: simply show your digital Guest Pass."
              : "We're hand-selecting a small collection of local partners for our guests. Offers will appear here, and in every guest's Insider Portal, as each one is confirmed."}
          </p>
          <Link href="/stays" className="btn-brass mt-8">Explore the homes</Link>
        </div>
      </section>
      <section className="container-x py-20">
        {hasPartners ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <article key={v.slug} data-reveal className="card flex flex-col !bg-white transition hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs uppercase tracking-wider text-ink-soft">{vendorCategories[v.category]?.icon} {vendorCategories[v.category]?.label ?? v.category}</p>
                <p className="mt-2 font-display text-2xl">{v.name}</p>
                <p className="mt-2 flex-1 text-sm text-ink-soft">{v.blurb}</p>
                <div className="mt-5 flex items-center justify-between rounded-lg bg-sand px-3 py-2 text-sm">
                  <span className="select-none blur-[4px]" aria-hidden>{v.perk}</span>
                  <span className="eyebrow">🔒 Guests</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div data-reveal className="text-center">
            <p className="eyebrow">In progress</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">The collection we're building</h2>
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(vendorCategories).map(([key, c]) => (
                <div key={key} className="card !bg-white text-left">
                  <p className="text-3xl">{c.icon}</p>
                  <p className="mt-3 text-sm">{c.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-luxe text-brass-dark">Coming soon</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-16 rounded-3xl bg-ink p-10 text-center text-sand">
          <h2 className="text-3xl sm:text-4xl">How guest perks work</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
            <div><p className="font-display text-2xl text-brass-light">1. Book direct</p><p className="mt-2 text-sm text-sand/70">Reserve either home on this site.</p></div>
            <div><p className="font-display text-2xl text-brass-light">2. Unlock</p><p className="mt-2 text-sm text-sand/70">Your Insider Portal opens {site.policies.refundWindowDays} days before arrival with every current partner offer.</p></div>
            <div><p className="font-display text-2xl text-brass-light">3. Enjoy</p><p className="mt-2 text-sm text-sand/70">Show your Guest Pass at partners during your stay to redeem.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
