import { prisma } from "@/lib/db";
import { emailProvider } from "@/services/email";
import { formatMoney } from "@/lib/money";

export async function sendBookingConfirmationEmail(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, items: true },
  });
  if (!booking) return;

  const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };
  const rows = booking.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
           <strong>${item.title}</strong><br/><span style="color:#64748b;font-size:13px;">${item.subtitle}</span>
         </td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(item.totalPriceCents, "USD", usdRate)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <h1 style="color:#2563eb;">Booking confirmed 🎉</h1>
      <p>Hi ${booking.user.name}, your booking <strong>${booking.bookingRef}</strong> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">${rows}</table>
      <table style="width:100%;margin-top:12px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatMoney(booking.subtotalCents, "USD", usdRate)}</td></tr>
        ${booking.discountCents > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${formatMoney(booking.discountCents, "USD", usdRate)}</td></tr>` : ""}
        <tr><td><strong>Total paid</strong></td><td style="text-align:right;"><strong>${formatMoney(booking.totalCents, "USD", usdRate)}</strong></td></tr>
      </table>
      <p style="margin-top:24px;color:#64748b;font-size:13px;">
        This is a demo confirmation from a portfolio project. No real payment was processed and no real travel services were booked.
      </p>
    </div>`;

  await emailProvider.send({
    to: booking.user.email,
    subject: `Booking confirmed — ${booking.bookingRef}`,
    html,
    template: "booking_confirmation",
    bookingId: booking.id,
  });
}
