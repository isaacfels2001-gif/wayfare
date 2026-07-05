import { MockTourProvider } from "./mockProvider";
import type { TourProvider } from "./types";

function createTourProvider(): TourProvider {
  const kind = process.env.TOUR_PROVIDER ?? "mock";
  switch (kind) {
    // case "dmc-feed": return new DmcFeedTourProvider();
    case "mock":
    default:
      return new MockTourProvider();
  }
}

export const tourProvider: TourProvider = createTourProvider();
export * from "./types";
