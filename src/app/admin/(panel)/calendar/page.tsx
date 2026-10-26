import { properties, getProperty } from "@/config/site";
import { db } from "@/lib/db";
import { addBlock, deleteBlock } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/forms";
import { formatRange, todayLocal } from "@/lib/dates";
import { importEnvKey, importUrlsFor } from "@/lib/ical";
import { siteUrl } from "@/lib/url";

export default async function CalendarAdmin() {
  const blocks = await db.blockedRange.findMany({ where: { end: { gte: todayLocal() } }, orderBy: { start: "asc" } });
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl">Block dates</h1>
        <p className="mt-1 text-sm text-ink-soft">Owner stays, maintenance, or anything else. End date is the checkout day.</p>
        <ActionForm action={addBlock} className="card mt-6 grid gap-4 !bg-white sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="label">Home</span>
            <select name="propertySlug" className="input">{properties.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
          </label>
          <label><span className="label">Start</span><input type="date" name="start" required className="input" /></label>
          <label><span className="label">End</span><input type="date" name="end" required className="input" /></label>
          <label className="sm:col-span-2"><span className="label">Reason</span><input name="reason" className="input" placeholder="Owner stay" /></label>
          <div className="sm:col-span-2"><SubmitButton>Block dates</SubmitButton></div>
        </ActionForm>
        <ul className="mt-6 space-y-2">
          {blocks.map((b) => (
            <li key={b.id} className="card flex items-center justify-between !bg-white !py-3 text-sm">
              <span>{getProperty(b.propertySlug)?.name} · {formatRange(b.start, b.end)}{b.reason ? ` · ${b.reason}` : ""}</span>
              <form action={deleteBlock}><input type="hidden" name="id" value={b.id} /><button className="text-red-700 underline">Remove</button></form>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-3xl">Channel calendar sync</h2>
        <p className="mt-1 text-sm text-ink-soft">Prevent double bookings with OwnerRez, VRBO, Airbnb, Furnished Finder, or any iCal-capable channel.</p>
        {properties.map((p) => (
          <div key={p.slug} className="card mt-4 !bg-white text-sm">
            <p className="font-display text-xl">{p.name}</p>
            <p className="label mt-3">1 · Export — add this as an imported calendar in OwnerRez (or each channel)</p>
            <p className="break-all rounded bg-sand px-3 py-2 font-mono text-xs">{siteUrl(`/api/ical/${p.slug}.ics`)}</p>
            <p className="label mt-3">2 · Import — set this env var to the channel export links (comma-separated)</p>
            <p className="font-mono text-xs">{importEnvKey(p.slug)}</p>
            <p className={`mt-1 text-xs ${importUrlsFor(p.slug).length ? "text-green-700" : "text-amber-700"}`}>
              {importUrlsFor(p.slug).length ? `✓ ${importUrlsFor(p.slug).length} feed(s) connected` : "Not connected yet"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
