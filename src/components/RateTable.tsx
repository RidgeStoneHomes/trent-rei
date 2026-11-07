import type { Property } from "@/config/site";
import { formatMoney } from "@/lib/money";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function label(date: string) {
  if (date === "02-29") return "end of Feb"; // the winter season runs through leap day when there is one
  const [y, m, d] = date.length === 10 ? date.split("-") : [null, ...date.split("-")];
  return `${MONTHS[Number(m) - 1]} ${Number(d)}${y ? `, ${y}` : ""}`;
}

// Public rate card: yearly seasons in calendar order, then holidays dated in the next 18 months.
export function RateTable({ property, today }: { property: Property; today: string }) {
  const seasons = property.rateSeasons ?? [];
  if (seasons.length === 0) return null;
  const horizon = `${Number(today.slice(0, 4)) + 2}${today.slice(4)}`;
  const yearly = seasons.filter((s) => s.from.length === 5).sort((a, b) => a.from.localeCompare(b.from));
  const dated = seasons
    .filter((s) => s.from.length === 10 && s.to >= today && s.from <= horizon)
    .sort((a, b) => a.from.localeCompare(b.from));
  const discounts = [...(property.stayDiscounts ?? [])].sort((a, b) => a.minNights - b.minNights);

  const rows = (list: typeof seasons) =>
    list.map((s) => (
      <tr key={`${s.label}-${s.from}`} className="border-t border-ink/5">
        <td className="py-2.5 pr-3">
          <p className="font-medium">{s.label}</p>
          <p className="text-xs text-ink-soft">{s.from === s.to ? label(s.from) : `${label(s.from)} – ${label(s.to)}`}</p>
        </td>
        {s.weekdayCents === s.weekendCents ? (
          <td colSpan={2} className="py-2.5 text-center">{formatMoney(s.weekdayCents)}</td>
        ) : (
          <>
            <td className="py-2.5 text-center">{formatMoney(s.weekdayCents)}</td>
            <td className="py-2.5 text-center">{formatMoney(s.weekendCents)}</td>
          </>
        )}
        <td className="py-2.5 text-center">{s.minNights ?? property.minNights}</td>
      </tr>
    ));

  const head = (title: string) => (
    <thead className="text-xs uppercase tracking-wider text-ink-soft">
      <tr>
        <th className="pb-2 text-left font-medium">{title}</th>
        <th className="pb-2 font-medium">Sun–Thu</th>
        <th className="pb-2 font-medium">Fri–Sat</th>
        <th className="pb-2 font-medium">Min. nights</th>
      </tr>
    </thead>
  );

  return (
    <div className="mt-12">
      <h2 className="text-3xl">Rates & minimum stays</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Nightly rates before tax. Cleaning is {formatMoney(property.cleaningFeeCents)} per stay
        {discounts.length > 0 && <>, and longer stays save: {discounts.map((d) => `${d.percent}% off ${d.minNights}+ nights`).join(", ")}</>}.
      </p>
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <table className="w-full text-sm">{head("Season")}<tbody>{rows(yearly)}</tbody></table>
        {dated.length > 0 && <table className="w-full self-start text-sm">{head("Holidays & events")}<tbody>{rows(dated)}</tbody></table>}
      </div>
    </div>
  );
}
