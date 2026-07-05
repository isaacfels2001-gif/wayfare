import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TourForm } from "@/components/admin/TourForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { updateTourAction, createDepartureAction, deleteDepartureAction } from "@/lib/actions/admin/tours";
import { formatDateLong } from "@/lib/format";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tourPackage.findUnique({ where: { id }, include: { departures: { orderBy: { date: "asc" } } } });
  if (!tour) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit tour package</h1>
      <div className="mt-6">
        <TourForm action={updateTourAction} defaults={tour} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Departure dates</h2>
      <div className="mt-3 space-y-2">
        {tour.departures.map((d) => (
          <Card key={d.id}>
            <CardBody className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-700">
                {formatDateLong(d.date.toISOString())} · {d.seatsAvailable} seats available
              </div>
              <form action={deleteDepartureAction}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="tourId" value={tour.id} />
                <DeleteButton />
              </form>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardBody>
          <h3 className="font-medium text-slate-900">Add a departure date</h3>
          <form action={createDepartureAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="tourId" value={tour.id} />
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div>
              <Label htmlFor="seatsAvailable">Seats available</Label>
              <Input id="seatsAvailable" name="seatsAvailable" type="number" min={1} defaultValue={12} required />
            </div>
            <Button type="submit" size="sm">
              Add departure
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
