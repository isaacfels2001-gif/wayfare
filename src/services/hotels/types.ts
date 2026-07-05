export interface HotelSearchParams {
  city: string;
  checkIn: string; // ISO yyyy-mm-dd
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface RoomOffer {
  roomId: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  pricePerNightCents: number;
  totalRooms: number;
  amenities: string[];
}

export interface HotelOffer {
  hotelId: string;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  rooms: RoomOffer[];
}

export interface ReserveResult {
  success: boolean;
  reason?: string;
}

/**
 * Contract every hotel data source must satisfy. A real integration
 * (Booking.com Connectivity, Expedia Rapid, etc.) implements this interface
 * and is swapped in via HOTEL_PROVIDER without touching booking/checkout code.
 */
export interface HotelProvider {
  search(params: HotelSearchParams): Promise<HotelOffer[]>;
  getOffer(hotelId: string): Promise<HotelOffer | null>;
  reserveRooms(roomId: string, rooms: number): Promise<ReserveResult>;
}
