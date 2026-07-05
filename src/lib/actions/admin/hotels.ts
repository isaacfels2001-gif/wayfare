"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const hotelSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  address: z.string().min(1),
  starRating: z.coerce.number().int().min(1).max(5),
  reviewScore: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().int().min(0),
  amenitiesCsv: z.string().min(1),
  imagesCsv: z.string().min(1),
});

function parseHotelForm(formData: FormData) {
  return hotelSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    city: formData.get("city"),
    country: formData.get("country"),
    address: formData.get("address"),
    starRating: formData.get("starRating"),
    reviewScore: formData.get("reviewScore"),
    reviewCount: formData.get("reviewCount"),
    amenitiesCsv: formData.get("amenities"),
    imagesCsv: formData.get("images"),
  });
}

export async function createHotelAction(formData: FormData) {
  await requireAdmin();
  const data = parseHotelForm(formData);
  const hotel = await prisma.hotel.create({ data });
  revalidatePath("/admin/hotels");
  redirect(`/admin/hotels/${hotel.id}`);
}

export async function updateHotelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseHotelForm(formData);
  await prisma.hotel.update({ where: { id }, data });
  revalidatePath("/admin/hotels");
  redirect(`/admin/hotels/${id}`);
}

export async function deleteHotelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.hotel.delete({ where: { id } });
  revalidatePath("/admin/hotels");
}

const roomSchema = z.object({
  hotelId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  maxOccupancy: z.coerce.number().int().min(1),
  bedType: z.string().min(1),
  pricePerNightCents: z.coerce.number().int().min(1),
  totalRooms: z.coerce.number().int().min(0),
  amenitiesCsv: z.string().min(1),
});

function parseRoomForm(formData: FormData) {
  return roomSchema.parse({
    hotelId: formData.get("hotelId"),
    name: formData.get("name"),
    description: formData.get("description"),
    maxOccupancy: formData.get("maxOccupancy"),
    bedType: formData.get("bedType"),
    pricePerNightCents: Number(formData.get("pricePerNight")) * 100,
    totalRooms: formData.get("totalRooms"),
    amenitiesCsv: formData.get("amenities"),
  });
}

export async function createRoomAction(formData: FormData) {
  await requireAdmin();
  const data = parseRoomForm(formData);
  await prisma.room.create({ data });
  revalidatePath(`/admin/hotels/${data.hotelId}`);
  redirect(`/admin/hotels/${data.hotelId}`);
}

export async function updateRoomAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseRoomForm(formData);
  await prisma.room.update({ where: { id }, data });
  revalidatePath(`/admin/hotels/${data.hotelId}`);
  redirect(`/admin/hotels/${data.hotelId}`);
}

export async function deleteRoomAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const hotelId = String(formData.get("hotelId"));
  await prisma.room.delete({ where: { id } });
  revalidatePath(`/admin/hotels/${hotelId}`);
}
