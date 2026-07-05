import Link from "next/link";
import { prisma } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteHotelAction } from "@/lib/actions/admin/hotels";

export default async function AdminHotelsPage() {
  const hotels = await prisma.hotel.findMany({ include: { rooms: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Hotels</h1>
        <LinkButton href="/admin/hotels/new">Add hotel</LinkButton>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">City</th>
              <th className="px-4 py-2.5">Stars</th>
              <th className="px-4 py-2.5">Room types</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hotels.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-2.5 font-medium text-slate-900">{h.name}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {h.city}, {h.country}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{"★".repeat(h.starRating)}</td>
                <td className="px-4 py-2.5 text-slate-600">{h.rooms.length}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/hotels/${h.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                    <form action={deleteHotelAction}>
                      <input type="hidden" name="id" value={h.id} />
                      <DeleteButton confirmText="Delete this hotel and all its room types?" />
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
