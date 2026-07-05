import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import { formatDateLong } from "@/lib/format";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id }, include: { items: true } });
  if (!booking) notFound();
  if (booking.userId !== user.id && user.role !== "admin") redirect("/account");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{booking.bookingRef}</h1>
          <p className="mt-1 text-sm text-slate-500">Booked {formatDateLong(booking.createdAt.toISOString())}</p>
        </div>
        <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
      </div>

      <Card className="mt-6">
        <CardBody>
          <ul className="space-y-4">
            {booking.items.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <Badge tone="blue" className="mb-1.5">
                    {item.type}
                  </Badge>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-500">{item.subtitle}</div>
                  <div className="text-xs text-slate-400">
                    {formatDateLong(item.startDate.toISOString())} → {formatDateLong(item.endDate.toISOString())}
                  </div>
                </div>
                <div className="font-semibold text-slate-900">{formatMoney(item.totalPriceCents, "USD", usdRate)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatMoney(booking.subtotalCents, "USD", usdRate)}</span>
            </div>
            {booking.discountCents > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatMoney(booking.discountCents, "USD", usdRate)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatMoney(booking.totalCents, "USD", usdRate)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex gap-3">
        <LinkButton href={`/api/vouchers/${booking.id}`} variant="outline">
          Download voucher (PDF)
        </LinkButton>
        <LinkButton href="/account" variant="ghost">
          Back to my trips
        </LinkButton>
      </div>
    </div>
  );
}
