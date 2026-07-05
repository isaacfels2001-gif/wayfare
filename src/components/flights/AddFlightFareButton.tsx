"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import type { FlightOffer, FlightFareOffer } from "@/services/flights/types";

export function AddFlightFareButton({
  flight,
  fare,
  passengers,
}: {
  flight: FlightOffer;
  fare: FlightFareOffer;
  passengers: number;
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
      variant={fare.cabin === "economy" ? "primary" : "outline"}
      onClick={() => {
        addItem({
          id: `flight-${flight.flightId}-${fare.fareId}-${Date.now()}`,
          type: "flight",
          title: `${flight.originCity} → ${flight.destinationCity}`,
          subtitle: `${flight.airline} ${flight.flightNumber} · ${fare.cabin.replace("_", " ")} · ${passengers} passenger${passengers > 1 ? "s" : ""}`,
          startDate: flight.departAt,
          endDate: flight.arriveAt,
          quantity: passengers,
          unitPriceCents: fare.priceUsdCents,
          ref: { flightId: flight.flightId, fareId: fare.fareId, passengers },
        });
        setAdded(true);
      }}
    >
      Select {fare.cabin.replace("_", " ")}
    </Button>
  );
}
