import { prisma } from "@/lib/db";
import type {
  CabinClass,
  FlightOffer,
  FlightProvider,
  FlightSearchParams,
  ReserveResult,
} from "./types";

function toOffer(flight: {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departAt: Date;
  arriveAt: Date;
  durationMinutes: number;
  stops: number;
  aircraft: string;
  fares: {
    id: string;
    cabin: string;
    priceUsdCents: number;
    seatsAvailable: number;
    baggageAllowance: string;
    refundable: boolean;
  }[];
}): FlightOffer {
  return {
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    originCode: flight.originCode,
    originCity: flight.originCity,
    destinationCode: flight.destinationCode,
    destinationCity: flight.destinationCity,
    departAt: flight.departAt.toISOString(),
    arriveAt: flight.arriveAt.toISOString(),
    durationMinutes: flight.durationMinutes,
    stops: flight.stops,
    aircraft: flight.aircraft,
    fares: flight.fares.map((f) => ({
      fareId: f.id,
      cabin: f.cabin as CabinClass,
      priceUsdCents: f.priceUsdCents,
      seatsAvailable: f.seatsAvailable,
      baggageAllowance: f.baggageAllowance,
      refundable: f.refundable,
    })),
  };
}

/**
 * Mock flight inventory backed by our own Postgres/SQLite tables, standing
 * in for a live GDS/NDC connection. Swap FLIGHT_PROVIDER=amadeus (etc.) once
 * a real adapter implementing FlightProvider exists.
 */
export class MockFlightProvider implements FlightProvider {
  async search(params: FlightSearchParams): Promise<FlightOffer[]> {
    const dayStart = new Date(`${params.departDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${params.departDate}T23:59:59.999Z`);

    const flights = await prisma.flight.findMany({
      where: {
        originCode: params.origin.toUpperCase(),
        destinationCode: params.destination.toUpperCase(),
        departAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        fares: {
          where: {
            seatsAvailable: { gte: params.passengers },
            ...(params.cabin ? { cabin: params.cabin } : {}),
          },
        },
      },
      orderBy: { departAt: "asc" },
    });

    return flights.filter((f) => f.fares.length > 0).map(toOffer);
  }

  async getOffer(flightId: string, fareId: string): Promise<FlightOffer | null> {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: { fares: { where: { id: fareId } } },
    });
    if (!flight || flight.fares.length === 0) return null;
    return toOffer(flight);
  }

  async reserveSeats(fareId: string, seats: number): Promise<ReserveResult> {
    const fare = await prisma.fareOption.findUnique({ where: { id: fareId } });
    if (!fare) return { success: false, reason: "Fare not found" };
    if (fare.seatsAvailable < seats) {
      return { success: false, reason: "Not enough seats available" };
    }
    await prisma.fareOption.update({
      where: { id: fareId },
      data: { seatsAvailable: { decrement: seats } },
    });
    return { success: true };
  }
}
