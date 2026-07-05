import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

export interface PromoDefaults {
  id?: string;
  code?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  minSpendCents?: number;
  appliesToCsv?: string;
  maxUses?: number | null;
  active?: boolean;
}

export function PromoForm({ action, defaults }: { action: (formData: FormData) => void; defaults: PromoDefaults }) {
  const appliesTo = (defaults.appliesToCsv ?? "flight,hotel,tour").split(",");

  return (
    <form action={action} className="max-w-xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div>
        <Label htmlFor="code">Promo code</Label>
        <Input id="code" name="code" defaultValue={defaults.code} required placeholder="SUMMER50" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={defaults.description} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">Discount type</Label>
          <Select id="discountType" name="discountType" defaultValue={defaults.discountType ?? "percent"}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off ($)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="discountValue">Discount value (% or cents)</Label>
          <Input id="discountValue" name="discountValue" type="number" min={1} defaultValue={defaults.discountValue ?? 10} required />
        </div>
      </div>
      <div>
        <Label htmlFor="minSpend">Minimum spend ($)</Label>
        <Input id="minSpend" name="minSpend" type="number" min={0} step="0.01" defaultValue={(defaults.minSpendCents ?? 0) / 100} />
      </div>
      <div>
        <Label>Applies to</Label>
        <div className="flex gap-4 text-sm">
          {["flight", "hotel", "tour"].map((t) => (
            <label key={t} className="flex items-center gap-1.5">
              <input type="checkbox" name="appliesTo" value={t} defaultChecked={appliesTo.includes(t) || appliesTo.includes("all")} />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="maxUses">Max uses (blank = unlimited)</Label>
        <Input id="maxUses" name="maxUses" type="number" min={1} defaultValue={defaults.maxUses ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} />
        Active
      </label>
      <Button type="submit">Save promo code</Button>
    </form>
  );
}
