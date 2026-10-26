// Seeds sample partner vendors. Run with `--demo` to also add demo guest bookings
// (one in each trip stage) for testing the portal. Don't use --demo in production.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// SAMPLE partners — replace with your real partner businesses and offers in /admin/vendors.
const vendors = [
  {
    slug: "striper-charter",
    name: "Lake Texoma Striper Charter",
    category: "fishing",
    blurb: "Half- and full-day striped bass trips with a licensed local guide — gear and cleaning included.",
    description: "Texoma is one of the few lakes where striped bass reproduce naturally. Your captain picks you up at our dock, handles the gear, and cleans and bags your catch.",
    perk: "15% off any charter + free fish cleaning",
    perkDetails: "Mention the code when booking by phone or online. Show your Guest Pass at the dock.",
    promoCode: "LAKEHOUSE15",
    bookingUrl: "https://example.com/striper-charter",
    phone: "(555) 555-0111",
    distance: "Dock pickup available",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "sunset-cruise",
    name: "Golden Hour Pontoon Cruises",
    category: "fishing",
    blurb: "Private captained sunset cruises with a curated cooler — perfect for proposals and anniversaries.",
    description: "Two hours on the water at golden hour with a captain, Bluetooth sound, and a charcuterie board waiting on board.",
    perk: "Complimentary champagne & charcuterie",
    promoCode: "GOLDENHOUR",
    bookingUrl: "https://example.com/sunset-cruise",
    phone: "(555) 555-0112",
    distance: "15 min drive",
    sortOrder: 2,
  },
  {
    slug: "hillside-vineyard",
    name: "Hillside Vineyard & Tasting Room",
    category: "wine",
    blurb: "Estate-grown Texas wines on a porch overlooking the vines.",
    description: "Reserve a seated tasting of five estate wines. Stay for a bottle and a cheese board as the sun sets over the rows.",
    perk: "Free tasting flight for two + 10% off bottles",
    perkDetails: "Show your Guest Pass at the tasting bar.",
    bookingUrl: "https://example.com/vineyard",
    distance: "10 min drive",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "red-river-trail-rides",
    name: "Red River Trail Rides",
    category: "outdoors",
    blurb: "Guided horseback rides through cross timbers and along the river — all levels welcome.",
    description: "One- and two-hour guided rides for riders of all experience levels, including a sunset ride that ends with s'mores at the fire ring.",
    perk: "20% off sunset rides",
    promoCode: "RIDEWITHUS",
    bookingUrl: "https://example.com/trail-rides",
    phone: "(555) 555-0113",
    distance: "20 min drive",
    sortOrder: 1,
  },
  {
    slug: "lakeside-steakhouse",
    name: "The Lakeside Steakhouse",
    category: "dining",
    blurb: "Dry-aged steaks and Gulf seafood with a view of the marina.",
    description: "The best table on the lake. We'll help you book a window seat for sunset — just tell us the night.",
    perk: "Complimentary dessert & priority reservations",
    perkDetails: "Text your host with the date and party size, or mention the code when reserving.",
    promoCode: "OVERLOOK",
    phone: "(555) 555-0114",
    distance: "8 min drive",
    sortOrder: 1,
  },
  {
    slug: "private-chef",
    name: "Private Chef Experience",
    category: "concierge",
    blurb: "A chef cooks a multi-course dinner in your kitchen — you just pour the wine.",
    description: "Four-course seasonal menus prepared in the home, with cleanup included. Ideal for celebrations and large groups.",
    perk: "Free appetizer course for parties of 6+",
    bookingUrl: "https://example.com/private-chef",
    phone: "(555) 555-0115",
    sortOrder: 1,
  },
  {
    slug: "casino-resort",
    name: "Partner Casino Resort",
    category: "casino",
    blurb: "World-class gaming, live shows, and dining just across the river.",
    description: "Make a night of it: gaming, concerts, and late-night dining. Our guests get a welcome package at the players' club desk.",
    perk: "$25 free play + show ticket upgrade",
    perkDetails: "Present your Guest Pass and ID at the players' club desk. 21+.",
    bookingUrl: "https://example.com/casino",
    distance: "25 min drive",
    sortOrder: 1,
  },
  {
    slug: "in-home-massage",
    name: "Lakeview Mobile Spa",
    category: "wellness",
    blurb: "Licensed therapists bring massage tables and calm to your living room.",
    description: "Couples and group massage in the home or on the deck, with aromatherapy and hot stones.",
    perk: "$30 off couples massage",
    promoCode: "UNWIND30",
    phone: "(555) 555-0116",
    sortOrder: 1,
  },
];

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function main() {
  for (const v of vendors) {
    await db.vendor.upsert({ where: { slug: v.slug }, update: {}, create: v });
  }
  console.log(`Seeded ${vendors.length} sample partners.`);

  if (process.argv.includes("--demo")) {
    const demos = [
      { code: "DEMO01", firstName: "Avery", checkIn: iso(60), checkOut: iso(63), slug: "the-overlook" }, // refundable — portal locked
      { code: "DEMO02", firstName: "Jordan", checkIn: iso(12), checkOut: iso(15), slug: "ironwood-acres" }, // portal open
      { code: "DEMO03", firstName: "Morgan", checkIn: iso(-1), checkOut: iso(2), slug: "the-overlook" }, // currently staying
    ];
    for (const d of demos) {
      await db.booking.upsert({
        where: { code: d.code },
        update: { checkIn: d.checkIn, checkOut: d.checkOut },
        create: {
          code: d.code,
          propertySlug: d.slug,
          checkIn: d.checkIn,
          checkOut: d.checkOut,
          guests: 4,
          firstName: d.firstName,
          lastName: "Demo",
          email: "demo@example.com",
          phone: "(555) 555-0199",
          nightlyCents: 180000,
          cleaningCents: 25000,
          taxCents: 26650,
          totalCents: 231650,
          status: "CONFIRMED",
          paidAt: new Date(),
        },
      });
    }
    console.log("Seeded demo bookings — sign in at /trip with demo@example.com and DEMO01, DEMO02 or DEMO03.");
  }
}

main().finally(() => db.$disconnect());
