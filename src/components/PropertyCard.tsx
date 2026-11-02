import Link from "next/link";
import type { Property } from "@/config/site";
import { Media } from "./Media";
import { formatMoney } from "@/lib/money";

export function PropertyCard({ property, query = "" }: { property: Property; query?: string }) {
  return (
    <Link href={`/stays/${property.slug}${query}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl">
        <Media property={property} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" label={property.location} />
        <span className="absolute right-4 top-4 rounded-full bg-sand/90 px-3 py-1 text-xs font-medium backdrop-blur">Sleeps {property.maxGuests}</span>
        <span className="absolute inset-x-4 bottom-4 translate-y-3 rounded-full bg-ink/85 py-2.5 text-center text-xs uppercase tracking-wider text-sand opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View home & dates →
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl transition group-hover:text-lake">{property.name}</h3>
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
