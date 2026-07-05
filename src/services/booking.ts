import { prisma } from "@/lib/db";
import { flightProvider } from "@/services/flights";
import { hotelProvider } from "@/services/hotels";
import { tourProvider } from "@/services/tours";
import { sendBookingConfirmationEmail } from "@/services/notifications";

export type CartItemType = "flight" | "hotel" | "tour";

export interface CartItemInput {
  type: CartItemType;
  quantity: number;
  ref: Record<string, unknown>;
}

export interface ValidatedBookingItem {
  type: CartItemType;
  title: string;
  subtitle: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  detailsJson: string;
  ref: Record<string, unknown>;
}

export type ValidationResult = { ok: true; items: ValidatedBookingItem[] } | { ok: false; error: string };

/**
 * Re-fetches live price/availability for every cart item from the booking
 * adapters — the client-side cart is never trusted for price. This is the
 * one place all three verticals get reconciled into a common shape.
 */
export async function validateAndPriceCart(items: CartItemInput[]): Promise<ValidationResult> {
  if (items.length === 0) return { ok: false, error: "Your cart is empty." };

  const priced: ValidatedBookingItem[] = [];

  for (const item of items) {
    if (item.type === "flight") {
      const flightId = String(item.ref.flightId);
      const fareId = String(item.ref.fareId);
      const offer = await flightProvider.getOffer(flightId, fareId);
      if (!offer) return { ok: false, error: "One of the selected flights is no longer available." };
      const fare = offer.fares.find((f) => f.fareId === fareId);
      if (!fare) return { ok: false, error: "One of the selected fares is no longer available." };
      if (fare.seatsAvailable < item.quantity) {
        return { ok: false, error: `Only ${fare.seatsAvailable} seat(s) left on ${offer.airline} ${offer.flightNumber}.` };
      }
      priced.push({
        type: "flight",
        title: `${offer.originCity} → ${offer.destinationCity}`,
        subtitle: `${offer.airline} ${offer.flightNumber} · ${fare.cabin.replace("_", " ")} · ${item.quantity} passenger(s)`,
        startDate: new Date(offer.departAt),
        endDate: new Date(offer.arriveAt),
        quantity: item.quantity,
        unitPriceCents: fare.priceUsdCents,
        totalPriceCents: fare.priceUsdCents * item.quantity,
        detailsJson: JSON.stringify({ offer, fare, passengers: item.quantity }),
        ref: { flightId, fareId, passengers: item.quantity },
      });
    } else if (item.type === "hotel") {
      const hotelId = String(item.ref.hotelId);
      const roomId = String(item.ref.roomId);
      const checkIn = String(item.ref.checkIn);
      const checkOut = String(item.ref.checkOut);
      const guests = Number(item.ref.guests) || 1;
      const offer = await hotelProvider.getOffer(hotelId);
      if (!offer) return { ok: false, error: "One of the selected hotels is no longer available." };
      const room = offer.rooms.find((r) => r.roomId === roomId);
      if (!room) return { ok: false, error: "One of the selected room types is no longer available." };
      if (room.totalRooms < item.quantity) {
        return { ok: false, error: `Only ${room.totalRooms} room(s) left for ${offer.name} — ${room.name}.` };
      }
      const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
      priced.push({
        type: "hotel",
        title: offer.name,
        subtitle: `${room.name} · ${nights} night(s) · ${item.quantity} room(s) · ${guests} guests`,
        startDate: new Date(checkIn),
        endDate: new Date(checkOut),
        quantity: item.quantity,
        unitPriceCents: room.pricePerNightCents * nights,
        totalPriceCents: room.pricePerNightCents * nights * item.quantity,
        detailsJson: JSON.stringify({ offer, room, checkIn, checkOut, guests, rooms: item.quantity, nights }),
        ref: { hotelId, roomId, rooms: item.quantity },
      });
    } else if (item.type === "tour") {
      const tourId = String(item.ref.tourId);
      const departureId = String(item.ref.departureId);
      const pax = Number(item.ref.pax) || 1;
      const offer = await tourProvider.getById(tourId);
      if (!offer) return { ok: false, error: "One of the selected tour packages is no longer available." };
      const departure = offer.departures.find((d) => d.departureId === departureId);
      if (!departure) return { ok: false, error: "The selected departure date is no longer available." };
      if (departure.seatsAvailable < pax) {
        return { ok: false, error: `Only ${departure.seatsAvailable} seat(s) left on ${offer.title} for that date.` };
      }
      priced.push({
        type: "tour",
        title: offer.title,
        subtitle: `${offer.destination} · ${offer.durationDays} days · ${pax} traveler(s)`,
        startDate: new Date(departure.date),
        endDate: new Date(new Date(departure.date).getTime() + offer.durationDays * 86400000),
        quantity: pax,
        unitPriceCents: offer.basePriceCents,
        totalPriceCents: offer.basePriceCents * pax,
        detailsJson: JSON.stringify({ offer, departure, pax }),
        ref: { departureId, pax },
      });
    } else {
      return { ok: false, error: "Unknown item type in cart." };
    }
  }

  return { ok: true, items: priced };
}

