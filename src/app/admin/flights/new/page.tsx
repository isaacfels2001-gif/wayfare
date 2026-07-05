import { FlightForm } from "@/components/admin/FlightForm";
import { createFlightAction } from "@/lib/actions/admin/flights";

export default function NewFlightPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add flight</h1>
      <p className="mt-1 text-sm text-slate-500">You can add fare classes after creating the flight.</p>
      <div className="mt-6">
        <FlightForm action={createFlightAction} defaults={{}} />
      </div>
    </div>
  );
}
