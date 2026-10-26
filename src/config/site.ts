// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — edit this file to rebrand, rename properties, and change pricing.
// Everything marked PLACEHOLDER should be replaced before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  brand: "Ridgestone Retreats", // PLACEHOLDER brand name
  tagline: "Private luxury stays on Lake Texoma",
  region: "Lake Texoma · North Texas",
  hostName: "Trent",
  email: "stay@example.com", // PLACEHOLDER
  phone: "(555) 555-0100", // PLACEHOLDER
  instagram: "https://instagram.com/", // PLACEHOLDER
  timeZone: "America/Chicago",
  currency: "usd",

  policies: {
    // Full refund until this many days before check-in. After that, the stay is
    // non-refundable — and the guest's Insider Portal unlocks.
    refundWindowDays: 30,
    // Check-in details (door code, Wi-Fi) are revealed this many days before arrival
    arrivalDetailsDays: 3,
    checkInTime: "4:00 PM",
    checkOutTime: "11:00 AM",
    // Unpaid holds release after this many minutes
    holdMinutes: 30,
  },

  // Texas state hotel occupancy tax is 6%; add county/city rates for your address.
  taxRate: 0.13, // PLACEHOLDER — confirm with your CPA

  // Typical Airbnb guest service fee — used for the "book direct & save" message
  otaGuestFeeRate: 0.14,

  referral: {
    friendDiscountCents: 10000, // $100 off a friend's first stay
    referrerCreditCents: 10000, // $100 credit back to the guest who shared
    minNightsForReferral: 2,
  },

  foundingGuest: {
    // Launch offer shown on the homepage interest form
    headline: "Become a Founding Guest",
    offer:
      "Our first 50 direct bookings receive a complimentary private sunset cruise or wine-trail tasting for two, plus founding rates for life.",
  },
} as const;

export type Property = {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  story: string[];
  location: string;
  bedrooms: number;
  beds: number;
  baths: number;
  maxGuests: number;
  minNights: number;
  baseRateCents: number; // Sun–Thu
  weekendRateCents: number; // Fri & Sat nights
  cleaningFeeCents: number;
  petFeeCents: number | null; // null = no pets
  highlights: string[];
  amenities: string[];
  houseRules: string[];
  // Put photos in /public/images/<slug>/ and list them here, e.g. "/images/the-overlook/1.jpg".
  // Until then, elegant gradient placeholders are shown.
  images: string[];
  palette: [string, string]; // placeholder gradient colors
  arrival: {
    address: string;
    doorCode: string;
    wifiName: string;
    wifiPassword: string;
    parking: string;
    notes: string[];
  };
};

export const properties: Property[] = [
  {
    slug: "the-overlook",
    name: "The Overlook", // PLACEHOLDER
    headline: "A glass-walled lake house above the water",
    summary:
      "Floor-to-ceiling views of Lake Texoma, a heated plunge pool, and sunsets that stop conversation mid-sentence.",
    story: [
      "Perched on a limestone bluff, The Overlook was designed around a single idea: that every room should face the water. Wake to mist lifting off the lake, spend the afternoon between the plunge pool and the dock, and gather around the fire pit as the sky turns copper.",
      "Inside, it's quiet luxury — hand-finished oak, linen bedding, a chef's kitchen stocked for real cooking, and a primary suite with a soaking tub positioned for the sunrise.",
    ],
    location: "Pottsboro, TX · Lake Texoma", // PLACEHOLDER
    bedrooms: 4,
    beds: 5,
    baths: 3.5,
    maxGuests: 10,
    minNights: 2,
    baseRateCents: 59500,
    weekendRateCents: 74500,
    cleaningFeeCents: 25000,
    petFeeCents: null,
    highlights: [
      "Panoramic lake views from every room",
      "Heated plunge pool & cedar hot tub",
      "Private dock access for boats & kayaks",
      "Chef's kitchen with Wolf range",
    ],
    amenities: [
      "Heated plunge pool",
      "Hot tub",
      "Fire pit lounge",
      "Kayaks & paddleboards",
      "Boat dock access",
      "Chef's kitchen",
      "Espresso bar",
      "King primary suite with soaking tub",
      "Fast Wi-Fi & workspace",
      "Smart TVs",
      "EV charger",
      "Washer & dryer",
    ],
    houseRules: [
      "No parties or events without written approval",
      "Quiet hours 10 PM – 8 AM",
      "No smoking indoors",
      "No pets",
    ],
    images: [],
    palette: ["#123543", "#b08d57"],
    arrival: {
      address: "123 Bluff View Dr, Pottsboro, TX", // PLACEHOLDER
      doorCode: "PLACEHOLDER-0000",
      wifiName: "Overlook-Guest",
      wifiPassword: "PLACEHOLDER",
      parking: "Driveway fits 4 vehicles; boat trailer parking at the side gate.",
      notes: [
        "Pool heat is set on arrival day — allow 6 hours to reach temperature.",
        "Life jackets are in the dock box.",
      ],
    },
  },
  {
    slug: "the-vineyard-house",
    name: "The Vineyard House", // PLACEHOLDER
    headline: "A modern farmhouse among the vines",
    summary:
      "Ten private acres minutes from the Texoma wine trail, with a wraparound porch, outdoor kitchen, and stars for days.",
    story: [
      "The Vineyard House is where slow weekends happen. Pour a glass on the wraparound porch, fire up the outdoor kitchen, and watch the horses in the neighboring pasture as the sun drops behind the hills.",
      "With wine trail tastings, horseback rides, and the lake all close by, it's the perfect base for couples' getaways, girls' trips, and milestone celebrations.",
    ],
    location: "Denison, TX · Texoma Wine Country", // PLACEHOLDER
    bedrooms: 3,
    beds: 4,
    baths: 2.5,
    maxGuests: 8,
    minNights: 2,
    baseRateCents: 42500,
    weekendRateCents: 54500,
    cleaningFeeCents: 20000,
    petFeeCents: 7500,
    highlights: [
      "10 private acres near the wine trail",
      "Outdoor kitchen & pizza oven",
      "Wraparound porch with swing beds",
      "Pet friendly (dogs welcome)",
    ],
    amenities: [
      "Outdoor kitchen",
      "Wood-fired pizza oven",
      "Hot tub under the stars",
      "Fire pit",
      "Porch swing beds",
      "Yard games",
      "Wine fridge",
      "Record player & vinyl",
      "Fast Wi-Fi",
      "Washer & dryer",
      "Fenced dog run",
    ],
    houseRules: [
      "No parties or events without written approval",
      "Quiet hours 10 PM – 8 AM",
      "No smoking indoors",
      "Up to 2 dogs with pet fee",
    ],
    images: [],
    palette: ["#3b2f2a", "#8a6a3b"],
    arrival: {
      address: "456 Vineyard Rd, Denison, TX", // PLACEHOLDER
      doorCode: "PLACEHOLDER-0000",
      wifiName: "VineyardHouse",
      wifiPassword: "PLACEHOLDER",
      parking: "Gravel drive — park by the barn.",
      notes: ["Gate code is the same as the door code."],
    },
  },
];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export const vendorCategories: Record<string, { label: string; icon: string }> = {
  fishing: { label: "Fishing & Lake", icon: "🎣" },
  dining: { label: "Dining", icon: "🍽️" },
  wine: { label: "Vineyards & Wine", icon: "🍷" },
  outdoors: { label: "Horseback & Outdoors", icon: "🐎" },
  casino: { label: "Casino & Nightlife", icon: "🎰" },
  wellness: { label: "Wellness & Spa", icon: "🌿" },
  concierge: { label: "In-Home Services", icon: "🛎️" },
};
