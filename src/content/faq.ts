import { site } from "@/config/site";

// Shown on the homepage and published as FAQPage structured data for search engines.
export const faqs: { q: string; a: string }[] = [
  {
    q: "Why book direct instead of on Airbnb or VRBO?",
    a: `No platform service fee (guests typically save around ${Math.round(site.otaGuestFeeRate * 100)}%), a real host you can text, and the Insider Portal with private perks from our local partners. It's the same home, just a better deal.`,
  },
  {
    q: "Where are the homes?",
    a: "Both are in Pottsboro, Texas on the Lake Texoma side of Grayson County. Ironwood Acres is about 2 miles from Highport Marina, and Denison and Sherman are a short drive away.",
  },
  {
    q: "How many guests can stay?",
    a: "Ironwood Acres sleeps 12 across 5 bedrooms; The Overlook sleeps 10. Booking both makes room for a reunion, retreat or wedding party.",
  },
  {
    q: "What's the cancellation policy?",
    a: `Full refund up to ${site.policies.refundWindowDays} days before check-in. After that the stay is non-refundable, and that's also when your Insider Portal unlocks.`,
  },
  {
    q: "What is the Insider Portal?",
    a: "Your private trip page. It holds partner perks (fishing charters, wine tastings, dining, horseback rides), your digital Guest Pass, and your door code and Wi-Fi a few days before arrival.",
  },
  {
    q: "What time is check-in and check-out?",
    a: `Check-in is after ${site.policies.checkInTime} and check-out is before ${site.policies.checkOutTime}. Check-in is self-serve, with arrival details sent ${site.policies.arrivalDetailsDays} days ahead.`,
  },
  {
    q: "Are pets allowed?",
    a: "Not at this time. Both homes are pet-free, which keeps them comfortable for guests with allergies.",
  },
  {
    q: "Can we host a party or event?",
    a: "No parties or events. For a celebration, rehearsal dinner or retreat, reach out first and we'll tell you what's possible.",
  },
];
