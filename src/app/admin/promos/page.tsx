import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePromoAction } from "@/lib/actions/admin/promos";
import { formatMoney } from "@/lib/money";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Promo codes</h1>
        <LinkButton href="/admin/promos/new">Add promo code</LinkButton>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Discount</th>
              <th className="px-4 py-2.5">Min spend</th>
              <th className="px-4 py-2.5">Applies to</th>
              <th className="px-4 py-2.5">Uses</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promos.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5">
                  <div className="font-mono font-semibold text-slate-900">{p.code}</div>
                  <div className="text-xs text-slate-500">{p.description}</div>
                </td>
                <td className="px-4 py-2.5 text-slate-700">
                  {p.discountType === "percent" ? `${p.discountValue}%` : formatMoney(p.discountValue, "USD", usdRate)}
                </td>
                <td className="px-4 py-2.5 text-slate-700">{formatMoney(p.minSpendCents, "USD", usdRate)}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.appliesToCsv}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {p.usedCount}
                  {p.maxUses ? ` / ${p.maxUses}` : ""}
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={p.active ? "green" : "slate"}>{p.active ? "active" : "inactive"}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/promos/${p.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                    <form action={deletePromoAction}>
                      <input type="hidden" name="id" value={p.id} />
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
