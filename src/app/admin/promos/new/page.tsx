import { PromoForm } from "@/components/admin/PromoForm";
import { createPromoAction } from "@/lib/actions/admin/promos";

export default function NewPromoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add promo code</h1>
      <div className="mt-6">
        <PromoForm action={createPromoAction} defaults={{}} />
      </div>
    </div>
  );
}
