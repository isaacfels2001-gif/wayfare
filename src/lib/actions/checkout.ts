"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import {
  applyPromoCode,
  confirmBookingPaid,
  generateBookingRef,
  releaseInventory,
  reserveInventory,
  validateAndPriceCart,
  type CartItemInput,
  type CartItemType,
} from "@/services/booking";

export interface CheckoutInput {
  items: CartItemInput[];
  promoCode?: string;
}

export interface CheckoutResult {
  error?: string;
  url?: string;
  requiresLogin?: boolean;
}

export async function previewPromoAction(
  code: string,
  subtotalCents: number,
  itemTypes: CartItemType[]
): Promise<{ discountCents: number; error?: string }> {
  const result = await applyPromoCode(code, subtotalCents, new Set(itemTypes));
  return { discountCents: result.discountCents, error: result.error };
}

export async function startCheckoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  const session = await getSession();
  if (!session?.user) return { requiresLogin: true };

  const validation = await validateAndPriceCart(input.items);
  if (!validation.ok) return { error: validation.error };

  const subtotalCents = validation.items.reduce((sum, i) => sum + i.totalPriceCents, 0);
  const itemTypes = new Set(validation.items.map((i) => i.type));
  const promo = await applyPromoCode(input.promoCode, subtotalCents, itemTypes);
  if (promo.error) return { error: promo.error };

  const reserved = await reserveInventory(validation.items);
  if (!reserved.ok) return { error: reserved.error };

  const totalCents = Math.max(0, subtotalCents - promo.discountCents);
  const bookingRef = generateBookingRef();

  const booking = await prisma.booking.create({
    data: {
      bookingRef,
      userId: session.user.id,
      status: "pending",
      currency: "USD",
      subtotalCents,
      discountCents: promo.discountCents,
      totalCents,
      promoCodeId: promo.promoCodeId,
      items: {
        create: validation.items.map((i) => ({
          type: i.type,
          title: i.title,
          subtitle: i.subtitle,
          startDate: i.startDate,
          endDate: i.endDate,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          totalPriceCents: i.totalPriceCents,
          detailsJson: i.detailsJson,
        })),
      },
    },
  });

  if (promo.promoCodeId) {
    await prisma.promoCode.update({ where: { id: promo.promoCodeId }, data: { usedCount: { increment: 1 } } });
  }

  // No Stripe test key configured yet: confirm immediately so the full
  // search -> checkout -> confirmation flow is testable out of the box.
  // Add STRIPE_SECRET_KEY (see .env.example) to exercise real Stripe
  // Checkout in test mode instead.
  if (!isStripeConfigured()) {
    await confirmBookingPaid(booking.id, { stripeSessionId: null, stripePaymentIntentId: null, amountCents: totalCents });
    return { url: `/checkout/success?bookingId=${booking.id}` };
  }

  try {
    const checkoutSession = await stripe!.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Wayfare booking ${bookingRef}`,
              description: validation.items.map((i) => i.title).join(", ").slice(0, 500),
            },
            unit_amount: Math.max(totalCents, 50),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/checkout/cancel?bookingId=${booking.id}`,
      metadata: { bookingId: booking.id },
    });

    await prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: checkoutSession.id } });
    return { url: checkoutSession.url ?? undefined };
  } catch {
    await releaseInventory(validation.items);
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "payment_failed" } });
    return { error: "Payment provider error. Please try again." };
  }
}
