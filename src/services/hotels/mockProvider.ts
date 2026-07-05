import { prisma } from "@/lib/db";
import type { HotelOffer, HotelProvider, HotelSearchParams, ReserveResult } from "./types";

function toOffer(hotel: {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  amenitiesCsv: string;
  imagesCsv: string;
  rooms: {
    id: string;
    name: string;
    description: string;
    maxOccupancy: number;
    bedType: string;
    pricePerNightCents: number;
    totalRooms: number;
    amenitiesCsv: string;
  }[];
}): HotelOffer {
  return {
    hotelId: hotel.id,
    name: hotel.name,
    description: hotel.description,
    city: hotel.city,
    country: hotel.country,
    address: hotel.address,
    starRating: hotel.starRating,
    reviewScore: hotel.reviewScore,
    reviewCount: hotel.reviewCount,
    amenities: hotel.amenitiesCsv.split(",").map((s) => s.trim()).filter(Boolean),
    images: hotel.imagesCsv.split(",").map((s) => s.trim()).filter(Boolean),
    rooms: hotel.rooms.map((r) => ({
      roomId: r.id,
      name: r.name,
      description: r.description,
      maxOccupancy: r.maxOccupancy,
      bedType: r.bedType,
      pricePerNightCents: r.pricePerNightCents,
      totalRooms: r.totalRooms,
      amenities: r.amenitiesCsv.split(",").map((s) => s.trim()).filter(Boolean),
    })),
  };
}

/**
 * Mock hotel inventory backed by our own DB tables, standing in for a live
 * channel-manager / Rapid API connection. Swap HOTEL_PROVIDER once a real
 * adapter implementing HotelProvider exists.
 */
export class MockHotelProvider implements HotelProvider {
  async search(params: HotelSearchParams): Promise<HotelOffer[]> {
    const hotels = await prisma.hotel.findMany({
      where: { city: { contains: params.city } },
      include: {
        rooms: { where: { maxOccupancy: { gte: Math.ceil(params.guests / Math.max(params.rooms, 1)) } } },
      },
      orderBy: { reviewScore: "desc" },
    });
    return hotels.filter((h) => h.rooms.length > 0).map(toOffer);
  }

  async getOffer(hotelId: string): Promise<HotelOffer | null> {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true },
    });
    if (!hotel) return null;
    return toOffer(hotel);
  }

  async reserveRooms(roomId: string, rooms: number): Promise<ReserveResult> {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return { success: false, reason: "Room not found" };
    if (room.totalRooms < rooms) {
      return { success: false, reason: "Not enough rooms available" };
    }
    await prisma.room.update({
      where: { id: roomId },
      data: { totalRooms: { decrement: rooms } },
    });
    return { success: true };
  }
}
