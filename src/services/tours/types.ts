export interface TourItineraryStep {
  day: number;
  title: string;
  description: string;
}

export interface TourDepartureOffer {
  departureId: string;
  date: string; // ISO date
  seatsAvailable: number;
}

export interface TourOffer {
  tourId: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  destination: string;
  durationDays: number;
  basePriceCents: number;
  images: string[];
  itinerary: TourItineraryStep[];
  included: string[];
  maxGroupSize: number;
  difficulty: string;
  departures: TourDepartureOffer[];
}

export interface TourSearchParams {
  destination?: string;
}

export interface ReserveResult {
  success: boolean;
  reason?: string;
}

/**
 * Contract every tour/activity data source must satisfy. Curated packages are
 * CMS-managed today (mock provider reads our own tables); a future adapter
 * could sync from a DMC/OTA supplier feed behind the same interface.
 */
export interface TourProvider {
  list(params?: TourSearchParams): Promise<TourOffer[]>;
  getBySlug(slug: string): Promise<TourOffer | null>;
  getById(tourId: string): Promise<TourOffer | null>;
  reserveSeats(departureId: string, pax: number): Promise<ReserveResult>;
}
