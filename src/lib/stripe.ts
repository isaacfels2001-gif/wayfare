import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

/**
 * Null when no Stripe test-mode key is configured. The checkout action falls
 * back to a "mock payment" path in that case (see src/lib/actions/checkout.ts)
 * so the booking flow is fully testable before you wire up your own free
 * Stripe test account. Add STRIPE_SECRET_KEY to switch to real Stripe
 * Checkout in test mode.
 */
export const stripe = secretKey ? new Stripe(secretKey) : null;

export function isStripeConfigured() {
  return stripe !== null;
}
