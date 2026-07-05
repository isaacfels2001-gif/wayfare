import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PromoForm } from "@/components/admin/PromoForm";
import { updatePromoAction } from "@/lib/actions/admin/promos";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit promo code</h1>
      <div className="mt-6">
        <PromoForm action={updatePromoAction} defaults={promo} />
      </div>
    </div>
  );
}
