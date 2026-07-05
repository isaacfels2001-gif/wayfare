import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/currency/Price";
import { AddFlightFareButton } from "@/components/flights/AddFlightFareButton";
import { formatDuration, formatTime } from "@/lib/format";
import type { FlightOffer } from "@/services/flights/types";

export function FlightCard({ flight, passengers }: { flight: FlightOffer; passengers: number }) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{flight.airline}</span>
              <span>·</span>
              <span>{flight.flightNumber}</span>
              <span>·</span>
              <span>{flight.aircraft}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-lg font-semibold text-slate-900">
                {formatTime(flight.departAt)} {flight.originCode}
              </div>
              <div className="flex flex-col items-center text-xs text-slate-400">
                <span>{formatDuration(flight.durationMinutes)}</span>
                <div className="h-px w-16 bg-slate-300" />
                <span>{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {formatTime(flight.arriveAt)} {flight.destinationCode}
              </div>
            </div>
          </div>
          {flight.stops === 0 && (
            <Badge tone="green" className="shrink-0">
              Nonstop
            </Badge>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {flight.fares.map((fare) => (
            <div key={fare.fareId} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {fare.cabin.replace("_", " ")}
                </div>
                <div className="text-base font-bold text-slate-900">
                  <Price usdCents={fare.priceUsdCents * passengers} />
                </div>
                <div className="text-[11px] text-slate-400">
                  {fare.seatsAvailable} left · {fare.refundable ? "Refundable" : "Non-refundable"}
                </div>
              </div>
              <AddFlightFareButton flight={flight} fare={fare} passengers={passengers} />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
