import { notFound } from "next/navigation";
import { tourProvider } from "@/services/tours";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TourBookingForm } from "@/components/tours/TourBookingForm";

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await tourProvider.getBySlug(slug);
  if (!tour) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tour.images.slice(0, 3).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={tour.title} className={`h-64 w-full rounded-xl object-cover ${i === 0 ? "sm:col-span-2 sm:row-span-2 sm:h-[21.5rem]" : ""}`} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{tour.durationDays} days</Badge>
            <Badge tone="slate">{tour.difficulty}</Badge>
            <Badge tone="slate">Up to {tour.maxGroupSize} travelers</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{tour.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{tour.destination}</p>
          <p className="mt-4 text-slate-700">{tour.description}</p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">What&apos;s included</h2>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
            {tour.included.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Itinerary</h2>
          <ol className="mt-3 space-y-4 border-l-2 border-slate-200 pl-4">
            {tour.itinerary.map((step) => (
              <li key={step.day}>
                <div className="text-sm font-semibold text-blue-600">Day {step.day}</div>
                <div className="font-medium text-slate-900">{step.title}</div>
                <p className="text-sm text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardBody>
              <TourBookingForm tour={tour} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
