import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

export default async function AccountPage() {
  const user = await requireUser();

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date().getTime();
  const upcoming = bookings.filter((b) => b.items.some((i) => i.startDate.getTime() >= now) && b.status !== "cancelled");
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">My trips</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back, {user.name}.</p>

      <Section title="Upcoming" bookings={upcoming} emptyText="No upcoming trips yet." />
      <Section title="Past & other bookings" bookings={past} emptyText="No past bookings." />
    </div>
  );
}

interface BookingSummary {
  id: string;
  bookingRef: string;
  status: string;
  totalCents: number;
  createdAt: Date;
  items: { title: string }[];
}

function Section({ title, bookings, emptyText }: { title: string; bookings: BookingSummary[]; emptyText: string }) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/account/bookings/${booking.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-700">{booking.bookingRef}</span>
                      <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.items.map((i) => i.title).join(" · ")}
                    </p>
                    <p className="text-xs text-slate-400">Booked {formatDate(booking.createdAt.toISOString())}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatMoney(booking.totalCents, "USD", usdRate)}</div>
                    <div className="text-xs text-blue-600">View details →</div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
