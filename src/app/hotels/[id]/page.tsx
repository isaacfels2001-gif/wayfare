import { notFound } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { hotelProvider } from "@/services/hotels";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/currency/Price";
import { AddHotelRoomButton } from "@/components/hotels/AddHotelRoomButton";
import { formatDateLong } from "@/lib/format";

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const hotel = await hotelProvider.getOffer(id);
  if (!hotel) notFound();

  const checkIn = sp.checkIn ?? new Date().toISOString().slice(0, 10);
  const checkOut = sp.checkOut ?? new Date(new Date().getTime() + 3 * 86400000).toISOString().slice(0, 10);
  const guests = Math.max(1, Math.min(12, Number(sp.guests) || 2));
  const rooms = Math.max(1, Math.min(5, Number(sp.rooms) || 1));
  const nights = Math.max(1, differenceInCalendarDays(new Date(checkOut), new Date(checkIn)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {hotel.images.slice(0, 3).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={hotel.name} className={`h-64 w-full rounded-xl object-cover ${i === 0 ? "sm:col-span-2 sm:row-span-2 sm:h-[21.5rem]" : ""}`} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {"★".repeat(hotel.starRating)} · {hotel.address}, {hotel.city}, {hotel.country}
          </p>
        </div>
        <Badge tone="green">
          {hotel.reviewScore.toFixed(1)} / 5 · {hotel.reviewCount.toLocaleString()} reviews
        </Badge>
      </div>

      <p className="mt-4 max-w-3xl text-slate-700">{hotel.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {hotel.amenities.map((a) => (
          <span key={a} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {a}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        {formatDateLong(new Date(`${checkIn}T00:00:00.000Z`).toISOString())} → {formatDateLong(new Date(`${checkOut}T00:00:00.000Z`).toISOString())} ·{" "}
        {nights} night{nights > 1 ? "s" : ""} · {guests} guests · {rooms} room{rooms > 1 ? "s" : ""}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Choose your room</h2>
      <div className="mt-4 space-y-4">
        {hotel.rooms.map((room) => (
          <Card key={room.roomId}>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{room.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{room.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {room.bedType} · Sleeps {room.maxOccupancy} · {room.totalRooms} rooms left
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    <Price usdCents={room.pricePerNightCents * nights} />
                  </div>
                  <div className="text-xs text-slate-500">for {nights} night{nights > 1 ? "s" : ""}</div>
                </div>
                <AddHotelRoomButton hotel={hotel} room={room} checkIn={checkIn} checkOut={checkOut} guests={guests} rooms={rooms} nights={nights} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
