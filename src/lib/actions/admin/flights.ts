"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const flightSchema = z.object({
  flightNumber: z.string().min(1),
  airline: z.string().min(1),
  airlineCode: z.string().min(1).toUpperCase(),
  originCode: z.string().min(3).max(4).toUpperCase(),
  originCity: z.string().min(1),
  destinationCode: z.string().min(3).max(4).toUpperCase(),
  destinationCity: z.string().min(1),
  departAt: z.coerce.date(),
  arriveAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(1),
  stops: z.coerce.number().int().min(0),
  aircraft: z.string().min(1),
});

function parseFlightForm(formData: FormData) {
  return flightSchema.parse({
    flightNumber: formData.get("flightNumber"),
    airline: formData.get("airline"),
    airlineCode: formData.get("airlineCode"),
    originCode: formData.get("originCode"),
    originCity: formData.get("originCity"),
    destinationCode: formData.get("destinationCode"),
    destinationCity: formData.get("destinationCity"),
    departAt: formData.get("departAt"),
    arriveAt: formData.get("arriveAt"),
    durationMinutes: formData.get("durationMinutes"),
    stops: formData.get("stops"),
    aircraft: formData.get("aircraft"),
  });
}

export async function createFlightAction(formData: FormData) {
  await requireAdmin();
  const data = parseFlightForm(formData);
  const flight = await prisma.flight.create({ data });
  revalidatePath("/admin/flights");
  redirect(`/admin/flights/${flight.id}`);
}

export async function updateFlightAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseFlightForm(formData);
  await prisma.flight.update({ where: { id }, data });
  revalidatePath("/admin/flights");
  redirect(`/admin/flights/${id}`);
}

export async function deleteFlightAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.flight.delete({ where: { id } });
  revalidatePath("/admin/flights");
}

const fareSchema = z.object({
  flightId: z.string().min(1),
  cabin: z.enum(["economy", "premium_economy", "business", "first"]),
  priceUsdCents: z.coerce.number().int().min(1),
  seatsAvailable: z.coerce.number().int().min(0),
  baggageAllowance: z.string().min(1),
  refundable: z.coerce.boolean(),
});

function parseFareForm(formData: FormData) {
  return fareSchema.parse({
    flightId: formData.get("flightId"),
    cabin: formData.get("cabin"),
    priceUsdCents: Number(formData.get("price")) * 100,
    seatsAvailable: formData.get("seatsAvailable"),
    baggageAllowance: formData.get("baggageAllowance"),
    refundable: formData.get("refundable") === "on",
  });
}

export async function createFareAction(formData: FormData) {
  await requireAdmin();
  const data = parseFareForm(formData);
  await prisma.fareOption.create({ data });
  revalidatePath(`/admin/flights/${data.flightId}`);
  redirect(`/admin/flights/${data.flightId}`);
}

export async function updateFareAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseFareForm(formData);
  await prisma.fareOption.update({ where: { id }, data });
  revalidatePath(`/admin/flights/${data.flightId}`);
  redirect(`/admin/flights/${data.flightId}`);
}

export async function deleteFareAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const flightId = String(formData.get("flightId"));
  await prisma.fareOption.delete({ where: { id } });
  revalidatePath(`/admin/flights/${flightId}`);
}
