import { MockFlightProvider } from "./mockProvider";
import type { FlightProvider } from "./types";

function createFlightProvider(): FlightProvider {
  const kind = process.env.FLIGHT_PROVIDER ?? "mock";
  switch (kind) {
    // case "amadeus": return new AmadeusFlightProvider();
    // case "duffel": return new DuffelFlightProvider();
    case "mock":
    default:
      return new MockFlightProvider();
  }
}

export const flightProvider: FlightProvider = createFlightProvider();
export * from "./types";
