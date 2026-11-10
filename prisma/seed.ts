// Run with `--demo` to add demo guest bookings (one in each trip stage) for testing
// the portal. Don't use --demo in production. Partners are added in /admin.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (process.argv.includes("--demo")) {
    const demos = [
      { code: "DEMO01", firstName: "Avery", checkIn: iso(60), checkOut: iso(63), slug: "ironwood-acres" }, // refundable — portal locked
      { code: "DEMO02", firstName: "Jordan", checkIn: iso(12), checkOut: iso(15), slug: "ironwood-acres" }, // portal open
      { code: "DEMO03", firstName: "Morgan", checkIn: iso(-1), checkOut: iso(2), slug: "ironwood-acres" }, // currently staying
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
