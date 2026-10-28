import { properties, site } from "@/config/site";
import { faqs } from "@/content/faq";
import { siteUrl } from "@/lib/url";

function Script({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

// Business + homes + FAQ structured data for the homepage, so search results can show rich details.
export function HomeJsonLd() {
  return (
    <>
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: site.brand,
          description: site.tagline,
          url: siteUrl("/"),
          email: site.email,
          telephone: site.phone,
          address: { "@type": "PostalAddress", addressLocality: "Pottsboro", addressRegion: "TX", addressCountry: "US" },
          areaServed: "Lake Texoma",
          checkinTime: site.policies.checkInTime,
          checkoutTime: site.policies.checkOutTime,
          containsPlace: properties.map((p) => ({
            "@type": "Accommodation",
            name: p.name,
            url: siteUrl(`/stays/${p.slug}`),
            description: p.summary,
            numberOfBedrooms: p.bedrooms,
            numberOfBathroomsTotal: p.baths,
            occupancy: { "@type": "QuantitativeValue", maxValue: p.maxGuests },
          })),
        }}
      />
      <Script
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
