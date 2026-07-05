import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { FlightForm } from "@/components/admin/FlightForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { updateFlightAction, createFareAction, updateFareAction, deleteFareAction } from "@/lib/actions/admin/flights";

export default async function EditFlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await prisma.flight.findUnique({ where: { id }, include: { fares: true } });
  if (!flight) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit flight</h1>
      <div className="mt-6">
        <FlightForm action={updateFlightAction} defaults={flight} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Fare classes</h2>
      <div className="mt-3 space-y-3">
        {flight.fares.map((fare) => (
          <Card key={fare.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{fare.cabin}</span> · ${(fare.priceUsdCents / 100).toFixed(2)} ·{" "}
                  {fare.seatsAvailable} seats left
                </div>
                <form action={deleteFareAction}>
                  <input type="hidden" name="id" value={fare.id} />
                  <input type="hidden" name="flightId" value={flight.id} />
                  <DeleteButton />
                </form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-blue-600">Edit fare</summary>
                <FareFields action={updateFareAction} flightId={flight.id} defaults={fare} />
              </details>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardBody>
          <h3 className="font-medium text-slate-900">Add a fare class</h3>
          <FareFields action={createFareAction} flightId={flight.id} defaults={{}} />
        </CardBody>
      </Card>
    </div>
  );
}

interface FareDefaults {
  id?: string;
  cabin?: string;
  priceUsdCents?: number;
  seatsAvailable?: number;
  baggageAllowance?: string;
  refundable?: boolean;
}

function FareFields({ action, flightId, defaults }: { action: (formData: FormData) => void; flightId: string; defaults: FareDefaults }) {
  const uid = defaults.id ?? "new";
  return (
    <form action={action} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="flightId" value={flightId} />
      <div>
        <Label htmlFor={`cabin-${uid}`}>Cabin</Label>
        <Select id={`cabin-${uid}`} name="cabin" defaultValue={defaults.cabin ?? "economy"}>
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </Select>
      </div>
      <div>
        <Label htmlFor={`price-${uid}`}>Price ($)</Label>
        <Input
          id={`price-${uid}`}
          name="price"
          type="number"
          min={1}
          step="0.01"
          defaultValue={defaults.priceUsdCents ? defaults.priceUsdCents / 100 : 250}
          required
        />
      </div>
      <div>
        <Label htmlFor={`seatsAvailable-${uid}`}>Seats available</Label>
        <Input id={`seatsAvailable-${uid}`} name="seatsAvailable" type="number" min={0} defaultValue={defaults.seatsAvailable ?? 20} required />
      </div>
      <div>
        <Label htmlFor={`baggageAllowance-${uid}`}>Baggage allowance</Label>
        <Input id={`baggageAllowance-${uid}`} name="baggageAllowance" defaultValue={defaults.baggageAllowance ?? "1 carry-on, 1 checked bag"} required />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="refundable" defaultChecked={defaults.refundable ?? false} />
        Refundable
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm">
          {defaults.id ? "Update fare" : "Add fare"}
        </Button>
      </div>
    </form>
  );
}
