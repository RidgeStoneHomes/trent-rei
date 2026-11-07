import { site } from "@/config/site";

// Shown on the homepage and published as FAQPage structured data for search engines.
export const faqs: { q: string; a: string }[] = [
  {
    q: "Why book direct instead of on Airbnb or VRBO?",
    a: "Our lowest price is always here, you get a real host you can call or text, and the Insider Portal opens private perks with our local partners. It's the same home, just a better stay.",
  },
  {
    q: "Where are the homes?",
    a: "Both are in Pottsboro, Texas on the Lake Texoma side of Grayson County. Ironwood Acres is about 2 miles from Highport Marina, and Denison and Sherman are a short drive away.",
  },
  {
    q: "How many guests can stay?",
    a: "Ironwood Acres sleeps 12 across 5 bedrooms. The Fog Line, opening soon just half a mile away, adds 4 more bedrooms plus a barndo guest house, so together they fit a reunion, retreat or wedding party.",
  },
  {
    q: "What's the cancellation policy?",
    a: `Full refund up to ${site.policies.refundWindowDays} days before check-in. After that the stay is non-refundable, and that's also when your Insider Portal unlocks.`,
  },
  {
    q: "What is the Insider Portal?",
    a: "Your private trip page. It holds partner perks (fishing charters, wine tastings, dining, horseback rides), your digital Guest Pass, your address a few days before arrival, your door code shortly before check-in, and the Wi-Fi once you're checked in.",
  },
  {
    q: "What time is check-in and check-out?",
    a: `Check-in is after ${site.policies.checkInTime} and check-out is before ${site.policies.checkOutTime}. Check-in is self-serve: your address appears in your trip page ${site.policies.arrivalDetailsDays} days ahead, and your door code shortly before arrival.`,
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
