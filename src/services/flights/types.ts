export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string; // ISO yyyy-mm-dd
  returnDate?: string;
  passengers: number;
  cabin?: CabinClass;
}

export interface FlightFareOffer {
  fareId: string;
  cabin: CabinClass;
  priceUsdCents: number;
  seatsAvailable: number;
  baggageAllowance: string;
  refundable: boolean;
}

export interface FlightOffer {
  flightId: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  stops: number;
  aircraft: string;
  fares: FlightFareOffer[];
}

export interface ReserveResult {
  success: boolean;
  reason?: string;
}

/**
 * Contract every flight data source must satisfy. A real integration
 * (Amadeus Self-Service / NDC, Duffel, Sabre) implements this same interface
 * and is swapped in via FLIGHT_PROVIDER without touching booking/checkout code.
 */
export interface FlightProvider {
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
  getOffer(flightId: string, fareId: string): Promise<FlightOffer | null>;
  reserveSeats(fareId: string, seats: number): Promise<ReserveResult>;
}