/** Decrements live inventory for each item, in order, with best-effort rollback if one fails partway through. */
export async function reserveInventory(
  items: ValidatedBookingItem[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const reserved: ValidatedBookingItem[] = [];

  for (const item of items) {
    let result: { success: boolean; reason?: string };
    if (item.type === "flight") {
      result = await flightProvider.reserveSeats(String(item.ref.fareId), item.quantity);
    } else if (item.type === "hotel") {
      result = await hotelProvider.reserveRooms(String(item.ref.roomId), item.quantity);
    } else {
      result = await tourProvider.reserveSeats(String(item.ref.departureId), item.quantity);
    }

    if (!result.success) {
      await releaseInventory(reserved);
      return { ok: false, error: result.reason ?? "One of the selected items just sold out. Please review your cart." };
    }
    reserved.push(item);
  }

  return { ok: true };
}

/** Compensating release used on rollback (checkout failure) or when a Stripe session expires/is cancelled. */
export async function releaseInventory(items: ValidatedBookingItem[]): Promise<void> {
  for (const item of items) {
    if (item.type === "flight") {
      await prisma.fareOption.update({ where: { id: String(item.ref.fareId) }, data: { seatsAvailable: { increment: item.quantity } } });
    } else if (item.type === "hotel") {
      await prisma.room.update({ where: { id: String(item.ref.roomId) }, data: { totalRooms: { increment: item.quantity } } });
    } else if (item.type === "tour") {
      await prisma.tourDeparture.update({ where: { id: String(item.ref.departureId) }, data: { seatsAvailable: { increment: item.quantity } } });
    }
  }
}

export interface PromoResult {
  discountCents: number;
  promoCodeId?: string;
  error?: string;
}

export async function applyPromoCode(
  code: string | undefined,
  subtotalCents: number,
  itemTypes: Set<CartItemType>
): Promise<PromoResult> {
  if (!code) return { discountCents: 0 };

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!promo || !promo.active) return { discountCents: 0, error: "Invalid or inactive promo code." };
  if (promo.validFrom && promo.validFrom > new Date()) return { discountCents: 0, error: "This promo code isn't active yet." };
  if (promo.validTo && promo.validTo < new Date()) return { discountCents: 0, error: "This promo code has expired." };
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return { discountCents: 0, error: "This promo code has reached its usage limit." };
  if (subtotalCents < promo.minSpendCents) {
    return { discountCents: 0, error: `This code requires a minimum spend of $${(promo.minSpendCents / 100).toFixed(2)}.` };
  }

  const appliesTo = promo.appliesToCsv.split(",").map((s) => s.trim());
  const applies = appliesTo.includes("all") || [...itemTypes].some((t) => appliesTo.includes(t));
  if (!applies) {
    return { discountCents: 0, error: `This code doesn't apply to the items in your cart.` };
  }

  const discountCents =
    promo.discountType === "percent"
      ? Math.round((subtotalCents * promo.discountValue) / 100)
      : Math.min(promo.discountValue, subtotalCents);

  return { discountCents, promoCodeId: promo.id };
}

export function generateBookingRef(): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WF-${rand}`;
}

/** Idempotent: marks a booking paid, records the payment, and fires the confirmation email. Safe to call from a webhook and/or a success-page fallback. */
export async function confirmBookingPaid(
  bookingId: string,
  payment: { stripeSessionId?: string | null; stripePaymentIntentId?: string | null; amountCents: number }
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return;
  if (booking.status === "confirmed") return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      stripePaymentIntentId: payment.stripePaymentIntentId ?? undefined,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId,
      provider: "stripe",
      status: "succeeded",
      amountCents: payment.amountCents,
      currency: "USD",
      stripePaymentIntentId: payment.stripePaymentIntentId ?? undefined,
    },
  });
  await sendBookingConfirmationEmail(bookingId);
}

/** Releases previously-reserved inventory for a booking (Stripe session expired/cancelled) and marks it cancelled. */
export async function releaseBookingInventory(bookingId: string, finalStatus: "cancelled" | "payment_failed" = "cancelled") {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { items: true } });
  if (!booking || booking.status === "cancelled") return;

  for (const item of booking.items) {
    const details = JSON.parse(item.detailsJson) as Record<string, unknown>;
    if (item.type === "flight") {
      const fare = details.fare as { fareId: string } | undefined;
      if (fare?.fareId) await prisma.fareOption.update({ where: { id: fare.fareId }, data: { seatsAvailable: { increment: item.quantity } } });
    } else if (item.type === "hotel") {
      const room = details.room as { roomId: string } | undefined;
      if (room?.roomId) await prisma.room.update({ where: { id: room.roomId }, data: { totalRooms: { increment: item.quantity } } });
    } else if (item.type === "tour") {
      const departure = details.departure as { departureId: string } | undefined;
      if (departure?.departureId) await prisma.tourDeparture.update({ where: { id: departure.departureId }, data: { seatsAvailable: { increment: item.quantity } } });
    }
  }

  await prisma.booking.update({ where: { id: bookingId }, data: { status: finalStatus } });
}
