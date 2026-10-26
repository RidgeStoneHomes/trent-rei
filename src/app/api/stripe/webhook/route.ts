import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { confirmBooking } from "@/lib/booking";

// Stripe → Developers → Webhooks → add endpoint: <site>/api/stripe/webhook, event checkout.session.completed
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  const body = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.bookingId) {
      await confirmBooking(session.metadata.bookingId, session.id);
    }
  }
  return NextResponse.json({ received: true });
}
