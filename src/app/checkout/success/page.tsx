import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { confirmBookingPaid } from "@/services/booking";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; bookingId?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { session_id, bookingId } = await searchParams;

  let booking = null;

  if (bookingId) {
    booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { items: true } });
  } else if (session_id) {
    booking = await prisma.booking.findUnique({ where: { stripeSessionId: session_id }, include: { items: true } });

    // Fallback confirmation if the Stripe webhook hasn't landed yet (common in
    // local dev without `stripe listen` forwarding events to this app).
    if (booking && booking.status === "pending" && isStripeConfigured()) {
      const checkoutSession = await stripe!.checkout.sessions.retrieve(session_id);
      if (checkoutSession.payment_status === "paid") {
        await confirmBookingPaid(booking.id, {
          stripeSessionId: checkoutSession.id,
          stripePaymentIntentId: typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null,
          amountCents: checkoutSession.amount_total ?? booking.totalCents,
        });
        booking = await prisma.booking.findUnique({ where: { id: booking.id }, include: { items: true } });
      }
    }
  }

  if (!booking) notFound();
  if (booking.userId !== session.user.id) redirect("/account");

  const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };
  const stillPending = booking.status === "pending";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      {stillPending ? (
        <>
          <h1 className="text-2xl font-bold text-slate-900">Finishing up your booking…</h1>
          <p className="mt-2 text-slate-500">
            Your payment is processing. Refresh in a moment — this usually only takes a few seconds.
          </p>
          <LinkButton className="mt-4" href={`/checkout/success?${bookingId ? `bookingId=${bookingId}` : `session_id=${session_id}`}`}>
            Refresh
          </LinkButton>
        </>
      ) : (
        <>
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Booking confirmed!</h1>
          <p className="mt-2 text-slate-500">
            Reference <span className="font-mono font-semibold text-slate-700">{booking.bookingRef}</span>. A confirmation email has been sent.
          </p>

          <Card className="mt-8 text-left">
            <CardBody>
              <ul className="space-y-3">
                {booking.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-slate-500">{item.subtitle}</div>
                    </div>
                    <div className="font-semibold text-slate-900">{formatMoney(item.totalPriceCents, "USD", usdRate)}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-900">
                <span>Total paid</span>
                <span>{formatMoney(booking.totalCents, "USD", usdRate)}</span>
              </div>
            </CardBody>
          </Card>

          <div className="mt-6 flex justify-center gap-3">
            <LinkButton href={`/api/vouchers/${booking.id}`} variant="outline">
              Download voucher (PDF)
            </LinkButton>
            <LinkButton href="/account">View my trips</LinkButton>
          </div>
        </>
      )}
    </div>
  );
}
