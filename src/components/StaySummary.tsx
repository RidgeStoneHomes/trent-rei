import type { Property } from "@/config/site";
import { Media } from "./Media";
import { formatRange } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export function StaySummary({
  property,
  checkIn,
  checkOut,
  guests,
  lines,
  totalCents,
  savingsCents,
}: {
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  lines: { label: string; cents: number }[];
  totalCents: number;
  savingsCents?: number;
}) {
  return (
    <div className="card !bg-white">
      <Media property={property} className="aspect-[16/9] w-full rounded-xl" />
      <p className="mt-4 font-display text-2xl">{property.name}</p>
      <p className="text-sm text-ink-soft">{formatRange(checkIn, checkOut)} · {guests} guest{guests === 1 ? "" : "s"}</p>
      <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between"><span className="text-ink-soft">{l.label}</span><span>{formatMoney(l.cents, { cents: true })}</span></div>
        ))}
        <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium"><span>Total (USD)</span><span>{formatMoney(totalCents, { cents: true })}</span></div>
      </div>
      {savingsCents ? (
        <p className="mt-3 rounded-lg bg-lake/10 px-3 py-2 text-xs text-lake-deep">Booking direct saves you about <strong>{formatMoney(savingsCents)}</strong>.</p>
      ) : null}
    </div>
  );
}

export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ["Your details", "Rental agreement", "Payment", "Confirmed"];
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
      {steps.map((s, i) => (
        <li key={s} className={i + 1 === current ? "text-ink" : i + 1 < current ? "text-brass-dark" : "text-ink/30"}>
          {i + 1 < current ? "✓" : i + 1}. {s}
        </li>
      ))}
    </ol>
  );
}
