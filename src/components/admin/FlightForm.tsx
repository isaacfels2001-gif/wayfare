import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export interface FlightDefaults {
  id?: string;
  flightNumber?: string;
  airline?: string;
  airlineCode?: string;
  originCode?: string;
  originCity?: string;
  destinationCode?: string;
  destinationCity?: string;
  departAt?: Date;
  arriveAt?: Date;
  durationMinutes?: number;
  stops?: number;
  aircraft?: string;
}

function toLocalInputValue(date?: Date) {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function FlightForm({ action, defaults }: { action: (formData: FormData) => void; defaults: FlightDefaults }) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="airline">Airline</Label>
          <Input id="airline" name="airline" defaultValue={defaults.airline} required />
        </div>
        <div>
          <Label htmlFor="airlineCode">Airline code</Label>
          <Input id="airlineCode" name="airlineCode" defaultValue={defaults.airlineCode} required placeholder="AA" />
        </div>
      </div>
      <div>
        <Label htmlFor="flightNumber">Flight number</Label>
        <Input id="flightNumber" name="flightNumber" defaultValue={defaults.flightNumber} required placeholder="AA123" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originCode">Origin code</Label>
          <Input id="originCode" name="originCode" defaultValue={defaults.originCode} required placeholder="JFK" />
        </div>
        <div>
          <Label htmlFor="originCity">Origin city</Label>
          <Input id="originCity" name="originCity" defaultValue={defaults.originCity} required />
        </div>
        <div>
          <Label htmlFor="destinationCode">Destination code</Label>
          <Input id="destinationCode" name="destinationCode" defaultValue={defaults.destinationCode} required placeholder="LAX" />
        </div>
        <div>
          <Label htmlFor="destinationCity">Destination city</Label>
          <Input id="destinationCity" name="destinationCity" defaultValue={defaults.destinationCity} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departAt">Departs at</Label>
          <Input id="departAt" name="departAt" type="datetime-local" defaultValue={toLocalInputValue(defaults.departAt)} required />
        </div>
        <div>
          <Label htmlFor="arriveAt">Arrives at</Label>
          <Input id="arriveAt" name="arriveAt" type="datetime-local" defaultValue={toLocalInputValue(defaults.arriveAt)} required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={1} defaultValue={defaults.durationMinutes} required />
        </div>
        <div>
          <Label htmlFor="stops">Stops</Label>
          <Input id="stops" name="stops" type="number" min={0} defaultValue={defaults.stops ?? 0} required />
        </div>
        <div>
          <Label htmlFor="aircraft">Aircraft</Label>
          <Input id="aircraft" name="aircraft" defaultValue={defaults.aircraft} required />
        </div>
      </div>
      <Button type="submit">Save flight</Button>
    </form>
  );
}
