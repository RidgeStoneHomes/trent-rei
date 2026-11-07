import { site, type Property, type RateSeason } from "@/config/site";
import { dayOfWeek, eachNight } from "./dates";

export type Quote = {
  nights: number;
  nightlyCents: number; // nightly rates before any discount
  stayDiscountCents: number; // length-of-stay discount
  stayDiscountPercent: number;
  cleaningCents: number;
  petCents: number;
  discountCents: number; // referral savings
  taxCents: number;
  totalCents: number;
  otaEstimateCents: number; // what the same stay would cost through Airbnb
  lines: { label: string; cents: number }[];
};

function isWeekend(night: string) {
  const dow = dayOfWeek(night);
  return dow === 5 || dow === 6;
}

// "MM-DD" seasons repeat yearly; "YYYY-MM-DD" seasons apply to one year. Wrap-around ranges aren't used.
function covers(season: RateSeason, night: string) {
  if (season.from.length === 10) return night >= season.from && night <= season.to;
  const md = night.slice(5);
  return md >= season.from && md <= season.to;
}

// The season that prices a night: dated seasons beat yearly ones; later entries beat earlier ones.
export function seasonFor(property: Property, night: string): RateSeason | null {
  let yearly: RateSeason | null = null;
  let dated: RateSeason | null = null;
  for (const season of property.rateSeasons ?? []) {
    if (!covers(season, night)) continue;
    if (season.from.length === 10) dated = season;
    else yearly = season;
  }
  return dated ?? yearly;
}

export function nightlyRate(property: Property, night: string): number {
  const season = seasonFor(property, night);
  const weekend = isWeekend(night);
  if (season) return weekend ? season.weekendCents : season.weekdayCents;
  return weekend ? property.weekendRateCents : property.baseRateCents;
}

// The longest minimum required by any night in the stay, and which season set it.
export function stayMinimum(property: Property, checkIn: string, checkOut: string) {
  let min = property.minNights;
  let label: string | null = null;
  for (const night of eachNight(checkIn, checkOut)) {
    const season = seasonFor(property, night);
    if (season?.minNights && season.minNights > min) {
      min = season.minNights;
      label = season.label;
    }
  }
  return { min, label };
}

export function stayDiscountPercent(property: Property, nights: number): number {
  const tiers = [...(property.stayDiscounts ?? [])].sort((a, b) => b.minNights - a.minNights);
  return tiers.find((t) => nights >= t.minNights)?.percent ?? 0;
}

// Lowest nightly rate the home ever charges, for "from $X / night" labels
export function lowestRate(property: Property): number {
  const rates = [property.baseRateCents, ...(property.rateSeasons ?? []).flatMap((s) => [s.weekdayCents, s.weekendCents])];
  return Math.max(property.priceFloorCents ?? 0, Math.min(...rates));
}

export function quoteStay(
  property: Property,
  checkIn: string,
  checkOut: string,
  opts: { pets?: number; discountCents?: number } = {},
): Quote {
  const nights = eachNight(checkIn, checkOut);
  const percent = stayDiscountPercent(property, nights.length);
  const floor = property.priceFloorCents ?? 0;

  let nightlyCents = 0;
  let discountedCents = 0;
  for (const night of nights) {
    const rate = nightlyRate(property, night);
    nightlyCents += rate;
    // A discount can lower a night to the floor but never below it
    discountedCents += Math.max(Math.min(rate, floor), Math.round(rate * (1 - percent / 100)));
  }
  const stayDiscountCents = nightlyCents - discountedCents;

  const cleaningCents = property.cleaningFeeCents;
  const petCents = opts.pets && property.petFeeCents ? property.petFeeCents : 0;
  const preReferral = discountedCents + cleaningCents + petCents;
  const discountCents = Math.min(opts.discountCents ?? 0, discountedCents);
  const taxable = preReferral - discountCents;
  const taxCents = Math.round(taxable * site.taxRate);
  const totalCents = taxable + taxCents;

  const otaEstimateCents = Math.round(preReferral * (1 + site.otaGuestFeeRate) + preReferral * site.taxRate);

  const avg = nights.length ? Math.round(nightlyCents / nights.length) : 0;
  const lines = [
    { label: `${nights.length} night${nights.length === 1 ? "" : "s"} × avg $${(avg / 100).toFixed(0)}`, cents: nightlyCents },
  ];
  if (stayDiscountCents) lines.push({ label: `${nights.length}-night stay discount (${percent}%)`, cents: -stayDiscountCents });
  lines.push({ label: "Cleaning & turndown", cents: cleaningCents });
  if (petCents) lines.push({ label: "Pet fee", cents: petCents });
  if (discountCents) lines.push({ label: "Referral savings", cents: -discountCents });
  lines.push({ label: "Occupancy taxes", cents: taxCents });

  return {
    nights: nights.length,
    nightlyCents,
    stayDiscountCents,
    stayDiscountPercent: percent,
    cleaningCents,
    petCents,
    discountCents,
    taxCents,
    totalCents,
    otaEstimateCents,
    lines,
  };
}
