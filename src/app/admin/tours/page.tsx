import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTourAction } from "@/lib/actions/admin/tours";
import { formatMoney } from "@/lib/money";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

export default async function AdminToursPage() {
  const tours = await prisma.tourPackage.findMany({ include: { departures: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tour packages</h1>
        <LinkButton href="/admin/tours/new">Add tour package</LinkButton>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Destination</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Departures</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tours.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2.5 font-medium text-slate-900">{t.title}</td>
                <td className="px-4 py-2.5 text-slate-600">{t.destination}</td>
                <td className="px-4 py-2.5 text-slate-600">{formatMoney(t.basePriceCents, "USD", usdRate)}</td>
                <td className="px-4 py-2.5 text-slate-600">{t.departures.length}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={t.published ? "green" : "slate"}>{t.published ? "published" : "draft"}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/tours/${t.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                    <form action={deleteTourAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
