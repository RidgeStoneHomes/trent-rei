// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — edit this file to rebrand, rename properties, and change pricing.
// Everything marked PLACEHOLDER should be replaced before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  brand: "Reynolds Retreats",
  tagline: "Private luxury stays on Lake Texoma",
  region: "Lake Texoma · North Texas",
  hostName: "Trent & Michelle",
  email: "reynoldsretreatstx@gmail.com",
  // Guest questions go to Michelle
  contactName: "Michelle",
  phone: "(682) 532-6007",
  instagram: "", // add your Instagram URL to show it in the footer
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
  // Texas state hotel occupancy tax (6%). Ironwood Acres is outside Pottsboro city limits, so no
  // city hotel tax applies; no Grayson County hotel tax was found. Confirm with your CPA.
  taxRate: 0.06,

  // Typical Airbnb guest service fee — used for the "book direct & save" message
  otaGuestFeeRate: 0.14,

  referral: {
    friendDiscountCents: 10000, // $100 off a friend's first stay
    referrerCreditCents: 10000, // $100 credit back to the guest who shared
    minNightsForReferral: 2,
  },

  // Email list signup on the homepage
  foundingGuest: {
    headline: "Join our guest list",
    offer: "Be first to hear about open dates, seasonal rates and new partner perks around the lake.",
  },

  // Announcement bar across the top of every guest page. It hides itself the day
  // after `endsOn`, so an expired offer never lingers. Set to null to turn it off.
  promo: null as { label: string; text: string; href: string; endsOn: string } | null,

  // Real guest reviews only. The reviews section stays hidden until this has entries.
  reviews: [] as { quote: string; name: string; home: string }[],
} as const;

// A photo in /public/images/<slug>/: `src` is the full-size file, `sm` an ~800px version for cards and grids.
export type Photo = { src: string; sm?: string; alt: string };

