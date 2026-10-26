// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — edit this file to rebrand, rename properties, and change pricing.
// Everything marked PLACEHOLDER should be replaced before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  brand: "Reynolds Retreats",
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
  rooms?: { name: string; beds: string; detail: string }[];
  spaces?: { title: string; items: string[] }[];
  nearby?: { place: string; distance: string }[];
  cameraDisclosure?: string;
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
    slug: "ironwood-acres",
    name: "Ironwood Acres", // 328 Brandon Way
    headline: "Putting green + hot tub on a private acre, 2 miles from Highport Marina",
    summary:
      "A private, fully fenced 1-acre luxury estate just 2 miles from Highport Marina on Lake Texoma: 5 bedrooms, 4.5 baths, 4 king beds, and room for 12.",
    story: [
      "Sink putts on the private green, soak in the 7-person hot tub, fire up the outdoor kitchen, and end the night at the stone fire pit beneath uplit trees. An 8-foot cedar fence wraps the entire acre, so the whole place is yours.",
      "Inside, 16-foot vaulted ceilings rise over a floor-to-ceiling slate fireplace, a leather sofa and swivel chairs gather the group, and a custom 12-seat dining table fits everyone at one meal. When the sun goes down, the air-conditioned game room takes over.",
    ],
    location: "Pottsboro, TX · Lake Texoma",
    bedrooms: 5,
    beds: 6,
    baths: 4.5,
    maxGuests: 12,
    minNights: 2,
    baseRateCents: 42500, // PLACEHOLDER rate
    weekendRateCents: 54500, // PLACEHOLDER rate
    cleaningFeeCents: 20000, // PLACEHOLDER fee
    petFeeCents: null,
    highlights: [
      "4-hole private putting green on 2,400 SF of turf",
      "7-person hot tub & stone fire pit under lit trees",
      "Air-conditioned game room with 85\" TV & poker table",
      "Fully fenced acre · 2 miles to Highport Marina",
    ],
    rooms: [
      { name: "Primary Suite", beds: "King", detail: "King bed under an 11' white pine ceiling, with a private en-suite bath." },
      { name: "The Highland Room", beds: "King", detail: "Private en-suite bath and shaggy Highland cow art: cozy farmhouse with a touch of Texas whimsy." },
      { name: "The 19th Hole", beds: "2 Queens · sleeps 4", detail: "Golf-themed to match the putting green out back, with a private en-suite bath." },
      { name: "The Drover Room", beds: "King", detail: "Moss-green accent wall and leather headboard, inspired by the cattle-drive hotels of the Texas frontier. Shares a full bath with the Lake Room." },
      { name: "The Lake Room", beds: "King", detail: "Vintage paddles on the wall, a nod to the Lake Texoma days that bring you here. Shares a full bath with the Drover Room." },
    ],
    spaces: [
      {
        title: "Living & dining",
        items: [
          "16' vaulted ceiling and floor-to-ceiling slate fireplace with wood beam mantel",
          "Leather Castlery sofa and four swivel chairs",
          "Custom 12-person dining table",
          "12' iron sliding door to the covered porch",
          "Half bath off the living room",
        ],
      },
      {
        title: "Game room",
        items: [
          "Air-conditioned converted garage",
          "85\" TV and lounge sofa",
          "Poker table for 8",
          "Foosball",
          "Bumper pool that converts to a second card table",
        ],
      },
      {
        title: "Outdoor oasis",
        items: [
          "32'×18' covered porch with pine ceilings and propane heater",
          "Outdoor kitchen: large grill, flat-top griddle, side burner",
          "7-person hot tub",
          "2,400 SF of turf: 4-hole putting green, bocce, giant Jenga, giant dice & yard games",
          "Lit pathways to a stone wood-burning fire pit ringed by uplit trees",
          "8' cedar privacy fence around the full acre",
        ],
      },
      {
        title: "The details",
        items: [
          "Pottery Barn beds throughout",
          "Whole-house water filtration",
          "Tankless water heater, so the hot water won't run out",
          "Mesh Wi-Fi across the property",
          "Self check-in", // PLACEHOLDER: keypad or smart lock
        ],
      },
    ],
    nearby: [
      { place: "Highport Marina", distance: "2 miles" },
      { place: "Denison", distance: "15 minutes" },
      { place: "Sherman", distance: "20 minutes" },
    ],
    amenities: [
      "Private putting green",
      "7-person hot tub",
      "Outdoor kitchen & griddle",
      "Stone fire pit",
      "Covered porch with heater",
      "Air-conditioned game room",
      "Poker table for 8",
      "Foosball & bumper pool",
      "Bocce & giant yard games",
      "12-seat dining table",
      "Slate fireplace",
      "Mesh Wi-Fi",
      "Whole-house water filtration",
      "Tankless water heater",
      "Fully fenced acre",
    ],
    houseRules: [
      "Maximum 12 guests",
      "No parties or events",
      "No pets",
      "Quiet hours 10 PM – 8 AM", // PLACEHOLDER: confirm quiet hours
      "No smoking indoors",
      "Park in the driveway only, never on the street or grass",
    ],
    cameraDisclosure:
      "Exterior security cameras monitor the front door, the garage, and the left side of the house. There are no cameras inside the home.",
    images: [],
    palette: ["#1f3a2e", "#b08d57"],
    arrival: {
      address: "328 Brandon Way, Pottsboro, TX", // PLACEHOLDER: confirm city & add ZIP
      doorCode: "PLACEHOLDER-0000", // keypad / smart lock code
      wifiName: "IronwoodAcres",
      wifiPassword: "PLACEHOLDER",
      parking: "Driveway parking only. Please don't park on the street or the grass.", // PLACEHOLDER: add "Driveway fits # vehicles"
      notes: [
        "Hot tub is ready on arrival; please shower before soaking.",
        "Firewood: PLACEHOLDER (e.g. one starter bundle provided; more available nearby).",
      ],
    },
  },
  {
    slug: "the-overlook",
    name: "The Overlook", // PLACEHOLDER — second home name
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
