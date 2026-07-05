import { prisma } from "@/lib/db";
import type { TourOffer, TourProvider, TourSearchParams, ReserveResult } from "./types";

function toOffer(tour: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  destination: string;
  durationDays: number;
  basePriceCents: number;
  imagesCsv: string;
  itineraryJson: string;
  includedCsv: string;
  maxGroupSize: number;
  difficulty: string;
  departures: { id: string; date: Date; seatsAvailable: number }[];
}): TourOffer {
  return {
    tourId: tour.id,
    slug: tour.slug,
    title: tour.title,
    summary: tour.summary,
    description: tour.description,
    destination: tour.destination,
    durationDays: tour.durationDays,
    basePriceCents: tour.basePriceCents,
    images: tour.imagesCsv.split(",").map((s) => s.trim()).filter(Boolean),
    itinerary: JSON.parse(tour.itineraryJson),
    included: tour.includedCsv.split(",").map((s) => s.trim()).filter(Boolean),
    maxGroupSize: tour.maxGroupSize,
    difficulty: tour.difficulty,
    departures: tour.departures
      .filter((d) => d.seatsAvailable > 0 && d.date.getTime() > Date.now())
      .map((d) => ({
        departureId: d.id,
        date: d.date.toISOString(),
        seatsAvailable: d.seatsAvailable,
      })),
  };
}

/**
 * Mock tour catalogue backed by our own CMS-managed tables. A real DMC/OTA
 * supplier feed can implement TourProvider and be swapped in via
 * TOUR_PROVIDER without touching booking/checkout code.
 */
export class MockTourProvider implements TourProvider {
  async list(params?: TourSearchParams): Promise<TourOffer[]> {
    const tours = await prisma.tourPackage.findMany({
      where: {
        published: true,
        ...(params?.destination ? { destination: { contains: params.destination } } : {}),
      },
      include: { departures: true },
      orderBy: { createdAt: "desc" },
    });
    return tours.map(toOffer);
  }

  async getBySlug(slug: string): Promise<TourOffer | null> {
    const tour = await prisma.tourPackage.findUnique({
      where: { slug },
      include: { departures: true },
    });
    if (!tour) return null;
    return toOffer(tour);
  }

  async getById(tourId: string): Promise<TourOffer | null> {
    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourId },
      include: { departures: true },
    });
    if (!tour) return null;
    return toOffer(tour);
  }

  async reserveSeats(departureId: string, pax: number): Promise<ReserveResult> {
    const departure = await prisma.tourDeparture.findUnique({ where: { id: departureId } });
    if (!departure) return { success: false, reason: "Departure date not found" };
    if (departure.seatsAvailable < pax) {
      return { success: false, reason: "Not enough seats available on this date" };
    }
    await prisma.tourDeparture.update({
      where: { id: departureId },
      data: { seatsAvailable: { decrement: pax } },
    });
    return { success: true };
  }
}
