import { AIRPORTS } from "@/lib/airports";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

export interface FlightSearchDefaults {
  origin?: string;
  destination?: string;
  departDate?: string;
  passengers?: string;
  cabin?: string;
}

export function FlightSearchForm({ defaults }: { defaults: FlightSearchDefaults }) {
  return (
    <form action="/flights" method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div>
        <Label htmlFor="origin">From</Label>
        <Select id="origin" name="origin" defaultValue={defaults.origin ?? "JFK"} required>
          {AIRPORTS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.city} ({a.code})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="destination">To</Label>
        <Select id="destination" name="destination" defaultValue={defaults.destination ?? "LAX"} required>
          {AIRPORTS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.city} ({a.code})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="departDate">Depart</Label>
        <Input id="departDate" name="departDate" type="date" defaultValue={defaults.departDate} required />
      </div>
      <div>
        <Label htmlFor="passengers">Passengers</Label>
        <Input id="passengers" name="passengers" type="number" min={1} max={9} defaultValue={defaults.passengers ?? "1"} required />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="cabin">Class</Label>
          <Select id="cabin" name="cabin" defaultValue={defaults.cabin ?? ""}>
            <option value="">Any</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </Select>
        </div>
        <Button type="submit" className="mb-[1px] shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}
