import Link from "next/link";
import { vendorCategories } from "@/config/site";
import { db } from "@/lib/db";
import { loadSampleVendors, toggleVendor } from "@/app/actions/admin";

export default async function VendorsAdmin() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const vendors = await db.vendor.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { clicks: true } }, clicks: { where: { createdAt: { gte: since } }, select: { source: true } } },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Preferred partners</h1>
          <p className="mt-1 text-sm text-ink-soft">Changes show up instantly in every guest's portal and behind every printed QR code.</p>
        </div>
        <Link href="/admin/vendors/new" className="btn-primary">Add partner</Link>
      </div>
      {vendors.length === 0 && (
        <form action={loadSampleVendors} className="card mt-6 !bg-white">
          <p className="font-medium">No partners yet.</p>
          <p className="mt-1 text-sm text-ink-soft">Add your own, or load 8 sample partners to see how the portal looks and edit them into your real ones.</p>
          <button className="btn-ghost mt-4">Load sample partners</button>
        </form>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {vendors.map((v) => {
          const qr = v.clicks.filter((c) => c.source === "qr").length;
          return (
            <div key={v.id} className={`card !bg-white ${v.active ? "" : "opacity-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-soft">{vendorCategories[v.category]?.icon} {vendorCategories[v.category]?.label ?? v.category}{v.featured ? " · ★ Featured" : ""}</p>
                  <p className="mt-1 font-display text-2xl">{v.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${v.active ? "bg-green-100 text-green-800" : "bg-ink/10"}`}>{v.active ? "Live" : "Hidden"}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-brass-dark">{v.perk}</p>
              <p className="mt-2 text-xs text-ink-soft">
                {v._count.clicks} total clicks · last 30 days: {v.clicks.length - qr} link, {qr} QR
                {v.promoCode ? ` · code ${v.promoCode}` : ""}
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                <Link href={`/admin/vendors/${v.id}`} className="underline">Edit</Link>
                <form action={toggleVendor}><input type="hidden" name="id" value={v.id} /><button className="underline">{v.active ? "Hide" : "Publish"}</button></form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
