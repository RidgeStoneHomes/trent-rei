import Stripe from "stripe";

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

// Without Stripe, bookings are confirmed with no charge. That's always allowed in local dev,
// but a live site only allows it when ALLOW_DEMO_PAYMENTS=true (for a preview before launch).
export const demoPaymentsAllowed =
  !stripeEnabled && (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_PAYMENTS === "true");

export const paymentsAvailable = stripeEnabled || demoPaymentsAllowed;

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
