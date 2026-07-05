import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/currency/Price";
import type { HotelOffer } from "@/services/hotels/types";

export function HotelCard({ hotel, query }: { hotel: HotelOffer; query: string }) {
  const cheapestRoom = [...hotel.rooms].sort((a, b) => a.pricePerNightCents - b.pricePerNightCents)[0];

  return (
    <Link href={`/hotels/${hotel.hotelId}?${query}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          {hotel.images[0] && (
            // Placeholder demo imagery (picsum.photos); swap for real DAM URLs in production.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.images[0]} alt={hotel.name} className="h-48 w-full object-cover sm:h-auto sm:w-56" />
          )}
          <CardBody className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{hotel.name}</h3>
                <p className="text-sm text-slate-500">
                  {"★".repeat(hotel.starRating)} · {hotel.city}, {hotel.country}
                </p>
              </div>
              <Badge tone="green">
                {hotel.reviewScore.toFixed(1)} ({hotel.reviewCount.toLocaleString()})
              </Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{hotel.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hotel.amenities.slice(0, 4).map((a) => (
                <span key={a} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                  {a}
                </span>
              ))}
            </div>
            {cheapestRoom && (
              <div className="mt-3 text-sm text-slate-500">
                From <span className="text-base font-bold text-slate-900"><Price usdCents={cheapestRoom.pricePerNightCents} /></span> / night
              </div>
            )}
          </CardBody>
        </div>
      </Card>
    </Link>
  );
}
