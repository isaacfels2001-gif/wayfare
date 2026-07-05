"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const tourSchema = z.object({
  slug: z
    .string()
    .min(1)
    .transform((s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")),
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  destination: z.string().min(1),
  durationDays: z.coerce.number().int().min(1),
  basePriceCents: z.coerce.number().int().min(1),
  imagesCsv: z.string().min(1),
  itineraryJson: z.string().refine((v) => {
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  }, "Itinerary must be valid JSON"),
  includedCsv: z.string().min(1),
  maxGroupSize: z.coerce.number().int().min(1),
  difficulty: z.string().min(1),
  published: z.coerce.boolean(),
});

function parseTourForm(formData: FormData) {
  return tourSchema.parse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    destination: formData.get("destination"),
    durationDays: formData.get("durationDays"),
    basePriceCents: Number(formData.get("basePrice")) * 100,
    imagesCsv: formData.get("images"),
    itineraryJson: formData.get("itineraryJson"),
    includedCsv: formData.get("included"),
    maxGroupSize: formData.get("maxGroupSize"),
    difficulty: formData.get("difficulty"),
    published: formData.get("published") === "on",
  });
}

export async function createTourAction(formData: FormData) {
  await requireAdmin();
  const data = parseTourForm(formData);
  const tour = await prisma.tourPackage.create({ data });
  revalidatePath("/admin/tours");
  redirect(`/admin/tours/${tour.id}`);
}

export async function updateTourAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseTourForm(formData);
  await prisma.tourPackage.update({ where: { id }, data });
  revalidatePath("/admin/tours");
  redirect(`/admin/tours/${id}`);
}

export async function deleteTourAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.tourPackage.delete({ where: { id } });
  revalidatePath("/admin/tours");
}

export async function createDepartureAction(formData: FormData) {
  await requireAdmin();
  const tourId = String(formData.get("tourId"));
  const date = new Date(String(formData.get("date")));
  const seatsAvailable = Number(formData.get("seatsAvailable"));
  await prisma.tourDeparture.create({ data: { tourId, date, seatsAvailable } });
  revalidatePath(`/admin/tours/${tourId}`);
  redirect(`/admin/tours/${tourId}`);
}

export async function deleteDepartureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const tourId = String(formData.get("tourId"));
  await prisma.tourDeparture.delete({ where: { id } });
  revalidatePath(`/admin/tours/${tourId}`);
}
