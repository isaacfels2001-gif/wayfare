import { XCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { releaseBookingInventory } from "@/services/booking";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (booking && booking.status === "pending") {
      if (stripe && booking.stripeSessionId) {
        try {
          await stripe.checkout.sessions.expire(booking.stripeSessionId);
        } catch {
          // Session may already be expired/completed — safe to ignore.
        }
      }
      await releaseBookingInventory(bookingId, "cancelled");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <XCircle className="mx-auto h-14 w-14 text-slate-400" />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Checkout cancelled</h1>
      <p className="mt-2 text-slate-500">
        No payment was taken and the items in your cart have been released back to inventory. You can pick up where you left off any time.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href="/cart">Back to cart</LinkButton>
        <LinkButton href="/" variant="outline">
          Continue browsing
        </LinkButton>
      </div>
    </div>
  );
}
