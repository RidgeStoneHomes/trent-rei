import { properties, site } from "@/config/site";
import { db } from "@/lib/db";
import { saveArrival } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/forms";
import { codeRevealOptions } from "@/lib/arrival";

export default async function ArrivalAdmin() {
  const rows = await db.propertyArrival.findMany();
  const bySlug = new Map(rows.map((r) => [r.propertySlug, r]));
  return (
    <div>
      <h1 className="text-3xl">Arrival info</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        Private details for each home, stored securely and never in the website code. Guests see the address
        {` ${site.policies.arrivalDetailsDays}`} days before check-in, the Wi-Fi at check-in time, and the door code only when you choose below. Changes apply instantly.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {properties.map((p) => {
          const r = bySlug.get(p.slug);
          const input = (name: string, label: string, value: string | null | undefined, placeholder = "") => (
            <label className="block">
              <span className="label">{label}</span>
              <input name={name} defaultValue={value ?? ""} placeholder={placeholder} className="input" autoComplete="off" />
            </label>
          );
          return (
            <ActionForm key={p.slug} action={saveArrival} successText="Saved." className="card grid gap-4 !bg-white">
              <input type="hidden" name="propertySlug" value={p.slug} />
              <p className="font-display text-2xl">{p.name}</p>
              {input("address", "Full address", r?.address, "328 Brandon Way, Pottsboro, TX 75076")}
              <div className="grid gap-4 sm:grid-cols-2">
                {input("checkInMethod", "Check-in method", r?.checkInMethod, "Keypad code")}
                {input("doorCode", "Door / keypad code", r?.doorCode)}
                <label className="block sm:col-span-2">
                  <span className="label">When guests see the door code</span>
                  <select
                    name="codeRevealHours"
                    defaultValue={r ? (r.codeRevealHours === null ? "manual" : String(r.codeRevealHours)) : "24"}
                    className="input"
                  >
                    {codeRevealOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-ink-soft">
                    Check-in is {site.policies.checkInTime}. You can also release the code early for one guest from the Bookings page.
                  </span>
                </label>
                {input("wifiName", "Wi-Fi network", r?.wifiName)}
                {input("wifiPassword", "Wi-Fi password", r?.wifiPassword)}
              </div>
              <label className="block">
                <span className="label">Parking (leave blank to use the default)</span>
                <input name="parking" defaultValue={r?.parking ?? ""} placeholder={p.arrival.parking} className="input" />
              </label>
              <label className="block">
                <span className="label">Arrival notes, one per line (leave blank to use the defaults)</span>
                <textarea name="notes" rows={3} defaultValue={r?.notes ?? ""} placeholder={p.arrival.notes.join("\n")} className="input" />
              </label>
              <SubmitButton pendingText="Saving…">Save {p.name}</SubmitButton>
              {r && <p className="text-xs text-ink-soft">Last updated {r.updatedAt.toLocaleString("en-US", { timeZone: site.timeZone })} CT</p>}
            </ActionForm>
          );
        })}
      </div>
    </div>
  );
}
