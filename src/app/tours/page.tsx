import { tourProvider } from "@/services/tours";
import { TourCard } from "@/components/tours/TourCard";

export default async function ToursPage() {
  const tours = await tourProvider.list();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Curated tour packages</h1>
      <p className="mt-1 text-sm text-slate-500">Small-group, multi-day trips with guides, lodging, and key activities included.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.tourId} tour={tour} />
        ))}
      </div>
    </div>
  );
}
