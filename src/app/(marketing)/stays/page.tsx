import { properties } from "@/config/site";
import { PropertyCard } from "@/components/PropertyCard";

export const metadata = { title: "The Homes" };

export default function StaysPage() {
  return (
    <section className="container-x py-20">
      <p className="eyebrow">The Homes</p>
      <h1 className="mt-3 text-5xl">Choose your retreat</h1>
      <p className="mt-4 max-w-xl text-ink-soft">Both homes include the Insider Portal, partner perks, and a personal host — with the best rate, only here.</p>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        {properties.map((p) => <PropertyCard key={p.slug} property={p} />)}
      </div>
    </section>
  );
}
