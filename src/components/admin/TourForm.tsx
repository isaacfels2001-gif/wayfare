import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export interface TourDefaults {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  destination?: string;
  durationDays?: number;
  basePriceCents?: number;
  imagesCsv?: string;
  itineraryJson?: string;
  includedCsv?: string;
  maxGroupSize?: number;
  difficulty?: string;
  published?: boolean;
}

export function TourForm({ action, defaults }: { action: (formData: FormData) => void; defaults: TourDefaults }) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaults.title} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" defaultValue={defaults.slug} required placeholder="tokyo-highlights-5-day" />
        </div>
      </div>
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Input id="summary" name="summary" defaultValue={defaults.summary} required />
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" name="destination" defaultValue={defaults.destination} required />
        </div>
        <div>
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input id="durationDays" name="durationDays" type="number" min={1} defaultValue={defaults.durationDays ?? 5} required />
        </div>
        <div>
          <Label htmlFor="maxGroupSize">Max group size</Label>
          <Input id="maxGroupSize" name="maxGroupSize" type="number" min={1} defaultValue={defaults.maxGroupSize ?? 14} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Base price per person ($)</Label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            min={1}
            step="0.01"
            defaultValue={defaults.basePriceCents ? defaults.basePriceCents / 100 : 999}
            required
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Input id="difficulty" name="difficulty" defaultValue={defaults.difficulty ?? "easy"} required />
        </div>
      </div>
      <div>
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Input id="images" name="images" defaultValue={defaults.imagesCsv} required />
      </div>
      <div>
        <Label htmlFor="included">Included items (comma-separated)</Label>
        <Input id="included" name="included" defaultValue={defaults.includedCsv} required />
      </div>
      <div>
        <Label htmlFor="itineraryJson">Itinerary (JSON array of {"{day,title,description}"})</Label>
        <textarea
          id="itineraryJson"
          name="itineraryJson"
          defaultValue={defaults.itineraryJson ?? "[]"}
          required
          rows={6}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
        Published
      </label>
      <Button type="submit">Save tour package</Button>
    </form>
  );
}
