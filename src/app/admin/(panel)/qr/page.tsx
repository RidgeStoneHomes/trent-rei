import { properties, site } from "@/config/site";
import { db } from "@/lib/db";
import { qrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/url";
import { PrintButton } from "@/components/PrintButton";

export default async function QrAdmin() {
  const insiderSvg = await qrSvg(siteUrl("/insider"));
  const vendors = await db.vendor.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const vendorQrs = await Promise.all(vendors.map(async (v) => ({ v, svg: await qrSvg(siteUrl(`/go/${v.slug}?src=qr`)) })));

  return (
    <div>
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Printable QR codes</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            These codes point at live pages, so you can change offers anytime in Partners without reprinting. Frame the
            in-home card on the kitchen counter; give partner codes to vendors for their counter or your welcome book.
          </p>
        </div>
        <PrintButton />
      </div>

      <h2 className="no-print mt-10 text-2xl">In-home welcome cards</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {properties.map((p) => (
          <div key={p.slug} className="break-inside-avoid rounded-2xl border-2 border-ink bg-sand p-8 text-center">
            <p className="eyebrow">{site.brand} · {p.name}</p>
            <p className="mt-3 font-display text-4xl">Your Insider Perks</p>
            <p className="mt-2 text-sm text-ink-soft">Scan for this week's exclusive guest offers — charters, tastings, trail rides & tables.</p>
            <div className="mx-auto mt-6 w-48" dangerouslySetInnerHTML={{ __html: insiderSvg }} />
            <p className="mt-4 text-xs text-ink-soft">Sign in with your email & confirmation code</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl">Partner QR codes</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vendorQrs.map(({ v, svg }) => (
          <div key={v.id} className="break-inside-avoid rounded-2xl border border-ink/20 bg-white p-6 text-center">
            <p className="eyebrow">{site.brand} guests</p>
            <p className="mt-2 font-display text-2xl">{v.name}</p>
            <p className="mt-1 text-sm text-brass-dark">{v.perk}</p>
            <div className="mx-auto mt-4 w-36" dangerouslySetInnerHTML={{ __html: svg }} />
            {v.promoCode && <p className="mt-3 font-mono text-sm tracking-widest">{v.promoCode}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
