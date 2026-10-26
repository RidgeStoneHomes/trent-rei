import { site, type Property } from "@/config/site";
import { addDays, formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

// IMPORTANT: This is a starting template, not legal advice. Have a Texas attorney
// review it before launch, then bump AGREEMENT_VERSION whenever the text changes.
export const AGREEMENT_VERSION = "2026-10-v1";

type AgreementInput = {
  property: Property;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
  totalCents: number;
};

export function renderAgreement(a: AgreementInput): { title: string; sections: { heading: string; body: string[] }[] } {
  const { property: p, policies } = { property: a.property, policies: site.policies };
  const refundDeadline = addDays(a.checkIn, -policies.refundWindowDays);

  return {
    title: `Short-Term Rental Agreement — ${p.name}`,
    sections: [
      {
        heading: "1. Parties & Property",
        body: [
          `This Short-Term Rental Agreement ("Agreement") is between ${site.brand} ("Host") and ${a.guestName} (${a.email}) ("Guest") for the vacation rental known as ${p.name}, located in ${p.location} (the "Property").`,
        ],
      },
      {
        heading: "2. Rental Period",
        body: [
          `Check-in: ${formatDate(a.checkIn)} at ${policies.checkInTime}. Check-out: ${formatDate(a.checkOut)} at ${policies.checkOutTime}.`,
          "Early check-in or late check-out is only permitted with written approval from Host. Remaining on the Property past check-out without approval may incur a fee equal to one night's rate.",
        ],
      },
      {
        heading: "3. Occupancy",
        body: [
          `Maximum occupancy is ${p.maxGuests} guests. This reservation is for ${a.guests} guest${a.guests === 1 ? "" : "s"}${a.pets ? ` and ${a.pets} pet${a.pets === 1 ? "" : "s"}` : ""}. Guest must be at least 25 years old and present for the duration of the stay. Only registered guests may stay overnight.`,
        ],
      },
      {
        heading: "4. Payment",
        body: [
          `The total rental amount of ${formatMoney(a.totalCents, { cents: true })}, including cleaning fees and applicable occupancy taxes, is due in full at booking.`,
        ],
      },
      {
        heading: "5. Cancellation & Refunds",
        body: [
          `Guest may cancel for a full refund until ${formatDate(refundDeadline)} (${policies.refundWindowDays} days before check-in). After that date the reservation is non-refundable.`,
          "Host strongly recommends travel insurance. If Host must cancel for reasons within its control, Guest will receive a full refund. Host is not responsible for weather, lake level conditions, or third-party closures.",
        ],
      },
      {
        heading: "6. House Rules",
        body: [
          ...p.houseRules.map((r) => `• ${r}`),
          "Parties, events, and commercial photography require prior written approval. Violation of house rules may result in immediate termination of the stay without refund.",
        ],
      },
      {
        heading: "7. Damage & Security",
        body: [
          "Guest is responsible for any damage to the Property, its contents, or its grounds caused by Guest, their party, or their pets beyond normal wear and tear. Guest authorizes Host to charge the payment method on file for the reasonable cost of repairs, replacement, excessive cleaning, or missing items, with photo documentation provided.",
          "Smoking or vaping indoors incurs a $500 cleaning fee.",
        ],
      },
      {
        heading: "8. Pool, Hot Tub, Lake & Activities — Assumption of Risk",
        body: [
          "The Property may include a pool, hot tub, dock, watercraft, fire pits, and access to open water. These are unsupervised; no lifeguard is on duty. Guest assumes all risks associated with their use and is responsible for supervising children at all times.",
          "Experiences booked with local partners (fishing guides, horseback riding, wineries, casinos, restaurants, and others) are provided by independent businesses. Host does not operate, control, or guarantee those services and is not liable for them. Partner discounts are a courtesy and may change or end at any time.",
        ],
      },
      {
        heading: "9. Liability & Indemnification",
        body: [
          "To the fullest extent permitted by law, Guest releases Host from liability for injury, loss, or damage to persons or property arising from the use of the Property, except where caused by Host's gross negligence. Guest agrees to indemnify Host against claims arising from the acts or omissions of Guest and their party.",
        ],
      },
      {
        heading: "10. Access, Privacy & Cameras",
        body: [
          "Exterior cameras may monitor entrances and driveways for security; no cameras are located inside the home. Host may enter the Property with reasonable notice, or without notice in an emergency.",
        ],
      },
      {
        heading: "11. General",
        body: [
          "This Agreement is governed by the laws of the State of Texas. If any provision is found unenforceable, the remainder stays in effect. This Agreement, together with the reservation confirmation, is the entire agreement between the parties.",
          "By typing their full name and initials below, Guest agrees that their electronic signature is legally binding, the same as a handwritten signature, under the Texas Uniform Electronic Transactions Act.",
        ],
      },
    ],
  };
}

export function agreementPlainText(doc: ReturnType<typeof renderAgreement>) {
  return [doc.title, "", ...doc.sections.flatMap((s) => [s.heading, ...s.body, ""])].join("\n");
}
