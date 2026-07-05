import { MockHotelProvider } from "./mockProvider";
import type { HotelProvider } from "./types";

function createHotelProvider(): HotelProvider {
  const kind = process.env.HOTEL_PROVIDER ?? "mock";
  switch (kind) {
    // case "expedia-rapid": return new ExpediaRapidHotelProvider();
    case "mock":
    default:
      return new MockHotelProvider();
  }
}

export const hotelProvider: HotelProvider = createHotelProvider();
export * from "./types";