// One pricing season. `from`/`to` are inclusive night dates: "MM-DD" repeats every year,
// "YYYY-MM-DD" applies to that year only. A dated season beats a yearly one, and among
// seasons of the same kind the one listed later wins (so holidays go after the base seasons).
export type RateSeason = {
  label: string;
  from: string;
  to: string;
  weekdayCents: number; // Sun–Thu nights
  weekendCents: number; // Fri & Sat nights
  minNights?: number; // a stay that includes any night of this season must be at least this long
};

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
  comingSoon?: boolean; // listed with a guest-list signup, not bookable yet
  formerSlugs?: string[]; // old web addresses, so earlier bookings and links still find this home
  rateSeasons?: RateSeason[]; // when set, nights are priced by season; base/weekend rates fill any gaps
  priceFloorCents?: number; // no night is ever priced below this, even after discounts
  stayDiscounts?: { minNights: number; percent: number }[]; // length-of-stay discounts on the nightly total
  petFeeCents: number | null; // null = no pets
  highlights: string[];
  amenities: string[];
  houseRules: string[];
  // Gallery photos in display order; the first is the main photo. With none, gradient placeholders show.
  images: Photo[];
  heroPhoto?: Photo; // wide photo behind the homepage headline
  heroVideo?: string; // short silent loop behind the homepage headline (heroPhoto is its poster)
  video?: { src: string; poster: string; title: string }; // full video tour on the home's page
  palette: [string, string]; // placeholder gradient colors
  rooms?: { name: string; beds: string; detail: string; photo?: Photo }[];
  spaces?: { title: string; blurb?: string; items: string[] }[];
  sleepIntro?: string; // shown above the bedroom cards
  nearby?: { place: string; distance: string }[];
  cameraDisclosure?: string;
  // Non-private arrival defaults. The address, door code and Wi-Fi are entered in
  // /admin → Arrival Info (stored privately in the database, never in this public code).
  arrival: {
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
      "Welcome to Ironwood Acres, a private 1-acre luxury estate with a fully fenced backyard, designed for ultimate group entertainment and relaxation near Lake Texoma.",
    story: [
      "Five bedrooms, 4.5 baths (three of them en-suite), 4 king beds plus 2 queens, and room for 12, just 2 miles from Highport Marina. An 8-foot cedar privacy fence wraps the entire backyard, so the fun stays private.",
      "Sink putts on the private green, soak in the 7-person hot tub, fire up the outdoor kitchen, and end the night at the stone fire pit beneath uplit trees. Inside, 16-foot vaulted ceilings rise over a floor-to-ceiling slate fireplace, and the professionally designed rooms are furnished with curated Pottery Barn pieces.",
      "Gather everyone around the custom 12-person dining table for a family dinner where nobody is stuck at the kids' table. When the sun goes down, the air-conditioned game room takes over. This is a house built for making memories together.",
    ],
    location: "Pottsboro, TX · Lake Texoma",
    bedrooms: 5,
    beds: 6,
    baths: 4.5,
    maxGuests: 12,
    minNights: 2,
    baseRateCents: 62500, // fallback for any night outside the seasons below
    weekendRateCents: 87500,
    cleaningFeeCents: 32500,
    // Seasonal calendar: owners' $550 weekday minimum, with weekends priced near the
    // Yellowpine Retreat comp (~$800–$900/night). Based on the Nov 2026 pricing report.
    rateSeasons: [
      // Every year
      { label: "New Year's", from: "01-01", to: "01-03", weekdayCents: 69500, weekendCents: 69500, minNights: 2 },
      { label: "Winter", from: "01-04", to: "02-29", weekdayCents: 55000, weekendCents: 79500, minNights: 2 },
      { label: "Spring", from: "03-01", to: "05-20", weekdayCents: 62500, weekendCents: 87500, minNights: 2 },
      { label: "Early summer", from: "05-21", to: "06-06", weekdayCents: 67500, weekendCents: 92500, minNights: 2 },
      { label: "Summer peak", from: "06-07", to: "08-15", weekdayCents: 72500, weekendCents: 97500, minNights: 2 },
      { label: "Late summer", from: "08-16", to: "09-30", weekdayCents: 59500, weekendCents: 82500, minNights: 2 },
      { label: "Fall", from: "10-01", to: "11-21", weekdayCents: 62500, weekendCents: 87500, minNights: 2 },
      { label: "Early December", from: "11-22", to: "12-18", weekdayCents: 55000, weekendCents: 79500, minNights: 2 },
      { label: "Christmas – New Year's", from: "12-19", to: "12-30", weekdayCents: 79500, weekendCents: 79500, minNights: 3 },
      { label: "New Year's Eve", from: "12-31", to: "12-31", weekdayCents: 99500, weekendCents: 99500, minNights: 3 },
      { label: "July 4th", from: "07-01", to: "07-04", weekdayCents: 139500, weekendCents: 139500, minNights: 3 },
      // Specific dates (holidays that move each year; verify spring break with DFW school calendars)
      { label: "Opening rates", from: "2026-11-08", to: "2026-11-21", weekdayCents: 55000, weekendCents: 79500, minNights: 2 },
      { label: "Thanksgiving week", from: "2026-11-22", to: "2026-11-28", weekdayCents: 79500, weekendCents: 79500, minNights: 3 },
      { label: "Spring break", from: "2027-03-12", to: "2027-03-20", weekdayCents: 67500, weekendCents: 92500, minNights: 3 },
      { label: "Easter weekend", from: "2027-03-25", to: "2027-03-27", weekdayCents: 79500, weekendCents: 79500, minNights: 2 },
      { label: "Memorial Day weekend", from: "2027-05-28", to: "2027-05-30", weekdayCents: 109500, weekendCents: 109500, minNights: 3 },
      { label: "Labor Day weekend", from: "2027-09-03", to: "2027-09-05", weekdayCents: 105000, weekendCents: 105000, minNights: 3 },
      { label: "Thanksgiving week", from: "2027-11-22", to: "2027-11-28", weekdayCents: 79500, weekendCents: 79500, minNights: 3 },
      { label: "Spring break", from: "2028-03-10", to: "2028-03-18", weekdayCents: 67500, weekendCents: 92500, minNights: 3 },
      { label: "Easter weekend", from: "2028-04-13", to: "2028-04-15", weekdayCents: 79500, weekendCents: 79500, minNights: 2 },
      { label: "Memorial Day weekend", from: "2028-05-26", to: "2028-05-28", weekdayCents: 109500, weekendCents: 109500, minNights: 3 },
    ],
    priceFloorCents: 55000, // owners' absolute weekday minimum
    stayDiscounts: [
      { minNights: 7, percent: 12 },
      { minNights: 4, percent: 7 },
    ],
    petFeeCents: null,
    highlights: [
      "4-hole private putting green on 2,400 SF of turf",
      "7-person hot tub & stone fire pit under lit trees",
      "Air-conditioned game room: arcade, bumper pool, poker table & 85\" TV",
      "Bocce ball court & Frisbee golf",
      "Private acre, fully fenced backyard · 2 miles to Highport Marina",
    ],
    sleepIntro:
      "Each bedroom is a sanctuary of comfort: plush Pottery Barn bedding, fluffy pillows in a choice of firmness so everyone sleeps their way, and spa-like baths. Three suites have their own private en-suite bath.",
    rooms: [
      { name: "Primary Suite", beds: "King", detail: "King bed under an 11' white pine ceiling, with a private en-suite bath.", photo: { src: "/images/ironwood-acres/078.jpg", sm: "/images/ironwood-acres/078-sm.jpg", alt: "Primary Suite" } },
      { name: "The Highland En-suite", beds: "King", detail: "Private en-suite bath and shaggy Highland cow art: cozy farmhouse with a touch of Texas whimsy.", photo: { src: "/images/ironwood-acres/062.jpg", sm: "/images/ironwood-acres/062-sm.jpg", alt: "The Highland En-suite" } },
      { name: "Upstairs 19th Hole Clubhouse En-suite", beds: "2 Queens · sleeps 4", detail: "A golf-themed clubhouse upstairs to match the putting green out back, with a private en-suite bath.", photo: { src: "/images/ironwood-acres/091.jpg", sm: "/images/ironwood-acres/091-sm.jpg", alt: "Upstairs 19th Hole Clubhouse En-suite" } },
      { name: "The Cattle Drive Room", beds: "King", detail: "Moss-green accent wall and leather headboard, inspired by the cattle-drive hotels of the Texas frontier. Shares a full bath with the Lake Room.", photo: { src: "/images/ironwood-acres/051.jpg", sm: "/images/ironwood-acres/051-sm.jpg", alt: "The Cattle Drive Room" } },
      { name: "The Lake Room", beds: "King", detail: "Vintage paddles on the wall, a nod to the Lake Texoma days that bring you here. Shares a full bath with the Cattle Drive Room.", photo: { src: "/images/ironwood-acres/057.jpg", sm: "/images/ironwood-acres/057-sm.jpg", alt: "The Lake Room" } },
    ],
    spaces: [
      {
        title: "Living & dining",
        blurb: "Sink into the oversized leather sectional by the fire, then pull everyone together at one table for dinner.",
        items: [
          "16' vaulted ceiling and floor-to-ceiling slate fireplace with wood beam mantel",
          "Leather Castlery sofa and four Pottery Barn swivel chairs",
          "Custom 12-person dining table, so the whole group shares one family dinner",
          "12' iron sliding door to the covered porch",
          "Half bath off the kitchen and dining room",
        ],
      },
      {
        title: "Game room",
        blurb: "Tournament night, settled. The converted garage is air-conditioned and built for friendly rivalries.",
        items: [
          "Air-conditioned converted garage",
          "85\" TV and lounge sofa",
          "Infinity 32\" electronic game table: play the free games, or feel free to buy and download new ones",
          "Poker table for 8",
          "Foosball",
          "Bumper pool that converts to a second card table",
          "Huksie toss game",
        ],
      },
      {
        title: "Kitchen",
        blurb: "A fully equipped gourmet kitchen with high-end appliances, an island with seating, and everything you need to cook for twelve.",
        items: [
          "Keurig-style coffee maker that brews single cups or a full pot",
          "Toaster oven and air fryer",
          "Toaster",
        ],
      },
      {
        title: "Outdoor oasis",
        blurb: "Your own private resort in a fully fenced backyard, from morning putts to late-night stories around the fire.",
        items: [
          "32'×18' covered porch with pine ceilings and propane heater",
          "Outdoor kitchen: large grill, flat-top griddle, side burner",
          "7-person hot tub",
          "2,400 SF of turf with a 4-hole putting green",
          "Bocce ball court",
          "Frisbee golf (2 baskets)",
          "Giant Jenga and giant Yahtzee",
          "Cornhole",
          "Paddle boards for the lake",
          "Lit pathways to a stone wood-burning fire pit ringed by uplit trees",
          "8' cedar privacy fence around the entire backyard",
        ],
      },
      {
        title: "The details",
        items: [
          "Pottery Barn beds and plush bedding throughout",
          "Fluffy pillows in a choice of firmness",
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
      "Infinity 32\" electronic game table",
      "Frisbee golf (2 baskets)",
      "Cornhole",
      "Paddle boards",
      "Coffee maker (single cup or full pot)",
      "Bocce ball court",
      "Giant Jenga & giant Yahtzee",
      "12-seat dining table",
      "Slate fireplace",
      "Mesh Wi-Fi",
      "Whole-house water filtration",
      "Tankless water heater",
      "Fully fenced backyard",
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
    images: [
      { src: "/images/ironwood-acres/132.jpg", sm: "/images/ironwood-acres/132-sm.jpg", alt: "Private 4-hole putting green at twilight" },
      { src: "/images/ironwood-acres/021.jpg", sm: "/images/ironwood-acres/021-sm.jpg", alt: "Living room with slate fireplace and leather sectional" },
      { src: "/images/ironwood-acres/099.jpg", sm: "/images/ironwood-acres/099-sm.jpg", alt: "7-person hot tub on the covered porch" },
      { src: "/images/ironwood-acres/042.jpg", sm: "/images/ironwood-acres/042-sm.jpg", alt: "Kitchen with island seating" },
      { src: "/images/ironwood-acres/118.jpg", sm: "/images/ironwood-acres/118-sm.jpg", alt: "Ironwood Acres at twilight" },
      { src: "/images/ironwood-acres/016.jpg", sm: "/images/ironwood-acres/016-sm.jpg", alt: "The home on a private acre" },
      { src: "/images/ironwood-acres/005.jpg", sm: "/images/ironwood-acres/005-sm.jpg", alt: "Sunset over Lake Texoma, minutes from the house" },
      { src: "/images/ironwood-acres/025.jpg", sm: "/images/ironwood-acres/025-sm.jpg", alt: "Open living room under the 16-foot vaulted ceiling" },
      { src: "/images/ironwood-acres/027.jpg", sm: "/images/ironwood-acres/027-sm.jpg", alt: "Living room and entry" },
      { src: "/images/ironwood-acres/032.jpg", sm: "/images/ironwood-acres/032-sm.jpg", alt: "Sitting area with swivel chairs" },
      { src: "/images/ironwood-acres/038.jpg", sm: "/images/ironwood-acres/038-sm.jpg", alt: "Custom 12-seat dining table" },
      { src: "/images/ironwood-acres/043.jpg", sm: "/images/ironwood-acres/043-sm.jpg", alt: "Kitchen and pantry" },
      { src: "/images/ironwood-acres/045.jpg", sm: "/images/ironwood-acres/045-sm.jpg", alt: "Farmhouse sink looking out to the living room" },
      { src: "/images/ironwood-acres/078.jpg", sm: "/images/ironwood-acres/078-sm.jpg", alt: "Primary suite under a white pine ceiling" },
      { src: "/images/ironwood-acres/081.jpg", sm: "/images/ironwood-acres/081-sm.jpg", alt: "Primary bath soaking tub" },
      { src: "/images/ironwood-acres/083.jpg", sm: "/images/ironwood-acres/083-sm.jpg", alt: "Primary bath double vanity" },
      { src: "/images/ironwood-acres/062.jpg", sm: "/images/ironwood-acres/062-sm.jpg", alt: "The Highland En-suite" },
      { src: "/images/ironwood-acres/051.jpg", sm: "/images/ironwood-acres/051-sm.jpg", alt: "The Cattle Drive Room" },
      { src: "/images/ironwood-acres/057.jpg", sm: "/images/ironwood-acres/057-sm.jpg", alt: "The Lake Room" },
      { src: "/images/ironwood-acres/091.jpg", sm: "/images/ironwood-acres/091-sm.jpg", alt: "Upstairs 19th Hole Clubhouse En-suite: two queens" },
      { src: "/images/ironwood-acres/070.jpg", sm: "/images/ironwood-acres/070-sm.jpg", alt: "Air-conditioned game room" },
      { src: "/images/ironwood-acres/073.jpg", sm: "/images/ironwood-acres/073-sm.jpg", alt: "Game room lounge and arcade" },
      { src: "/images/ironwood-acres/075.jpg", sm: "/images/ironwood-acres/075-sm.jpg", alt: "Foosball" },
      { src: "/images/ironwood-acres/076.jpg", sm: "/images/ironwood-acres/076-sm.jpg", alt: "Poker table for 8" },
      { src: "/images/ironwood-acres/072.jpg", sm: "/images/ironwood-acres/072-sm.jpg", alt: "Bumper pool" },
      { src: "/images/ironwood-acres/098.jpg", sm: "/images/ironwood-acres/098-sm.jpg", alt: "Covered porch lounge" },
      { src: "/images/ironwood-acres/123.jpg", sm: "/images/ironwood-acres/123-sm.jpg", alt: "Covered porch at dusk" },
      { src: "/images/ironwood-acres/102.jpg", sm: "/images/ironwood-acres/102-sm.jpg", alt: "Porch dining" },
      { src: "/images/ironwood-acres/129.jpg", sm: "/images/ironwood-acres/129-sm.jpg", alt: "Outdoor kitchen with grill and griddle" },
      { src: "/images/ironwood-acres/130.jpg", sm: "/images/ironwood-acres/130-sm.jpg", alt: "Hot tub at dusk" },
      { src: "/images/ironwood-acres/124.jpg", sm: "/images/ironwood-acres/124-sm.jpg", alt: "Porch seating at dusk" },
      { src: "/images/ironwood-acres/110.jpg", sm: "/images/ironwood-acres/110-sm.jpg", alt: "The backyard: covered porch, hot tub and putting green" },
      { src: "/images/ironwood-acres/109.jpg", sm: "/images/ironwood-acres/109-sm.jpg", alt: "Stone fire pit with Adirondack chairs" },
      { src: "/images/ironwood-acres/135.jpg", sm: "/images/ironwood-acres/135-sm.jpg", alt: "Lit pathway to the fire pit" },
      { src: "/images/ironwood-acres/106.jpg", sm: "/images/ironwood-acres/106-sm.jpg", alt: "Putting green" },
      { src: "/images/ironwood-acres/133.jpg", sm: "/images/ironwood-acres/133-sm.jpg", alt: "Putting green lit up at dusk" },
      { src: "/images/ironwood-acres/113.jpg", sm: "/images/ironwood-acres/113-sm.jpg", alt: "Bocce court" },
      { src: "/images/ironwood-acres/114.jpg", sm: "/images/ironwood-acres/114-sm.jpg", alt: "Bocce" },
      { src: "/images/ironwood-acres/112.jpg", sm: "/images/ironwood-acres/112-sm.jpg", alt: "Cornhole on the lawn" },
      { src: "/images/ironwood-acres/116.jpg", sm: "/images/ironwood-acres/116-sm.jpg", alt: "One of two Frisbee golf baskets" },
      { src: "/images/ironwood-acres/121.jpg", sm: "/images/ironwood-acres/121-sm.jpg", alt: "Front entry" },
      { src: "/images/ironwood-acres/003.jpg", sm: "/images/ironwood-acres/003-sm.jpg", alt: "Lake Texoma from above" },
    ],
    heroPhoto: { src: "/videos/ironwood-acres/hero-loop-poster.jpg", alt: "Ironwood Acres at dusk" },
    heroVideo: "/videos/ironwood-acres/hero-loop.mp4",
    video: { src: "/videos/ironwood-acres/tour.mp4", poster: "/videos/ironwood-acres/tour-poster.jpg", title: "Ironwood Acres video tour" },
    palette: ["#1f3a2e", "#b08d57"],
    arrival: {
      parking: "Driveway parking only. Please don't park on the street or the grass.", // PLACEHOLDER: add "Driveway fits # vehicles"
      notes: [
        "Hot tub is ready on arrival; please shower before soaking.",
        "Firewood: PLACEHOLDER (e.g. one starter bundle provided; more available nearby).",
      ],
    },
  },
  {
    slug: "the-fog-line",
    name: "The Fog Line",
    comingSoon: true, // shows "opening soon" with a guest-list signup instead of booking
    formerSlugs: ["the-overlook", "the-lake-house"],
    headline: "A barndo guest house, hot tub and two fire pits, half a mile from Ironwood Acres",
    summary:
      "Welcome to The Fog Line, a private Lake Texoma retreat with 4 bedrooms, a 600 sq ft barndominium guest house with its own full bath and sleeping loft, and a fully fenced backyard made for long evenings outside.",
    story: [
      "Four bedrooms in the main house plus the barndo loft, and 4.5 baths in all, give a big group room to spread out. The 600 sq ft barndominium has its own full bath and loft, so it works as a guest suite for grandparents, a hangout for the kids, or a quiet bunkhouse at the end of the day.",
      "Out back, an 8-foot privacy fence wraps a turf-covered yard with a hot tub and not one but two fire pits. Ironwood Acres is just half a mile away, so two families or a large reunion can book both homes and still share every meal.",
    ],
    location: "Pottsboro, TX · Lake Texoma",
    bedrooms: 4,
    beds: 6,
    baths: 4.5,
    maxGuests: 10,
    minNights: 2,
    baseRateCents: 54500, // fallback for any night outside the seasons below
    weekendRateCents: 77500,
    cleaningFeeCents: 32500, // PLACEHOLDER — confirm with your cleaner
    // Seasonal calendar about 10–15% below Ironwood Acres (smaller home, sleeps 10)
    rateSeasons: [
      // Every year
      { label: "New Year's", from: "01-01", to: "01-03", weekdayCents: 59500, weekendCents: 59500, minNights: 2 },
      { label: "Winter", from: "01-04", to: "02-29", weekdayCents: 47500, weekendCents: 69500, minNights: 2 },
      { label: "Spring", from: "03-01", to: "05-20", weekdayCents: 54500, weekendCents: 77500, minNights: 2 },
      { label: "Early summer", from: "05-21", to: "06-06", weekdayCents: 59500, weekendCents: 82500, minNights: 2 },
      { label: "Summer peak", from: "06-07", to: "08-15", weekdayCents: 62500, weekendCents: 87500, minNights: 2 },
      { label: "Late summer", from: "08-16", to: "09-30", weekdayCents: 51500, weekendCents: 72500, minNights: 2 },
      { label: "Fall", from: "10-01", to: "11-21", weekdayCents: 54500, weekendCents: 77500, minNights: 2 },
      { label: "Early December", from: "11-22", to: "12-18", weekdayCents: 47500, weekendCents: 69500, minNights: 2 },
      { label: "Christmas – New Year's", from: "12-19", to: "12-30", weekdayCents: 69500, weekendCents: 69500, minNights: 3 },
      { label: "New Year's Eve", from: "12-31", to: "12-31", weekdayCents: 87500, weekendCents: 87500, minNights: 3 },
      { label: "July 4th", from: "07-01", to: "07-04", weekdayCents: 119500, weekendCents: 119500, minNights: 3 },
      // Specific dates (verify spring break with DFW school calendars)
      { label: "Thanksgiving week", from: "2026-11-22", to: "2026-11-28", weekdayCents: 69500, weekendCents: 69500, minNights: 3 },
      { label: "Spring break", from: "2027-03-12", to: "2027-03-20", weekdayCents: 59500, weekendCents: 82500, minNights: 3 },
      { label: "Easter weekend", from: "2027-03-25", to: "2027-03-27", weekdayCents: 69500, weekendCents: 69500, minNights: 2 },
      { label: "Memorial Day weekend", from: "2027-05-28", to: "2027-05-30", weekdayCents: 95000, weekendCents: 95000, minNights: 3 },
      { label: "Labor Day weekend", from: "2027-09-03", to: "2027-09-05", weekdayCents: 89500, weekendCents: 89500, minNights: 3 },
      { label: "Thanksgiving week", from: "2027-11-22", to: "2027-11-28", weekdayCents: 69500, weekendCents: 69500, minNights: 3 },
      { label: "Spring break", from: "2028-03-10", to: "2028-03-18", weekdayCents: 59500, weekendCents: 82500, minNights: 3 },
      { label: "Easter weekend", from: "2028-04-13", to: "2028-04-15", weekdayCents: 69500, weekendCents: 69500, minNights: 2 },
      { label: "Memorial Day weekend", from: "2028-05-26", to: "2028-05-28", weekdayCents: 95000, weekendCents: 95000, minNights: 3 },
    ],
    priceFloorCents: 47500,
    stayDiscounts: [
      { minNights: 7, percent: 12 },
      { minNights: 4, percent: 7 },
    ],
    petFeeCents: null,
    highlights: [
      "600 sq ft barndominium guest house with full bath & loft",
      "Hot tub and two fire pits",
      "Turf yard behind an 8-foot privacy fence",
      "Half a mile from Ironwood Acres: book both for up to 22 guests",
    ],
    sleepIntro: "Four bedrooms in the main house, plus a king bed up in the barndo loft.",
    rooms: [
      { name: "King Bedroom", beds: "King", detail: "A king bed in the main house." }, // PLACEHOLDER detail and name
      { name: "Second King Bedroom", beds: "King", detail: "Another king bed in the main house." }, // PLACEHOLDER detail and name
      { name: "Queen Bedroom", beds: "Queen", detail: "A queen bed in the main house." }, // PLACEHOLDER detail and name
      { name: "Twin XL Bedroom", beds: "2 Twin XL", detail: "Two twin XL beds, great for kids or friends who'd rather not share." }, // PLACEHOLDER
      { name: "The Barn Loft", beds: "King", detail: "A king bed in the loft of the 600 sq ft barndo guest house, with its own full bath downstairs." },
    ],
    spaces: [
      {
        title: "The barndo",
        blurb: "A 600 sq ft barndominium guest house steps from the main home.",
        items: ["Sleeping loft with a king bed", "Full bathroom", "Its own space for grandparents, teens or late-night games"],
      },
      {
        title: "Outdoor oasis",
        blurb: "A fully fenced backyard built for evenings outside.",
        items: [
          "Hot tub",
          "Two fire pits",
          "Artificial turf yard",
          "8' privacy fence around the backyard",
          "Yard games coming soon",
        ],
      },
    ],
    nearby: [
      { place: "Ironwood Acres", distance: "½ mile" },
      { place: "Highport Marina", distance: "Minutes" },
      { place: "Denison", distance: "15 minutes" },
    ],
    amenities: ["Barndominium guest house", "Sleeping loft", "Hot tub", "Two fire pits", "Turf yard", "Fully fenced backyard"],
    houseRules: [
      "No parties or events",
      "No pets",
      "Quiet hours 10 PM – 8 AM", // PLACEHOLDER: confirm quiet hours
      "No smoking indoors",
    ],
    images: [],
    palette: ["#123543", "#b08d57"],
    arrival: {
      parking: "Driveway parking only. Please don't park on the street or the grass.", // PLACEHOLDER
      notes: [],
    },
  },
];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug) ?? properties.find((p) => p.formerSlugs?.includes(slug));
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
