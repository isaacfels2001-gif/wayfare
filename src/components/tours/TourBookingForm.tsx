"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Price } from "@/components/currency/Price";
import { formatDateLong } from "@/lib/format";
import type { TourOffer } from "@/services/tours/types";

export function TourBookingForm({ tour }: { tour: TourOffer }) {
  const addItem = useCartStore((s) => s.addItem);
  const [departureId, setDepartureId] = useState(tour.departures[0]?.departureId ?? "");
  const [pax, setPax] = useState(2);
  const [added, setAdded] = useState(false);

  const departure = useMemo(() => tour.departures.find((d) => d.departureId === departureId), [departureId, tour.departures]);

  if (tour.departures.length === 0) {
    return <p className="text-sm text-slate-500">No upcoming departure dates are available for this package right now.</p>;
  }

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

  const totalCents = tour.basePriceCents * pax;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="departure">Departure date</Label>
        <Select id="departure" value={departureId} onChange={(e) => setDepartureId(e.target.value)}>
          {tour.departures.map((d) => (
            <option key={d.departureId} value={d.departureId}>
              {formatDateLong(d.date)} · {d.seatsAvailable} seats left
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="pax">Travelers</Label>
        <Input
          id="pax"
          type="number"
          min={1}
          max={Math.min(tour.maxGroupSize, departure?.seatsAvailable ?? tour.maxGroupSize)}
          value={pax}
          onChange={(e) => setPax(Number(e.target.value) || 1)}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">Total for {pax} traveler{pax > 1 ? "s" : ""}</span>
        <span className="text-lg font-bold text-slate-900">
          <Price usdCents={totalCents} />
        </span>
      </div>
      <Button
        fullWidth
        disabled={!departure || pax > departure.seatsAvailable}
        onClick={() => {
          if (!departure) return;
          addItem({
            id: `tour-${tour.tourId}-${departure.departureId}-${Date.now()}`,
            type: "tour",
            title: tour.title,
            subtitle: `${tour.destination} · ${tour.durationDays} days · ${pax} traveler${pax > 1 ? "s" : ""}`,
            image: tour.images[0],
            startDate: departure.date,
            endDate: new Date(new Date(departure.date).getTime() + tour.durationDays * 86400000).toISOString(),
            quantity: pax,
            unitPriceCents: tour.basePriceCents,
            ref: { tourId: tour.tourId, departureId: departure.departureId, pax },
          });
          setAdded(true);
        }}
      >
        Add to trip
      </Button>
      {departure && pax > departure.seatsAvailable && (
        <p className="text-xs font-medium text-rose-600">Only {departure.seatsAvailable} seats left on this date.</p>
      )}
    </div>
  );
}
