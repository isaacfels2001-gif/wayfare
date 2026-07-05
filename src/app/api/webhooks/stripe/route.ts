import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { confirmBookingPaid, releaseBookingInventory } from "@/services/booking";

/**
 * Stripe test-mode webhook. In local dev, forward events with the Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * The success page also has a best-effort fallback confirmation for local
 * setups that don't run the CLI (see src/app/checkout/success/page.tsx).
 */
export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // No webhook secret configured — accept unsigned events (dev convenience only).
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await confirmBookingPaid(bookingId, {
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          amountCents: session.amount_total ?? 0,
        });
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) await releaseBookingInventory(bookingId, "cancelled");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
