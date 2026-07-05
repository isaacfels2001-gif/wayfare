import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

const USD_ONLY = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

// The standard 14 PDF fonts only support WinAnsi encoding, which excludes
// characters like "→" used elsewhere in the UI — swap them for ASCII here.
function pdfSafe(text: string): string {
  return text.replace(/→/g, "->");
}

export async function generateVoucherPdf(bookingId: string): Promise<Uint8Array | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, items: true },
  });
  if (!booking) return null;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const brand = rgb(0.15, 0.39, 0.92);
  const dark = rgb(0.06, 0.09, 0.16);
  const gray = rgb(0.42, 0.45, 0.5);

  let y = 730;
  page.drawText("Wayfare", { x: 50, y, size: 24, font: bold, color: brand });
  page.drawText("Booking Voucher", { x: 50, y: y - 22, size: 12, font: regular, color: gray });
  page.drawText(booking.bookingRef, { x: 462, y, size: 16, font: bold, color: dark });
  page.drawText("Booking Reference", { x: 462, y: y - 16, size: 9, font: regular, color: gray });

  y -= 60;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.9, 0.91, 0.93) });

  y -= 24;
  page.drawText(`Guest: ${booking.user.name}`, { x: 50, y, size: 11, font: regular, color: dark });
  y -= 16;
  page.drawText(`Email: ${booking.user.email}`, { x: 50, y, size: 11, font: regular, color: dark });
  y -= 16;
  page.drawText(`Status: ${booking.status.toUpperCase()}`, { x: 50, y, size: 11, font: regular, color: dark });
  y -= 16;
  page.drawText(`Booked: ${booking.createdAt.toDateString()}`, { x: 50, y, size: 11, font: regular, color: dark });

  y -= 36;
  page.drawText("Itinerary", { x: 50, y, size: 13, font: bold, color: dark });
  y -= 20;

  for (const item of booking.items) {
    if (y < 120) {
      y = 730;
      pdf.addPage([612, 792]);
    }
    page.drawText(pdfSafe(`[${item.type.toUpperCase()}] ${item.title}`), { x: 50, y, size: 11, font: bold, color: dark });
    page.drawText(formatMoney(item.totalPriceCents, "USD", USD_ONLY), { x: 480, y, size: 11, font: bold, color: dark });
    y -= 15;
    page.drawText(pdfSafe(item.subtitle), { x: 50, y, size: 9, font: regular, color: gray });
    y -= 12;
    page.drawText(
      `${item.startDate.toDateString()} -> ${item.endDate.toDateString()}`,
      { x: 50, y, size: 9, font: regular, color: gray }
    );
    y -= 22;
  }

  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.9, 0.91, 0.93) });
  y -= 24;
  page.drawText("Subtotal", { x: 400, y, size: 10, font: regular, color: gray });
  page.drawText(formatMoney(booking.subtotalCents, "USD", USD_ONLY), { x: 480, y, size: 10, font: regular, color: dark });

  if (booking.discountCents > 0) {
    y -= 16;
    page.drawText("Discount", { x: 400, y, size: 10, font: regular, color: gray });
    page.drawText(`-${formatMoney(booking.discountCents, "USD", USD_ONLY)}`, { x: 480, y, size: 10, font: regular, color: dark });
  }

  y -= 20;
  page.drawText("Total Paid", { x: 400, y, size: 12, font: bold, color: brand });
  page.drawText(formatMoney(booking.totalCents, "USD", USD_ONLY), { x: 480, y, size: 12, font: bold, color: brand });

  page.drawText(
    "This is a demo voucher generated for a portfolio project. No real travel services were purchased.",
    { x: 50, y: 40, size: 8, font: regular, color: gray }
  );

  return pdf.save();
}
