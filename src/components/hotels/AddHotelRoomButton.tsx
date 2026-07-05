"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import type { HotelOffer, RoomOffer } from "@/services/hotels/types";

export function AddHotelRoomButton({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  rooms,
  nights,
}: {
  hotel: HotelOffer;
  room: RoomOffer;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  nights: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  if (added) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium text-emerald-600">Added to trip ✓</span>
        <Link href="/cart" className="font-medium text-blue-600 hover:text-blue-700">
          View cart
        </Link>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => {
        addItem({
          id: `hotel-${hotel.hotelId}-${room.roomId}-${Date.now()}`,
          type: "hotel",
          title: hotel.name,
          subtitle: `${room.name} · ${nights} night${nights > 1 ? "s" : ""} · ${rooms} room${rooms > 1 ? "s" : ""} · ${guests} guests`,
          image: hotel.images[0],
          startDate: new Date(`${checkIn}T00:00:00.000Z`).toISOString(),
          endDate: new Date(`${checkOut}T00:00:00.000Z`).toISOString(),
          quantity: rooms,
          unitPriceCents: room.pricePerNightCents * nights,
          ref: { hotelId: hotel.hotelId, roomId: room.roomId, checkIn, checkOut, guests, rooms },
        });
        setAdded(true);
      }}
    >
      Select room
    </Button>
  );
}
