"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const contentSchema = z.object({
  slug: z
    .string()
    .min(1)
    .transform((s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")),
  title: z.string().min(1),
  heroImage: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  published: z.coerce.boolean(),
});

function parseForm(formData: FormData) {
  return contentSchema.parse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    heroImage: formData.get("heroImage"),
    bodyMarkdown: formData.get("bodyMarkdown"),
    published: formData.get("published") === "on",
  });
}

export async function createContentAction(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  await prisma.contentPage.create({ data });
  revalidatePath("/admin/content");
  revalidatePath("/destinations");
  redirect("/admin/content");
}

export async function updateContentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseForm(formData);
  await prisma.contentPage.update({ where: { id }, data });
  revalidatePath("/admin/content");
  revalidatePath("/destinations");
  redirect("/admin/content");
}

export async function deleteContentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.contentPage.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/destinations");
}
