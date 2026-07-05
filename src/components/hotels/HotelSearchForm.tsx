import { HOTEL_CITIES } from "@/lib/cities";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

export interface HotelSearchDefaults {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
}

export function HotelSearchForm({ defaults }: { defaults: HotelSearchDefaults }) {
  return (
    <form action="/hotels" method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div>
        <Label htmlFor="city">Destination</Label>
        <Select id="city" name="city" defaultValue={defaults.city ?? "New York"} required>
          {HOTEL_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="checkIn">Check-in</Label>
        <Input id="checkIn" name="checkIn" type="date" defaultValue={defaults.checkIn} required />
      </div>
      <div>
        <Label htmlFor="checkOut">Check-out</Label>
        <Input id="checkOut" name="checkOut" type="date" defaultValue={defaults.checkOut} required />
      </div>
      <div>
        <Label htmlFor="guests">Guests</Label>
        <Input id="guests" name="guests" type="number" min={1} max={12} defaultValue={defaults.guests ?? "2"} required />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="rooms">Rooms</Label>
          <Input id="rooms" name="rooms" type="number" min={1} max={5} defaultValue={defaults.rooms ?? "1"} required />
        </div>
        <Button type="submit" className="mb-[1px] shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}
