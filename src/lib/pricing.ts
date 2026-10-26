import { site, type Property } from "@/config/site";
import { dayOfWeek, eachNight } from "./dates";

export type Quote = {
  nights: number;
  nightlyCents: number;
  cleaningCents: number;
  petCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  otaEstimateCents: number; // what the same stay would cost through Airbnb
  lines: { label: string; cents: number }[];
};

export function quoteStay(
  property: Property,
  checkIn: string,
  checkOut: string,
  opts: { pets?: number; discountCents?: number } = {},
): Quote {
  const nights = eachNight(checkIn, checkOut);
  let nightlyCents = 0;
  for (const night of nights) {
    const dow = dayOfWeek(night);
    nightlyCents += dow === 5 || dow === 6 ? property.weekendRateCents : property.baseRateCents;
  }
  const cleaningCents = property.cleaningFeeCents;
  const petCents = opts.pets && property.petFeeCents ? property.petFeeCents : 0;
  const preDiscount = nightlyCents + cleaningCents + petCents;
  const discountCents = Math.min(opts.discountCents ?? 0, nightlyCents);
  const taxable = preDiscount - discountCents;
  const taxCents = Math.round(taxable * site.taxRate);
  const totalCents = taxable + taxCents;

  const otaEstimateCents = Math.round(
    preDiscount * (1 + site.otaGuestFeeRate) + preDiscount * site.taxRate,
  );

  const avg = nights.length ? Math.round(nightlyCents / nights.length) : 0;
  const lines = [
    { label: `${nights.length} night${nights.length === 1 ? "" : "s"} × avg $${(avg / 100).toFixed(0)}`, cents: nightlyCents },
    { label: "Cleaning & turndown", cents: cleaningCents },
  ];
  if (petCents) lines.push({ label: "Pet fee", cents: petCents });
  if (discountCents) lines.push({ label: "Referral savings", cents: -discountCents });
  lines.push({ label: "Occupancy taxes", cents: taxCents });

  return {
    nights: nights.length,
    nightlyCents,
    cleaningCents,
    petCents,
    discountCents,
    taxCents,
    totalCents,
    otaEstimateCents,
    lines,
  };
}
