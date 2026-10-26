import Link from "next/link";
import type { Property } from "@/config/site";
import { Media } from "./Media";
import { formatMoney } from "@/lib/money";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/stays/${property.slug}`} className="group block">
      <Media property={property} className="aspect-[4/3] w-full rounded-2xl transition duration-500 group-hover:scale-[1.01]" label={property.location} />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl">{property.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{property.headline}</p>
          <p className="mt-2 text-xs uppercase tracking-wider text-ink-soft/70">
            {property.bedrooms} bedrooms · {property.baths} baths · sleeps {property.maxGuests}
          </p>
        </div>
        <p className="shrink-0 text-right text-sm">
          from <span className="font-display text-2xl">{formatMoney(property.baseRateCents)}</span>
          <br />
          <span className="text-xs text-ink-soft">per night</span>
        </p>
      </div>
    </Link>
  );
}
