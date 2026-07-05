import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/currency/Price";
import type { TourOffer } from "@/services/tours/types";

export function TourCard({ tour }: { tour: TourOffer }) {
  return (
    <Link href={`/tours/${tour.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {tour.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.images[0]} alt={tour.title} className="h-48 w-full object-cover" />
        )}
        <CardBody>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{tour.title}</h3>
            <Badge tone="blue">{tour.durationDays}d</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{tour.destination}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{tour.summary}</p>
          <div className="mt-3 text-sm text-slate-500">
            From <span className="text-base font-bold text-slate-900"><Price usdCents={tour.basePriceCents} /></span> / person
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
