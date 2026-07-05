import { redirect } from "next/navigation";
import { hotelProvider } from "@/services/hotels";
import { HotelSearchForm } from "@/components/hotels/HotelSearchForm";
import { HotelCard } from "@/components/hotels/HotelCard";

function defaultDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 21);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  return { checkIn: checkIn.toISOString().slice(0, 10), checkOut: checkOut.toISOString().slice(0, 10) };
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { city, checkIn, checkOut } = params;

  if (!city || !checkIn || !checkOut) {
    const defaults = defaultDates();
    redirect(
      `/hotels?city=${encodeURIComponent(city ?? "New York")}&checkIn=${checkIn ?? defaults.checkIn}&checkOut=${checkOut ?? defaults.checkOut}&guests=${params.guests ?? "2"}&rooms=${params.rooms ?? "1"}`
    );
  }

  const guests = Math.max(1, Math.min(12, Number(params.guests) || 2));
  const rooms = Math.max(1, Math.min(5, Number(params.rooms) || 1));

  const hotels = await hotelProvider.search({ city, checkIn, checkOut, guests, rooms });
  const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests), rooms: String(rooms) }).toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Search hotels</h1>
      <p className="mt-1 text-sm text-slate-500">Mock inventory for demo purposes — see README for how a real channel-manager adapter plugs in here.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <HotelSearchForm defaults={{ city, checkIn, checkOut, guests: String(guests), rooms: String(rooms) }} />
      </div>

      <p className="mt-6 text-sm text-slate-600">
        {hotels.length} hotel{hotels.length === 1 ? "" : "s"} in {city}
      </p>

      <div className="mt-4 space-y-4">
        {hotels.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No hotels found for this search. Try New York, Los Angeles, London, Tokyo, Miami, or Paris.
          </div>
        )}
        {hotels.map((hotel) => (
          <HotelCard key={hotel.hotelId} hotel={hotel} query={query} />
        ))}
      </div>
    </div>
  );
}
