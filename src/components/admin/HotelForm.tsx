import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export interface HotelDefaults {
  id?: string;
  name?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  starRating?: number;
  reviewScore?: number;
  reviewCount?: number;
  amenitiesCsv?: string;
  imagesCsv?: string;
}

export function HotelForm({ action, defaults }: { action: (formData: FormData) => void; defaults: HotelDefaults }) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div>
        <Label htmlFor="name">Hotel name</Label>
        <Input id="name" name="name" defaultValue={defaults.name} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults.description}
          required
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={defaults.city} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaults.country} required />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={defaults.address} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="starRating">Star rating (1-5)</Label>
          <Input id="starRating" name="starRating" type="number" min={1} max={5} defaultValue={defaults.starRating ?? 4} required />
        </div>
        <div>
          <Label htmlFor="reviewScore">Review score (0-5)</Label>
          <Input id="reviewScore" name="reviewScore" type="number" min={0} max={5} step="0.1" defaultValue={defaults.reviewScore ?? 4.5} required />
        </div>
        <div>
          <Label htmlFor="reviewCount">Review count</Label>
          <Input id="reviewCount" name="reviewCount" type="number" min={0} defaultValue={defaults.reviewCount ?? 100} required />
        </div>
      </div>
      <div>
        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
        <Input id="amenities" name="amenities" defaultValue={defaults.amenitiesCsv} required placeholder="Free WiFi, Pool, Spa" />
      </div>
      <div>
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Input id="images" name="images" defaultValue={defaults.imagesCsv} required placeholder="https://..." />
      </div>
      <Button type="submit">Save hotel</Button>
    </form>
  );
}
