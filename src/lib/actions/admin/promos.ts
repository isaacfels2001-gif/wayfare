"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const promoSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().min(1),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().int().positive(),
  minSpendCents: z.coerce.number().int().min(0),
  appliesToCsv: z.string().min(1),
  maxUses: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  active: z.coerce.boolean(),
});

function parseForm(formData: FormData) {
  const appliesTo = formData.getAll("appliesTo") as string[];
  return promoSchema.parse({
    code: formData.get("code"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minSpendCents: Number(formData.get("minSpend")) * 100,
    appliesToCsv: appliesTo.length > 0 ? appliesTo.join(",") : "all",
    maxUses: formData.get("maxUses") || "",
    active: formData.get("active") === "on",
  });
}

export async function createPromoAction(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  await prisma.promoCode.create({
    data: {
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minSpendCents: data.minSpendCents,
      appliesToCsv: data.appliesToCsv,
      maxUses: data.maxUses === "" || data.maxUses === undefined ? null : Number(data.maxUses),
      active: data.active,
    },
  });
  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

export async function updatePromoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseForm(formData);
  await prisma.promoCode.update({
    where: { id },
    data: {
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minSpendCents: data.minSpendCents,
      appliesToCsv: data.appliesToCsv,
      maxUses: data.maxUses === "" || data.maxUses === undefined ? null : Number(data.maxUses),
      active: data.active,
    },
  });
  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

export async function deletePromoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promos");
}
