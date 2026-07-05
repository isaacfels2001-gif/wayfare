import Link from "next/link";
import { prisma } from "@/lib/db";
import { LinkButton, Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteFlightAction } from "@/lib/actions/admin/flights";
import { formatDate, formatTime } from "@/lib/format";

const PAGE_SIZE = 25;

export default async function AdminFlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = q
    ? {
        OR: [
          { flightNumber: { contains: q } },
          { originCode: { contains: q.toUpperCase() } },
          { destinationCode: { contains: q.toUpperCase() } },
          { airline: { contains: q } },
        ],
      }
    : {};

  const [flights, total] = await Promise.all([
    prisma.flight.findMany({
      where,
      include: { fares: true },
      orderBy: { departAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.flight.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Flights</h1>
        <LinkButton href="/admin/flights/new">Add flight</LinkButton>
      </div>
      <p className="mt-1 text-sm text-slate-500">{total.toLocaleString()} flights in inventory</p>

      <form action="/admin/flights" method="get" className="mt-4 flex gap-3">
        <Input name="q" defaultValue={q} placeholder="Search by flight number, airline, or airport code" className="max-w-sm" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Flight</th>
              <th className="px-4 py-2.5">Route</th>
              <th className="px-4 py-2.5">Departs</th>
              <th className="px-4 py-2.5">Fares</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flights.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-slate-900">{f.flightNumber}</div>
                  <div className="text-xs text-slate-500">{f.airline}</div>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {f.originCode} → {f.destinationCode}
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {formatDate(f.departAt.toISOString())} {formatTime(f.departAt.toISOString())}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{f.fares.length}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/flights/${f.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                    <form action={deleteFlightAction}>
                      <input type="hidden" name="id" value={f.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/flights?q=${q ?? ""}&page=${page - 1}`} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link href={`/admin/flights?q=${q ?? ""}&page=${page + 1}`} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
