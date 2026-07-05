import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { cancelBookingAction } from "@/lib/actions/admin/bookings";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };
const STATUSES = ["pending", "confirmed", "cancelled", "payment_failed"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { bookingRef: { contains: q } },
              { user: { email: { contains: q } } },
              { user: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-1 text-sm text-slate-500">{bookings.length} result(s)</p>

      <form action="/admin/bookings" method="get" className="mt-4 flex flex-wrap gap-3">
        <Input name="q" defaultValue={q} placeholder="Search by reference, name, or email" className="max-w-xs" />
        <Select name="status" defaultValue={status ?? ""} className="max-w-[180px]">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Reference</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Items</th>
              <th className="px-4 py-2.5">Total</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Booked</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2.5">
                  <Link href={`/account/bookings/${b.id}`} className="font-mono font-medium text-blue-600 hover:text-blue-700">
                    {b.bookingRef}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <div className="text-slate-900">{b.user.name}</div>
                  <div className="text-xs text-slate-500">{b.user.email}</div>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{b.items.map((i) => i.type).join(", ")}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900">{formatMoney(b.totalCents, "USD", usdRate)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{formatDate(b.createdAt.toISOString())}</td>
                <td className="px-4 py-2.5 text-right">
                  {b.status !== "cancelled" && (
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <DeleteButton label="Cancel" confirmText="Cancel this booking and release its inventory?" />
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No bookings match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
